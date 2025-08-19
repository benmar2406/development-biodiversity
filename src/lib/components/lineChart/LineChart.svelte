<script>
    import { scaleLinear, scaleTime } from "d3";
    import { extent, max } from 'd3-array';
    import { line, curveBasis } from 'd3-shape';
    import { draw, fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { useVisibilityObserver } from '$lib/utils/useVisibilityObserver.svelte.js';
    import Tooltip from "../Tooltip.svelte";
    

    let { dataReady, data } = $props();

    let tooltipX = $state(null);
    let tooltipY = $state(null);
    let tooltipVisible = $state(false);
    let tooltipYear = $state("");
    let tooltipValue = $state("");
    let tooltipContent = $derived(`In ${tooltipYear} there were ${tooltipValue}m bees`)

    //chart defs
    let width = $state(0);
    const height = 350;
    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    let numberTicksY = 5;
    let drawCircles = $state(false);
    const beeMarker = 'bee.webp'

    let numberTicksX = $derived(
        data && data.length ? Math.round(data.length / 10) : 0
    );

    let elementToObserve;
    let observer = $state(null)

    const lineAnimDuration = 4000;

    onMount(() => {
         $effect(() => {
        if (data) {
            drawCircles = true;
        }
    });

        observer = useVisibilityObserver(elementToObserve);
    });

    const showToolTip = (event, point) => {
        tooltipX = event.clientX;
        tooltipY = event.clientY;
        tooltipVisible = true;
        tooltipYear = point.year;
        tooltipValue = Math.round(point.total / 1000000);
        console.log("tooltip func")
    }

    const hideToolTip = () => {
        tooltipVisible = false;
    }


    let xScale = $derived(
        data && width
        ? scaleTime()
                .domain(extent(data, (d) => new Date(d.year, 0, 1)))
                .range([margin.left, width - margin.right])
            : null
    );


    let yScale = $derived(
        data && width
        ? scaleLinear()
            .domain(extent(data, (d) => d.total))
            .range([height - margin.bottom, margin.top])
        : null
    );

    // optional, to draw straight lines between ticks, set like this to be able to display ticks and data points independently
    let filteredData = $derived(
        data
            ? data.filter((_, index) =>
                index % Math.max(1, Math.floor(data.length / numberTicksX)) == 0 || index === 0
            )
            : null
    );

    let lineGenerator = $derived(
        xScale && yScale 
            ? line()
                .x((d) => xScale(new Date(d.year, 0, 1)))
                .y((d) => yScale(+d.total))
            : null
    );

</script>


<div class="chart-container" bind:clientWidth={width}>
    <svg {width} {height}>
        {#if lineGenerator && filteredData && observer.isVisible}
            <path 
                in:draw={{duration: lineAnimDuration} }
                d={lineGenerator(filteredData)}
                stroke-width={1.5}
            />
        {/if}
        {#if filteredData && drawCircles && observer.isVisible}
            <g in:fade={{duration: 800, delay: lineAnimDuration + 100}}>
                {#each filteredData as point, index}
                    {#if index !== 0 && index !== filteredData.length - 1}
                        <circle
                            cx={xScale(new Date(point.year, 0, 1))}
                            cy={yScale(point.total)}
                            r="5"
                            onmouseenter={(event) => showToolTip(event, point)}
                            onmouseleave={() => hideToolTip()}
                            role="tooltip"
                        />
                    {:else if index  === filteredData.length - 1}
                        <image
                            href={beeMarker}
                            x={xScale(new Date(point.year, 0, 1)) - 15} 
                            y={yScale(point.total) - 15} 
                            width="30"
                            height="30"
                            onmouseenter={(event) => showToolTip(event, point)}
                            onmouseleave={() => hideToolTip()}
                            role="tooltip"
                        />
                    {/if}
                {/each}
            </g>
        {/if}
        {#if yScale}
            <g transform="translate({margin.left}, 0)">  
                <line
                    y1={yScale(yScale.domain()[0])}
                    y2={yScale(yScale.domain()[1])}
                />
                {#each yScale.ticks(numberTicksY) as tick}
                    {#if tick !== null}
                        <line 
                            x1={0}
                            x2={-6}
                            y1={yScale(tick)}
                            y2={yScale(tick)}
                        />
                    {/if}
                    <text
                        x={-9}
                        y={yScale(tick)}
                        text-anchor="end"
                        dominant-baseline="middle"
                    >
                        {`${tick / 1000000}m`} 
                    </text>
                {/each}
            </g>
            {/if}
            {#if xScale}
                <g transform="translate(0,{height - margin.bottom})">
                    <line
                        x1={margin.left} 
                        x2={width - margin.right}
                    />
                    {#each xScale.ticks(numberTicksX) as tick}
                        <line 
                            x1={xScale(tick)}
                            x2={xScale(tick)}
                            y1={0}
                            y2={6}
                        />
                        <text
                            x={xScale(tick)}
                            y={18}
                            text-anchor="middle"
                        >
                            {tick.getFullYear()}  
                        </text>
                    {/each}
                </g>
            {/if}  
    </svg>
</div>
<div bind:this={elementToObserve}></div>
{#if tooltipVisible}
   <Tooltip {tooltipContent} {tooltipX} {tooltipY}/>
{/if}

<style>

    .chart-container {
        margin: auto;
        background-color: var(--dark);
        border-radius: 10px;
        width: 100%;
    }

    line {
        stroke: var(--bright);
    }

    path {
        fill: none;
        stroke-width: 0.2rem;
        stroke: var(--orange)
    }

    text {
        font-family: 'Poppins';
        font-weight: 600;
        font-size: 0.7rem;
        fill: var(--bright);
    }

    circle {
        fill: var(--yellow);
        stroke: var(--dark);
        stroke-width: 1;
    }

    .tooltip {
        position: fixed;
        background: rgba(255, 255, 255, 0.9);
        padding: 0.3rem 1rem;
        border: 1px solid var(--yellow);
        border-radius: 0.5rem;
        box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 6px;
        pointer-events: none;
        font-size: 0.9rem;
        color: #333;
        z-index: 1000;
        max-width: 250px;
        word-wrap: break-word;
        margin: 1rem;
    }

</style>