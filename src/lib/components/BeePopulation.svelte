<script>
import { onMount } from 'svelte';
import * as d3 from 'd3';
import { csv, json } from 'd3-fetch';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { flip } from 'svelte/animate';
import { innerWidth } from 'svelte/reactivity/window';
import { base } from '$app/paths';

//data
let geojson = $state(null);
let data = $state([]);
let dataReady = $state(false);
//geometry
let projection = $state();
let path = $state();
//map specs
let width = $state(1200);
let height = 450;
let selectedYear = $state(1961);
let spikeScale = $state(0);
let mapX = $state(200);
//autoplay
let autoplayInterval = $state(null); 
let autoplayActive = $state(false);
//tooltip
let tooltipVisible = $state(false);
let tooltipX = $state(0);
let tooltipY = $state(0);
let tooltipContent = $state("");

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
        autoplayActive = !autoplayActive; // Toggle the state
    };

    const stopAutoplay = () => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
            autoplayActive = false; // Ensure state is updated
        }
    };

    const showTooltip = (event, feature) => {
        const code = +feature.properties.ISO_N3;
        const value = getValue(code);
        hoveredCountry = feature.properties.ADMIN;
        tooltipContent = `${feature.properties.ADMIN}: ${value.toLocaleString('en-EN')} bees`;
        tooltipVisible = true;
        moveTooltip(event);
    }

    const moveTooltip = (event) => {
        tooltipX = event.clientX + 10;
        tooltipY = event.clientY + 10;
    }

    const hideTooltip = () => {
        tooltipVisible = false;
        hoveredCountry = "Hover over a country";
    }
</script>
<h2>Global development of bee population</h2>
<div class="map-container">
    {#if geojson && dataReady}
        <div 
            class="map" 
            bind:clientWidth={width} 
            style:height={`${height}px`}
        >   
            <svg class="map-land" {width} {height}>
                <!-- gradient for spikes -->
                <defs>
                    <linearGradient id="spike-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f9ad6a" />
                        <stop offset="80%" stop-color="#f9e07f" />
                        <stop offset="100%" stop-color="grey" />
                    </linearGradient>
                </defs>

                <!-- Countries -->
                <g class="countries">
                    {#each geojson.features as feature}
                        <path d={path(feature)} />
                    {/each}
                </g>

                <!-- Spikes -->
                <g class="spikes-layer">
                    {#each geojson.features as feature}
                        {#if getValue(+feature.properties.ISO_N3) > 0}
                            {#key +feature.properties.ISO_N3}
                                <g transform={`translate(${path.centroid(feature)[0]}, ${path.centroid(feature)[1]})`}>
                                    <path
                                        d={spike(spikeScale(getValue(+feature.properties.ISO_N3)))}
                                        class="spikes"
                                        fill="url(#spike-gradient)"
                                        onmouseenter={(e) => showTooltip(e, feature)}
                                        onmousemove={(e) => moveTooltip(e)}
                                        onmouseleave={hideTooltip}
                                        role="tooltip"
                                    />
                                </g>
                            {/key}
                        {/if}
                    {/each}
                </g>
            </svg>
        </div>
        <!-- tooltip -->
        {#if tooltipVisible}
            <div 
                class="tooltip info" 
                style="top: {tooltipY}px; left: {tooltipX}px;"
            >
                {tooltipContent}
            </div>
        {/if}
    {:else}
    <div class="loading-container">
        <p 
            class="info"
            style:height={`${height}px`}
            >Loading map...
        </p>
    </div>
    {/if}
    <div 
        class="controls-container">
    <button 
        class="play-button {autoplayActive ? 'active' : ''}"
        onclick={autoplayYears}
        >&#9658;
    </button>
    <input
        type="range"
        min="1961"
        max="2023"
        step="1"
        bind:value={selectedYear}
        onclick={stopAutoplay}
        />
    <div class="year-container">
        <p class="info year">Year: {selectedYear}</p>
    </div>
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

    .map {
        border: solid var(--yellow);
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
    }

    .map-land {
        fill: grey;
        stroke: var(--yellow);
        stroke-width: 0.4;
        filter: drop-shadow(0px 8px 8px rgba(149, 157, 165, 0.2));
                height: 100%;
    }

    .spikes {
        fill-opacity: 0.9;
        stroke-width: 0;
        transition: all;
        cursor: pointer;
    }

    .controls-container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 70%;
        margin: auto;
        display: block;
        margin: 1rem auto;
        flex: 1;
}

    /***** Track Styles *****/
    /***** Chrome, Safari, Opera, and Edge Chromium *****/
    input[type="range"]::-webkit-slider-runnable-track {
        background: var(--yellow);
        height: 1.5rem;
        border-radius: 10px;
        box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
    }

    /******** Firefox ********/
    input[type="range"]::-moz-range-track {
        background: var(--yellow);
        height: 1.5rem;
        border-radius: 5rem;
        box-shadow: rgb(249, 224, 127) 3px 3px 6px 0px inset, rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
    }

    /***** Thumb Styles *****/
    /***** Chrome, Safari, Opera, and Edge Chromium *****/
    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        background-color: var(--red);
        background-color: rgb(255, 120, 0);
        height: 1.5rem;
        width: 1.5rem;    
        transition: all;
        border-radius: 50%;
        cursor: grab;

    }

    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .year {
        text-align: center;
        text-decoration: underline;
        text-decoration-color: var(--red);
    }

    .year-container {
        width: 6rem;
    }

    .play-button {
        height: 2.3rem;
        width: 2.3rem;
        margin: 0.5rem;
        border-radius: 50%;
    }

    .play-button.active {
        border: solid 1px var(--red);
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
    }

    .tooltip {
        position: fixed;
        background: rgba(255, 255, 255, 0.9);
        padding: 0.5rem 1rem;
        border: 1px solid var(--yellow);
        border-radius: 0.5rem;
        box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 6px;
        pointer-events: none;
        font-size: 0.9rem;
        color: #333;
        z-index: 1000;
        max-width: 250px;
        word-wrap: break-word;
    }

    @media screen and (max-width: 1030px) {
        
        .map-container {
            width: 95%;
            min-width: auto;
        }
    }
</style>