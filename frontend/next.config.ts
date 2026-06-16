import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cleanBackend = BACKEND_URL.replace(/\/$/, '');

    return [
      {
        // 🛣️ Jalur 1: Jinakin rute ganda /api/api/... biar jadi /api/... di Railway
        source: '/api/api/:path*',
        destination: `${cleanBackend}/api/:path*`,
      },
      {
        // 🛣️ Jalur 2: Oper gambar /api/uploads/... langsung ke folder uploads Railway
        source: '/api/uploads/:path*',
        destination: `${cleanBackend}/uploads/:path*`,
      },
      {
        // 🛣️ Jalur 3: Oper semua rute /api/... standar langsung ke /api/... di Railway
        source: '/api/:path*',
        destination: `${cleanBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;