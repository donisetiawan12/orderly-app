'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // <-- Di sini udah include useRouter bray

export default function Sidebar() {
  const pathname = usePathname(); 
  const [notificationCount, setNotificationCount] = useState<number>(0); 
  const router = useRouter(); // <-- Di sini dijamin aman gak bakal merah lagi

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/orders/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (result.status === 'success' && result.data?.recent_orders) {
          const pendingOrders = result.data.recent_orders.filter(
            (o: any) => o.status === 'paid' || o.status === 'pending'
          ).length;
          setNotificationCount(pendingOrders);
        }
      } catch (err) {
        console.error("Gagal mengambil data notifikasi sidebar:", err);
      }
    };

    fetchNotification();
    
    const interval = setInterval(fetchNotification, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- FUNGSI LOGOUT NYA TARUH DI SINI BRAY ---
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 
    const yakinLogout = window.confirm("Apakah anda yakin ingin logout dari Dashboard Orderly?");
    if (yakinLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    } 
  };

  // Helper function buat nentuin class link (Aktif vs Biasa)
  const getLinkClass = (path: string) => {
    const baseClass = "py-2.7 text-sm my-0 mx-2 flex items-center justify-between whitespace-nowrap rounded-lg px-4 font-semibold transition-all duration-200";
    if (pathname === path) {
      return `${baseClass} bg-blue-500/13 text-blue-600 dark:text-white`;
    }
    return `${baseClass} text-slate-700 hover:bg-slate-100/50`;
  };

  return (
    <aside
      className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
      aria-expanded="false"
    >
      <div className="h-19">
        <a className="block px-8 py-6 m-0 text-sm whitespace-nowrap text-slate-700" href="#">
          <span className="ml-1 font-semibold transition-all duration-200">
            Dashboard Orderly
          </span>
        </a>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent" />

      <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul className="flex flex-col pl-0 mb-0">

          {/* MENU 1: DASHBOARD UTAMA */}
          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/seller')} href="/dashboard/seller">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-tv-2 text-blue-500"></i>
                </div>
                <span className="ml-1">Dashboard</span>
              </div>
            </Link>
          </li>

          {/* MENU 2: MANAJEMEN PRODUK */}
          <li className="mt-0.5 w-full">
            <Link
              className={getLinkClass('/dashboard/products')} // <-- Otomatis nyala kalau di /dashboard/products
              href="/dashboard/products"
            >
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-box-2 text-orange-500" style={{ fontSize: '14px' }}></i>
                </div>
                <span className="ml-1">Manajemen Produk</span>
              </div>
            </Link>
          </li>

          {/* MENU 3: PESANAN + LENCANA NOTIFIKASI */}
          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/pesanan')} href="/dashboard/pesanan">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-cart text-emerald-500"></i>
                </div>
                <span className="ml-1">Pesanan</span>
              </div>

              {/* 🔴 BADGE NOTIFIKASI BULAT SAKTI (Sekarang super akurat menyala pas pending/paid) */}
              {notificationCount > 0 && (
                <span 
                  className="flex items-center justify-center font-bold rounded-full animate-pulse text-center text-white shadow-sm" 
                  style={{ 
                    fontSize: '10px', 
                    minWidth: '18px', 
                    height: '18px', 
                    padding: '0 5px', 
                    lineHeight: '18px',
                    backgroundColor: '#ef4444' 
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </Link>
          </li>

          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/reviews')} href="/dashboard/reviews">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-chat-round text-cyan-500"></i>
                </div>
                <span className="ml-1">Ulasan Pelanggan</span>
              </div>
            </Link>
          </li>

        <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/payments')} href="/dashboard/payments">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-money-coins text-yellow-500"></i>
                </div>
                <span className="ml-1">Payment Saya</span>
              </div>
            </Link>
          </li>

          <li className="w-full mt-4">
            <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">
              Pengaturan
            </h6>
          </li>

          <li className="mt-0.5 w-full">
            <a className={getLinkClass('/dashboard/settings')} href="#">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-settings-gear-65 text-orange-500"></i>
                </div>
                <span className="ml-1">Pengaturan Akun</span>
              </div>
            </a>
          </li>

         <li className="mt-0.5 w-full">
  <a 
    className={getLinkClass('/logout')} 
    href="#"
    onClick={handleLogout} // <-- Tinggal diselipin fungsi ini aja bray, beres!
  >
    <div className="flex items-center">
      <div className="mr-2 flex h-8 w-8 items-center justify-center">
        <i className="ni ni-button-power text-red-500"></i>
      </div>
      <span className="ml-1">Logout</span>
    </div>
  </a>
</li>

        </ul>
      </div>
    </aside>
  );
}