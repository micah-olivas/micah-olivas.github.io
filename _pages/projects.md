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

<div class="projects">
  <!-- Work-related projects, shown by default -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
      {% for project in visible_projects %}
        {% include projects_horizontal.liquid %}
      {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in visible_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}

  <!-- Personal / non-work projects, hidden behind a toggle -->
  {% if hidden_projects.size > 0 %}
  <div class="projects-toggle-wrap">
    <button
      type="button"
      id="toggle-personal"
      class="projects-toggle"
      aria-expanded="false"
      aria-controls="personal-projects"
    >
      <span class="toggle-label">Show personal projects</span>
      <i class="fa-solid fa-chevron-down toggle-chevron"></i>
    </button>
  </div>

  <div id="personal-projects" class="personal-projects" hidden>
    {% if page.horizontal %}
    <div class="container">
      <div class="row row-cols-1 row-cols-md-2">
        {% for project in hidden_projects %}
          {% include projects_horizontal.liquid %}
        {% endfor %}
      </div>
    </div>
    {% else %}
    <div class="row row-cols-1 row-cols-md-3">
      {% for project in hidden_projects %}
        {% include projects.liquid %}
      {% endfor %}
    </div>
    {% endif %}
  </div>
  {% endif %}
</div>

<style>
  .projects-toggle-wrap {
    text-align: center;
    margin: 2.5rem 0 0.5rem;
  }
  .projects-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 1px solid var(--global-divider-color);
    border-radius: 6px;
    color: var(--global-text-color-light);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.5rem 1.1rem;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      border-color 0.15s ease-in-out;
  }
  .projects-toggle:hover {
    color: var(--global-hover-color);
    border-color: var(--global-hover-color);
  }
  .projects-toggle .toggle-chevron {
    font-size: 0.7rem;
    transition: transform 0.2s ease-in-out;
  }
  .projects-toggle[aria-expanded="true"] .toggle-chevron {
    transform: rotate(180deg);
  }
  .personal-projects[hidden] {
    display: none;
  }
</style>

<noscript>
  <style>
    /* Without JS there is no toggle, so just show everything. */
    #personal-projects[hidden] {
      display: block;
    }
    .projects-toggle-wrap {
      display: none;
    }
  </style>
</noscript>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("toggle-personal");
    var panel = document.getElementById("personal-projects");
    if (!btn || !panel) return;
    var label = btn.querySelector(".toggle-label");
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      label.textContent = expanded ? "Show personal projects" : "Hide personal projects";
    });
  });
</script>
