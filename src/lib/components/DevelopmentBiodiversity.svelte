<script>
  import { onMount } from 'svelte';
  import { csv, json } from 'd3-fetch';
  import { scaleQuantize } from 'd3-scale';
  import { geoPath, geoMercator } from 'd3-geo';
  import { extent } from 'd3-array';

  let geojson = $state();
  let data = [];
  let selectedYear = $state(1970);
  let dataReady = $state(false);
  let width = $state(800);
  let height = 500;

  let projection = geoMercator().scale(150).translate([400, 250]);
  let path = geoPath(projection);

  let colorScale = scaleQuantize()
    .domain([5, 120])
    .range(["#d7301f", "#fc8d59", "#fdcc8a", "#fef0d9"]);

  // Daten laden
  onMount(async () => {
    geojson = await json('/data/continents.geojson');
    data = await csv('/data/biodiversity.csv', d => ({
      continent: d.Entity,
      year: +d.Year,
      value: +d["Living Planet Index"]
    }));
    dataReady = true;
  });

const CONTINENT_NAME_MAP = {
        "Africa": "Africa",
        "Asia": "Asia and Pacific",
        "Europe": "Europe and Central Asia",
        "North America": "North America",
        "South America": "Latin America and the Caribbean",
        "Australia": "Asia and Pacific",          // group with Asia-Pacific
        "Oceania": "Asia and Pacific",            // same as above
        "Antarctica": null                        // no data in CSV
};  


const getValue = (cont) => {
  const mapped = CONTINENT_NAME_MAP[cont];
  if (!mapped) return 0;

  const found = data.find(d =>
    d.continent?.trim().toLowerCase() === mapped.toLowerCase() &&
    d.year === selectedYear
  );
  return found?.value ?? 0;
};
</script>
<div class="chart-container">
    <div bind:clientWidth={width}>
        <svg {width} {height}>
            {#if geojson && dataReady}
                {#each geojson.features as feature}
                <path
                    d={path(feature)}
                    fill={colorScale(getValue(feature.properties.CONTINENT))}
                    stroke="#fff"
                    stroke-width="0.5"
                />
                {/each}
            {:else}
                <text
                    x={width / 2}
                    y={height / 2}>Loading map...</text> 
            {/if}
        </svg>
    </div>
</div>

<input
  type="range"
  min="1970"
  max="2020"
  step="1"
  bind:value={selectedYear}
/>
<p>Jahr: {selectedYear}</p>

<style>
    .chart-container {
        width: 800px;
    }
</style>




