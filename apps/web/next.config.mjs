/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Tauri
  transpilePackages: ['@smart-erp/i18n', '@smart-erp/types', '@smart-erp/validation'],
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,
};

export default nextConfig;
