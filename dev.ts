#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import { getBinary } from "@astral/astral";

import "$std/dotenv/load.ts";

// Download chrome binary for astral
await getBinary("chrome", { cache: "node_modules/.astral" });

await dev(import.meta.url, "./main.ts", config);
