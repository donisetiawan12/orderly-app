'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // 🔥 KUNCI: Import SweetAlert2 murni bray
import logoAdmin from '../assets/img/img.jpeg';

export default function Sidebar() {
  const pathname = usePathname(); 
  const [notificationCount, setNotificationCount] = useState<number>(0); 
  const router = useRouter();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://127.0.0.1:5000/api/orders/stats', {
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

  // --- 🔥 FUNGSI LOGOUT SELLER DENGAN SWEETALERT2 & ANTI-HOVER ---
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 

    Swal.fire({
      title: '<span style="font-family: sans-serif; font-size: 18px; font-weight:700; color:#1e293b;">Mau Keluar, Seller?</span>',
      text: "Sesi login di dashboard seller ini bakal dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Logout!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-2xl' },
      // 🛠️ LOCK COLOR: Tombol konfirmasi & batal anti-hover pas dideketin kursor bray
      didOpen: () => {
        const styleTag = document.createElement('style');
        styleTag.id = 'swal-logout-hover-bypass-seller';
        styleTag.innerHTML = `
          /* --- TOMBOL YA, LOGOUT! (CONFIRM) --- */
          .swal2-popup .swal2-styled.swal2-confirm {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
          .swal2-popup .swal2-styled.swal2-confirm:hover,
          .swal2-popup .swal2-styled.swal2-confirm:focus {
            background-color: #3b82f6 !important;
            filter: none !important;
          }

          /* --- TOMBOL BATAL (CANCEL) --- */
          .swal2-popup .swal2-styled.swal2-cancel {
            background-color: #94a3b8 !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
          .swal2-popup .swal2-styled.swal2-cancel:hover,
          .swal2-popup .swal2-styled.swal2-cancel:focus {
            background-color: #94a3b8 !important;
            filter: none !important;
          }
        `;
        document.head.appendChild(styleTag);
      },
      willClose: () => {
        const styleTag = document.getElementById('swal-logout-hover-bypass-seller');
        if (styleTag) styleTag.remove();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      }
    });
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
      className="fixed inset-y-0 flex flex-col justify-between block w-full p-0 my-4 antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
      style={{ height: 'calc(100vh - 32px)' }} // Mengunci tinggi sidebar pas satu layar penuh minus margin my-4
      aria-expanded="false"
    >
      {/* ATAS: HEADER LOGO */}
      <div className="h-20 relative flex items-center flex-shrink-0">
        <Link className="block px-8 py-4 m-0 text-sm whitespace-nowrap dark:text-white text-slate-700 flex items-center w-full" href="/dashboard/seller">
          {/* 📸 LOGO UTAMA SELLER */}
          <img 
            src={logoAdmin.src} 
            className="inline max-w-full transition-all duration-200 ease-nav-brand max-h-10 rounded-lg shadow-sm"
            alt="main_logo" 
            style={{ 
              height: '40px',        
              width: '40px',         
              aspectRatio: '1/1', 
              objectFit: 'cover' 
            }} 
          />
          
          {/* 👑 Teks Nama Aplikasi */}
          <span 
            className="font-bold text-blue-600 text-xl transition-all duration-200 ease-nav-brand tracking-wide align-middle"
            style={{ marginLeft: '10px' }}
          >
            Orderly Seller
          </span>
        </Link>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent flex-shrink-0" />

      {/* TENGAH: DAFTAR MENU NAVIGASI (DIBUAT COMPACT & ANTI-OVERFLOW) */}
      <div className="block w-auto grow basis-full overflow-hidden">
        <ul className="flex flex-col pl-0 mb-0 gap-y-0.5"> {/* Dipasangi gap rapat biar ga makan tinggi layar */}

          {/* MENU 1: DASHBOARD UTAMA */}
          <li className="w-full">
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
          <li className="w-full">
            <Link className={getLinkClass('/dashboard/products')} href="/dashboard/products">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-box-2 text-orange-500" style={{ fontSize: '14px' }}></i>
                </div>
                <span className="ml-1">Manajemen Produk</span>
              </div>
            </Link>
          </li>

          {/* MENU 3: PESANAN + LENCANA NOTIFIKASI */}
          <li className="w-full">
            <Link className={getLinkClass('/dashboard/pesanan')} href="/dashboard/pesanan">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-cart text-emerald-500"></i>
                </div>
                <span className="ml-1">Pesanan</span>
              </div>

              {/* 🔴 BADGE NOTIFIKASI BULAT */}
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

          {/* MENU 4: ULASAN PELANGGAN */}
          <li className="w-full">
            <Link className={getLinkClass('/dashboard/reviews')} href="/dashboard/reviews">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-chat-round text-cyan-500"></i>
                </div>
                <span className="ml-1">Ulasan Pelanggan</span>
              </div>
            </Link>
          </li>

          {/* MENU 5: PAYMENT */}
          <li className="w-full">
            <Link className={getLinkClass('/dashboard/payments')} href="/dashboard/payments">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-money-coins text-yellow-500"></i>
                </div>
                <span className="ml-1">Payment Saya</span>
              </div>
            </Link>
          </li>

          {/* SECTION HEADER: PENGATURAN */}
          <li className="w-full mt-4">
            <h6 className="pl-6 ml-2 text-xs font-bold leading-tight uppercase dark:text-white opacity-60">
              Pengaturan
            </h6>
          </li>
          

          {/* MENU 6: PENGATURAN AKUN */}
          <li className="w-full">
            <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')}>
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-settings-gear-65 text-orange-500"></i>
                </div>
                <span className="ml-1">Pengaturan Akun</span>
              </div>
            </Link>
          </li>

          {/* MENU 7: LOGOUT */}
          <li className="w-full">
            <a 
              className={getLinkClass('/logout')} 
              href="#"
              onClick={handleLogout}
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