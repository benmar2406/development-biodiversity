<script>
    import { rollups, sum } from 'd3';
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
        ? rollups(
            data,
            yearGroup => sum(yearGroup, record => record.value),
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

    $inspect(data)


</script>

<MapContainer {data} {dataReady}/>
{#if globalYearlySums}
    <LineChartContainer data={globalYearlySums} {dataReady}/>
{/if}