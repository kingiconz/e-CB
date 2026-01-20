/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // ✅ enables App Router
  },
  output: 'standalone',   // optional, good for production
};

export default nextConfig;
