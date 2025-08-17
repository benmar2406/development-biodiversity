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
        width: 90%;
        margin: 3rem auto;
        max-width: 1000px;
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

    @media screen and (min-width: 1500px) {
        main {
            width: 80%;
        }
    }

</style>
