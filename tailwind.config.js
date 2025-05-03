module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          gray: {
            900: '#111827',
            800: '#1F2937',
            700: '#374151',
          },
          purple: {
            400: '#C084FC',
            600: '#9333EA',
          },
          green: {
            600: '#16A34A',
            700: '#15803D',
          }
        }
      }
    },
    plugins: [],
  }