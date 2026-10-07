/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: 'https://portal.sukabumikota.go.id/wp-content/:path*',
      },
    ];
  },
}

export default nextConfig
