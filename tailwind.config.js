/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      animation: {
        // From the animated gradient version
        "gradient-pan": "gradient-pan 15s ease infinite",
        "blob": "blob 10s infinite",
        
        // From your custom version, but using the better 'forwards' value
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.8s ease-out forwards',

        // From your custom version
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        // For the animated gradient
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // For the aesthetic blobs
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        // Combined and corrected fade animations
        "fade-in-up": {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in-right": {
          '0%': { opacity: '0', transform: 'translateX(20px)' }, // Corrected to come from the right
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        // For the float animation
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};