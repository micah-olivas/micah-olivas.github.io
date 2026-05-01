require "net/http"
require "json"
require "fileutils"
require "time"

# Populates site.data.highlighted_projects from the GitHub API at build time.
#
# Configure in _config.yml under `github_projects:` — `users` is the list of
# user/org logins to scan, `topic` is the GitHub topic that flags a repo as
# featured. Per-repo overrides (thumbnails, custom names, etc.) live in
# _data/project_overrides.yml, keyed by "owner/repo".
#
# Set GITHUB_TOKEN in the environment to lift the API rate limit from 60/hr to
# 5,000/hr. The deploy workflow already passes the Actions token.
module Jekyll
  class HighlightedProjectsGenerator < Generator
    safe false
    priority :high

    CACHE_DIR = ".cache".freeze
    CACHE_FILE = File.join(CACHE_DIR, "highlighted_projects.json").freeze
    CACHE_TTL_SECONDS = 60 * 60

    def generate(site)
      config = site.config["github_projects"] || {}
      users = Array(config["users"]).compact
      topic = (config["topic"] || "featured").to_s

      return if users.empty?

      overrides = site.data["project_overrides"] || {}

      repos = use_cache? ? load_cache : nil
      if repos.nil?
        repos = fetch_all_repos(users)
        write_cache(repos) unless production?
      end

      featured = repos
        .select { |r| Array(r["topics"]).include?(topic) }
        .sort_by { |r| -parse_time(r["pushed_at"]) }

      site.data["highlighted_projects"] = featured.map do |r|
        slug = r["full_name"]
        ov = overrides[slug] || {}
        tags = Array(r["topics"]).reject { |t| t == topic }
        {
          "name" => ov["name"] || r["name"],
          "description" => ov["description"] || r["description"].to_s,
          "github" => r["html_url"],
          "github_repo" => slug,
          "thumbnail" => ov["thumbnail"],
          "tags" => ov["tags"] || tags,
        }
      end

      Jekyll.logger.info "HighlightedProjects:",
        "loaded #{site.data['highlighted_projects'].size} repos tagged '#{topic}'"
    end

    private

    def production?
      ENV["JEKYLL_ENV"] == "production" || ENV["CI"] == "true"
    end

    def use_cache?
      return false if production?
      return false unless File.exist?(CACHE_FILE)
      (Time.now - File.mtime(CACHE_FILE)) < CACHE_TTL_SECONDS
    end

    def load_cache
      JSON.parse(File.read(CACHE_FILE))
    rescue StandardError
      nil
    end

    def write_cache(repos)
      FileUtils.mkdir_p(CACHE_DIR)
      File.write(CACHE_FILE, JSON.generate(repos))
    end

    def parse_time(value)
      Time.parse(value.to_s).to_i
    rescue StandardError
      0
    end

    def fetch_all_repos(users)
      users.flat_map { |u| fetch_user_repos(u) }
    end

    def fetch_user_repos(user)
      results = []
      page = 1
      loop do
        uri = URI("https://api.github.com/users/#{user}/repos" \
                  "?per_page=100&page=#{page}&type=owner&sort=pushed")
        req = Net::HTTP::Get.new(uri)
        req["Accept"] = "application/vnd.github+json"
        req["User-Agent"] = "al-folio-highlighted-projects-plugin"
        token = ENV["GITHUB_TOKEN"]
        req["Authorization"] = "Bearer #{token}" if token && !token.empty?

        res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(req)
        end

        unless res.is_a?(Net::HTTPSuccess)
          Jekyll.logger.warn "HighlightedProjects:",
            "GitHub API #{res.code} for #{user}: #{res.body.to_s[0, 200]}"
          break
        end

        page_repos = JSON.parse(res.body)
        break if page_repos.empty?
        results.concat(page_repos)
        break if page_repos.size < 100
        page += 1
      end
      results
    rescue StandardError => e
      Jekyll.logger.warn "HighlightedProjects:",
        "fetch failed for #{user}: #{e.class}: #{e.message}"
      []
    end
  end
end
