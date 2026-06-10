'use client';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
}

export default function Navbar({
  user,
  onLogout,
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

        <div className="collapse navbar-collapse" id="navmenu">
          {/* Menu Navigasi */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a className="nav-link" href="#hero">
                Home
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#about">
                Tentang
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#menu-section">
                Produk
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#hours">
                Cara Kerja
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#contact-section">
                Kontak
              </a>
            </li>
          </ul>

          {/* Action Buttons Dinamis */}
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={onSearchOpen}
              id="navSearchBtn"
              className="btn btn-light rounded-circle"
            >
              <i className="fas fa-search"></i>
            </button>

            {user ? (
              <>
                {/* JIKA BUYER */}
                {user.role === 'buyer' && (
                  <a
                    href="/dashboard/orders"
                    className="nav-link nav-cta border-0"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Pesanan Saya
                  </a>
                )}

                {/* JIKA SELLER */}
                {user.role === 'seller' && (
                  <a
                    href="/dashboard/seller"
                    className="nav-link nav-cta border-0"
                    style={{ 
                      textDecoration: 'none', 
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)' 
                    }}
                  >
                    <i className="fas fa-store me-2"></i>
                    Dashboard Seller
                  </a>
                )}

                {/* JIKA ADMIN */}
                {user.role === 'admin' && (
                  <a
                    href="/dashboard/admin"
                    className="nav-link nav-cta border-0"
                    style={{ 
                      textDecoration: 'none', 
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    }}
                  >
                    <i className="fas fa-user-shield me-2"></i>
                    Dashboard Admin
                  </a>
                )}

                {/* TOMBOL LOGOUT */}
                <button
                  onClick={onLogout}
                  className="nav-link nav-cta border-0"
                  style={{
                    borderRadius: '50px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              /* JIKA BELUM LOGIN */
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}