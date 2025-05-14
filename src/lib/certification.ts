/// <reference lib="deno.ns" />

import type { Action } from "@sveltejs/kit";
import { Buffer } from "node:buffer";

import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";
import { 
	generateRegenPDF
} from "./regen";
import { 
	PDFDocument,
	PDFName
} from 'pdf-lib';
import { uploadFile } from "./drive";

// FIXME: How to do this the sveltekit way?
const cert = Deno.env.get("P12_CERT_PATH");

/**
 * Takes a request of form data and generates the PDF
 */
export const create = (async ({ 
	request,
	fetch
}) => {
	// Get regen form data
	const data = await request.formData();
	const template = await fetch("/template2.pdf");
	const doc = await PDFDocument.load(await template.arrayBuffer());

	// Populate the output PDF and PAC
	const { form, pacData } = await generateRegenPDF(data, doc);

	// @ts-expect-error fix pacData type later
	const pac = await generatePAC(pacData);

	form.flatten();

	// Now add the PAC json
	const customData = doc.context.obj({ Data: JSON.stringify(pac) });
	doc.catalog.set(PDFName.of('CustomData'), doc.context.register(customData));

	const filled = await doc.save();
	const signer = cert ? new P12Signer(await Deno.readFile(cert)) : undefined;

	// TODO: Actually try to sign the PDF
	const signed = signer ? await signpdf.default.sign(filled, signer) : filled;
	await uploadFile({
		filename: `RegenScoreCert-${pacData.dataOwner.name}.pdf`,
		content: Buffer.from(signed), // or Uint8Array directly
		mimeType: 'application/pdf',
		parentFolderId: '1Zycnk_gjSeRjb9O1sN__gInSIgcOaXcv' 
	  });
	return signed;
}) satisfies Action;


// Generic verification of the PAC
export const verify = (async () => {

}) satisfies Action;


export const generatePAC = async (
	pacData: Record<string, number>
) => {
	return {
		sadie: 'foo'
	}
}

export type PAC = {
	sadie: string;
}