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

{% capture personal_toggle %}
<div class="projects-toggle-cell">
  <button
    type="button"
    id="toggle-personal"
    class="projects-toggle"
    aria-expanded="false"
    aria-controls="personal-projects"
  >
    <span class="toggle-label">Show personal</span>
    <span class="toggle-count">{{ hidden_projects.size }}</span>
    <i class="fa-solid fa-chevron-down toggle-chevron" aria-hidden="true"></i>
  </button>
</div>
{% endcapture %}

<div class="projects">
  <!-- Work-related projects, shown by default. The reveal control rides along
       in the grid's trailing cell, just right of the last card. -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
      {% for project in visible_projects %}
        {% include projects_horizontal.liquid %}
      {% endfor %}
      {% if hidden_projects.size > 0 %}{{ personal_toggle }}{% endif %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in visible_projects %}
      {% include projects.liquid %}
    {% endfor %}
    {% if hidden_projects.size > 0 %}{{ personal_toggle }}{% endif %}
  </div>
  {% endif %}

  <!-- Personal / non-work projects, revealed by the toggle above -->
  {% if hidden_projects.size > 0 %}
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

<noscript>
  <style>
    /* Without JS there is no toggle, so just show everything, un-hidden. */
    #personal-projects[hidden] {
      display: block;
    }
    #personal-projects .row > .col {
      opacity: 1 !important;
      transform: none !important;
    }
    .projects-toggle-cell {
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
      if (expanded) {
        btn.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-visible");
        panel.hidden = true;
        if (label) label.textContent = "Show personal";
      } else {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        // paint the hidden (lifted/transparent) state, then transition in
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            panel.classList.add("is-visible");
          });
        });
        if (label) label.textContent = "Hide personal";
      }
    });
  });
</script>
