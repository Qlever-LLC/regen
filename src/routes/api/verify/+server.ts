/// <reference lib="deno.ns" />

import type { RequestHandler } from "@sveltejs/kit";
import { verify } from "../../../lib/certification.ts";

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Ensure the Content-Type is application/pdf
    const contentType = request.headers.get("content-type");
    if (contentType !== "application/pdf") {
      return new Response(
        JSON.stringify({ error: "Expected Content-Type: application/pdf" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Read the raw PDF bytes
    const pdfBytes = new Uint8Array(await request.arrayBuffer());

    // Process the PDF
    const { pac, verification } = await verify(pdfBytes);

    // Return result as JSON
    return new Response(
      JSON.stringify({ pac, verification }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error handling PDF upload:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
