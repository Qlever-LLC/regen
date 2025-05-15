<script lang="ts">
  import { PDFDocument } from "pdf-lib";

  async function getFields() {
    const template = await fetch("/template2.pdf");
    const doc = await PDFDocument.load(await template.arrayBuffer());
    const form = doc.getForm();
    const fields = form.getFields();
    return fields;
  }

  const { form } = $props();
</script>

<main>
  {#if form?.certification}
    <a
      href={URL.createObjectURL(new Blob([form.certification]))}
      download="certification.pdf"
      target="_blank"
    >
      Download generated certification
    </a>
  {/if}
  <!-- FIXME: action="?/create" for svelte kit form action breaks on lambda -->
  <form method="POST" action="?">
    {#await getFields() then fields}
      {#each fields as field}
        {field.getName()} <input type="text" name={field.getName()} value="" />
      {/each}
    {/await}
    <button type="submit">Create</button>
  </form>
</main>
