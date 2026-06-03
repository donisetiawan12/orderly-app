'use client';

interface NavbarProps {
  onSearchOpen: () => void;
  onLoginOpen: () => void;
}

export default function Navbar({
  onSearchOpen,
  onLoginOpen,
}: NavbarProps) {
  return (
    <nav className="navbar navbar-expand-lg" id="nav">
      <div className="container">
        {/* Logo */}
        <a className="navbar-brand" href="#">
          <div className="blogo">
            <div className="bico">
              <i className="fas fa-store"></i>
            </div>

            <div>
              <div className="bname">
                Order<span>ly</span>
              </div>

              <div className="bsub">
                Marketplace Pre-Order Mahasiswa
              </div>
            </div>
          </div>
        </a>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navmenu"
        >
          <i
            className="fas fa-bars"
            style={{
              color: 'var(--primary)',
              fontSize: '1.35rem',
            }}
          ></i>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navmenu"
        >
          {/* Menu */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="#hero"
              >
                Home
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#about"
              >
                Tentang
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#menu-section"
              >
                Produk
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#hours"
              >
                Cara Kerja
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#contact-section"
              >
                Kontak
              </a>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={onSearchOpen}
              id="navSearchBtn"
              className="btn btn-light rounded-circle"
            >
              <i className="fas fa-search"></i>
            </button>

            <button
              onClick={onLoginOpen}
              className="nav-link nav-cta border-0"
              style={{
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}