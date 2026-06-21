'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// 🔑 DEFINISIKAN PROPS: Biar tombol hamburger bisa ngirim perintah buka ke layout
interface NavbarProps {
  toggleSidebar?: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname(); 

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <nav
      className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-4 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start"
      navbar-main="true"
      navbar-scroll="false"
    >
      <div className="flex items-center justify-between w-full px-0 py-1 mx-auto flex-wrap-inherit">

        {/* ================= BREADCRUMB OTOMATIS ================= */}
        <nav className="block" style={{ transform: 'translateY(5px)' }}>
          <ol className="flex flex-wrap pt-0 bg-transparent rounded-lg items-center mb-0 list-none p-0">
            <li className="text-sm capitalize leading-normal text-white font-semibold">
              <Link href="/dashboard" className="text-white opacity-80 hover:opacity-100">
                Home
              </Link>
            </li>

            {pathSegments.map((segment, index) => {
              if (segment.toLowerCase() === 'dashboard' && index === 0) return null;

              const isLast = index === pathSegments.length - 1;
              const cleanSegmentName = segment.replace(/[-_]/g, ' ');
              const pathLink = '/' + pathSegments.slice(0, index + 1).join('/');

              if (isLast) {
                return (
                  <li
                    key={index}
                    className="text-sm pl-2 capitalize leading-normal text-white font-bold before:float-left before:pr-2 before:text-white/60 before:content-['/']"
                    aria-current="page"
                  >
                    {cleanSegmentName}
                  </li>
                );
              } else {
                return (
                  <li
                    key={index}
                    className="text-sm pl-2 capitalize leading-normal text-white opacity-60 before:float-left before:pr-2 before:text-white/60 before:content-['/']"
                  >
                    <Link href={pathLink} className="text-white hover:underline">
                      {cleanSegmentName}
                    </Link>
                  </li>
                );
              }
            })}
          </ol>
        </nav>

        {/* Sisi Kanan */}
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
          <div className="flex items-center md:ml-auto md:pr-4"></div>

          <ul className="flex flex-row items-center justify-end pl-0 mb-0 list-none gap-3 md-max:w-full">

            {/* Back Button */}
            <li className="flex items-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn btn-outline-light btn-sm rounded-pill !text-white px-3 py-1 border border-white/40 transition hover:bg-white hover:!text-black hover:border-white cursor-pointer"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              >
                <i className="fas fa-arrow-left mr-1"></i>
                Kembali ke Marketplace
              </button>
            </li>

            {/* 💻 DESKTOP ONLY: Tombol Profile cuma muncul di Layar Gede */}
            <li className="hidden lg:flex items-center">
              <Link
                href="/dashboard/profile" 
                className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand hover:opacity-80"
              >
                <i className="fa fa-user sm:mr-1"></i>
                <span>Profile</span>
              </Link>
            </li>

            {/* 📱 MOBILE ONLY: Tombol Hamburger pengganti Profile pas di Layar HP */}
            <li className="block lg:hidden flex items-center">
              <button
                type="button"
                onClick={toggleSidebar} // 💥 Triger pembuka sidebar bray
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