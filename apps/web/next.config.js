/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
    {
      source: '/socket.io/:path*',
      destination: 'http://localhost:3001/socket.io/:path*',
    },
  ],
};

module.exports = nextConfig;
