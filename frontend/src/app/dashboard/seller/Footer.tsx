'use client';

export default function Footer() {
  return (
    <footer className="pt-4 pb-4 mt-6 bg-transparent w-full">
      <div className="w-full px-6 mx-auto">
        <div className="flex flex-wrap items-center -mx-3 lg:justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
          
          {/* SISI KIRI: Hak Cipta & Nama Aplikasi */}
          <div className="w-full max-w-full px-3 mt-0 mb-4 shrink-0 lg:mb-0 lg:w-1/2 lg:flex-none">
            <div className="text-xs leading-normal text-center text-slate-400 lg:text-left dark:text-white/60">
              © {new Date().getFullYear()}, dibuat dengan PT COMET{' '}
              <i className="fa fa-heart text-rose-500 animate-pulse mx-0.5"></i>{' '}
              untuk platform yang lebih baik bagi Mahasiswa .
            </div>
          </div>
          
          {/* SISI KANAN: Menu Navigasi Link Internal */}
          <div className="w-full max-w-full px-3 mt-0 shrink-0 lg:w-1/2 lg:flex-none">
            <ul className="flex flex-wrap justify-center pl-0 mb-0 list-none lg:justify-end gap-1">
              <li className="nav-item">
                <a 
                  href="/tentang-kami" 
                  className="block px-3 py-1 text-xs font-medium transition-colors ease-in-out text-slate-400 hover:text-blue-500 dark:text-white/60 dark:hover:text-white"
                >
                  Tentang Kami
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="/bantuan" 
                  className="block px-3 py-1 text-xs font-medium transition-colors ease-in-out text-slate-400 hover:text-blue-500 dark:text-white/60 dark:hover:text-white"
                >
                  Pusat Bantuan
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="/ketentuan-layanan" 
                  className="block px-3 py-1 pr-0 text-xs font-medium transition-colors ease-in-out text-slate-400 hover:text-blue-500 dark:text-white/60 dark:hover:text-white"
                >
                  Ketentuan & Privasi
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}