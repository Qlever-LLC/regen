<script lang="ts">
  let {
    pac = $bindable()
  } = $props();
</script>
  
{#if pac}
  <div>
    <h2>Data Owner</h2>
    {pac.dataOwner.name}

    <h2>Escrow Provider</h2>
    {pac.escrowProvider.name}
    
    <h2>Code Execution</h2>
  </div>
{:else}
  <h2>License Plate data couldn't be extracted.</h2>
{/if}