/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'btn-gradient',
    'btn-gradient-border',
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette from design
        'light-green': '#22D060',
        'dark-green': '#22D060',
        'light-accent-orange': '#FFB32C',
        'dark-accent-orange': '#FFB32C',
        'light-surface': '#FFFFFF',
        'dark-surface': '#232728',
        'light-text-muted': '#666666',
        'dark-text-muted': '#A0A3A7',
        'light-background': '#F5F5F5',
        'dark-background': '#0D1F1E',
        'light-overlay-blur': '#FFFFFF',
        'dark-overlay-blur': '#FFFFFF',
        'light-text-primary': '#121212',
        'dark-text-primary': '#F9F9F9',
        'golden': '#423404',
        // Existing theme colors
        primary: '#00FF85', // Neon green
        'primary-dark': '#003B1F', // Dark green
        background: '#001F10', // Very dark green
        foreground: '#FFFFFF',
        surface: '#002B17', // Slightly lighter dark green
        'surface-accent': '#004D2B', // Even lighter dark green for hover states
      },
      fontFamily: {
        sans: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
        rajdhani: ['var(--font-rajdhani)', 'system-ui', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary), 0 0 20px theme(colors.primary)',
        'neon-sm': '0 0 2px theme(colors.primary), 0 0 10px theme(colors.primary)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 255, 133, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 133, 0.05) 1px, transparent 1px)",
        'green-gradient-dark': "linear-gradient(180deg, rgba(0, 102, 51, 0.5) -40.91%, rgba(0, 204, 102, 0.8) 132.95%)",
        'hof-select-golden-gradient': "linear-gradient(205.04deg, rgba(248, 241, 202, 0.14) 8.48%, rgba(221, 169, 68, 0.14) 50%, rgba(239, 215, 126, 0.14) 91.52%)",
        'hof-select-golden-gradient-light': "linear-gradient(205.04deg, #F8F1CA 8.48%, #DDA944 50%, #EFD77E 91.52%)",
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
}

 