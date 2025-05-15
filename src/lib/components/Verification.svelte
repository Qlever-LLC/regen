<script lang="ts">
  import LicensePlate from './LicensePlate.svelte';

  let { 
    verification = $bindable(),
    pac = $bindable()
  } = $props();
  let { dataOwner, escrowProvider, codeExecution } = verification;
  console.log(verification, pac)
</script>
  
<div>
  <LicensePlate pac={pac} />
  <hr />
  <h1>Data Owner: </h1>
  {#if dataOwner}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

  <h1>Escrow Provider:</h1>
    <p>{pac.escrowProvider.name}</p>
  {#if escrowProvider}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

  <h1>Code Execution:</h1>
  {#if codeExecution}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

</div>

  <style>
  </style>