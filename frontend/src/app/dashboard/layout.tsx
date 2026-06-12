'use client';

import Script from 'next/script';
import './assets/css/nucleo-icons.css';
import './assets/css/nucleo-svg.css';
import './assets/css/argon-dashboard-tailwind.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default bg-gray-50 text-slate-500 min-h-screen relative block w-full overflow-x-hidden">
      
      {/* Konten halaman (Sidebar, Navbar, Cards, dan Tabel) akan dirender rapi di dalam div pembungkus Argon ini */}
      {children}

      {/* ================= PLUGIN UTAN JAVASCRIPT ARGON ================= */}
      {/* ChartJS */}
      <Script
        src="/dashboard/js/plugins/chartjs.min.js"
        strategy="afterInteractive"
      />

      {/* Perfect Scrollbar */}
      <Script
        src="/dashboard/js/plugins/perfect-scrollbar.min.js"
        strategy="afterInteractive"
      />

      {/* Argon core script */}
      <Script
        src="/dashboard/js/argon-dashboard-tailwind.js"
        strategy="afterInteractive"
      />
      
    </div>
  );
}