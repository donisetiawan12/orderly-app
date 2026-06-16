import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // 🛣️ Mantra Pemotong Kompas: Semua yang nembak ke /api/ otomatis dioper ke Railway
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || '/api/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;