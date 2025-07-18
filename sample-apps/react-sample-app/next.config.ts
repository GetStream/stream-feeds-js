import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index2',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
