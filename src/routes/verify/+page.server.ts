/// <reference lib="deno.ns" />

import type { Actions } from "@sveltejs/kit";

import { verify } from "../../lib/certification.ts";

export const actions = {
  async default(ctx) {
    // Process the PDF
    const verified = await verify(ctx);
    return {
      verified,
    };
  },
} satisfies Actions;
