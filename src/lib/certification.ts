/// <reference lib="deno.ns" />

import forge from "node-forge";
import type { Action } from "@sveltejs/kit";
import { Buffer } from "node:buffer";
import { sha256 } from "js-sha256";
import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type {
  UnpackedSadiePAC,
  Sadie,
  PAC,
} from "./types";

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
//const cert = Deno.env.get("P12_CERT_PATH");
//const der = Deno.env.get("CERT_DER");
const PLACEHOLDER = { 'SADIE': 'x'.repeat(1000) };
const ALGORITHM = "RS256";
const PRIVKEY = Deno.readFileSync(Deno.env.get("PRIVKEY") || '');
const PUBKEY = Deno.readFileSync(Deno.env.get("PUBKEY") || '');
//const passphrase = Deno.env.get("CERT_PASS");
const CATALOG_ENTRY = "PAC"
//const DRIVE_BASE_ID = "1Zycnk_gjSeRjb9O1sN__gInSIgcOaXcv"
const CATALOG_KEY = "payload"
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";

export const handleForm = (async ({
  request,
}:{
  request: Request
}) => {
	// Get regen form data
  const formData = await request.formData();
  const data : Record<string, any> = {};
  formData.forEach((v,k) => {
    data[k] = v.valueOf()
  });
  await create(data);
})

/**
 * Takes a request of form data and generates the PDF
 */
export const create = (async ( 
	formData: Record<string, any>,
) => {
	// Get regen form data
	const template = await fetch("http://localhost:5173/template3.pdf");
	const doc = await PDFDocument.load(await template.arrayBuffer());

	// Populate the output PDF and PAC
	const { form, pacData, dataOwner } = await generateRegenPDF(formData, doc);

  const unpackedPac = {
    sadie: {
      pdfHash: '', // ?
      pacHash: '',
      quote: '', //code 
      dataOwner,
      escrowProvider: {
        name: "The Qlever Company, LLC",
        runAdditionalPACsLink: "https://www.qlever.io/escrow-provider",
      },
    },
    ...pacData
	};

	form.flatten();

	doc.catalog.set(
    PDFName.of(CATALOG_ENTRY), 
    doc.context.register(doc.context.obj(PLACEHOLDER))
  );

	const prePac = await doc.save();
	const hash = createHash("sha256").update(prePac).digest("hex");

	unpackedPac.sadie.pdfHash = hash;
	console.log('prepac hash', hash);
	const pac = generatePAC(unpackedPac);
  console.log({pac})

	// Now add the PAC json
	const customData = doc.context.obj({ [CATALOG_KEY]: PDFString.of(JSON.stringify(pac)) });
	doc.catalog.set(PDFName.of(CATALOG_ENTRY), doc.context.register(customData));

	const filled = await doc.save();
	/*
	const docWithPlaceholder = await PDFDocument.load(filled);
	await pdflibAddPlaceholder({
		pdfDoc: docWithPlaceholder,
		reason: "I am signing this doc",
		name: "Qlever",
		contactInfo: "info@qlever.io",
		signatureLength: 8192,
		location: "Qlever HQ",
    });

	const placeholderBytes = await docWithPlaceholder.save();

	const signer = cert ? new P12Signer(await Deno.readFile(cert), {passphrase}) : undefined;

	console.log(cert ? "Signed" : "Not Signed");

	const signed = signer ? await signpdf.default.sign(placeholderBytes, signer) : filled;
	*/

	// Sync to Google Drive
  /*
	await uploadFile({
		filename: `RegenScoreCert-${unpackedPac.sadie.dataOwner.name}.pdf`,
		content: Buffer.from(filled), // or Uint8Array directly
		//content: Buffer.from(signed), // or Uint8Array directly
		mimeType: 'application/pdf',
		parentFolderId: DRIVE_BASE_ID,
	});
  */

  try {
    const v = await verify(filled);
    console.log(v);
  } catch (error) {
    console.error("Verification failed:", error);
  }

//	await verify(signed)

	//return signed;
	return filled;
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

  // Extract the pdf
  const doc = await PDFDocument.load(pdfBytes);

	//1. verify the pdf signature
	//const { signedData: pdf, signature, valid } = await extractSignatureData(pdfBytes);

	//2. extract the PAC from the PDF
  // TODO: make/handle sadie key as JWT. for now, just use the json
	//const sadieStr = await extractEmbeddedJSON(doc);
  //const sadie = await decodeSadieJwt(sadieStr);
  const pac = await extractEmbeddedJSON(doc) as unknown as PAC<Regenscore>;
  console.log('verify pac', { pac })

	const pdfContainsData = !!pac;
	if (!pdfContainsData) return { pdfContainsData }

  // Decode the JWT payload
  const unpacked = jwt.verify(pac, PUBKEY, { algorithm: ALGORITHM });
  console.log({ unpacked })

  // 3. Ensure the pdf hash matches the original pdf hash
  const originalPdf = await getOriginalPdf(doc);
	const originalPdfHash = createHash("sha256").update(originalPdf).digest("hex");
	const pdfHashValid = originalPdf === unpacked.sadie.pdfHash;
  console.log({ originalPdfHash, unpackedPdfHash: unpacked.sadie.pdfHash, pdfHashValid })

	//4. confirm the PAC was signed by a trusted escrow provider
	//const escrowTrusted = 
	//  Object.values(trustedList).map(v => v.key).includes(unpacked.escrowProvider.key);

	return {
		verification: unpacked/*{
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
    */
	}
});

export const generatePAC = (
	pacData: UnpackedSadiePAC<Regenscore>, 
) => {

  return jwt.sign(pacData, PRIVKEY, {
    algorithm: ALGORITHM,
  });
}



async function extractEmbeddedJSON(
  doc: PDFDocument
): Promise<UnpackedSadiePAC<Regenscore>| null> {
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

/*
export async function extractSignatureData(pdfBytes: Uint8Array): Promise<{
	signedData: Uint8Array;
	signature: Uint8Array;
	valid: boolean;
}> {
	const pdfStr = new TextDecoder().decode(pdfBytes); // latin1 preserves raw bytes
  
	// Extract the /ByteRange
	const byteRangeMatch = pdfStr.match(
	  /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/
	);
	if (!byteRangeMatch) throw new Error("No /ByteRange found in PDF");
  
	const byteRange = byteRangeMatch
	  .slice(1)
	  .map(Number);
	const [start1, len1, start2, len2] = byteRange;
  
	const signedData = new Uint8Array(len1 + len2);
	signedData.set(pdfBytes.slice(start1, start1 + len1), 0);
	signedData.set(pdfBytes.slice(start2, start2 + len2), len1);

	// Extract the /Contents
	const contentsMatch = pdfStr.match(/\/Contents\s*<([0-9A-Fa-f\s]+)>/);
	if (!contentsMatch) throw new Error("No /Contents found in PDF");
 
	// Signature hex decode
	const hex = contentsMatch[1].replace(/\s/g, "");
	const fullSig = new Uint8Array((hex.match(/.{2}/g) || [])
	  .map(h => Number.parseInt(h, 16)));

    let end = fullSig.length;
	while (end > 0 && fullSig[end - 1] === 0x00) end--;
	const signature = fullSig.slice(0, end);

//	const hex = contentsMatch[1].replace(/^<|>$/g, "").trim();
//	let signature = Uint8Array.from((hex.match(/.{1,2}/g) || []).map(b => Number.parseInt(b, 16)));

	console.log('Pdf size', pdfBytes.length)
	console.log('byterange', start1, len1, start2, len2)
	console.log('signedData', signedData.length)
	console.log('signature', signature.length)
	console.log('pdfBytes minus length', pdfBytes.length - (len1 + len2))

	const res = validatePKCS7Signature(signedData, signature)
	console.log(res);

	return { 
		signedData,
		signature, 
		valid: await verifySignature({signedData, signature })
	};
}
*/

/*
async function verifySignature({
	signedData,
	signature,
  }: {
	signedData: Uint8Array;
	signature: Uint8Array;
  }): Promise<boolean> {
	const pubDer = der ? await Deno.readFile(der) : undefined;

	if (!pubDer) throw new Error("Certificate not provided.");

	// Import the certificate
	const pubKey = await crypto.subtle.importKey(
	  "spki", // X.509 SubjectPublicKeyInfo (public key format)
	  pubDer,
	  {
		name: "RSASSA-PKCS1-v1_5",
		hash: "SHA-256",
	  },
	  false,
	  ["verify"]
	);
  
	// Verify the signature
	const valid = await crypto.subtle.verify(
	  {
		name: "RSASSA-PKCS1-v1_5",
	  },
	  pubKey,
	  signature,
	  signedData
	);

	console.log('FINISHED', valid);
  
	return valid;
}
*/

/* 
function validatePKCS7Signature(signedData: Uint8Array, signatureContents: Uint8Array) {
  const p7 = forge.pkcs7.messageFromAsn1(
    forge.asn1.fromDer(forge.util.createBuffer(String.fromCharCode(...signatureContents), 'raw'))
  );

  const certi = p7.certificates[0];
  const sig = p7.rawCapture.signature;
  const md = forge.md.sha256.create();
  md.update(forge.util.createBuffer(String.fromCharCode(...signedData), 'raw').getBytes());

  const verified = certi.publicKey.verify(md.digest().bytes(), sig);
  return { verified, subject: certi.subject };
}
  */

async function getOriginalPdf(pdfDoc: PDFDocument): Promise<Uint8Array> {
  const copyBytes = await pdfDoc.save();
  const copy = await PDFDocument.load(copyBytes);
  copy.catalog.set(
    PDFName.of(CATALOG_ENTRY), 
    copy.context.register(copy.context.obj(PLACEHOLDER))
  );
  return copy.save();
}

function serializeJSON(obj: any): string {
  if (typeof obj === 'number') {
    const str = obj.toString();
    if (str.match(/\./)) {
      console.warn('You cannot serialize a floating point number with a hashing function and expect it to work consistently across all systems.  Use a string.');
    }
    // Otherwise, it's an int and it should serialize just fine.
    return str;
  }
  if (typeof obj === 'string') return `"${obj}"`;
  if (typeof obj === 'boolean') return (obj ? 'true' : 'false');
  // Must be an array or object
  const isarray = Array.isArray(obj);
  const starttoken = isarray ? '[' : '{';
  const endtoken = isarray ? ']' : '}';

  if (!obj) return 'null';

  const keys = Object.keys(obj).sort(); // you can't have two identical keys, so you don't have to worry about that.

  return starttoken
    + keys.reduce((acc,k,index) => {
      if (!isarray) acc += `"${k}":`; // if an object, put the key name here
      acc += serializeJSON(obj[k]);
      if (index < keys.length-1) acc += ',';
      return acc;
    },"")
    + endtoken;
}