// src/lib/attachments/d3DragReactive.js
import { drag as d3drag } from 'd3-drag';
import { select } from 'd3-selection';

export function d3Drag(onDrag) {
  return (element) => {
    console.log('[d3Drag] attached to', element); // MOUNT PROOF

    const handler = d3drag()
      .on('start', (event) => console.log('[d3Drag] start', event))
      .on('drag', (event) => {
        console.log('[d3Drag] drag', event.dx, event.dy); // DRAG PROOF
        onDrag && onDrag({ dx: event.dx, dy: event.dy, raw: event });
      })
      .on('end', (event) => console.log('[d3Drag] end', event));

    select(element).call(handler);

    return () => {
      console.log('[d3Drag] cleanup');
      select(element).on('.drag', null);
    };
  };
}
