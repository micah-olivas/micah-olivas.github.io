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
  let renderToken = 0;
  let lastWidth = 0;
  let resizeTimer = null;

  async function render() {
    const myToken = ++renderToken;
    if (!pdfDoc) pdfDoc = await pdfjsLib.getDocument(url).promise;

    const containerWidth = container.clientWidth;
    if (containerWidth === lastWidth) return;
    lastWidth = containerWidth;

    // Oversample 3x for crisp text/lines, even on non-retina displays.
    const dpr = Math.max(window.devicePixelRatio || 1, 2) * 1.5;
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      if (myToken !== renderToken) return;
      const page = await pdfDoc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const cssScale = containerWidth / base.width;
      const cssViewport = page.getViewport({ scale: cssScale });
      const canvasViewport = page.getViewport({ scale: cssScale * dpr });

      const pageWrap = document.createElement('div');
      pageWrap.className = 'cv-page-wrap';
      pageWrap.style.width = cssViewport.width + 'px';
      pageWrap.style.height = cssViewport.height + 'px';

      const canvas = document.createElement('canvas');
      canvas.className = 'cv-page';
      canvas.width = Math.floor(canvasViewport.width);
      canvas.height = Math.floor(canvasViewport.height);
      canvas.style.width = cssViewport.width + 'px';
      canvas.style.height = cssViewport.height + 'px';
      pageWrap.appendChild(canvas);

      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'cv-textlayer textLayer';
      pageWrap.appendChild(textLayerDiv);

      const linkLayerDiv = document.createElement('div');
      linkLayerDiv.className = 'cv-linklayer';
      pageWrap.appendChild(linkLayerDiv);

      fragment.appendChild(pageWrap);

      await page.render({ canvasContext: canvas.getContext('2d'), viewport: canvasViewport }).promise;
      if (myToken !== renderToken) return;

      // Selectable text overlay
      try {
        const textContent = await page.getTextContent();
        if (pdfjsLib.TextLayer) {
          const tl = new pdfjsLib.TextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: cssViewport,
          });
          await tl.render();
        }
      } catch (e) {
        console.warn('text layer failed', e);
      }

      // Clickable links
      try {
        const annotations = await page.getAnnotations({ intent: 'display' });
        annotations.forEach(ann => {
          if (ann.subtype !== 'Link' || !ann.url) return;
          const [x1, y1, x2, y2] = pdfjsLib.Util.normalizeRect(
            cssViewport.convertToViewportRectangle(ann.rect)
          );
          const a = document.createElement('a');
          a.href = ann.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'cv-link';
          a.style.left = x1 + 'px';
          a.style.top = y1 + 'px';
          a.style.width = (x2 - x1) + 'px';
          a.style.height = (y2 - y1) + 'px';
          linkLayerDiv.appendChild(a);
        });
      } catch (e) {
        console.warn('link layer failed', e);
      }
    }

    if (myToken !== renderToken) return;
    container.innerHTML = '';
    container.appendChild(fragment);
  }

  render().catch(err => {
    console.error('CV render failed', err);
    container.innerHTML = '<p class="cv-fallback"><a href="' + url + '">Download the CV (PDF)</a></p>';
  });

  // Only re-render on actual width changes (ignore mobile URL-bar resizes)
  window.addEventListener('resize', () => {
    if (container.clientWidth === lastWidth) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render().catch(console.error), 250);
  });
</script>
