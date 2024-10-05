// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         hostname: 'digital-market-place-nine.vercel.app',
//         pathname: '**',
//         port: '3000',
//         protocol: 'https'
//       }
//     ]
//   }
// }

// export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'digital-market-place-nine.vercel.app',
        pathname: '**',
        protocol: 'https'
      }
    ],
    domains: ['digital-market-place-nine.vercel.app']
  }
}

export default nextConfig
