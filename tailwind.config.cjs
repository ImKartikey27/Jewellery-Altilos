module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}", "./src/app/**/*.{ts,tsx,js,jsx}", "./public/**/*.html"],
  theme: {
    extend: {
        fontFamily: {
       bricolageGrotesque: ["var(--font-bricolage-grotesque)"],
         poppins: ["var(--font-poppins)"],
    },
    },
  },
  plugins: [],
};
