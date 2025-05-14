/// <reference lib="deno.ns" />

import type { Action } from "@sveltejs/kit";

import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";
import { 
	computeScore,
	generateRegenPDF
} from "./regen";
import { PDFName } from 'pdf-lib';
import { generateKeyPairSync } from "node:crypto";

// FIXME: How to do this the sveltekit way?
const cert = Deno.env.get("P12_CERT_PATH");

/**
 * Takes a request of form data and generates the PDF
 */
export const create = (async ({ request }) => {
	// Get regen form data
	const data = await request.formData();


	// Populate the output PDF and PAC
	const { doc, form, pacData } = await generateRegenPDF(data);

	// @ts-expect-error fix pacData type later
	const pac = await generatePAC(pacData);

	form.flatten();

	// Now add the PAC json
	const customData = doc.context.obj({ Data: JSON.stringify(pac) });
	doc.catalog.set(PDFName.of('CustomData'), doc.context.register(customData));

	const filled = await doc.save();
	const signer = cert ? new P12Signer(await Deno.readFile(cert)) : undefined;

	// TODO: Actually try to sign the PDF
	return signer ? await signpdf.default.sign(filled, signer) : filled;
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