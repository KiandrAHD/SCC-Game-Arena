/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E62E37',
          hover: '#C91F2A',
        },
        text: '#18202B',
        muted: '#687386',
        border: '#E7E9EE',
        surface: '#FFFFFF',
        background: '#FAFBFC',
        dark: '#202936',
        success: '#159365',
        warning: '#AA7100',
        info: '#2672CC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
