/** @type {import("tailwindcss").Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9'
        }
      },
      boxShadow: {
        card: '0 4px 16px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        xl: '0.75rem'
      }
    }
  },
  plugins: []
}
