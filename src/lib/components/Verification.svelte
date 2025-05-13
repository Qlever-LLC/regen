<script lang="ts">
  /*
  const dataOwner = $state(false);
  const escrowProvider = $state(false);
  const codeExecution = $state(false);
  */
</script>
  
<div>
  <h1>Data Owner</h1>
  {#if dataOwner}
    <p>Verified!</p>
  {:else}
    : <p>Not Verified</p>
  {/if}

  <h1>Escrow Provider</h1>
  {#if escrowProvider}
    <p>Verified!</p>
  {:else}
    : <p>Not Verified</p>
  {/if}

  <h1>Code Execution</h1>
  {#if codeExecution}
    <p>Verified!</p>
  {:else}
    : <p>Not Verified</p>
  {/if}

</div>

  <style>
  </style>