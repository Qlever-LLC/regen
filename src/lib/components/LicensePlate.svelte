<script lang="ts">
  import type { Regenscore } from "$lib/regen";
  import type { UnpackedSadiePAC } from "$lib/types";

  interface Props {
    pac?: UnpackedSadiePAC<Regenscore>;
  }

  let {
    pac = $bindable(),
  }: Props = $props();
</script>

{#if pac}
  <div>
    <h2>Data Owner</h2>
    {pac.sadie.dataOwner.name}

    <h2>Escrow Provider</h2>
    {pac.sadie.escrowProvider.name}

    <h2>Code Execution</h2>
  </div>
{:else}
  <h2>License Plate data couldn't be extracted.</h2>
{/if}
