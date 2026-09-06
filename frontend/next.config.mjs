/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/eventos',
        destination: '/explorar',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
