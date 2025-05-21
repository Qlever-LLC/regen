<script lang="ts">
  import Dropzone from "$lib/components/Dropzone.svelte";
  import Verification from "$lib/components/Verification.svelte";

  let { 
    verification,
    pac
  } = $state({verification: undefined, pac: undefined});
  console.log(verification, pac);
</script>

<main class="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-2xl">
    <h1 class="text-4xl font-bold text-center text-primary mb-8">Verify App</h1>

    {#if verification}
      <div class="card shadow-xl bg-base-100">
        <div class="card-body">
          <Verification bind:verification={verification} bind:pac={pac} />
        </div>
      </div>
    {:else}
      <div class="card shadow-xl bg-base-100">
        <div class="card-body">
          <Dropzone bind:verification={verification} bind:pac={pac} />
        </div>
      </div>
    {/if}
  </div>
</main>

<style lang="postcss">
  @reference "tailwindcss"
  global(html) {
    background-color: theme(--color-gray-100)
  }
</style>
