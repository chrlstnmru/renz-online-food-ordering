const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true,
			padding: '1.25rem'
		},
		extend: {
			fontFamily: {
				sans: ['Inter', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				primary: {
					50: 'hsl(43, 90%, 96%)',
					100: 'hsl(46, 82%, 89%)',
					200: 'hsl(45, 83%, 77%)',
					300: 'hsl(43, 83%, 65%)',
					400: 'hsl(41, 83%, 56%)',
					500: 'hsl(35, 79%, 53%)',
					600: 'hsl(30, 81%, 44%)',
					700: 'hsl(24, 78%, 37%)',
					800: 'hsl(20, 71%, 31%)',
					900: 'hsl(19, 67%, 26%)',
					950: 'hsl(18, 78%, 14%)'
				},
				secondary: {
					50: 'hsl(0, 5%, 96%)',
					100: 'hsl(24, 10%, 90%)',
					200: 'hsl(20, 10%, 82%)',
					300: 'hsl(17, 9%, 69%)',
					400: 'hsl(18, 8%, 53%)',
					500: 'hsl(21, 9%, 43%)',
					600: 'hsl(28, 9%, 37%)',
					700: 'hsl(28, 8%, 31%)',
					800: 'hsl(24, 7%, 27%)',
					900: 'hsl(34, 6%, 24%)',
					950: 'hsl(30, 8%, 15%)'
				}
			},
			screens: {
				'2xl': { max: '1535px' },
				xl: { max: '1279px' },
				lg: { max: '1023px' },
				md: { max: '767px' },
				sm: { max: '639px' },
				xs: { max: '479px' }
			}
		}
	},
	plugins: [require('tailwind-scrollbar')({ nocompatible: true }), require('@tailwindcss/forms')]
};

module.exports = config;
