'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  setUser: (user: any) => void;
}

export default function LoginModal({ show, onClose, onOpenRegister, setUser }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sesuaikan URL ini dengan endpoint backend Node.js/Laravel kamu bro
      const res = await fetch('http://${process.env.NEXT_PUBLIC_API_URL}/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal, periksa email & password!');
      }

      // 1. Simpan ke LocalStorage agar tidak hilang saat di-refresh
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token); // kalau backend pakai JWT token

      // 2. Update state user global di page.tsx
      setUser(data.user);
      onClose();

      // 3. Logika redirect berdasarkan Role dari DB kamu
      if (data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'seller') {
        router.push('/dashboard/seller');
      } else {
        // Buyer tetap di halaman utama
        router.push('/');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background:
          'rgba(0,0,0,.65)',
        zIndex: 9999,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="bg-white shadow-lg"
        style={{
          width: '1000px',
          maxWidth: '95%',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      >
        <div className="row g-0">
          {/* LEFT SIDE IMAGE */}
          <div
            className="col-md-6 position-relative d-none d-md-block"
            style={{
              minHeight: '650px',
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(rgba(79,70,229,.85), rgba(124,58,237,.85))',
              }}
            />

            {/* Content */}
            <div
              className="position-relative h-100 d-flex flex-column justify-content-center p-5 text-white"
              style={{
                zIndex: 2,
              }}
            >
              <h1
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                }}
              >
                Orderly
              </h1>

              {/* <h3
                className="mt-4"
                style={{
                  fontWeight: 700,
                }}
              >
                Marketplace Mahasiswa
              </h3> */}

              <p
                className="mt-3"
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                }}
              >
                Platform yang
                menghubungkan
                mahasiswa untuk
                menjual, membeli,
                dan melakukan
                pre-order berbagai
                produk dalam satu
                ekosistem digital.
              </p>

              <div className="mt-4">
                <div className="mb-3">
                  ✓ Jual Produk
                  Mahasiswa
                </div>

                <div className="mb-3">
                  ✓ Kelola Pesanan
                  dengan Mudah
                </div>

                <div className="mb-3">
                  ✓ Marketplace
                  Kampus Terintegrasi
                </div>

                <div className="mb-3">
                  ✓ Transaksi Aman
                  dan Cepat
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="col-md-6 p-5">
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2
                className="fw-bold"
              >
                Login
              </h2>

              <button
                className="btn-close"
                onClick={onClose}
              />
            </div>

            <p
              className="text-muted mb-4"
            >
              Masuk ke akun Anda
              untuk mulai
              bertransaksi di
              Orderly.
            </p>
            {error && <div className="alert alert-danger py-2 mt-2">{error}</div>}

            <form
              onSubmit={handleLoginSubmit}
            >
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Masukkan email"
                  style={{
                  borderRadius: '14px',
                  height: '55px',
                  border: '1px solid #e5e7eb',
                }}
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Masukkan password"
                  style={{
                  borderRadius: '14px',
                  height: '55px',
                  border: '1px solid #e5e7eb',
                }}
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 py-3"
                style={{
                  background:
                    'linear-gradient(90deg,#4f46e5,#ec4899)',
                  color: '#fff',
                  border: 'none',
                  borderRadius:
                    '12px',
                  fontWeight: 600,
                }}
              >
                {loading
                  ? 'Loading...'
                  : 'Login'}
              </button>
            </form>

            <div className="text-center mt-4">
              Belum punya akun?

              <button
                type="button"
                className="btn btn-link text-decoration-none fw-semibold"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}