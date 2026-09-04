import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Application Colors
        ku: {
          // Backgrounds
          bg: '#0c1117',
          bgLight: '#111820',
          surface: '#161d27',
          surfaceHover: '#1c2533',
          card: '#1a2232',
          // Accents
          teal: '#14b8a6',
          tealLight: '#2dd4bf',
          tealDark: '#0d9488',
          tealMuted: 'rgba(20, 184, 166, 0.12)',
          // Kerala Gold
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          goldMuted: 'rgba(245, 158, 11, 0.12)',
          // Warm Cream (for light accents)
          cream: '#faf6f0',
          creamDark: '#f5efe6',
          // Text
          text: '#e2e8f0',
          textMuted: '#94a3b8',
          textDim: '#64748b',
          // Borders
          border: 'rgba(148, 163, 184, 0.12)',
          borderLight: 'rgba(148, 163, 184, 0.2)',
        },
        // Persona Colors — harmonious, not overpowering
        persona: {
          sheela: '#f43f5e',    // Rose
          sheelaLight: 'rgba(244, 63, 94, 0.1)',
          sheelaBubble: '#1f1520',
          anjali: '#a855f7',    // Purple
          anjaliLight: 'rgba(168, 85, 247, 0.1)',
          anjaliBubble: '#1a1525',
          soman: '#f59e0b',     // Amber
          somanLight: 'rgba(245, 158, 11, 0.1)',
          somanBubble: '#1f1a12',
          latha: '#14b8a6',     // Teal
          lathaLight: 'rgba(20, 184, 166, 0.1)',
          lathaBubble: '#121f1d',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'glass-sm': '0 2px 15px rgba(0, 0, 0, 0.2)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.2)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.2)',
        'bubble': '0 1px 3px rgba(0, 0, 0, 0.15)',
        'header': '0 2px 20px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '4xl': '2.25rem',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
