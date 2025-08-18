<script>
  let {
    selectedYear = $bindable(1961),     
    autoplayActive,
    autoplayYears,
    stopAutoplay,
    getValue
  } = $props();

</script>

<button
  class="play-button {autoplayActive ? 'active' : ''}"
  onclick={autoplayYears}    
>
  {autoplayActive ? '⏸' : '▶'}
</button>

<input
  type="range"
  min="1961"
  max="2023"
  step="1"
  bind:value={selectedYear}
/>

<div class="year-container">
  <p class="info year">Year: {selectedYear}</p>  
</div>


<style>
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
</style>