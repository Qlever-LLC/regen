/// <reference lib="deno.ns" />

import { Buffer } from "node:buffer";
import { returnsNext, stub } from "jsr:@std/testing/mock";

import type { RequestEvent } from "@sveltejs/kit";
import { create } from "../src/lib/certification.ts";

Deno.test("test certification", async () => {
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
  const _formDataStub = stub(formData, "get", (name: string) => testdata[name]);
  const response = new Response("https://example.com");
  const _responseStub = stub(
    response,
    "arrayBuffer",
    async () =>
      Buffer.from(await Deno.readFile("./static/template3.pdf")).buffer,
  );
  const _fetch = stub(
    globalThis,
    "fetch",
    returnsNext([Promise.resolve(response)]),
  );
  const request = new Request("https://example.com");
  const _requestStub = stub(
    request,
    "formData",
    // deno-lint-ignore require-await
    async () => {
      return formData;
    },
  );

  await create({ fetch, request } as RequestEvent);
});
