/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#564787",
                secondary: "#DBCBD8",
                tertiary: "#f2fdff",
                "primary-black": "#1A232E",
                "secondary-white": "#c7c7c7",
                siteblack: "#131519",
                siteDimBlack: "#191d23",
                siteBlue: "#65c4fa",
                siteWhite: "#9eacc7",
            },
            transitionTimingFunction: {
                "out-flex": "cubic-bezier(0.05, 0.6, 0.4, 0.9)",
            },
            screens: {
                xs: "480px",
            },
            fontFamily: {
                inter: ["Inter var", "sans-serif"],
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
