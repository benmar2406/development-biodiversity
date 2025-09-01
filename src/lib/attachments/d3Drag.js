import { drag as d3drag } from 'd3-drag';
import { select } from 'd3-selection';

export function d3Drag(onDrag) {
  return (element) => {

    const handler = d3drag()
      .on('start', (event) => console.log('[d3Drag] start', event))
      .on('drag', (event) => {
        onDrag && onDrag({ dx: event.dx, dy: event.dy, raw: event });
      })
      .on('end', (event) => console.log('[d3Drag] end', event));

    select(element).call(handler);

    return () => {
      select(element).on('.drag', null);
    };
  };
}
