/** Design system GigaTech – Premium Enterprise ERP */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          light: '#ffffff',
          dark:  '#172033',
          page:  '#f8fafc',
          'page-dark': '#080f1c',
          sidebar: '#111827',
        },
      },
      backgroundImage: {
        'grad-blue':   'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        'grad-green':  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'grad-amber':  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'grad-rose':   'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
        'grad-violet': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
        'grad-cyan':   'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        'grad-auth':   'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)',
        'grad-card':   'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.02) 100%)',
      },
      boxShadow: {
        card:  '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        float: '0 12px 32px -8px rgba(37,99,235,0.18)',
        glow:  '0 0 0 3px rgba(37,99,235,0.15)',
        soft:  '0 4px 16px -4px rgba(15,23,42,0.08)',
        glass: '0 8px 32px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.65 },
        },
      },
      animation: {
        'fade-in':    'fade-in .35s ease-out both',
        shimmer:      'shimmer 1.4s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
