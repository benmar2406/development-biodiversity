<script>
import { onMount } from 'svelte';
import * as d3 from 'd3';
import { csv, json } from 'd3-fetch';
import { geoPath, geoMercator } from 'd3-geo';
import { extent } from 'd3-array';
import { geoBounds } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { flip } from 'svelte/animate';
import { innerWidth } from 'svelte/reactivity/window';
import { base } from '$app/paths';


let geojson = $state(null);
let data = $state([]);
let selectedYear = $state(1961);
let dataReady = $state(false);
let width = $state(1200);
let height = 450;
let projection = $state();
let path = $state();
let spikeScale = $state(0);
let hoveredCountry = $state("Hover over a country");
let mapX = $state(200);
let autoplayInterval = $state(null); 
let autoplayActive = $state(false);

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

function spike(height) {
  const width = 10; // base width of triangle
  return `M${-width / 2},0L0,${-height}L${width / 2},0Z`;
}

const getValue = (countryCodeToDisplay) => {
    const code = +countryCodeToDisplay;
    const found = data.find(d =>
        d.countryCode === code &&
        d.year === selectedYear
    );
    return found?.population ?? 0;
};

$effect(() => {
    innerWidth.current < 200 ? mapX = 100 : 250;
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

</script>
<div class="map-container">
    <p class="info">Bees in: {hoveredCountry}</p>
    {#if geojson && dataReady}
        <div class="map" bind:clientWidth={width}>
            <svg class="map-land" {width} {height}>
                <defs>
                    <linearGradient id="spike-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f9ad6a" />
                        <stop offset="80%" stop-color="#f9e07f" />
                        <stop offset="100%" stop-color="grey" />
                    </linearGradient>
                </defs>

                <!-- Countries  -->
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
                                    />
                                </g>
                            {/key}
                        {/if}
                    {/each}
                </g>
            </svg>

        </div>
    {:else}
        <p class="info">Loading map...</p>
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
    <p class="info year">Year: {selectedYear}</p>
</div>
</div>

<style>

    .map-container {
        margin: auto;
        height: 500px;
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
    }


    .spikes {
        fill-opacity: 0.9;
        stroke-width: 0;
        transition: all;
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
        height: 1.5rem;
        width: 1.5rem;    
        transition: all;
        border-radius: 50%;
        cursor: grab;

    }

    .year {
        text-align: center;
        text-decoration: underline;
        text-decoration-color: var(--red);
        margin: 0.5rem;
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

    @media screen and (max-width: 1030px) {
        
        .map-container {
            width: 95%;
            min-width: auto;
        }
    }
</style>