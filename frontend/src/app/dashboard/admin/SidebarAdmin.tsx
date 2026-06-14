'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    const yakinLogout = window.confirm("Apakah komandan yakin ingin logout dari Dashboard Admin?");
    if (yakinLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const getLinkClass = (path: string) => {
    const baseClass = "py-2.7 text-sm my-0 mx-2 flex items-center justify-between whitespace-nowrap rounded-lg px-4 font-semibold transition-all duration-200";
    if (pathname === path) {
      return `${baseClass} bg-blue-500/13 text-blue-600 dark:text-white`;
    }
    return `${baseClass} text-slate-700 hover:bg-slate-100/50`;
  };

  return (
    <aside className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0">
      <div className="h-19">
        <Link className="block px-8 py-6 m-0 text-sm whitespace-nowrap text-slate-700" href="/dashboard/admin">
          <span className="ml-1 font-bold text-blue-600 text-lg">Orderly Admin 👑</span>
        </Link>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent" />

      <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul className="flex flex-col pl-0 mb-0">
          
         {/* MENU UTAMA ADMIN */}
          <li className="w-full mt-2">
            <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Ringkasan</h6>
          </li>

          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/admin')} href="/dashboard/admin">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-tv-2 text-blue-500"></i>
                </div>
                <span className="ml-1">Dashboard</span>
              </div>
            </Link>
          </li>

          {/* 🛠️ KATEGORI MANAJEMEN DATA (OPERASIONAL ADMIN) */}
          <li className="w-full mt-4">
            <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Manajemen</h6>
          </li>

          {/* Menu Verifikasi Seller */}
          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/admin/verifikasi')} href="/dashboard/admin/verifikasi">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  <i className="ni ni-badge text-cyan-500"></i>
                </div>
                <span className="ml-1">Verifikasi Seller</span>
              </div>
            </Link>
          </li>

          {/* 🔥 MENU BARU: KELOLA KATEGORI PRODUK */}
          <li className="mt-0.5 w-full">
            <Link className={getLinkClass('/dashboard/admin/kategori')} href="/dashboard/admin/kategori">
              <div className="flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center">
                  {/* Pake icon ni-folder-17 atau ni-books-bookmark biar nyambung sama kategori produk bray */}
                  <i className="ni ni-folder-17 text-emerald-500"></i>
                </div>
                <span className="ml-1">Kelola Kategori Produk</span>
              </div>
            </Link>
          </li>


          {/* ⚙️ KATEGORI PENGATURAN (KHUSUS AKUN / SISTEM) */}
          <li className="w-full mt-4">
            <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">Pengaturan</h6>
          </li>

          {/* Pengaturan Akun */}
          <li className="mt-0.5 w-full">
            <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')}>
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
  );
}