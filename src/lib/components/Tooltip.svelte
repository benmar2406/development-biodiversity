
<script>
    let { tooltipContent, tooltipX, tooltipY } = $props();
</script>
<div 
    class="tooltip info" 
    style="top: {tooltipY}px; left: {tooltipX}px;"
>
    {tooltipContent}
</div>

<style>
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
        margin: 1rem;
    }
</style>