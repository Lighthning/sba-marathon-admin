/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          primary: '#0097B2',
        },
        blue: {
          bright: '#58EDEC',
          dark: '#1C244B',
        },
        gray: {
          text: '#545454',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
