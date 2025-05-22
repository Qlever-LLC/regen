/// <reference lib="deno.ns" />

import { handleForm } from "../../lib/certification.ts";

import type { Actions } from "@sveltejs/kit";

export const actions = {
  async default(ctx) {
    const certification = await handleForm(ctx);
    return {
      certification,
    };
  },
} satisfies Actions;
