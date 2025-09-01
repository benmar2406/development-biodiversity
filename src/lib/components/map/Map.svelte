<script>

    import { width } from '$lib/shared';
    import { zoomPan } from '$lib/attachments/zoomPan';
    import Tooltip from '../Tooltip.svelte';

    let tooltipVisible = $state(false);
    let tooltipX = $state(0);
    let tooltipY = $state(0);
    let tooltipCountry = $state("");
    let tooltipValue = $state("");
    let tooltipContent = $derived(`${tooltipCountry}: ${tooltipValue} bees`);

    let { 
        height, 
        geojson, 
        dataReady, 
        spike, 
        spikeScale,
        getValue, 
        path,
        onDrag,
        baseWidth
    } = $props();

    const showTooltip = (event, feature) => {
        const code = +feature.properties.ISO_N3;
        const value = getValue(code);
        tooltipCountry = feature.properties.ADMIN
        tooltipValue = value.toLocaleString('en-EN')
        tooltipVisible = true;
        tooltipX = event.clientX;
        tooltipY = event.clientY;
    }

    const moveTooltip = (event) => {
        tooltipX = event.clientX;
        tooltipY = event.clientY;
    }

    const hideTooltip = () => {
        tooltipVisible = false;
    }

</script>

{#if geojson && dataReady && spike && spikeScale && getValue && path}
    <div 
        class="map" 
        bind:clientWidth={$width} 
        style:height={`${height}px`}
    >   
        <svg 
            class="map-land" 
            width={$width} 
            {height} 
            style="touch-action:none; cursor: grab;"
        >
            <g class="viewport" {@attach zoomPan({ min: 0.4, max: 3 })}>
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
                                    fill="#f9ad6a"
                                    onmouseenter={(e) => showTooltip(e, feature)}
                                    onmousemove={(e) => moveTooltip(e)}
                                    onmouseleave={hideTooltip}
                                    role="tooltip"
                                />
                                <line 
                                    x1={-baseWidth / 1.3}
                                    x2={baseWidth / 1.3}
                                
                                />
                            </g>
                        {/key}
                    {/if}
                {/each}
            </g>
            </g>
        </svg>
    </div>
{:else}
    <div class="loading-container">
        <p 
            class="info"
            style:height={`${height}px`}
            >Loading map...
        </p>
    </div>
{/if}
<!-- tooltip -->
{#if tooltipVisible}
    <Tooltip 
        {tooltipContent} 
        {tooltipX} 
        {tooltipY} />
{/if}

<style>

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
        cursor: grab;
    }

    .map-land:drag {

    }

    .spikes {
        fill-opacity: 0.9;
        stroke-width: 0;
        transition: all;
        cursor: pointer;
    }
    </style>