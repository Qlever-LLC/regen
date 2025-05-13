import { FreshContext, Handlers } from "$fresh/server.ts";

import { PDFDocument } from "pdf-lib";
import { pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import signpdf from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";

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
			signer ? await signpdf.default.sign(filled, signer) : filled,
			{
				status: 201,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": 'attachment; filename="certification.pdf',
				},
			},
		);
	},
};

export default async function Create() {
	const doc = await PDFDocument.load(template);
	const form = doc.getForm();
	const fields = form.getFields();
	return (
		<>
			<form method="post">
				{fields.map((field) => (
					<>
						<input type="text" name={field.getName()} value="">
							{field.getName()}
						</input>
					</>
				))}
				<button type="submit">Create</button>
			</form>
		</>
	);
}
