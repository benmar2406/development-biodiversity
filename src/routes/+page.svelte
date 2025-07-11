<script>
    import '../app.css'
    import BeePopulation from "$lib/components/BeePopulation.svelte";
    import DevelopmentBiodiversity from "$lib/components/DevelopmentBiodiversity.svelte";
</script>

<main>
    <h1>Development of Global Bee Population</h1>
    <BeePopulation />
</main>

<style>
    main {
        width: 80%;
        margin: 3rem auto;
    }


    h1 {
        text-align: center;
        width: 100%;
    }

     @media screen and (max-width: 1030px) {
        
        main{
            width: 95%;
        }
    }

</style>
