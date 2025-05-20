 /// <reference lib="deno.ns" />

import { create } from "../src/lib/certification.ts";


Deno.test('test certification', async () => {
  await create({
    'Company Name': '',
    'Address Line 1': '',
    'Address Line 2': '',
    'City': '',
    'State': '',
    'Zip Code': '',
    'Date': '',
    'Air Score': '',
    'Water Score': '',
    'Soil Score': '',
    'Equity Score': '',
    'Regen Score': ''
  })
})