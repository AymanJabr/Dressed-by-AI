/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            keyframes: {
                pulse: {
                    '0%, 100%': {
                        transform: 'scale(1)',
                        opacity: '0.3'
                    },
                    '50%': {
                        transform: 'scale(1.5)',
                        opacity: '1'
                    },
                },
            },
            animation: {
                pulse: 'pulse 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
} 