<script>
import { onMount } from 'svelte';
import { setContext } from 'svelte';
import * as d3 from 'd3';
import { csv, json } from 'd3-fetch';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { flip } from 'svelte/animate';
import { innerWidth } from 'svelte/reactivity/window';
import { base } from '$app/paths';
import { width } from '$lib/shared';
import Map from './Map.svelte';
import Controls from './Controls.svelte';

//data
let geojson = $state(null);
let data = $state([]);
let dataReady = $state(false);
//geometry
let projection = $state();
let path = $state();
//map specs   
//let width = $state(1200);
let height = 450;
let selectedYear = $state(1961);
let spikeScale = $state(0);
let mapX = $state(200);
//autoplay
let autoplayInterval = $state(null); 
let autoplayActive = $state(false);
//tooltip


// load and transform data
onMount(async () => {

    geojson = await json(`${base}/data/countries.json`);
    projection = geoMercator().scale(400).translate([mapX, 550]);
    path = geoPath(projection);
    
    data = await csv(`${base}/data/bees.csv`, d => ({
        countryCode: +d["Area Code (M49)"],
        population: +d.Value,
        year: +d.Year
    }));

    //generate scale
    const globalMax = d3.max(data, d => d.population);
    spikeScale = d3.scaleLinear()
        .domain([0, globalMax])
        .range([0, 300]);

    dataReady = true;
});

//define spike
const spike = (height) => {
const width = 10; // base width of triangle
return `M${-width / 2},0L0,${-height}L${width / 2},0Z`;
}

// find bee population value for country
const getValue = (countryCodeToDisplay) => {
    const code = +countryCodeToDisplay;
    const found = data.find(d =>
        d.countryCode === code &&
        d.year === selectedYear
    );
    return found?.population ?? 0;
};

// adjusts the map perspective to a sustain interesting view for small screens
$effect(() => {
    innerWidth.current < 600 ? mapX = 70 : 250;
})

//player
const autoplayYears = () => {
        if (autoplayActive) {
            // If autoplay is active, stop it
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        } else {
            // If autoplay is not active, start it
            autoplayInterval = setInterval(() => {
                if (selectedYear <= 2022) {
                    selectedYear++;
                } else {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                    autoplayActive = false;
                }
            }, 200);
        }
        autoplayActive = !autoplayActive; 
    };

    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
            autoplayActive = false; 
        }
    };

    
    let mapProps = $derived(
        {
            spikeScale,
            spike,
            getValue,
            height,
            path,
            geojson,
            dataReady
        }
    );

    let playerProps = $derived(
        { 
            autoplayActive, 
            autoplayYears, 
            selectedYear 
        }
    );

</script>

<h2>Global development of bee population</h2>
<div class="map-container">
    <Map
        {...mapProps}
    />
    
    <div
        class="controls-container"
    >
       <Controls {...playerProps}/>
    </div>
</div>

<style>

    h2 {
        text-align: center;
        font-size: 1.3rem;
        margin-bottom: 0.6rem;
    }

    .map-container {
        margin: auto;
        width: 70%;
        min-width: 800px;
    }


    .controls-container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    
    @media screen and (max-width: 1030px) {
        
        .map-container {
            width: 95%;
            min-width: auto;
        }
    }
</style>