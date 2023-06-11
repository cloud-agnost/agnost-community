import { fontFamily } from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */
export default {
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
					primary: 'rgba(var(--brand-color-primary), <alpha-value>)',
					'primary-darker': 'rgba(var(--brand-color-primary--darker), <alpha-value>)',
					'subtle-primary': 'rgba(var(--brand-color-subtle--primary), <alpha-value>)',
				},
				elements: {
					'strong-blue': 'rgba(var(--elements-strong--blue), <alpha-value>)',
					blue: 'rgba(var(--elements-blue), <alpha-value>)',
					'subtle-blue': 'rgba(var(--elements-subtle-blue), <alpha-value>)',

					'strong-green': 'rgba(var(--elements-strong-green), <alpha-value>)',
					green: 'rgba(var(--elements-green), <alpha-value>)',
					'subtle-green': 'rgba(var(--elements-subtle-green), <alpha-value>)',

					'strong-yellow': 'rgba(var(--elements-strong-yellow), <alpha-value>)',
					yellow: 'rgba(var(--elements-yellow), <alpha-value>)',
					'subtle-yellow': 'rgba(var(--elements-subtle-yellow), <alpha-value>)',

					'strong-purple': 'rgba(var(--elements-strong-purple), <alpha-value>)',
					purple: 'rgba(var(--elements-purple), <alpha-value>)',
					'subtle-purple': 'rgba(var(--elements-subtle-purple), <alpha-value>)',

					'strong-red': 'rgba(var(--elements-strong-red), <alpha-value>)',
					red: 'rgba(var(--elements-red), <alpha-value>)',
					'subtle-red': 'rgba(var(--elements-subtle-red), <alpha-value>)',

					'strong-orange': 'rgba(var(--elements-strong-orange), <alpha-value>)',
					orange: 'rgba(var(--elements-orange), <alpha-value>)',
					'subtle-orange': 'rgba(var(--elements-subtle-orange), <alpha-value>)',
				},
				success: {
					default: 'rgba(var(--success-default), <alpha-value>)',
					hover: 'rgba(var(--success-hover), <alpha-value>)',
					focus: 'rgba(var(--success-focus), <alpha-value>)',
				},

				error: {
					default: 'rgba(var(--error-default), <alpha-value>)',
					hover: 'rgba(var(--error-hover), <alpha-value>)',
					focus: 'rgba(var(--error-focus), <alpha-value>)',
				},

				border: 'rgba(var(--theme-border), <alpha-value>)',

				icon: {
					darker: 'rgba(var(--icon-darker), <alpha-value>)',
					lighter: 'rgba(var(--icon-lighter), <alpha-value>)',
					base: 'rgba(var(--icon-base), <alpha-value>)',
					disabled: 'rgba(var(--icon-disabled), <alpha-value>)',
				},

				input: {
					background: 'rgba(var(--form-input-base-background), <alpha-value>)',
					border: 'rgba(var(--form-input-base-border), <alpha-value>)',
					hover: 'rgba(var(--form-input-hover), <alpha-value>)',
					focus: 'rgba(var(--form-input-focus), <alpha-value>)',
					'disabled-background': 'rgba(var(--form-input-disabled-background), <alpha-value>)',
					'disabled-border': 'rgba(var(--form-input-disabled-border), <alpha-value>)',
				},
				button: {
					primary: 'rgba(var(--button-background-base-primary), <alpha-value>)',
					'primary-hover': 'rgba(var(--button-background-hover-primary), <alpha-value>)',
					secondary: 'rgba(var(--button-background-base-secondary), <alpha-value>)',
					'secondary-hover': 'rgba(var(--button-background-hover-secondary), <alpha-value>)',
					border: 'rgba(var(--button-border-base), <alpha-value>)',
					'border-hover': 'rgba(var(--button-border-hover), <alpha-value>)',
					'border-disabled': 'rgba(var(--button-border-disabled), <alpha-value>)',
					disabled: 'rgba(var(--button-background-disabled), <alpha-value>)',
				},
				surface: {
					blue: 'rgba(var(--surface-blue), <alpha-value>)',
					green: 'rgba(var(--surface-green), <alpha-value>)',
					yellow: 'rgba(var(--surface-yellow), <alpha-value>)',
					purple: 'rgba(var(--surface-purple), <alpha-value>)',
					red: 'rgba(var(--surface-red), <alpha-value>)',
					orange: 'rgba(var(--surface-orange), <alpha-value>)',
				},
				wrapper: {
					'background-base': 'rgba(var(--wrapper-background-base), <alpha-value>)',
					'background-hover': 'rgba(var(--wrapper-background-hover), <alpha-value>)',
					'background-light': 'rgba(var(--wrapper-background-light), <alpha-value>)',
				},
				text: {
					default: 'rgba(var(--text-base), <alpha-value>)',
					subtle: 'rgba(var(--text-subtle), <alpha-value>)',
					disabled: 'rgba(var(--text-disabled), <alpha-value>)',
					'background-base': 'rgba(var(--wrapper-background-base), <alpha-value>)',
					'background-hover': 'rgba(var(--wrapper-background-hover), <alpha-value>)',
					'background-base-light': 'rgba(var(--wrapper-background-base-light), <alpha-value>)',
				},
				red: {
					DEFAULT: 'rgba(var(--red-500), <alpha-value>)',
					50: 'rgba(var(--red-50), <alpha-value>)',
					100: 'rgba(var(--red-100), <alpha-value>)',
					200: 'rgba(var(--red-200), <alpha-value>)',
					300: 'rgba(var(--red-300), <alpha-value>)',
					400: 'rgba(var(--red-400), <alpha-value>)',
					500: 'rgba(var(--red-500), <alpha-value>)',
					600: 'rgba(var(--red-600), <alpha-value>)',
					700: 'rgba(var(--red-700), <alpha-value>)',
					800: 'rgba(var(--red-800), <alpha-value>)',
					900: 'rgba(var(--red-900), <alpha-value>)',
				},
				green: {
					DEFAULT: 'rgba(var(--green-500), <alpha-value>)',
					50: 'rgba(var(--green-50), <alpha-value>)',
					100: 'rgba(var(--green-100), <alpha-value>)',
					200: 'rgba(var(--green-200), <alpha-value>)',
					300: 'rgba(var(--green-300), <alpha-value>)',
					400: 'rgba(var(--green-400), <alpha-value>)',
					500: 'rgba(var(--green-500), <alpha-value>)',
					600: 'rgba(var(--green-600), <alpha-value>)',
					700: 'rgba(var(--green-700), <alpha-value>)',
					800: 'rgba(var(--green-800), <alpha-value>)',
					900: 'rgba(var(--green-900), <alpha-value>)',
				},
				blue: {
					DEFAULT: 'rgba(var(--blue-500), <alpha-value>)',
					50: 'rgba(var(--blue-50), <alpha-value>)',
					100: 'rgba(var(--blue-100), <alpha-value>)',
					200: 'rgba(var(--blue-200), <alpha-value>)',
					300: 'rgba(var(--blue-300), <alpha-value>)',
					400: 'rgba(var(--blue-400), <alpha-value>)',
					500: 'rgba(var(--blue-500), <alpha-value>)',
					600: 'rgba(var(--blue-600), <alpha-value>)',
					700: 'rgba(var(--blue-700), <alpha-value>)',
					800: 'rgba(var(--blue-800), <alpha-value>)',
					900: 'rgba(var(--blue-900), <alpha-value>)',
				},
				yellow: {
					DEFAULT: 'rgba(var(--yellow-500), <alpha-value>)',
					50: 'rgba(var(--yellow-50), <alpha-value>)',
					100: 'rgba(var(--yellow-100), <alpha-value>)',
					200: 'rgba(var(--yellow-200), <alpha-value>)',
					300: 'rgba(var(--yellow-300), <alpha-value>)',
					400: 'rgba(var(--yellow-400), <alpha-value>)',
					500: 'rgba(var(--yellow-500), <alpha-value>)',
					600: 'rgba(var(--yellow-600), <alpha-value>)',
					700: 'rgba(var(--yellow-700), <alpha-value>)',
					800: 'rgba(var(--yellow-800), <alpha-value>)',
					900: 'rgba(var(--yellow-900), <alpha-value>)',
				},
				purple: {
					DEFAULT: 'rgba(var(--purple-500), <alpha-value>)',
					50: 'rgba(var(--purple-50), <alpha-value>)',
					100: 'rgba(var(--purple-100), <alpha-value>)',
					200: 'rgba(var(--purple-200), <alpha-value>)',
					300: 'rgba(var(--purple-300), <alpha-value>)',
					400: 'rgba(var(--purple-400), <alpha-value>)',
					500: 'rgba(var(--purple-500), <alpha-value>)',
					600: 'rgba(var(--purple-600), <alpha-value>)',
					700: 'rgba(var(--purple-700), <alpha-value>)',
					800: 'rgba(var(--purple-800), <alpha-value>)',
					900: 'rgba(var(--purple-900), <alpha-value>)',
				},
				neutral: {
					DEFAULT: 'rgba(var(--neutral-500), <alpha-value>)',
					50: 'rgba(var(--neutral-50), <alpha-value>)',
					100: 'rgba(var(--neutral-100), <alpha-value>)',
					200: 'rgba(var(--neutral-200), <alpha-value>)',
					300: 'rgba(var(--neutral-300), <alpha-value>)',
					400: 'rgba(var(--neutral-400), <alpha-value>)',
					500: 'rgba(var(--neutral-500), <alpha-value>)',
					600: 'rgba(var(--neutral-600), <alpha-value>)',
					650: 'rgba(var(--neutral-650), <alpha-value>)',
					700: 'rgba(var(--neutral-700), <alpha-value>)',
					750: 'rgba(var(--neutral-750), <alpha-value>)',
					800: 'rgba(var(--neutral-800), <alpha-value>)',
					900: 'rgba(var(--neutral-900), <alpha-value>)',
				},
			},
			backgroundColor: {
				base: 'rgba(var(--theme-base-background), <alpha-value>)',
				subtle: 'rgba(var(--theme-subtle-background), <alpha-value>)',
				lighter: 'rgba(var(--theme-lighter-background), <alpha-value>)',
			},
			textColor: {
				default: 'rgba(var(--text-base), <alpha-value>)',
				subtle: 'rgba(var(--text-subtle), <alpha-value>)',
				disabled: 'rgba(var(--text-disabled), <alpha-value>)',
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
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [],
};
