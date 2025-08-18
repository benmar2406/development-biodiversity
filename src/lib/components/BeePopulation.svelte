<script>
    import * as d3 from 'd3';
    import { onMount } from "svelte";
    import { csv } from 'd3-fetch';
    import MapContainer from "./map/MapContainer.svelte";
    import LineChartContainer from './lineChart/lineChartContainer.svelte';
    import { base } from "$app/paths";

    let geojson = $state(null);
    let data = $state(null);
    let dataReady = $state(false);

    //calculate grouped data for line chart
    let globalYearlySums = $derived(
    data
        ? d3.rollups(
            data,
            yearGroup => d3.sum(yearGroup, record => record.value),
            record => record.year
            ).map(([year, total]) => ({ year, total }))
        : null
)

    // load and transform data
    onMount(async () => {
        
        data = await csv(`${base}/data/bees.csv`, d => ({
            countryCode: +d["Area Code (M49)"],
            value: +d.Value,
            year: +d.Year
        })).then(
            dataReady = true
        )
  
    });
</script>

<h2>Global development of bee population</h2>

<MapContainer {data} {dataReady}/>
{#if globalYearlySums}
    <LineChartContainer data={globalYearlySums} {dataReady}/>
{/if}
<style>

    h2 {
        text-align: center;
        font-size: 1.3rem;
        margin-bottom: 0.6rem;
    }
    
</style>