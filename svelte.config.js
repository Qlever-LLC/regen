import adapter from "@qlever-llc/svelte-adapter-deno";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	compilerOptions: {
		runes: true,
	},
	kit: {
		adapter: adapter({
			// out: 'build',
		}),
	},
};

export default config;
