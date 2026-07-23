---
layout: page
title: projects
permalink: /projects/
description: A growing collection of your cool projects.
nav: false
nav_order: 3
display_categories: [work, fun]
primary_category: work
horizontal: false
---

<!-- pages/projects.md -->
{% assign primary = page.primary_category | default: 'work' %}
{% assign all_sorted = site.projects | sort: "importance" %}
{% assign visible_projects = all_sorted | where: "category", primary %}
{% assign hidden_projects = all_sorted | where_exp: "p", "p.category != primary" %}

{% assign personal_ids = "" %}
{% for project in hidden_projects %}{% assign personal_ids = personal_ids | append: "personal-project-" | append: forloop.index | append: " " %}{% endfor %}

{% capture personal_toggle %}
<div class="projects-toggle-cell">
  <button
    type="button"
    id="toggle-personal"
    class="projects-toggle"
    aria-expanded="false"
    aria-controls="{{ personal_ids | strip }}"
  >
    <span class="toggle-label">Show personal</span>
    <span class="toggle-count">{{ hidden_projects.size }}</span>
    <i class="fa-solid fa-chevron-down toggle-chevron" aria-hidden="true"></i>
  </button>
</div>
{% endcapture %}

<div class="projects">
  <!-- Work + personal share one grid. Personal cards sit inline, hidden until
       the toggle reveals them, so they fill in right after the work cards; the
       toggle trails along to whatever the last cell becomes. -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
      {% for project in visible_projects %}
        {% include projects_horizontal.liquid %}
      {% endfor %}
      {% for project in hidden_projects %}
        {% capture pid %}personal-project-{{ forloop.index }}{% endcapture %}
        {% include projects_horizontal.liquid extra_class="js-personal" id=pid %}
      {% endfor %}
      {% if hidden_projects.size > 0 %}{{ personal_toggle }}{% endif %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in visible_projects %}
      {% include projects.liquid %}
    {% endfor %}
    {% for project in hidden_projects %}
      {% capture pid %}personal-project-{{ forloop.index }}{% endcapture %}
      {% include projects.liquid extra_class="js-personal" id=pid %}
    {% endfor %}
    {% if hidden_projects.size > 0 %}{{ personal_toggle }}{% endif %}
  </div>
  {% endif %}
</div>

<noscript>
  <style>
    /* Without JS there is no toggle, so just show everything, un-hidden. */
    .projects .js-personal {
      display: block !important;
      opacity: 1 !important;
      transform: none !important;
    }
    .projects .projects-toggle-cell {
      display: none;
    }
  </style>
</noscript>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("toggle-personal");
    var grid = document.querySelector(".projects");
    if (!btn || !grid) return;
    var label = btn.querySelector(".toggle-label");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hideTimer;
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      window.clearTimeout(hideTimer);
      if (expanded) {
        btn.setAttribute("aria-expanded", "false");
        if (label) label.textContent = "Show personal";
        // fade the cards out, then drop them from the grid once they settle
        grid.classList.remove("personal-in");
        if (reduce) {
          grid.classList.remove("personal-open");
        } else {
          hideTimer = window.setTimeout(function () {
            if (btn.getAttribute("aria-expanded") === "false") grid.classList.remove("personal-open");
          }, 500);
        }
      } else {
        btn.setAttribute("aria-expanded", "true");
        if (label) label.textContent = "Hide personal";
        // place the cards in the grid (transparent), then fade them in
        grid.classList.add("personal-open");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            grid.classList.add("personal-in");
          });
        });
      }
    });
  });
</script>
