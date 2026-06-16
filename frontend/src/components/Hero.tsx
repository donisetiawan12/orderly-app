
'use client';

import { useEffect, useState } from 'react';

interface HeroProps {
  user: any;
  logoutMessage: boolean;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
}

export default function Hero({
  user,
  logoutMessage,
  onSearchOpen,
  onLoginOpen,
}: HeroProps) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      setShowWelcome(true);

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <>
      {/* Welcome Toast */}
      {user && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            opacity: showWelcome ? 1 : 0,
            transform: showWelcome
              ? 'translateY(0)'
              : 'translateY(-20px)',
            transition: 'all .4s ease',
            pointerEvents: showWelcome ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              minWidth: '340px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg,#22c55e,#16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '20px',
                  }}
                >
                  <i className="fas fa-check"></i>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                    }}
                  >
                    Login berhasil
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    Selamat datang 👋
                  </div>

                  <div
                    style={{
                      fontSize: '14px',
                      color: '#4b5563',
                    }}
                  >
                    {user.name}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginTop: '12px',
                height: '4px',
                background: '#e5e7eb',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  background:
                    'linear-gradient(90deg,#22c55e,#16a34a)',
                  animation: 'toastProgress 3s linear forwards',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {logoutMessage && (
  <div
    style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        minWidth: '340px',
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,.12)',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
        </div>

        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            Logout berhasil
          </div>

          <div
            style={{
              fontWeight: 700,
            }}
          >
            Sampai jumpa lagi 👋
          </div>

          <div
            style={{
              fontSize: '14px',
              color: '#4b5563',
            }}
          >
            Anda telah keluar dari akun
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      <section id="hero">
        <div className="hs hs1"></div>
        <div className="hs hs2"></div>

        <div className="container">
          <div
            className="row align-items-center g-5"
            style={{ minHeight: '88vh' }}
          >
            <div className="col-lg-6">
              <div className="hbadge">
                <div className="hbi">
                  <i className="fas fa-shopping-basket"></i>
                </div>
                <span>#1 Marketplace Mahasiswa</span>
              </div>

              <h1 className="htitle">
                Pesan produk anti drama,{' '}
                <span className="hl">Orderly</span>
                <br />
                Bikin Rapih Bersama.
              </h1>

              <p className="hdesc">
                Orderly hadir untuk membantu mahasiswa
                menjual dan membeli berbagai produk
                dengan lebih terorganisir, transparan,
                dan mudah diakses melalui satu platform
                marketplace kampus.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSearchOpen();
                  }}
                  className="btn-red"
                  style={{
                    zIndex: 10,
                    position: 'relative',
                  }}
                >
                  <i className="fas fa-search me-2"></i>
                  Cari Produk
                </button>

                {user ? (
                  <>
                    {user.role === 'buyer' && (
                      <a
                        href="/dashboard/orders"
                        className="btn-play"
                      >
                        <div className="pico">
                          <i className="fas fa-receipt"></i>
                        </div>
                        <span>Pesanan Saya</span>
                      </a>
                    )}

                    {user.role === 'seller' && (
                      <a
                        href="/dashboard/seller"
                        className="btn-play"
                      >
                        <div className="pico">
                          <i className="fas fa-tachometer-alt"></i>
                        </div>
                        <span>Dashboard Seller</span>
                      </a>
                    )}

                    {user.role === 'admin' && (
                      <a
                        href="/dashboard/admin"
                        className="btn-play"
                      >
                        <div className="pico">
                          <i className="fas fa-user-shield"></i>
                        </div>
                        <span>Dashboard Admin</span>
                      </a>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onLoginOpen}
                    className="btn-play"
                    style={{
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <div className="pico">
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <span>Daftar Sekarang</span>
                  </button>
                )}
              </div>

              <div className="hstats d-flex gap-3 flex-wrap mt-4">
                <div className="hstat">
                  <span className="snum">
                    PO<em>+</em>
                  </span>
                  <small>Transaksi Aman</small>
                </div>

                <div className="sdiv"></div>

                <div className="hstat">
                  <span className="snum">
                    100<em>%</em>
                  </span>
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
              <div
                style={{
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <div className="hcircle">
                  <img
                    src="/img/hero.jpeg"
                    alt="Orderly Marketplace"
                    className="img-fluid"
                  />
                </div>

                <div className="fcard fc1">
                  <div className="fcoi r">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <span className="fcnum">
                      Deadline
                    </span>
                    <span className="fcsm">
                      PO Terjadwal
                    </span>
                  </div>
                </div>

                <div className="fcard fc2">
                  <div className="fcoi y">
                    <i className="fas fa-check-double"></i>
                  </div>
                  <div>
                    <span className="fcnum">
                      Verifikasi
                    </span>
                    <span className="fcsm">
                      Pembayaran Aman
                    </span>
                  </div>
                </div>

                <div className="fcard fc3">
                  <div className="fcoi g">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <div>
                    <span className="fcnum">
                      Tracking
                    </span>
                    <span className="fcsm">
                      Status Pesanan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

