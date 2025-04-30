// tailwind.config.js
import typography from '@tailwindcss/typography'; // <-- Use import syntax

/** @type {import('tailwindcss').Config} */
const config = { // Use a variable for the config object
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./app/**/*.{js,ts,jsx,tsx,mdx}", // Uncomment if using App Router
  ],
  theme: {
    extend: {
      colors: {
        'gold': '#FFD700',
        'cream': '#FFFDD0', // Assuming this is the correct cream #f0e6d2 was in globals? Use one consistently.
        'maroon': '#800000',
        'navy-blue-darker': '#000050',
      },
    },
  },
  plugins: [
    typography, // <-- Reference the imported plugin
  ],
};

export default config; // <-- Use export default