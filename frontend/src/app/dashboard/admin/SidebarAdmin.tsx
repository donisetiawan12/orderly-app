'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
// 📂 Keluar satu folder (../) dari admin untuk mengakses folder assets
import logoAdmin from '../assets/img/img.jpeg';

// 🔑 DEFINISIKAN PROPS: Terima state pembuka dari Layout bray
interface SidebarAdminProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarAdmin({ isOpen = false, onClose }: SidebarAdminProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 🚪 HANDLER LOGOUT MODERN DENGAN SWEETALERT ANTI-HOVER
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    
    Swal.fire({
      title: '<span style="font-family: sans-serif; font-size: 18px; font-weight:700; color:#1e293b;">Mau Keluar, Komandan?</span>',
      text: "Sesi login di dashboard admin ini bakal dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Logout!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-2xl' },
      didOpen: () => {
        const styleTag = document.createElement('style');
        styleTag.id = 'swal-logout-hover-bypass';
        styleTag.innerHTML = `
          .swal2-popup .swal2-styled.swal2-confirm { background-color: #3b82f6 !important; color: #ffffff !important; border: none !important; box-shadow: none !important; }
          .swal2-popup .swal2-styled.swal2-confirm:hover { background-color: #3b82f6 !important; filter: none !important; }
          .swal2-popup .swal2-styled.swal2-cancel { background-color: #94a3b8 !important; color: #ffffff !important; border: none !important; box-shadow: none !important; }
          .swal2-popup .swal2-styled.swal2-cancel:hover { background-color: #94a3b8 !important; filter: none !important; }
        `;
        document.head.appendChild(styleTag);
      },
      willClose: () => {
        const styleTag = document.getElementById('swal-logout-hover-bypass');
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
      {/* 📱 BACKDROP (Lapisan Gelap): Muncul pas di mobile buat nutupin konten belakang pas sidebar aktif */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-980 xl:hidden transition-opacity duration-300 rounded-2xl"
          onClick={onClose}
        />
      )}

      {/* aside utama dengan dynamic style logic bray */}
      <aside 
        className={`fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-20 relative flex items-center">
          <Link className="block px-8 py-4 m-0 text-sm whitespace-nowrap dark:text-white text-slate-700 flex items-center w-full" href="/dashboard/admin" onClick={onClose}>
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
              Orderly Admin
            </span>
          </Link>
        </div>

        <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent" />

        <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
          <ul className="flex flex-col pl-0 mb-0">
            
            <li className="w-full mt-2">
              <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Ringkasan</h6>
            </li>

            <li className="mt-0.5 w-full">
              <Link className={getLinkClass('/dashboard/admin')} href="/dashboard/admin" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-tv-2 text-blue-500"></i>
                  </div>
                  <span className="ml-1">Dashboard</span>
                </div>
              </Link>
            </li>

            <li className="w-full mt-4">
              <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Manajemen</h6>
            </li>

            <li className="mt-0.5 w-full">
              <Link className={getLinkClass('/dashboard/admin/verifikasi')} href="/dashboard/admin/verifikasi" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-badge text-cyan-500"></i>
                  </div>
                  <span className="ml-1">Verifikasi Seller</span>
                </div>
              </Link>
            </li>

            <li className="mt-0.5 w-full">
              <Link className={getLinkClass('/dashboard/admin/kategory_product')} href="/dashboard/admin/kategory_product" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-folder-17 text-emerald-500"></i>
                  </div>
                  <span className="ml-1">Kelola Kategori Produk</span>
                </div>
              </Link>
            </li>

            <li className="w-full mt-4">
              <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Pengaturan</h6>
            </li>

            <li className="mt-0.5 w-full">
              <Link className={getLinkClass('/dashboard/admin/profile')} href="/dashboard/admin/profile" onClick={onClose}>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center">
                    <i className="ni ni-settings-gear-65 text-orange-500"></i>
                  </div>
                  <span className="ml-1">Pengaturan Akun</span>
                </div>
              </Link>
            </li>

            <li className="mt-0.5 w-full">
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