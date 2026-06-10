'use client';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav
      className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all ease-in shadow-none duration-250 rounded-2xl lg:flex-nowrap lg:justify-start"
      navbar-main="true"
      navbar-scroll="false"
    >
      <div className="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">

        {/* Breadcrumb */}
        <nav>
          <ol className="flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16">
            <li className="text-sm leading-normal">
              <a className="text-white opacity-50" href="#">
                Pages
              </a>
            </li>

            <li
              className="text-sm pl-2 capitalize leading-normal text-white before:float-left before:pr-2 before:text-white before:content-['/']"
              aria-current="page"
            >
              Dashboard
            </li>
          </ol>
        </nav>

        {/* Right section */}
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
          <div className="flex items-center md:ml-auto md:pr-4"></div>

          <ul className="flex flex-row items-center justify-end pl-0 mb-0 list-none gap-3 md-max:w-full">

            {/* Back Button */}
            <li className="flex items-center">
<button
  onClick={() => router.push('/')}
  className="btn btn-outline-light btn-sm rounded-pill !text-white px-3 py-1 border border-white/40 transition hover:bg-white hover:!text-black hover:border-white"
>
  <i className="fas fa-arrow-left mr-1"></i>
  Kembali ke Marketplace
</button>
            </li>

            {/* Profile */}
            <li className="flex items-center">
              <a
                href="/sign-in"
                className="block px-0 py-2 text-sm font-semibold text-white transition-all ease-nav-brand"
              >
                <i className="fa fa-user sm:mr-1"></i>
                <span className="hidden sm:inline">Profile</span>
              </a>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}