/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0A0F1C', // Deep Navy/Black
                    primary: '#00D4FF', // Cyan
                    secondary: '#7A00FF', // Purple
                    accent: '#00FF94', // Green accent
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.1)',
                    dark: 'rgba(0, 0, 0, 0.3)',
                    border: 'rgba(255, 255, 255, 0.05)'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.1)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
                }
            }
        },
    },
    plugins: [],
}
