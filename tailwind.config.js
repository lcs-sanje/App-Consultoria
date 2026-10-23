/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F4',
          100: '#E6EFE8',
          200: '#CFE0D3',
          300: '#B0CBB7',
          400: '#8BAE95',
          500: '#6B9076',
          600: '#52735C',
          700: '#415B49',
          800: '#35493C',
          900: '#2C3C32',
        },
        clay: {
          50: '#F9F6F3',
          100: '#F0EAE3',
          200: '#E2D6C8',
          300: '#CEB9A5',
          400: '#B5997F',
          500: '#9B7E63',
          600: '#82664E',
          700: '#6A523F',
          800: '#584436',
          900: '#49392E',
        },
      },
    },
  },
  plugins: [],
};
