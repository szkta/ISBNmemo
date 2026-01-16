import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/isbn',

  images: {
    unoptimized: true,
  },
  // ▼▼▼ ストリクトモードをオフにする（最重要） ▼▼▼
  reactStrictMode: false,
};

export default nextConfig;