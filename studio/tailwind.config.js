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
					primary: 'var(--brand-color-primary)',
					'primary-darker': 'var(--brand-color-primary--darker)',
					'subtle-primary': 'var(--brand-color-subtle--primary)',
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
				success: {
					default: 'var(--success-default)',
					hover: 'var(--success-hover)',
					focus: 'var(--success-focus)',
				},

				error: {
					default: 'var(--error-default)',
					hover: 'var(--error-hover)',
					focus: 'var(--error-focus)',
				},

				border: 'var(--theme-border)',

				icon: {
					darker: 'var(--icon-darker)',
					base: 'var(--icon-base)',
					disabled: 'var(--icon-disabled)',
				},

				input: {
					'base-background': 'var(--form-input-base-background)',
					'base-border': 'var(--form-input-base-border)',
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
					blue: 'var(--surface-blue)',
					green: 'var(--surface-green)',
					yellow: 'var(--surface-yellow)',
					purple: 'var(--surface-purple)',
					red: 'var(--surface-red)',
					orange: 'var(--surface-orange)',
				},
				wrapper: {
					'background-base': 'var(--wrapper-background-base)',
					'background-hover': 'var(--wrapper-background-hover)',
				},

				red: {
					DEFAULT: 'var(--red-500)',
					50: 'var(--red-50)',
					100: 'var(--red-100)',
					200: 'var(--red-200)',
					300: 'var(--red-300)',
					400: 'var(--red-400)',
					500: 'var(--red-500)',
					600: 'var(--red-600)',
					700: 'var(--red-700)',
					800: 'var(--red-800)',
					900: 'var(--red-900)',
				},
				green: {
					DEFAULT: 'var(--green-500)',
					50: 'var(--green-50)',
					100: 'var(--green-100)',
					200: 'var(--green-200)',
					300: 'var(--green-300)',
					400: 'var(--green-400)',
					500: 'var(--green-500)',
					600: 'var(--green-600)',
					700: 'var(--green-700)',
					800: 'var(--green-800)',
					900: 'var(--green-900)',
				},
				blue: {
					DEFAULT: 'var(--blue-500)',
					50: 'var(--blue-50)',
					100: 'var(--blue-100)',
					200: 'var(--blue-200)',
					300: 'var(--blue-300)',
					400: 'var(--blue-400)',
					500: 'var(--blue-500)',
					600: 'var(--blue-600)',
					700: 'var(--blue-700)',
					800: 'var(--blue-800)',
					900: 'var(--blue-900)',
				},
				yellow: {
					DEFAULT: 'var(--yellow-500)',
					50: 'var(--yellow-50)',
					100: 'var(--yellow-100)',
					200: 'var(--yellow-200)',
					300: 'var(--yellow-300)',
					400: 'var(--yellow-400)',
					500: 'var(--yellow-500)',
					600: 'var(--yellow-600)',
					700: 'var(--yellow-700)',
					800: 'var(--yellow-800)',
					900: 'var(--yellow-900)',
				},
				purple: {
					DEFAULT: 'var(--purple-500)',
					50: 'var(--purple-50)',
					100: 'var(--purple-100)',
					200: 'var(--purple-200)',
					300: 'var(--purple-300)',
					400: 'var(--purple-400)',
					500: 'var(--purple-500)',
					600: 'var(--purple-600)',
					700: 'var(--purple-700)',
					800: 'var(--purple-800)',
					900: 'var(--purple-900)',
				},
				neutral: {
					DEFAULT: 'var(--neutral-500)',
					50: 'var(--neutral-50)',
					100: 'var(--neutral-100)',
					200: 'var(--neutral-200)',
					300: 'var(--neutral-300)',
					400: 'var(--neutral-400)',
					500: 'var(--neutral-500)',
					600: 'var(--neutral-600)',
					650: 'var(--neutral-650)',
					700: 'var(--neutral-700)',
					750: 'var(--neutral-750)',
					800: 'var(--neutral-800)',
					900: 'var(--neutral-900)',
				},
			},
			backgroundColor: {
				base: 'var(--theme-base-background)',
				subtle: 'var(--theme-subtle-background)',
				lighter: 'var(--theme-lighter-background)',
			},
			textColor: {
				default: 'var(--text-base)',
				subtle: 'var(--text-subtle)',
				disabled: 'var(--text-disabled)',
			},
			borderRadius: {
				lg: `var(--radius)`,
				md: `calc(var(--radius) - 2px)`,
				sm: 'calc(var(--radius) - 4px)',
				xs: 'calc(var(--radius) - 6px)',
			},
			fontFamily: {
				sans: ['var(--font-sans)', ...fontFamily.sans],
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
