/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/foodsport",
  assetPrefix: "/foodsport/",
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
