<script>
import { json } from 'd3-fetch';
import { onMount } from 'svelte';
import { setContext } from 'svelte';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3';
import { scaleLinear } from 'd3-scale';
import { flip } from 'svelte/animate';
import { innerWidth } from 'svelte/reactivity/window';
import { base } from '$app/paths';
import { width } from '$lib/shared';
import Map from './Map.svelte';
import Controls from './Controls.svelte';

let  { data, dataReady } = $props();
//data
let geojson = $state(null);
//geometry
let projection = $state();
let path = $state();
//map specs   
//let width = $state(1200);
let height = 450;
let selectedYear = $state(1961);
let mapX = $state(200);
//autoplay
let autoplayInterval = $state(null); 
let autoplayActive = $state(false);

//define spike
const spike = (height) => {
const width = 10; // base width of triangle
return `M${-width / 2},0L0,${-height}L${width / 2},0Z`;
}

// load and transform data
    onMount(async () => {
        geojson = await json(`${base}/data/countries.json`);
        projection = geoMercator().scale(400).translate([mapX, 550]);
        path = geoPath(projection);
    });

    //generate scale
    let globalMax = $derived(
        data && Array.isArray(data) && dataReady
            ? d3.max(data, d => d.value) // oder d.population, je nach Datenstruktur
            : 0
    );

    let spikeScale = $derived(
        globalMax !== undefined
            ? d3.scaleLinear().domain([0, globalMax]).range([0, 300])
            : null
    );

    // find bee population value for country
    const getValue = (countryCodeToDisplay) => {

        if (!Array.isArray(data) || selectedYear == null) return 0;

        const code = +countryCodeToDisplay;
        const found = data.find(d =>
            d.countryCode === code &&
            d.year === selectedYear
        );
        return found?.value ?? 0;
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

</script>

<section>
    <div class="map-container">
        <Map
            {...mapProps}
        />
        
        <div
            class="controls-container"
        >
        <Controls 
            {autoplayActive}
            {autoplayYears} 
            bind:selectedYear
            {getValue}
        />
        </div>
    </div>
</section>

<style>

    .map-container {
        margin: auto;
    }


    .controls-container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .map-container {
        width: 100%;
    }

  

    
    @media screen and (max-width: 1030px) {
        
        .map-container {
            width: 95%;
            min-width: auto;
        }
    }
</style>