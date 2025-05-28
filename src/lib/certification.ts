/// <reference lib="deno.ns" />

import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import type { Action } from "@sveltejs/kit";
import _canonicalize from "canonicalize";

import { verifyPDF } from "@qlever-llc/verify-pdf";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import { P12Signer } from "@signpdf/signer-p12";
import signpdf from "@signpdf/signpdf";
import jwt from "jsonwebtoken";
import { PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";

import { CERT, PASSWORD, PRIVKEY, PUBKEY } from "./p12";
// deno-fmt-ignore
import { type Regenscore, generateRegenPDF } from "./regen";
import { trustedList } from "./trusted.ts";
import type { PAC, UnpackedSadiePAC } from "./types";
//import { uploadFile } from "./drive.ts";
//import { Buffer } from 'node:buffer';

// HACK: broken types for cannonicalize
const canonicalize = _canonicalize as unknown as typeof _canonicalize.default;

// FIXME: Sveltekit way to get from env?
const PLACEHOLDER = { SADIE: "x".repeat(1000) };
const ALGORITHM = "RS256";
const CATALOG_ENTRY = "PAC";

// @ts-expect-error HACK: fixes jsonwebtoken
globalThis.Buffer = Buffer;

/**
 * Takes a request of form data and generates the PDF/PAC
 */
export const create = (async ({ request, fetch }) => {
  // Get regen form data
  const template = await fetch("/template3.pdf");
  const doc = await PDFDocument.load(await template.arrayBuffer());

  /* FIXME: Get PDF hash inside PAC working?

	doc.catalog.set
		PDFName.of(CATALOG_ENTRY),
		doc.context.register(doc.context.obj(PLACEHOLDER)),
	);
	const prePac = await doc.save();
	const hash = createHash("sha256").update(prePac).digest("hex");
  */

  // compute the PAC data
  const formData = await request.formData();
  const { pacData, dataOwner } = generateRegenPDF(formData, doc);

  const unpackedPac = {
    sadie: {
      // pdfHash: "", // ?
      pacHash: "",
      quote: "", //code
      dataOwner,
      escrowProvider: {
        name: "The Qlever Company, LLC",
        runAdditionalPACsLink: "http://localhost:5173/escrow-provider",
      },
    },
    ...pacData,
  };

  //unpackedPac.sadie.pdfHash = hash;
  const pac = generatePAC(unpackedPac);

  // Now add the PAC json
  const customData = doc.context.obj({
    [CATALOG_ENTRY]: PDFString.of(pac),
  });
  doc.catalog.set(PDFName.of(CATALOG_ENTRY), doc.context.register(customData));

  const signed = await signPdf(await doc.save());
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

  return signed;
}) satisfies Action;

/**
 * Add eSignature to a PDF
 */
export async function signPdf(pdfBytes: Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdflibAddPlaceholder({
    pdfDoc,
    reason: "test",
    contactInfo: "test@qlever.io",
    name: "test",
    location: "here",
  });
  const toSign = await pdfDoc.save();

  const signer = new P12Signer(CERT, {
    passphrase: PASSWORD,
  });

  // TODO: Get PDF to show as "certified" in PDF readers
  return signer
    ? await signpdf.default.sign(toSign, signer, new Date())
    : toSign;
}

export interface verification {
  pdfContainsPAC: boolean;
  pdfUnchanged?: boolean;
  dataOwnerTrusted?: boolean;
  escrowProviderTrusted?: boolean;
  codeExecutionTrusted?: boolean;
}

/**
 * Generic verification of the PDF/PAC
 */
export const verify = (async ({ request }) => {
  // Read the raw PDF bytes
  const pdfBytes = new Uint8Array(await request.arrayBuffer());

  // Check both things in parallel
  const [pacResult, pdfResult] = await Promise.all([
    verifyPac(pdfBytes),
    verifyPDF(pdfBytes),
  ]);

  return {
    ...pacResult,
    verification: {
      ...pacResult.verification,
      pdfUnchanged: pdfResult.verified,
    },
  };
}) satisfies Action;

/**
 * verification of a PAC inside the PDF
 */
export const verifyPac = async (pdfBytes: Uint8Array) => {
  // Load the pdf
  const doc = await PDFDocument.load(pdfBytes);

  //1. Extract the PAC from the PDF
  const pac = extractEmbeddedJSON(doc);
  const pdfContainsData = !!pac;
  if (!pdfContainsData) {
    return { pdfContainsData };
  }

  //const DRIVE_BASE_ID = "1Zycnk_gjSeRjb9O1sN__gInSIgcOaXcv"
  //2. Extract the PAC JSON payload (i.e., decode the JWT)
  const unpacked = jwt.verify(pac, PUBKEY, {
    algorithms: [ALGORITHM],
  }) as unknown as UnpackedSadiePAC<Regenscore>;

  //3. Compute the pdf hash and validate against the pdf hash stored in the PAC
  const originalPdfHash = await getOriginalPdfHash(doc);
  const pdfUnchanged = originalPdfHash === unpacked.sadie.pdfHash;

  //4. confirm the PAC was signed by a trusted escrow provider
  const escrowTrusted = Object.keys(trustedList).includes(
    unpacked.sadie.escrowProvider.name,
  );

  return {
    verification: {
      escrowProviderTrusted: escrowTrusted,
      dataOwnerTrusted: escrowTrusted,
      // TODO: enclave quote
      codeExecutionTrusted: true,
      pdfContainsData: true,
      pdfUnchanged,
    },
    pac: unpacked as unknown as PAC<Regenscore>,
  };
};

export const generatePAC = (pacData: UnpackedSadiePAC<Regenscore>) => {
  const canon = canonicalize(pacData);
  if (!canon) {
    throw new TypeError("Failed to canonicalize PAC data");
  }
  return jwt.sign(canon, PRIVKEY, { algorithm: ALGORITHM });
};

function extractEmbeddedJSON(doc: PDFDocument) {
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
    return jsonString;
    //return JSON.parse(jsonString);
  } catch (error: unknown) {
    console.error(error, "Failed to parse embedded JSON");
    return null;
  }
}

async function getOriginalPdfHash(pdfDoc: PDFDocument): Promise<string> {
  const copyBytes = await pdfDoc.save();
  const copy = await PDFDocument.load(copyBytes);
  copy.catalog.set(
    PDFName.of(CATALOG_ENTRY),
    copy.context.register(copy.context.obj(PLACEHOLDER)),
  );
  const copyDoc = await copy.save();
  return createHash("sha256").update(copyDoc).digest("hex");
}
