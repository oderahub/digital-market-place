/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/media/**'
      },
      {
        protocol: 'https',
        hostname: 'digital-market-place-production-b880.up.railway.app',
        pathname: '/media/**'
      }
    ]
  }
}

export default nextConfig
