import { defineConfig } from "$fresh/server.ts";
import tailwind from "@tailwindcss/postcss";

export default defineConfig({
	plugins: [tailwind()],
});
