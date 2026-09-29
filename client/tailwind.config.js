/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.06)',
          100: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.12)',
          200: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.22)',
          300: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.45)',
          400: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.8)',
          500: 'rgb(var(--primary-r), var(--primary-g), var(--primary-b))',
          600: 'var(--color-primary-hover)',
          700: 'var(--color-primary-active)',
          800: 'var(--color-primary-active)',
          900: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.9)',
          950: 'rgba(var(--primary-r), var(--primary-g), var(--primary-b), 0.95)',
          DEFAULT: 'rgb(var(--primary-r), var(--primary-g), var(--primary-b))',
          glow: 'var(--color-primary-glow)',
        },
        dark: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          card: 'var(--color-card)',
          hover: 'var(--color-hover)',
          border: 'var(--color-border)',
          muted: 'var(--color-text-muted)',
        },
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          card: 'var(--color-card)',
          hover: 'var(--color-hover)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          secondary: 'var(--color-text-secondary)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        theme: 'var(--radius)',
      }
    },
  },
  plugins: [],
}
