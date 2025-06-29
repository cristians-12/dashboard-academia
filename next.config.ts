/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 👈 desactiva errores de lint en el build
  },
};

module.exports = nextConfig;
