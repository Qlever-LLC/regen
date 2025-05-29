<script lang="ts">
  import type { PACVerification } from "$lib/certification";
  import type { Regenscore } from "$lib/regen";
  import type { UnpackedSadiePAC } from "$lib/types";

  interface Props {
    verification?: PACVerification;
    pac?: UnpackedSadiePAC<Regenscore>;
  }

  let {
    verification = $bindable(),
    pac = $bindable(),
  }: Props = $props();

  async function onFile(file: File) {
    const result = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: file,
    });

    const data = await result.json();
    ({ verification, pac } = data);
  }
  let dragging = $state(false);

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      onFile(files[0]); // Handle the first file
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragging = true;
  }

  function handleDragLeave() {
    dragging = false;
  }

  function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      onFile(input.files[0]);
    }
  }
</script>

<div
  class:dragging
  class="dropzone"
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  role="region"
  aria-label="File dropzone"
>
  <p>Drop a certificate here to verify</p>
  <input type="file" onchange={handleFileInput} />
</div>

<style>
  .dropzone {
    border: 2px dashed #aaa;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    transition: background-color 0.2s;
    cursor: pointer;
    position: relative;
  }

  .dropzone.dragging {
    background-color: #eef;
    border-color: #66f;
  }

  input[type="file"] {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
  }
</style>
