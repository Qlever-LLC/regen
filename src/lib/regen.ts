import type { PDFDocument, PDFForm } from "pdf-lib";
import type { Sadie } from "./types.ts";

export const computeScore = (formData: Record<string, any>) => {
  return {
    regenscore: formData?.["Regen Score"] as unknown as number,
    air: formData?.["Air Score"] as unknown as number,
    water: formData?.["Water Score"] as unknown as number,
    soil: formData?.["Soil Score"] as unknown as number,
    equity: formData?.["Equity Score"] as unknown as number,
  };
};

export const generateRegenPDF = async (
  formData: Record<string, any>,
  doc: PDFDocument,
): Promise<{
  pacData: Regenscore;
  dataOwner: Sadie["dataOwner"];
  form: PDFForm;
  doc: PDFDocument;
}> => {
  // Compute a score from the form
  const scores = computeScore(formData);

  const form = doc.getForm();
  const fields = form.getFields();

  for (const field of fields) {
    const name = field.getName();
    try {
      //TODO: Non-text field support
      const text = form.getTextField(name);
      text.setText(formData?.[name]?.toString());
    } catch (error: unknown) {
      console.warn(error, `Failed to handle form field ${name}`);
    }
  }

  return {
    form,
    doc,
    dataOwner: {
      name: formData?.["Company Name"]?.toString() || "",
    },
    pacData: {
      regenscore: scores,
    },
  };
};

export type Regenscore = {
  regenscore: {
    regenscore: number;
    air: number;
    water: number;
    soil: number;
    equity: number;
  };
};
