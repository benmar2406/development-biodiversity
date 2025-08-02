<script>
    import '../app.css'
    import BeePopulation from "$lib/components/map/BeePopulation.svelte";
</script>

<main>
    <h1>Bee Population: The Buzz Over Time</h1>
    <BeePopulation />
</main>

<style>
    main {
        width: 80%;
        margin: 3rem auto;
    }


    h1 {
        text-align: center;
        width: fit-content;
        background-color: var(--yellow);
        margin: auto;
        margin-bottom: 3rem;
        padding: 0.7rem 1.6rem;
        border-radius: 1.6rem;
    }

     @media screen and (max-width: 1030px) {
        
        main{
            width: 95%;
        }
    }

</style>
