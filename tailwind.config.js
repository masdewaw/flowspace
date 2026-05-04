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
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          light: 'rgb(var(--primary-light) / <alpha-value>)',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        button: '10px',
        card: '16px',
        modal: '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h1': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2': ['20px', { lineHeight: '1.4', fontWeight: '700' }],
        'h3': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['11px', { lineHeight: '1.6', letterSpacing: '0.04em', fontWeight: '600' }],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
