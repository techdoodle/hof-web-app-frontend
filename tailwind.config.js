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
        // Existing theme colors
        primary: '#00FF85', // Neon green
        'primary-dark': '#003B1F', // Dark green
        background: '#001F10', // Very dark green
        foreground: '#FFFFFF',
        surface: '#002B17', // Slightly lighter dark green
        'surface-accent': '#004D2B', // Even lighter dark green for hover states
      },
      fontFamily: {
        sans: ['Orbitron', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary), 0 0 20px theme(colors.primary)',
        'neon-sm': '0 0 2px theme(colors.primary), 0 0 10px theme(colors.primary)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 255, 133, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 133, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
}

 