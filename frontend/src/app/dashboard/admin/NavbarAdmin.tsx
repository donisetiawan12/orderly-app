'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// 🔑 WAJIB: Daftarkan props toggleSidebar biar bisa dihubungkan ke sidebar bray
interface NavbarAdminProps {
  toggleSidebar?: () => void;
}

export default function NavbarAdmin({ toggleSidebar }: NavbarAdminProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Pecah path URL (Contoh: "/dashboard/admin" -> ["dashboard", "admin"])
  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <nav
      className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-4 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start z-50"
      navbar-main="true"
    >
      <div className="flex items-center justify-between w-full px-0 py-1 mx-auto flex-wrap-inherit">

        {/* ================= BREADCRUMB OTOMATIS ADMIN ================= */}
        <nav className="block" style={{ transform: 'translateY(5px)' }}>
          <ol className="flex flex-wrap pt-0 bg-transparent rounded-lg items-center mb-0 list-none p-0">
            <li className="text-sm capitalize leading-normal text-white font-semibold">
              <Link href="/dashboard/admin" className="text-white opacity-80 hover:opacity-100">
                Admin Central
              </Link>
            </li>

            {pathSegments.map((segment, index) => {
              if (segment.toLowerCase() === 'dashboard' || segment.toLowerCase() === 'admin') return null;

              const isLast = index === pathSegments.length - 1;
              const cleanSegmentName = segment.replace(/[-_]/g, ' ');
              const pathLink = '/' + pathSegments.slice(0, index + 1).join('/');

              return (
                <li
                  key={index}
                  className={`text-sm pl-2 capitalize leading-normal text-white before:float-left before:pr-2 before:text-white/60 before:content-['/'] ${
                    isLast ? 'font-bold' : 'opacity-60'
                  }`}
                >
                  {isLast ? cleanSegmentName : <Link href={pathLink} className="text-white hover:underline">{cleanSegmentName}</Link>}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Sisi Kanan Navbar */}
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
          <div className="flex items-center md:ml-auto md:pr-4"></div>

          <ul className="flex flex-row items-center justify-end pl-0 mb-0 list-none gap-3">
            <li className="flex items-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn btn-outline-light btn-sm rounded-pill !text-white px-3 py-1 border border-white/40 transition hover:bg-white hover:!text-black cursor-pointer"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              >
                <i className="fas fa-arrow-left mr-1"></i> Kembali ke Marketplace
              </button>
            </li>

            {/* 💻 DESKTOP ONLY: Icon Profile (Hanya kelihatan di Laptop, di HP lenyap) */}
            <li className="hidden lg:flex items-center">
              <Link
                href="/dashboard/admin/profile"
                className="block px-0 py-2 text-sm font-semibold text-white transition-all hover:opacity-80"
              >
                <i className="fa fa-user sm:mr-1"></i>
                <span>Admin Profile</span>
              </Link>
            </li>

            {/* 📱 MOBILE ONLY: Tombol Hamburger pengganti Profile (Hanya nongol di HP bray) */}
            <li className="block lg:hidden flex items-center">
              <button
                type="button"
                onClick={toggleSidebar} // 💥 Memicu fungsi buka tutup sidebar pas diklik
                className="p-1 text-white transition-all cursor-pointer bg-transparent border-0 flex items-center justify-center"
                style={{ fontSize: '20px' }}
                aria-label="Toggle Sidebar"
              >
                <i className="fas fa-bars"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}