import { FreshContext, Handlers } from "$fresh/server.ts";

import { PDFDocument } from "pdf-lib";

const template = await Deno.readFile("static/template.pdf");

export const handler: Handlers = {
	async GET(_req: Request, ctx: FreshContext) {
		return await ctx.render();
	},
	async POST(req: Request, _ctx: FreshContext) {
		const doc = await PDFDocument.load(template);
		const form = doc.getForm();
		const fields = form.getFields();
		const data = await req.formData();
		for (const field of fields) {
			const name = field.getName();
			try {
				//TODO: Non-text field support
				const text = form.getTextField(name);
				text.setText(data.get(name)?.toString());
			} catch {
				console.warn(`Failed to handle form field ${name}`);
			}
		}
		const filled = await doc.save();
		// TODO: Sign the PDF
		return new Response(filled, {
			status: 201,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'attachment; filename="certification.pdf',
			},
		});
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
