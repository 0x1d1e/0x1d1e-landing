import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import config from './svelte.config.js';
export default ts.config(
	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'node_modules/**',
			'playwright-report/**',
			'test-results/**'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: { parserOptions: { parser: ts.parser, svelteConfig: config } }
	},
	{
		files: ['src/routes/+page.svelte'],
		// This single-page site uses external GitHub URLs and fragments, not Kit routes.
		rules: { 'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }] }
	},
	{
		languageOptions: {
			globals: {
				window: 'readonly',
				document: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				URL: 'readonly',
				console: 'readonly',
				process: 'readonly'
			}
		}
	}
);
