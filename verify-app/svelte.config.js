import adapter from "svelte-adapter-deno";
//import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()],
  compilerOptions: {
    runes: true
  },
  kit: {
    adapter: adapter(/*{
//      out: 'build',
    }*/),
  }
}

export default config;