/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'digital-market-place-production-b880.up.railway.app',
        port: '8080',
        pathname: '/**'
      }
    ]
  }
}

export default nextConfig
