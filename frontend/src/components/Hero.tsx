'use client';

import { useEffect, useState } from 'react';

// Pastikan interface mendefinisikan prop onSearchOpen
interface HeroProps {
  onSearchOpen: () => void;
  onLoginOpen: () => void; // Tambahkan ini
}

export default function Hero({ onSearchOpen, onLoginOpen }: HeroProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Gagal memuat data user:", e);
      }
    }
  }, []);

  return (
    <section id="hero">
      <div className="hs hs1"></div>
      <div className="hs hs2"></div>

      <div className="container">
        <div className="row align-items-center g-5" style={{ minHeight: '88vh' }}>
          <div className="col-lg-6">
            <div className="hbadge">
              <div className="hbi"><i className="fas fa-shopping-basket"></i></div>
              <span>#1 Marketplace Mahasiswa</span>
            </div>

            <h1 className="htitle">
              Pesan produk anti drama, <span className="hl">Orderly</span><br />
              Bikin Rapih Bersama.
            </h1>

            <p className="hdesc">
              Orderly hadir untuk membantu mahasiswa menjual dan membeli berbagai produk 
              dengan lebih terorganisir, transparan, dan mudah diakses melalui satu 
              platform marketplace kampus.
            </p>

            {user?.role === 'buyer' && (
              <div className="alert alert-success mt-3 mb-4">
                Selamat datang kembali, <strong>{user.name}</strong> 👋
              </div>
            )}

            <div className="d-flex flex-wrap gap-3 mb-2">
              {/* Pastikan onClick memanggil fungsi onSearchOpen */}
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // Mencegah reload halaman
                  onSearchOpen();
                }} 
                className="btn-red"
                style={{ zIndex: 10, position: 'relative' }} // Memastikan tombol bisa diklik
              >
                <i className="fas fa-search me-2"></i> Cari Produk
              </button>

             {user?.role === 'buyer' ? (
                <a href="/dashboard/orders" className="btn-play">
                  <div className="pico"><i className="fas fa-receipt"></i></div>
                  <span>Pesanan Saya</span>
                </a>
              ) : (
                <button 
                  onClick={onLoginOpen} 
                  className="btn-play" 
                  style={{ cursor: 'pointer', border: 'none' }} // <-- Hapus background: 'none', sisakan border: 'none' jika perlu
                >
                  <div className="pico"><i className="fas fa-user-plus"></i></div>
                  <span>Daftar Sekarang</span>
                </button>
              )}
            </div>

            <div className="hstats d-flex gap-3 flex-wrap mt-4">
              <div className="hstat">
                <span className="snum">PO<em>+</em></span>
                <small>Transaksi Aman</small>
              </div>
              <div className="sdiv"></div>
              <div className="hstat">
                <span className="snum">100<em>%</em></span>
                <small>Transparan</small>
              </div>
              <div className="hdiv"></div>
              <div className="hstat">
                <span className="snum">MUDAH</span>
                <small>Sistem Terukur</small>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div className="hcircle">
                <img src="/img/hero.jpeg" alt="Orderly Marketplace" className="img-fluid" />
              </div>
              {/* Card dekoratif tetap sama */}
              <div className="fcard fc1"><div className="fcoi r"><i className="fas fa-clock"></i></div><div><span className="fcnum">Deadline</span><span className="fcsm">PO Terjadwal</span></div></div>
              <div className="fcard fc2"><div className="fcoi y"><i className="fas fa-check-double"></i></div><div><span className="fcnum">Verifikasi</span><span className="fcsm">Pembayaran Aman</span></div></div>
              <div className="fcard fc3"><div className="fcoi g"><i className="fas fa-receipt"></i></div><div><span className="fcnum">Tracking</span><span className="fcsm">Status Pesanan</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}