/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow reading files from parent directory (auto-co root)
  experimental: {
    serverExternalPackages: ['gray-matter'],
  },
};

export default nextConfig;
