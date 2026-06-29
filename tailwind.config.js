/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',   // Celulares grandes / Tablets verticais
        'md': '768px',   // Tablets horizontais
        'lg': '1280px',  // Laptops e telas de 1280px
        'xl': '1920px',  // Monitores Full HD 1920px
      },
      colors: {
        brand: {
          dark: '#121212',     // O fundo preto fosco da imagem
          darker: '#0a0a0a',   // Preto mais profundo para degradês
          gold: '#D4AF37',     // O dourado premium dos botões e ícones
          goldGlow: 'rgba(212, 175, 55, 0.3)' // Opacidade para efeito de brilho
        }
      }
    },
  },
  plugins: [],
}