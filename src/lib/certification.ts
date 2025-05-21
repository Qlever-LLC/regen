/// <reference lib="deno.ns" />

import type { Action } from "@sveltejs/kit";
import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type {
  UnpackedSadiePAC,
  PAC,
} from "./types";

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
import { trustedList } from './trusted.ts';
const PLACEHOLDER = { 'SADIE': 'x'.repeat(1000) };
const ALGORITHM = "RS256";
const PRIVKEY = Deno.readFileSync(Deno.env.get("PRIVKEY") || '');
const PUBKEY = Deno.readFileSync(Deno.env.get("PUBKEY") || '');
const CATALOG_ENTRY = "PAC"
//const DRIVE_BASE_ID = "1Zycnk_gjSeRjb9O1sN__gInSIgcOaXcv"

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

	doc.catalog.set(
    PDFName.of(CATALOG_ENTRY), 
    doc.context.register(doc.context.obj(PLACEHOLDER))
  );
	const prePac = await doc.save();
  const hash = createHash("sha256").update(prePac).digest("hex");

  // compute the PAC data
	const { form, pacData, dataOwner } = await generateRegenPDF(formData, doc);

  const unpackedPac = {
    sadie: {
      pdfHash: '', // ?
      pacHash: '',
      quote: '', //code 
      dataOwner,
      escrowProvider: {
        name: "The Qlever Company, LLC",
        runAdditionalPACsLink: "http://localhost:5173/escrow-provider",
      },
    },
    ...pacData
	};

	form.flatten();

	unpackedPac.sadie.pdfHash = hash;
	const pac = generatePAC(unpackedPac);

	// Now add the PAC json
	const customData = doc.context.obj({ [CATALOG_ENTRY]: PDFString.of(JSON.stringify(pac)) });
	doc.catalog.set(PDFName.of(CATALOG_ENTRY), doc.context.register(customData));

	const filled = await doc.save();
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
  } catch (error) {
    console.error("Verification failed:", error);
  }

	return filled;
}) satisfies Action;

export type verification = {
	pdfContainsPAC: boolean;
	pdfUnchanged?: boolean;
	dataOwnerTrusted?: boolean;
	escrowProviderTrusted?: boolean;
	codeExecutionTrusted?: boolean;
}

// Generic verification of the PAC
export const verify = (async (pdfBytes: Uint8Array) => {
  // Load the pdf
  const doc = await PDFDocument.load(pdfBytes);

	//1. Extract the PAC from the PDF
  const pac = await extractEmbeddedJSON(doc) as unknown as PAC<Regenscore>;
	const pdfContainsData = !!pac;
	if (!pdfContainsData) return { pdfContainsData }

  //2. Extract the PAC JSON payload (i.e., decode the JWT)
  const unpacked = jwt.verify(pac, PUBKEY, { algorithm: ALGORITHM });

  //3. Compute the pdf hash and validate against the pdf hash stored in the PAC
  const originalPdfHash = await getOriginalPdfHash(doc);
	const pdfUnchanged = originalPdfHash === unpacked.sadie.pdfHash;

	//4. confirm the PAC was signed by a trusted escrow provider
	const escrowTrusted = 
	  Object.keys(trustedList).includes(unpacked.sadie.escrowProvider.name);

	return {
		verification: {
			escrowProviderTrusted: escrowTrusted,
			dataOwnerTrusted: escrowTrusted,
			codeExecutionTrusted: true, //TODO: enclave quote
      pdfContainsData: true,
      pdfUnchanged,
		},
		pac: unpacked,
	}
});

export const generatePAC = (
	pacData: UnpackedSadiePAC<Regenscore>, 
) => jwt.sign(pacData, PRIVKEY, { algorithm: ALGORITHM});

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

  const pacData = catEntry.get(PDFName.of(`${CATALOG_ENTRY}`));

  if (!(pacData instanceof PDFString)) {
    console.warn(`No ${CATALOG_ENTRY} key in /${CATALOG_ENTRY} dictionary.`);
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

async function getOriginalPdfHash(pdfDoc: PDFDocument): Promise<string> {
  const copyBytes = await pdfDoc.save();
  const copy = await PDFDocument.load(copyBytes);
  copy.catalog.set(
    PDFName.of(CATALOG_ENTRY), 
    copy.context.register(copy.context.obj(PLACEHOLDER))
  );
  const copyDoc = await copy.save();
	return createHash("sha256").update(copyDoc).digest("hex");
}