/// <reference lib="deno.ns" />

import type { Action } from "@sveltejs/kit";
import { Buffer } from "node:buffer";
import { sha256 } from "js-sha256";

import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";
import { 
	generateRegenPDF,
	type Regenscore
} from './regen';
import { 
	PDFDict,
	PDFDocument,
	PDFName,
    PDFString
} from 'pdf-lib';
import { uploadFile } from "./drive";
import { trustedList } from './trusted.ts';;

// FIXME: How to do this the sveltekit way?
const cert = Deno.env.get("P12_CERT_PATH");
const CATALOG_ENTRY = "PAC"
const DRIVE_BASE_ID = "1Zycnk_gjSeRjb9O1sN__gInSIgcOaXcv"
const CATALOG_KEY = "payload"

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
	const customData = doc.context.obj({ [CATALOG_KEY]: PDFString.of(JSON.stringify(pac)) });
	doc.catalog.set(PDFName.of(CATALOG_ENTRY), doc.context.register(customData));

	const filled = await doc.save();
	const signer = cert ? new P12Signer(await Deno.readFile(cert)) : undefined;

	// TODO: Actually try to sign the PDF
	const signed = signer ? await signpdf.default.sign(filled, signer) : filled;
	await uploadFile({
		filename: `RegenScoreCert-${pacData.dataOwner.name}.pdf`,
		content: Buffer.from(signed), // or Uint8Array directly
		mimeType: 'application/pdf',
		parentFolderId: DRIVE_BASE_ID,
	  });
	return signed;
}) satisfies Action;

export type verification = {
	pdfContainsPAC: boolean;
	unchanged?: boolean;
	dataOwner?: {
		trusted: boolean;
	};
	escrowProvider?: {
		trusted: boolean;
	};
	code: {
		trusted: boolean;
	}
}

// Generic verification of the PAC
export const verify = (async (pdf: Uint8Array) => {

	//1. extract the PAC from the PDF
	const pac = await extractEmbeddedJSON(pdf);

	if (!pac) return {
		pdfContainsPAC: false,
	};

	//1. verify the pac wasn't modified
	const pacCopy = JSON.parse(JSON.stringify(pac));
	// biome-ignore lint/performance/noDelete: 
	delete pacCopy.sadie;

	const unchanged = sha256(JSON.stringify(pacCopy)) === pac.sadie;

	//1. confirm the PAC was signed by a trusted escrow provider
	const escrowTrusted = 
	  Object.values(trustedList).map(v => v.key).includes(pac.escrowProvider.key);

	return {
		verification: {
			pdfContainsData: true,
			unchanged,
			dataOwner: {
				trusted: escrowTrusted, // escrow 'vouches' for data owner 
			},
			escrowProvider: {
				trusted: escrowTrusted,
			},
			code: {
				trusted: true, // escrow 'vouches' for code 
			},
		},
		pac
	}
});


export const generatePAC = async (
	pacData: Record<string, number>
) => {
	
	return {
		...pacData,
		sadie: sha256(JSON.stringify(pacData)),
	}
}

export type PAC<T> = {
	sadie: string;
	dataOwner: {
		name: string;
		address: {
			street1: string;
			city: string;
			state: string;
			zip: string;
		},
		signature: string;
	},
	escrowProvider: {
		name: string;
		address: string;
		website: string;
		key: string;
	},
	pac: T; 
}


async function extractEmbeddedJSON(
	pdfBytes: Uint8Array
): Promise<PAC<Regenscore>| null> {
  const doc = await PDFDocument.load(pdfBytes);
  const catRef = doc.catalog.get(PDFName.of(CATALOG_ENTRY));
  
  if (!catRef) {
    console.warn(`No /${CATALOG_ENTRY} entry found in PDF catalog.`);
    return null;
  }

  const catEntry = doc.context.lookup(catRef);

  if (!(catEntry instanceof PDFDict)) {
    console.warn(`Expected ${CATALOG_ENTRY} to be a PDFDict.`);
    return null;
  }

  const pacData = catEntry.get(PDFName.of(`${CATALOG_KEY}`));

  if (!(pacData instanceof PDFString)) {
    console.warn(`No ${CATALOG_KEY} key in /${CATALOG_ENTRY} dictionary.`);
    return null;
  }

  try {
    const jsonString = pacData.decodeText();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse embedded JSON:", e);
    return null;
  }
}