/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				palette1: "var(--palette1)",
				palette2: "var(--palette2)",
				palette3: "var(--palette3)",
				palette4: "var(--palette4)",
				palette5: "var(--palette5)",
				bg: 'var(--bg)',
				text: 'var(--text)',
				link: 'var(--link)',
				border: 'var(--border)',
				shadow: 'var(--shadow)',
			}
		},
	},
	plugins: [],
}
