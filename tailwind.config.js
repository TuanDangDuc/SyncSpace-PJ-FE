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
        // Primary — warm terracotta
        primary: {
          50:  '#fdf5f0',
          100: '#fae7da',
          200: '#f5cdb5',
          300: '#ecab86',
          400: '#df8055',
          500: '#C2714F',
          600: '#a85d3d',
          700: '#8a4a2f',
          800: '#6e3a24',
          900: '#4e291a',
          950: '#2c160d',
        },
        // Warm neutral grays (stone-based)
        gray: {
          50:  '#FAF9F6',
          75:  '#F5F1EB',
          100: '#EDE8E0',
          150: '#E8E3DC',
          200: '#D9D0C5',
          300: '#BAB0A3',
          400: '#9C9186',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        // Semantic colors — muted, earthy
        success: {
          50:  '#F0F7F2',
          100: '#D9EEE0',
          200: '#B0D9BC',
          500: '#4A7C59',
          600: '#3D6B4A',
          700: '#2F5239',
        },
        warning: {
          50:  '#FDF8EE',
          100: '#FAEDCB',
          200: '#F3D58F',
          500: '#B45309',
          600: '#9A4508',
          700: '#7C3606',
        },
        danger: {
          50:  '#FEF2F0',
          100: '#FDE0DB',
          200: '#FAC0B5',
          500: '#C0392B',
          600: '#A73020',
          700: '#8B2419',
        },
        info: {
          50:  '#EFF4FB',
          100: '#D6E5F5',
          200: '#ACCBEB',
          500: '#3D6FA0',
          600: '#305C87',
          700: '#244869',
        },
        // Vintage accent — warm cream/parchment
        cream: {
          50:  '#FFFEF9',
          100: '#FAF9F6',
          200: '#F5F1EB',
          300: '#EDE8E0',
        },
        espresso: {
          800: '#2C1810',
          900: '#1A0F0A',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem',    { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem',{ lineHeight: '1.2',  letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '14px',
        '2xl': '18px',
      },
      boxShadow: {
        'xs':         '0 1px 2px rgba(28,25,23,0.06)',
        'sm':         '0 1px 3px rgba(28,25,23,0.08), 0 1px 2px rgba(28,25,23,0.04)',
        'card':       '0 1px 3px rgba(28,25,23,0.06), 0 0 0 1px rgba(28,25,23,0.05)',
        'card-hover': '0 6px 20px rgba(28,25,23,0.10), 0 0 0 1px rgba(28,25,23,0.06)',
        'dropdown':   '0 10px 30px rgba(28,25,23,0.12), 0 0 0 1px rgba(28,25,23,0.08)',
        'focus':      '0 0 0 3px rgba(194,113,79,0.22)',
        'warm':       '0 4px 16px rgba(194,113,79,0.15)',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'shimmer':   'shimmer 1.8s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition:  '600px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
