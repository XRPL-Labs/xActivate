/** @type {import('tailwindcss').Config} */

const styles = require("@kevinkoobs/xummstyleplugin")

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xl': '1.75rem',
      },
      fontFamily: {
        'sans': ['proxima-nova', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    styles
  ],
}
