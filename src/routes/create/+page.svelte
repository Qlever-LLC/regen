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

<main class="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-2xl mx-auto">
    {#if form?.certification}
      <div class="mb-6 text-center">
        <a
          href={URL.createObjectURL(new Blob([form.certification]))}
          download="certification.pdf"
          target="_blank"
          class="btn btn-success"
        >
          Download Certification
        </a>
      </div>
    {/if}

    <!-- Form Card -->
    <div class="card bg-white shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center">Create a Certificate</h2>

        <form method="POST" action="/api/create" class="space-y-4">
          {#await getFields() then fields}
            {#each fields as field}
              <div class="form-control">
                <label class="label" for={field.getName()}>
                  <span class="label-text">{field.getName()}</span>
                </label>
                <input
                  type="text"
                  id={field.getName()}
                  name={field.getName()}
                  class="input input-bordered w-full"
                />
              </div>
            {/each}
          {/await}

          <div class="card-actions justify-end mt-6">
            <button type="submit" class="btn btn-primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</main>