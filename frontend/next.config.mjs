/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['123.456.789.xyz'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '123.456.789.xyz',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;