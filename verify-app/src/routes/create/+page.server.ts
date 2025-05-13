/// <reference lib="deno.ns" />

import { create } from "../../lib/certification.ts";

import type { Actions } from "@sveltejs/kit";

export const actions = {
	async create(ctx) {
		const certification = await create(ctx);
		return {
			certification,
		};
	},
} satisfies Actions;
