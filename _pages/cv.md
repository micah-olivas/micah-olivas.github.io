---
layout: page
permalink: /cv/
title: cv
nav: true
nav_order: 3
description:
---

{% assign cv_url = '/assets/pdf/CV.pdf' | relative_url %}

<div id="cv-pages" class="cv-pages" data-pdf-url="{{ cv_url }}">
  <p class="cv-fallback">
    Loading CV… <a href="{{ cv_url }}">Download the PDF</a> if this doesn't render.
  </p>
</div>

<script type="module">
  import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';

  const container = document.getElementById('cv-pages');
  const url = container.dataset.pdfUrl;
  let pdfDoc = null;
  let resizeTimer = null;

  async function render() {
    if (!pdfDoc) pdfDoc = await pdfjsLib.getDocument(url).promise;

    const containerWidth = container.clientWidth;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    container.innerHTML = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const cssScale = containerWidth / base.width;
      const viewport = page.getViewport({ scale: cssScale * dpr });

      const canvas = document.createElement('canvas');
      canvas.className = 'cv-page';
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = containerWidth + 'px';
      canvas.style.height = Math.floor(base.height * cssScale) + 'px';
      container.appendChild(canvas);

      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    }
  }

  render().catch(err => {
    console.error('CV render failed', err);
    container.innerHTML = '<p class="cv-fallback"><a href="' + url + '">Download the CV (PDF)</a></p>';
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render().catch(console.error), 200);
  });
</script>
