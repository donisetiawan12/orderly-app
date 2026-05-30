'use client';

interface NavbarProps {
  onSearchOpen: () => void;
}

export default function Navbar({ onSearchOpen }: any) {
      return (
    <nav className="navbar navbar-expand-lg" id="nav">
      <div className="container">
        <a className="navbar-brand" href="#">
          <div className="blogo">
            <div className="bico"><i className="fas fa-utensils"></i></div>
            <div>
              <div className="bname">Order<span>ly</span></div>
              <div className="bsub">Platform Pre-order Kuliner Kampus</div>
            </div>
          </div>
        </a>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
          <i className="fas fa-bars" style={{ color: "var(--primary)", fontSize: "1.35rem" }}></i>
        </button>

        <div className="collapse navbar-collapse" id="navmenu">
         <ul className="navbar-nav mx-auto">
            <li className="nav-item"><a className="nav-link" href="#hero">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="#about">Tentang</a></li>
            <li className="nav-item"><a className="nav-link" href="#menu-section">Menu</a></li>
            <li className="nav-item"><a className="nav-link" href="#hours">Cara Kerja</a></li>
            <li className="nav-item"><a className="nav-link" href="#contact-section">Kontak</a></li>
          </ul>
        
        <div className="d-flex align-items-center gap-1">
            <button onClick={onSearchOpen} id="navSearchBtn">
                <i className="fas fa-search"></i>
            </button>       
            <a href="#menu" className="nav-link nav-cta">
              <i className="fas fa-shopping-bag me-1"></i>Pesan Sekarang
            </a>
        </div>
        </div>
      </div>
    </nav>
  );
}