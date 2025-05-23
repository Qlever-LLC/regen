/// <reference lib="deno.ns" />

import { Buffer } from "node:buffer";
import { returnsNext, stub } from "jsr:@std/testing/mock";

import type { RequestEvent } from "@sveltejs/kit";

import { create, verify } from "../src/lib/certification.ts";

Deno.test("certification creation/validation", async (test) => {
  // TODO: Beetter way to pass context?
  let certificateP: Promise<Uint8Array>;

  await test.step("creation", async () => {
    const testdata: Record<string, string> = {
      "Company Name": "",
      "Address Line 1": "",
      "Address Line 2": "",
      City: "",
      State: "",
      "Zip Code": "",
      Date: "",
      "Air Score": "",
      "Water Score": "",
      "Soil Score": "",
      "Equity Score": "",
      "Regen Score": "",
    };

    const formData = new FormData();
    using _formDataStub = stub(
      formData,
      "get",
      (name: string) => testdata[name],
    );
    const event = {
      fetch,
      request: new Request("https://example.com"),
    } satisfies Partial<RequestEvent>;
    const response = new Response(
      await Deno.readFile("./static/template3.pdf"),
    );
    using _fetchStub = stub(
      event,
      "fetch",
      returnsNext([Promise.resolve(response)]),
    );
    using _requestStub = stub(
      event.request,
      "formData",
      async () => {
        return formData;
      },
    );

    certificateP = create(event as RequestEvent);
    await certificateP;
  });

  await test.step("verification", async () => {
    const event = {
      request: new Request("https://example.com"),
    } satisfies Partial<RequestEvent>;
    using _requestStub = stub(
      event.request,
      "arrayBuffer",
      () => certificateP.then((buffer) => Buffer.from(buffer).buffer),
    );

    const verified = await verify(event as RequestEvent);
    console.dir(verified);
  });
});
