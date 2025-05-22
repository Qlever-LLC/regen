/// <reference lib="deno.ns" />

import type { RequestHandler } from "@sveltejs/kit";

import { handleForm } from "../../../lib/certification.ts";

export const POST: RequestHandler = async (ctx) => {
  const certification = await handleForm(ctx);
  return new Response(certification, {
    status: 201,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="certification.pdf',
    },
  });
};
