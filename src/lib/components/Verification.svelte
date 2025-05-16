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
  <hr />
  <LicensePlate pac={pac} />
  <hr />
  <h3>Data Owner: </h3>
  {#if dataOwner}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

  <h3>Escrow Provider:</h3>
  {#if escrowProvider}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

  <h3>Code Execution:</h3>
  {#if codeExecution}
    <p>Verified!</p>
  {:else}
    <p>Not Verified</p>
  {/if}

</div>

  <style>
  </style>