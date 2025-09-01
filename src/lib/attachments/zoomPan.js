// src/lib/attachments/zoomPan.js
import { zoom, select } from 'd3';

export function zoomPan({ min = 0.5, max = 8, extent } = {}) {
  return (el) => {
    const z = zoom()
      .scaleExtent([min, max])
      .on('zoom', (e) => {
        // e.transform has x, y, k
        el.setAttribute('transform', `translate(${e.transform.x},${e.transform.y}) scale(${e.transform.k})`);
      });

    const s = select(el);
    if (extent) z.extent(extent); // optional: [[x0,y0],[x1,y1]] in pixel space

    // The element's parent must be an <svg>; call zoom on the parent,
    // but apply the transform to this group (<g>).
    const svg = s.node().nearestViewportElement || s.node().ownerSVGElement;
    select(svg).call(z);

    // Optional: dblclick-to-zoom enabled by default; disable if you like:
    // select(svg).on("dblclick.zoom", null);

    return () => select(svg).on('.zoom', null);
  };
}
