/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true, // solo si usas App Router con server components
  },
};

module.exports = nextConfig;
