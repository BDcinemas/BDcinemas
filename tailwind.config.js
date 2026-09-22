/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          black: '#050507',
          obsidian: '#0A0A0C',
          dark: '#111115',
          surface: '#18181D',
          border: 'rgba(255, 255, 255, 0.08)',
          card: 'rgba(24, 24, 29, 0.75)',
          red: '#E50914',
          gold: '#FFD700',
          accent: '#FF334B'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
