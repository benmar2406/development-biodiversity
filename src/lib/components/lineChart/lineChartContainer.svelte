<script>
    import LineChart from "./LineChart.svelte";

    let { data, dataReady } = $props();
</script>

<section>
    <div class="chart">
        <LineChart {data} {dataReady}/>
    </div>
    <article>
        <h3>Lorem ipsum dolor sit amet</h3>
        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
        <p>At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
    </article>
</section>

<style>
    

    @media screen and (min-width: 800px) {
        section {
            margin-top: 4rem;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }

        article {
            order: 1;
        }

        .chart {
            order: 2;
            min-width: 0;
        }
    }

  
</style>
