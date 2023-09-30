/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#12263A",
                secondary: "#DBCBD8",
                tertiary: "#1A232E",
                "primary-black": "#1A232E",
                "secondary-white": "#c7c7c7",
                "scrollbar-thumb": "#666e75",
                "footer-gradient": "#65c4fa",
            },
            fontFamily: {
                sans: ["Montserrat", "sans-serif"],
            },
            transitionTimingFunction: {
                "out-flex": "cubic-bezier(0.05, 0.6, 0.4, 0.9)",
            },
            screens: {
                xs: "480px",
            },
            boxShadow: {
                card: "0 0 1px 0 rgba(189,192,207,0.06),0 10px 16px -1px rgba(189,192,207,0.2)",
                cardhover:
                    "0 0 1px 0 rgba(189,192,207,0.06),0 10px 16px -1px rgba(189,192,207,0.4)",
            },
        },
    },
    plugins: [],
};
