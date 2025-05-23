/// <reference lib="deno.ns" />

import { json, type RequestHandler } from "@sveltejs/kit";

import { verify } from "../../../lib/certification.ts";

export const POST: RequestHandler = async (ctx) => {
  try {
    // Ensure the Content-Type is application/pdf
    const contentType = ctx.request.headers.get("content-type");
    if (contentType !== "application/pdf") {
      return json(
        { error: "Expected Content-Type: application/pdf" },
        { status: 400 },
      );
    }

    // Process the PDF
    const verified = await verify(ctx);

    // Decide overall success?
    const valid = Object.values(verified.verification).reduce((a, b) => a && b);

    // Return result as JSON
    return json(verified, {
      status: valid ? 200 : 400,
    });
  } catch (error: unknown) {
    console.error(error, "Error handling PDF upload");
    return json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
