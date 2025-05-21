/// <reference lib="deno.ns" />

import { verify } from "../../lib/certification.ts";

import type { Actions } from "@sveltejs/kit";

export const actions = {
  async default(ctx) {
    // Read the raw PDF bytes
    const pdfBytes = new Uint8Array(await ctx.request.arrayBuffer());

    // Process the PDF
    const { pac, verification } = await verify(pdfBytes);
    return {
      verification,
      pac,
    };
  },
} satisfies Actions;
