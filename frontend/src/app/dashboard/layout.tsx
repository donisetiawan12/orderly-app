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
    <>
      {children}

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

      {/* Argon */}
      <Script
        src="/dashboard/js/argon-dashboard-tailwind.js"
        strategy="afterInteractive"
      />
    </>
  );
}