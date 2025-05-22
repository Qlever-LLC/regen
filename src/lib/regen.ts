import type { PDFDocument } from "pdf-lib";

export const computeScore = (formData: FormData) => {
  return {
    regenscore: Number(formData.get("Regen Score")),
    air: Number(formData.get("Air Score")),
    water: Number(formData.get("Water Score")),
    soil: Number(formData.get("Soil Score")),
    equity: Number(formData.get("Equity Score")),
  };
};

export const generateRegenPDF = (formData: FormData, doc: PDFDocument) => {
  // Compute a score from the form
  const scores = computeScore(formData);

  const form = doc.getForm();
  const fields = form.getFields();

  for (const field of fields) {
    const name = field.getName();
    try {
      //TODO: Non-text field support
      const text = form.getTextField(name);
      text.setText(formData.get(name)?.toString());
    } catch (error: unknown) {
      console.warn(error, `Failed to handle form field ${name}`);
    }
  }

  form.flatten();
  return {
    doc,
    dataOwner: {
      name: formData.get("Company Name")?.toString() ?? "",
    },
    pacData: {
      regenscore: scores,
    },
  };
};

export interface Regenscore {
  regenscore: {
    regenscore: number;
    air: number;
    water: number;
    soil: number;
    equity: number;
  };
}
