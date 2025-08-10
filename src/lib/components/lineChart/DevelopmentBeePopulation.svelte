<script>
    import { scaleLinear, scaleTime } from "d3";
    import { extent, max } from 'd3-array';
    import { line, curveLinear } from 'd3-shape';
    import { draw } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { csv, json } from 'd3-fetch';
    import { base } from "$app/paths";
    import * as d3 from 'd3';

    let data = $state(null);
    let width = $state(0);
    const height = 350;
    const margin = { top: 10, right: 0, bottom: 20, left: 35 };

    onMount(() => {
        csv(`${base}/data/bees.csv`, row => ({
            ...row,
            year: new Date(row["Year Code"]),
            value: +row.Value  
        })).then((csvData) => {
            // Group data by year and calculate total value for each year
            const yearlySums = d3.rollups(
                csvData,
                yearGroup => d3.sum(yearGroup, record => record.value),
                record => record.year
            );

            // Convert grouped data into array of { year, total } objects
            data = yearlySums.map(([year, total]) => ({ year, total }));
                console.log(data)

        });
    });



let xScale = $derived(
    data && width
      ? scaleTime()
            .domain(extend(data, (d) => new Date(d.year)))
            .range([margin.left, width - margin.right])
        : null
);

let yScale = $derived(
    data && width
    ? scaleLinear()
        .domain(extend(data, (d) => d.total))
        .range([height - margin.bottom, margin.top])
    : null
);

let lineGenerator = $derived(
    xScale && yScale 
        ? line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(+d.total))
        : null
)
</script>


<div class="chart-container">
    <svg {width} {height}>
     
    </svg>
</div>