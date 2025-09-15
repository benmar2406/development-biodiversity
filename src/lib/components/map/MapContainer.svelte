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
    import Map from './Map.svelte';
    import Controls from './Controls.svelte';


    let  { data, dataReady } = $props();

    //data
    let geojson = $state(null);

    //geometry
    let mapX = $state(250);
    let mapY = $state(550);
    let scaleFactor = 400;

    //map specs   
    let height = 450;
    let selectedYear = $state(1961);

    //autoplay
    let autoplayInterval = $state(null); 
    let autoplayActive = $state(false);

    //define spike
    const baseWidth = 10; //global because needed for underlines in child component

    const spike = (height) => {
        return `M${-baseWidth / 2},0L0,${-height}L${baseWidth / 2},0Z`;
    }

    // load and transform data
    onMount(async () => {
        geojson = await json(`${base}/data/countries.json`);
    });

     // recompute projection+path when mapX or mapY change
    let projection = $derived(d3.geoMercator().scale(scaleFactor).translate([mapX, mapY]));
    let path = $derived(d3.geoPath().projection(projection));

    //generate scale
    let globalMax = $derived(
        data && Array.isArray(data) && dataReady
            ? d3.max(data, d => d.value) 
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
            dataReady,
            baseWidth,
            scaleFactor
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