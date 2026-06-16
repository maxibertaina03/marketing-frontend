/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta base de ContentOS (se puede ajustar más adelante)
        marca: {
          DEFAULT: '#6d28d9',
          claro: '#8b5cf6',
          oscuro: '#5b21b6',
        },
      },
    },
  },
  plugins: [],
};
