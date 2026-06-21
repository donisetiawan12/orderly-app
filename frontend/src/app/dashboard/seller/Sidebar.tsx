'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; 
import logoAdmin from '../assets/img/img.jpeg';

// 🔑 DEFINISIKAN PROPS: Tangkap state dari layout biar bisa sliding
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname(); 
  const [notificationCount, setNotificationCount] = useState<number>(0); 
  const router = useRouter();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://orderly.web.id/api/orders/stats', {
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
      didOpen: () => {
        const styleTag = document.createElement('style');
        styleTag.id = 'swal-logout-hover-bypass-seller';
        styleTag.innerHTML = `
          .swal2-popup .swal2-styled.swal2-confirm { background-color: #3b82f6 !important; color: #ffffff !important; border: none !important; box-shadow: none !important; }
          .swal2-popup .swal2-styled.swal2-confirm:hover { background-color: #3b82f6 !important; filter: none !important; }
          .swal2-popup .swal2-styled.swal2-cancel { background-color: #94a3b8 !important; color: #ffffff !important; border: none !important; box-shadow: none !important; }
          .swal2-popup .swal2-styled.swal2-cancel:hover { background-color: #94a3b8 !important; filter: none !important; }
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

  const getLinkClass = (path: string) => {
    const baseClass = "py-2.7 text-sm my-0 mx-2 flex items-center justify-between whitespace-nowrap rounded-lg px-4 font-semibold transition-all duration-200";
    if (pathname === path) {
      return `${baseClass} bg-blue-500/13 text-blue-600 dark:text-white`;
    }
    return `${baseClass} text-slate-700 hover:bg-slate-100/50`;
  };

  return (
    <>
      {/* 📱 BACKDROP LAYER: Menutupi konten saat sidebar aktif di mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-980 xl:hidden transition-opacity duration-300 rounded-2xl"
          onClick={onClose}
        />
      )}

      {/* 🛠️ SIDEBAR UTAMA: Class diubah dari static -translate-x-full menjadi dynamic bray */}
      <aside
        className={`fixed inset-y-0 flex flex-col justify-between block w-full p-0 my-4 antialiased transition-transform duration-200 bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ height: 'calc(100vh - 32px)' }} 
      >
        {/* ATAS: HEADER LOGO */}
        <div className="h-20 relative flex items-center flex-shrink-0">
          <Link className="block px-8 py-4 m-0 text-sm whitespace-nowrap dark:text-white text-slate-700 flex items-center w-full" href="/dashboard/seller" onClick={onClose}>
            <img 
              src={logoAdmin.src} 
              className="inline max-w-full transition-all duration-200 ease-nav-brand max-h-10 rounded-lg shadow-sm"
              alt="main_logo" 
              style={{ height: '40px', width: '40px', aspectRatio: '1/1', objectFit: 'cover' }} 
            />
            <span 
              className="font-bold text-blue-600 text-xl transition-all duration-200 ease-nav-brand tracking-wide align-middle"
              style={{ marginLeft: '10px' }}
            >
              Orderly Seller
            </span>
          </Link>
        </div>

        <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent flex-shrink-0" />

        {/* TENGAH: DAFTAR MENU NAVIGASI */}
        <div className="block w-auto grow basis-full overflow-hidden">
          <ul className="flex flex-col pl-0 mb-0 gap-y-0.5"> 

            <li className="w-full">
              <Link className={getLinkClass('/dashboard/seller')} href="/dashboard/seller" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-tv-2 text-blue-500"></i>
                  </div>
                  <span className="ml-1">Dashboard</span>
                </div>
              </Link>
            </li>

            <li className="w-full">
              <Link className={getLinkClass('/dashboard/products')} href="/dashboard/products" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-box-2 text-orange-500" style={{ fontSize: '14px' }}></i>
                  </div>
                  <span className="ml-1">Manajemen Produk</span>
                </div>
              </Link>
            </li>

            <li className="w-full">
              <Link className={getLinkClass('/dashboard/pesanan')} href="/dashboard/pesanan" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-cart text-emerald-500"></i>
                  </div>
                  <span className="ml-1">Pesanan</span>
                </div>

                {notificationCount > 0 && (
                  <span 
                    className="flex items-center justify-center font-bold rounded-full animate-pulse text-center text-white shadow-sm" 
                    style={{ fontSize: '10px', minWidth: '18px', height: '18px', padding: '0 5px', lineHeight: '18px', backgroundColor: '#ef4444' }}
                  >
                    {notificationCount}
                  </span>
                )}
              </Link>
            </li>

            <li className="w-full">
              <Link className={getLinkClass('/dashboard/reviews')} href="/dashboard/reviews" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-chat-round text-cyan-500"></i>
                  </div>
                  <span className="ml-1">Ulasan Pelanggan</span>
                </div>
              </Link>
            </li>

            <li className="w-full">
              <Link className={getLinkClass('/dashboard/payments')} href="/dashboard/payments" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-money-coins text-yellow-500"></i>
                  </div>
                  <span className="ml-1">Payment Saya</span>
                </div>
              </Link>
            </li>

            <li className="w-full mt-4">
              <h6 className="pl-6 ml-2 text-xs font-bold leading-tight uppercase dark:text-white opacity-60">
                Pengaturan
              </h6>
            </li>
            
            <li className="w-full">
              <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')} onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-settings-gear-65 text-orange-500"></i>
                  </div>
                  <span className="ml-1">Pengaturan Akun</span>
                </div>
              </Link>
            </li>

            <li className="w-full">
              <a className={getLinkClass('/logout')} href="#" onClick={handleLogout}>
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
    </>
  );
}