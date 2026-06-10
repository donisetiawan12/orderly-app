'use client';

export default function Sidebar() {
  return (
    <aside
      className="fixed inset-y-0 flex-wrap items-center justify-between block w-full p-0 my-4 overflow-y-auto antialiased transition-transform duration-200 -translate-x-full bg-white border-0 shadow-xl max-w-64 ease-nav-brand z-990 xl:ml-6 rounded-2xl xl:left-0 xl:translate-x-0"
      aria-expanded="false"
    >
      <div className="h-19">
        <a
          className="block px-8 py-6 m-0 text-sm whitespace-nowrap text-slate-700"
          href="#"
        >
          <span className="ml-1 font-semibold transition-all duration-200">
            Dashboard Orderly
          </span>
        </a>
      </div>

      <hr className="h-px mt-0 bg-transparent bg-gradient-to-r from-transparent via-black/40 to-transparent" />

      <div className="items-center block w-auto max-h-screen overflow-auto h-sidenav grow basis-full">
        <ul className="flex flex-col pl-0 mb-0">

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 bg-blue-500/13 text-sm my-0 mx-2 flex items-center whitespace-nowrap rounded-lg px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-tv-2 text-blue-500"></i>
              </div>

              <span className="ml-1">Dashboard</span>
            </a>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-box-2 text-orange-500"></i>
              </div>

              <span className="ml-1">
                Manajemen Produk
              </span>
            </a>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-cart text-emerald-500"></i>
              </div>

              <span className="ml-1">
                Pesanan
              </span>
            </a>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-chat-round text-cyan-500"></i>
              </div>

              <span className="ml-1">
                Ulasan Pelanggan
              </span>
            </a>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-money-coins text-yellow-500"></i>
              </div>

              <span className="ml-1">
                Payment Saya
              </span>
            </a>
          </li>

          <li className="w-full mt-4">
            <h6 className="pl-6 ml-2 text-xs font-bold uppercase opacity-60">
              Pengaturan
            </h6>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-settings-gear-65 text-orange-500"></i>
              </div>

              <span className="ml-1">
                Pengaturan Akun
              </span>
            </a>
          </li>

          <li className="mt-0.5 w-full">
            <a
              className="py-2.7 text-sm my-0 mx-2 flex items-center whitespace-nowrap px-4 font-semibold text-slate-700"
              href="#"
            >
              <div className="mr-2 flex h-8 w-8 items-center justify-center">
                <i className="ni ni-button-power text-red-500"></i>
              </div>

              <span className="ml-1">
                Logout
              </span>
            </a>
          </li>

        </ul>
      </div>
    </aside>
  );
}