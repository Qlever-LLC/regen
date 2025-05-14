/// <reference lib="deno.ns" />

import type { RequestHandler } from "@sveltejs/kit";

import { verify } from "../../../lib/certification.ts";

export const POST: RequestHandler = async (ctx) => {
	const {pac, licensePlate }= await verify(ctx);

	return new Response({}, {
		status: 201,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": 'attachment; filename="certification.pdf',
		},
	});
};
