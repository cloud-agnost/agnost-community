import { fontFamily } from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */
// @filename tailwind.config.js
module.exports = {
	darkMode: ['class', '[data-mode="dark"]'],
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				brand: {
					primary: 'var(--brand-color-primary)',
				},
				elements: {
					'strong-blue': 'var(--elements-strong--blue)',
					blue: 'var(--elements-blue)',
					'subtle-blue': 'var(--elements-subtle-blue)',

					'strong-green': 'var(--elements-strong-green)',
					green: 'var(--elements-green)',
					'subtle-green': 'var(--elements-subtle-green)',

					'strong-yellow': 'var(--elements-strong-yellow)',
					yellow: 'var(--elements-yellow)',
					'subtle-yellow': 'var(--elements-subtle-yellow)',

					'strong-purple': 'var(--elements-strong-purple)',
					purple: 'var(--elements-purple)',
					'subtle-purple': 'var(--elements-subtle-purple)',

					'strong-red': 'var(--elements-strong-red)',
					red: 'var(--elements-red)',
					'subtle-red': 'var(--elements-subtle-red)',

					'strong-orange': 'var(--elements-strong-orange)',
					orange: 'var(--elements-orange)',
					'subtle-orange': 'var(--elements-subtle-orange)',
				},
				success: 'var(--success)',

				error: 'var(--error)',
				border: 'var(--theme-border)',
				'border-hover': 'var(--theme-border-hover)',
				database: 'var(--database)',
				model: 'var(--model)',
				cache: 'var(--cache)',
				storage: 'var(--storage)',
				endpoint: 'var(--endpoint)',
				middleware: 'var(--middleware)',
				function: 'var(--function)',
				queue: 'var(--queue)',
				task: 'var(--task)',
				field: 'var(--field)',
				bucket: 'var(--bucket)',
				file: 'var(--file)',

				icon: {
					secondary: 'var(--icon-secondary)',
					base: 'var(--icon-base)',
					disabled: 'var(--icon-disabled)',
					'secondary-reverse': 'var(--icon-secondary-reverse)',
					'base-reverse': 'var(--icon-base-reverse)',
					'disabled-reverse': 'var(--icon-disabled-reverse)',
				},

				input: {
					background: 'var(--form-input-base-background)',
					border: 'var(--form-input-base-border)',
					hover: 'var(--form-input-hover)',
					focus: 'var(--form-input-focus)',
					'disabled-background': 'var(--form-input-disabled-background)',
					'disabled-border': 'var(--form-input-disabled-border)',
				},
				button: {
					primary: 'var(--button-background-base-primary)',
					'primary-hover': 'var(--button-background-hover-primary)',
					secondary: 'var(--button-background-base-secondary)',
					'secondary-hover': 'var(--button-background-hover-secondary)',
					border: 'var(--button-border-base)',
					'border-hover': 'var(--button-border-hover)',
					'border-disabled': 'var(--button-border-disabled)',
					disabled: 'var(--button-background-disabled)',
				},
				surface: {
					green: 'var(--surface-green)',
					yellow: 'var(--surface-yellow)',
					red: 'var(--surface-red)',
				},
				wrapper: {
					'background-base': 'var(--wrapper-background-base)',
					'background-hover': 'var(--wrapper-background-hover)',
					'background-light': 'var(--wrapper-background-light)',
					border: 'var(--wrapper-menu-border)',
				},
				text: {
					default: 'var(--text-base)',
					subtle: 'var(--text-subtle)',
					disabled: 'var(--text-disabled)',
					'default-reverse': 'var(--text-base-reverse)',
					'subtle-reverse': 'var(--text-subtle-reverse)',
					'disabled-reverse': 'var(--text-disabled-reverse)',
					'background-base': 'var(--wrapper-background-base)',
					'background-hover': 'var(--wrapper-background-hover)',
					'background-base-light': 'var(--wrapper-background-base-light)',
				},
			},
			backgroundColor: {
				base: 'var(--theme-base-background)',
				subtle: 'var(--theme-subtle-background)',
				lighter: 'var(--theme-lighter-background)',
				'base-reverse': 'var(--theme-base-reverse-background)',
				'subtle-reverse': 'var(--theme-subtle-reverse-background)',
				'lighter-reverse': 'var(--theme-lighter-reverse-background)',
			},
			textColor: {
				default: 'var(--text-base)',
				subtle: 'var(--text-subtle)',
				disabled: 'var(--text-disabled)',
				'default-reverse': 'var(--text-base-reverse)',
				'subtle-reverse': 'var(--text-subtle-reverse)',
				'disabled-reverse': 'var(--text-disabled-reverse)',
			},
			borderWidth: {
				3: '3px',
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: 'calc(var(--radius) - 4px)',
				xs: 'calc(var(--radius) - 6px)',
			},
			fontFamily: {
				sans: ['var(--font-sans)', ...fontFamily.sans],
				albert: ['var(--font-albert)'],
				sfCompact: ['var(--font-sf)', ...fontFamily.sans],
				mono: ['var(--font-mono)', ...fontFamily.mono],
			},
			fontSize: {
				xs: ['var(--font-size-xs)', 'var(--font-size-xs-line-height)'],
				sm: ['var(--font-size-sm)', 'var(--font-size-sm-line-height)'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				animation: {
					'accordion-down': 'accordion-down 0.2s ease-out',
					'accordion-up': 'accordion-up 0.2s ease-out',
				},
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
