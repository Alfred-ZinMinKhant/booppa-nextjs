/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'placeholder-gray-400',
    'placeholder-gray-500',
    'placeholder-gray-600',
    'placeholder-gray-700',
  ],
  theme: {
    extend: {
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      colors: {
        'booppa-purple': '#7C3AED',
        'booppa-green': '#10B981',
        'booppa-blue': '#3B82F6',
        'booppa-pink': '#EC4899',
      }
    },
  },
  plugins: [],
}
