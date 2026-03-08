import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Enable experimental features as needed
  }
}

export default nextConfig