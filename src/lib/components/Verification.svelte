<script lang="ts">
  import LicensePlate from './LicensePlate.svelte';

  let { 
    verification = $bindable(),
    pac = $bindable(),
  } = $props();
  console.log({ verification, pac });
  const { dataOwnerTrusted, escrowProviderTrusted, codeExecutionTrusted } = verification;
  const { runAdditionalPACsLink } = pac.sadie.escrowProvider;
</script>

<div class="card bg-base-100 shadow-xl mt-6">
  <div class="card-body space-y-4">
    <div class="border-t border-base-300 pt-4">
      <LicensePlate pac={pac} />
    </div>

    <div class="divider">Verification Status</div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Data Owner:</h3>
        {#if dataOwnerTrusted}
          <span class="badge badge-success">Verified</span>
        {:else}
          <span class="badge badge-error">Not Verified</span>
        {/if}
      </div>

      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Escrow Provider:</h3>
        {#if escrowProviderTrusted}
          <span class="badge badge-success">Verified</span>
        {:else}
          <span class="badge badge-error">Not Verified</span>
        {/if}
      </div>

      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Code Execution:</h3>
        {#if codeExecutionTrusted}
          <span class="badge badge-success">Verified</span>
        {:else}
          <span class="badge badge-error">Not Verified</span>
        {/if}
      </div>
    </div>

    <div class="text-right">
      <a href={runAdditionalPACsLink} class="btn btn-outline btn-primary">
        Run Additional PACs
      </a>
    </div>
  </div>
</div>