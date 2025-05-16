/// <reference lib="deno.ns" />

import forge from "node-forge";
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
const der = Deno.env.get("CERT_DER");
const passphrase = Deno.env.get("CERT_PASS");
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
	const template = await fetch("/template3.pdf");
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
	const signer = cert ? new P12Signer(await Deno.readFile(cert), {passphrase}) : undefined;

	// TODO: Actually try to sign the PDF
	const signed = signer ? await signpdf.default.sign(filled, signer) : filled;

	// Sync to Google Drive
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
export const verify = (async (pdfBytes: Uint8Array) => {
	//1. verify the pdf signature
	const { signedData: pdf, signature, valid } = await extractSignatureData(pdfBytes);

	//2. extract the PAC from the PDF
	const pac = await extractEmbeddedJSON(pdf);

	const pdfContainsData = !!pac;
	if (!pdfContainsData) return { pdfContainsData }

	//3. verify the pac wasn't modified
	const pacCopy = JSON.parse(JSON.stringify(pac));
	// biome-ignore lint/performance/noDelete: 
	delete pacCopy.sadie;

	const unchanged = sha256(JSON.stringify(pacCopy)) === pac.sadie;

	//4. confirm the PAC was signed by a trusted escrow provider
	const escrowTrusted = 
	  Object.values(trustedList).map(v => v.key).includes(pac.escrowProvider.key);

	return {
		verification: {
			pdfContainsData,
			pdfSigned: !!signature,
			valid,
			unchanged,
			dataOwner: {
				present: !!pac.dataOwner.signature,
				trusted: escrowTrusted, // escrow 'vouches' for data owner 
			},
			escrowProvider: {
				trusted: escrowTrusted,
			},
			code: {
				trusted: escrowTrusted, // escrow 'vouches' for code 
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

export async function extractSignatureData(pdfBytes: Uint8Array): Promise<{
	signedData: Uint8Array;
	signature: Uint8Array;
	valid: boolean;
}> {
	const pdfStr = new TextDecoder("latin1").decode(pdfBytes); // latin1 preserves raw bytes
  
	// Extract the /ByteRange
	const byteRangeMatch = pdfStr.match(
	  /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/
	);
	if (!byteRangeMatch) throw new Error("No /ByteRange found in PDF");
  
	const [start1, len1, start2, len2] = byteRangeMatch
	  .slice(1)
	  .map((n) => Number.parseInt(n, 10));
  
	const signedData = new Uint8Array(
	  len1 + len2
	);
	signedData.set(pdfBytes.slice(start1, start1 + len1), 0);
	signedData.set(pdfBytes.slice(start2, start2 + len2), len1);
  
	// Extract the /Contents
	const contentsMatch = pdfStr.match(/\/Contents\s*<([0-9A-Fa-f\s]+)>/);
	if (!contentsMatch) throw new Error("No /Contents found in PDF");
  
	const hex = contentsMatch[1].replace(/\s+/g, '');
	let signature = Uint8Array.from(
		(hex.match(/.{2}/g) || []).map((b) => Number.parseInt(b, 16))
	);
  
	// Strip trailing 0-padding (optional, but common with fixed-length buffers)
	while (signature[signature.length - 1] === 0) {
	  signature = signature.slice(0, -1);
	}
  
	return { 
		signedData,
		signature, 
		valid: await verifySignature({signedData, signature })
	};
}

// Convert your Uint8Array signature into a Forge-readable DER buffer
/*
function uint8ArrayToForgeBuffer(data: Uint8Array) {
	const binaryStr = Array.from(data)
	  .map((b) => String.fromCharCode(b))
	  .join('');
	  //@ts-expect-error "Forge doesn’t publish good typings — so any type enforcement from Deno is guessing wrong."
	return forge.util.createBuffer(binaryStr, 'binary');
}
 
export function validateSignature(signedDataUint8: Uint8Array, signatureUint8: Uint8Array): boolean {
  try {
    // Parse CMS signature (PKCS#7)
    const der = uint8ArrayToForgeBuffer(signatureUint8);
    const asn1 = forge.asn1.fromDer(der);
    const p7 = forge.pkcs7.messageFromAsn1(asn1);

    // Check if signature is detached (i.e., external data was signed)
    if (!p7.signers.length) throw new Error("No signers found in signature.");

    // Convert signed content to forge buffer
    const signedData = forge.util.createBuffer(
		forge.util.binary.raw.encode([...signedDataUint8]),
		'binary'
	);

    // Validate the signature (note: assumes detached mode)
    const valid = p7.verify({
      detached: true,
      content: signedData
    });

    return valid;
  } catch (e) {
    console.error("Signature validation failed:", e);
    return false;
  }
}

function isSignedData(
	obj: forge.pkcs7.PkcsEnvelopedData | forge.pkcs7.PkcsSignedData
): obj is forge.pkcs7.PkcsSignedData {
	return typeof (obj as any).signers !== "undefined";
}
*/

async function verifySignature({
	signedData,
	signature,
  }: {
	signedData: Uint8Array;
	signature: Uint8Array;
  }): Promise<boolean> {
	const certificateDer = der ? await Deno.readFile(der) : undefined;

	if (!certificateDer) throw new Error("Certificate not provided.");
	console.log('CERTIFICATE DER', certificateDer)
	// Import the certificate
	const cert = await crypto.subtle.importKey(
	  "spki", // X.509 SubjectPublicKeyInfo (public key format)
	  certificateDer,
	  {
		name: "RSASSA-PKCS1-v1_5",
		hash: "SHA-256",
	  },
	  false,
	  ["verify"]
	);
	console.log('IMPORTED CERTIFICATE')
  
	// Verify the signature
	const valid = await crypto.subtle.verify(
	  {
		name: "RSASSA-PKCS1-v1_5",
		hash: "SHA-256",
	  },
	  cert,
	  signature,
	  signedData
	);

	console.log('FINISHED', valid);
  
	return valid;
}
  