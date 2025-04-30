// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // <--- UNCOMMENT THIS LINE
  // IMPORTANT: Add image optimization disable if needed for export
  images: {
     unoptimized: true,
  },
  reactStrictMode: true, // Good practice to keep this
  // Add other configurations if you have them
};

export default nextConfig;