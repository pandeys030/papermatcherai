/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7FBFD',
          pure: '#FFFFFF',
        },
        'baby-blue': {
          DEFAULT: '#9DDCF5',
          soft: '#DDF3FB',
          tint: '#EAF7FC',
        },
        ink: {
          DEFAULT: '#183B56',
          muted: '#667786',
        },
        rule: {
          DEFAULT: '#DDE9EF',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(24, 59, 86, 0.05), 0 1px 2px rgba(24, 59, 86, 0.03)',
        'paper-md': '0 4px 12px rgba(24, 59, 86, 0.06), 0 1px 3px rgba(24, 59, 86, 0.04)',
        'paper-lg': '0 10px 25px -3px rgba(24, 59, 86, 0.08), 0 4px 6px -2px rgba(24, 59, 86, 0.03)',
        'paper-stack': '0 14px 35px -5px rgba(24, 59, 86, 0.10), 0 8px 10px -6px rgba(24, 59, 86, 0.04)',
      },
    },
  },
  plugins: [],
};
