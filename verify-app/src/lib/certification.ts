/// <reference lib="deno.ns" />

import type { Action } from "@sveltejs/kit";

import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";

// FIXME: How to do this the sveltekit way?
const cert = Deno.env.get("P12_CERT_PATH");

/**
 * Takes a request of form data and generates the PDF
 */
export const create = (async ({ request, fetch }) => {
	const template = await fetch("/template.pdf");
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
	const data = await request.formData();
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

	form.flatten();
	const filled = await doc.save();
	const signer = cert ? new P12Signer(await Deno.readFile(cert)) : undefined;

	// TODO: Actually try to sign the PDF
	return signer ? await signpdf.default.sign(filled, signer) : filled;
}) satisfies Action;

export const verify = (async () => {}) satisfies Action;
