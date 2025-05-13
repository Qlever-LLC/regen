<script lang="ts">
  import Dropzone from "../../lib/components/Dropzone.svelte";
  import Verification from "../../lib/components/Verification.svelte";

  const certificate = $state();
</script>

<main>
  <h1>Verify App</h1>

  {#if certificate}
    <Verification />
  {:else}
    <div class="card">
      <Dropzone />
    </div>
  {/if}
</main>

<style>
</style>
