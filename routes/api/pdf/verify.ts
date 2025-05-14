import { FreshContext, Handlers } from "$fresh/server.ts";

import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";

// TODO: Actually try to sign the PDF
const cert = Deno.env.get("P12_CERT_PATH");
const template = await Deno.readFile("static/template.pdf");
const data = {
    dataOwner: "test owner",
    escrowProvider: "test provider",
}

export const handler: Handlers = {
	async POST(req: Request, _ctx: FreshContext) {
		const doc = await PDFDocument.load(template);
		const scores = await computeScore(data);

		return new Response(
			undefined,
			{
				status: 201,
				headers: {
					"Content-Type": "application/pdf",
				},
				: {

				},
			},
		);
	},
};

export const computeScore = async (data: any) => {
	return {
		regenscore: 80,
		air: 90,
		water: 70,
		soil: 80,
		equity: 80
	}
}