/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			borderColor: {
				'light': 'var(--color-border-dark)',
				'dark': 'var(--color-border)',
			},
			backgroundColor: {
				'light': 'var(--color-bg-dark)',
				'dark': 'var(--color-bg)',
				'peer': 'var(--color-bg-peer)',
				'peer-dark': 'var(--color-bg-peer-dark)',
				// 'sicily': 'var(--color-bg-sicily)',
			},
			textColor: {
				'light': 'var(--color-t-dark)',
				'dark': 'var(--color-t)',
				'peer': 'var(--color-bg-peer)',
				// 'sicily': 'var(--color-sicily)',
			},
			ringColor: {
				'light': 'var(--color-ring-dark)',
				'dark': 'var(--color-ring)',
			},
		},
	},
	plugins: [],
}
