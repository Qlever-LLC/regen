import { FreshContext, Handlers } from "$fresh/server.ts";

import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";
import trustedList = {

};

// TODO: Actually try to sign the PDF
const cert = Deno.env.get("P12_CERT_PATH");
const template = await Deno.readFile("static/template.pdf");

export const handler: Handlers = {
	async GET(_req: Request, ctx: FreshContext) {
		return await ctx.render();
	},
	async POST(req: Request, _ctx: FreshContext) {
		const doc = await PDFDocument.load(template);
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
		const data = await req.formData();
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
		
		return new Response(
			JSON.stringify(computeScore(data)),
			{
				status: 201,
				headers: {
					"Content-Type": "application/json",
					"Content-Disposition": 'attachment; filename="certification.pdf',
				},
			},
		);
	},
};

export const computeScore = (_data: FormData) => {
	return {
		regenscore: {
			name: 'Total REGENScore',
			score: 80,
		},
		air: {
			name: 'Air Quality Score',
			score: 90,
		},
		water: {
			name: 'Water Quality Score',
			score: 70,
		},
		soil: {
			name: 'Soil Quality Score',
			score: 80,
		},
		equity: {
			name: 'Equity Score',
			score: 80,
		}
	};
}

export const createPAC = async (
	licensePlate: Record<string, any>,
	pacData: Record<string, any>
) => {
	return {
		pac: {

		}
	}
}

export const pac = {
	sadie: {
	},
	escrowProvider: {
		name: "The Qlever Company, LLC",
		address: "1234 Main St, Suite 100, San Francisco, CA 94105",
		phone: "+1 (415) 555-1234",
		email: "info@qlever.io",
		website: "https://www.qlever.io",
		publickey: ""
	},
	dataOwner: {
		name: "Farmer Joe",
		address: "1080 North 500 East, Bakersfield, CA 93308",
		email: "farmerjoe@example.com",
	},
	pacData: {}
}

// Remove the sha256 hash of the pac and ensure the hash can be regenerated