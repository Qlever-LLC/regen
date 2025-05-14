import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import { R } from "../../build/server/chunks/index-2de64aee.js";
import { _ } from '../../.svelte-kit/ambient';


export const computeScore = (_data: FormData) => {
	return {
		regenscore: _data.get("RegenScore") as unknown as number,
		air: _data.get('AirScore') as unknown as number,
		water: _data.get('WaterScore') as unknown as number,
		soil: _data.get('SoilScore') as unknown as number,
		equity: _data.get('EquityScore') as unknown as number,
	};
}


export const generateRegenPDF = async (
	data: FormData,
	scores: Record<string, number>,
) => {
	const template = await fetch("/template2.pdf");
	const doc = await PDFDocument.load(await template.arrayBuffer());
	// FIXME: Probably should just have the placeholder builtin to template
	pdflibAddPlaceholder({
		pdfDoc: doc,
		reason: "test",
		contactInfo: "test@qlever.io",
		name: "test",
		location: "here",
	});

	const form = doc.getForm();
	const fields = form.getFields();

	for (const field of fields) {
		const name = field.getName();
		try {
			//TODO: Non-text field support
			const text = form.getTextField(name);
			text.setText(data.get(name)?.toString());
		} catch (error: unknown) {
			console.warn(error, `Failed to handle form field ${name}`);
		}
	}

	const pacData = {
		dataOwner: {
			name: data.get("DatOwnerName")?.toString(),
			address: data.get("DatOwnerAddress")?.toString(),
			website: data.get("DatOwnerWebsite")?.toString(),
		},
		escrowProvider: {
			name: "The Qlever Company, LLC",
			address: "",
			website: "https://www.qlever.io",
		},
		licensePlate: {
			header: "Certificate Information",
			product: data.get("Product")?.toString(),
			origin: data.get("Origin")?.toString(),
			destination: data.get("Destination")?.toString(),
			certificateId: data.get("CertificateId")?.toString(),
			issueDate: new Date().toLocaleDateString(),
		}
	}
	
	return { form, doc, pacData };
}