/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors:{
        palette1: "#002B39",
        palette2: "#004A58",
        palette3: "#006B7A",
        palette4: "#358E9D",
        palette5: "#5EB2C2",
			}
		},
	},
	plugins: [],
}
