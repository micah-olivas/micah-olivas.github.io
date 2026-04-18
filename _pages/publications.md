---
layout: page
permalink: /publications/
title: publications
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<p class="pub-scholar-pointer">
  Publications are listed in reverse chronological order. For an up-to-date list, see
  <a href="https://scholar.google.com/citations?user={{ site.data.socials.scholar_userid }}" target="_blank" rel="noopener">Google Scholar</a>.
</p>

{% include bib_search.liquid %}

<h2 class="pub-section-heading">preprints</h2>

<div class="publications">
{% bibliography -q @Preprint %}
</div>

<h2 class="pub-section-heading">publications</h2>

<div class="publications">
{% bibliography -q @article || @inproceedings || @incollection || @book || @phdthesis || @mastersthesis %}
</div>
