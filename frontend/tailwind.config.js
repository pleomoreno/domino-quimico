/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "dq-bg": "#FFFFFF",
        "dq-red": "#C8102E",
        "dq-red-dim": "rgba(200,16,46,0.15)",
        "dq-red-soft": "rgba(200,16,46,0.08)",
        "dq-text": "#C8102E",
        "dq-muted": "rgba(200,16,46,0.45)",
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
