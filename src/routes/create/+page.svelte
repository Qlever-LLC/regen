<script lang="ts">
  import { PDFDocument } from "pdf-lib";

  async function getFields() {
    const template = await fetch("/template3.pdf");
    const doc = await PDFDocument.load(await template.arrayBuffer());
    const form = doc.getForm();
    const fields = form.getFields();
    return fields;
  }

  const { form } = $props();
</script>
<main class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    {#if form?.certification}
      <div class="mb-6 text-center">
        <a
          href={URL.createObjectURL(new Blob([form.certification]))}
          download="certification.pdf"
          target="_blank"
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm"
        >
          Download Certification
        </a>
      </div>
    {/if}

    <!-- The Form -->
    <form method="POST" action="?" class="bg-white shadow-lg rounded-lg px-8 py-10 space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Create a certificate</h2>

      {#await getFields() then fields}
        {#each fields as field}
          <div class="grid grid-cols-4 items-center gap-4">
            <label
              for={field.getName()}
              class="col-span-1 text-right text-sm font-medium text-gray-700"
            >
              {field.getName()}
            </label>
            <input
              type="text"
              id={field.getName()}
              name={field.getName()}
              class="col-span-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        {/each}
      {/await}

      <div class="text-right">
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm"
        >
          Create
        </button>
      </div>
    </form>
  </div>
</main>