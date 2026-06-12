/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ledger: {
                    paper: '#ffffff',
                    ink: '#0f172a',
                    accent: '#4f46e5',
                    divider: '#e2e8f0',
                },
                brand: {
                    indigo: '#4f46e5',
                    violet: '#8b5cf6',
                    cyan: '#06b6d4',
                    rose: '#f43f5e',
                    emerald: '#10b981',
                    slate: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(79, 70, 229, 0.08), 0 1px 3px rgba(79, 70, 229, 0.02)',
                'premium-hover': '0 20px 40px -15px rgba(79, 70, 229, 0.15), 0 1px 5px rgba(79, 70, 229, 0.05)',
            }
        },
    },
    plugins: [],
}
