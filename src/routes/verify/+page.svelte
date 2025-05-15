<script lang="ts">
  import Dropzone from "$lib/components/Dropzone.svelte";
  import Verification from "$lib/components/Verification.svelte";

  let { 
    verification,
    pac
  } = $state({verification: undefined, pac: undefined});
  console.log(verification, pac);
</script>

<main>
  <h1>Verify App</h1>

  {#if verification}
    <Verification bind:verification={verification} bind:pac={pac} />
  {:else}
    <div class="card">
      <Dropzone bind:verification={verification} bind:pac={pac} />
    </div>
  {/if}
</main>

<style>
</style>
