import { FreshContext, Handlers } from "$fresh/server.ts";

import { connect, launch } from "@astral/astral";

const BROWSER = Deno.env.get("BROWSER_ENDPOINT");

export const handler: Handlers = {
	async GET(_req: Request, ctx: FreshContext) {
		return await ctx.render();
	},
	async POST(req: Request, _ctx: FreshContext) {
		const data = await req.formData();
		const browser = await (BROWSER
			? connect({ wsEndpoint: BROWSER })
			: launch({ cache: "/tmp/astral" }));
		try {
			// TODO: Actually make PDF template page
			const page = await browser.newPage(`https://www.google.com?q=${data}`);
			const pdf = await page.pdf();
			// TODO: Sign the PDF
			return new Response(pdf, { status: 201 });
		} finally {
			if (!BROWSER) {
				//await browser.close();
			}
		}
	},
};

export default function Create() {
	return (
		<>
			<form method="post">
				<input type="text" name="test" value="" />
				<button type="submit">Create</button>
			</form>
		</>
	);
}
