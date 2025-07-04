import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    swcMinifyDebugOptions: {
      compress: false,
      mangle: false
    }
  },
  reactStrictMode: true,
  images: {
    domains: ['api.hof.com'], // Add your API domain here
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWAConfig(nextConfig);
