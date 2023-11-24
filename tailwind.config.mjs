/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			boxShadow: {
				'bottom-ring': '0 2px 0 0 var(--tw-ring-color)'
			}
		},
	},
	plugins: [],
}
