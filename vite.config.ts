import { sveltekit } from '@sveltejs/kit/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
import { isoImport } from 'vite-plugin-iso-import'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from "vite-plugin-top-level-await";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		wasm(),
		topLevelAwait(),
		isoImport(),
		nodePolyfills(),
		sveltekit(),
		ViteImageOptimizer({})
	],
};

export default config;
