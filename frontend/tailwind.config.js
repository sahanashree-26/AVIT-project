/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfb',
          100: '#d4f5f3',
          200: '#aeece8',
          300: '#78dcd6',
          400: '#42c2ba',
          500: '#22a39f',
          600: '#178582',
          700: '#166a69',
          800: '#175553',
          900: '#164747',
        },
        ink: {
          50: '#f5f7f9',
          100: '#e9edf1',
          700: '#324152',
          800: '#212b38',
          900: '#141b24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
