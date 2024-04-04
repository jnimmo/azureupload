/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverMinification: false,
    taint: true,
  },
};

export default nextConfig;
