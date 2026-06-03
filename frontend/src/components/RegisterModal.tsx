'use client';

import { useState } from 'react';

interface Props {
  show: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function RegisterModal({
  show,
  onClose,
  onOpenLogin,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');

  const [ktm, setKtm] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  if (!show) return null;

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', name);
      formData.append('email', email);
      formData.append(
        'password',
        password
      );
      formData.append('role', role);

      if (
        role === 'seller' &&
        ktm
      ) {
        formData.append('ktm', ktm);
      }

      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      setName('');
      setEmail('');
      setPassword('');
      setRole('buyer');
      setKtm(null);

      onClose();
      onOpenLogin();
    } catch (error) {
      console.error(error);

      alert(
        'Terjadi kesalahan saat registrasi'
      );
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
          {/* LEFT IMAGE */}
          <div
            className="col-md-6 position-relative d-none d-md-block"
            style={{
              minHeight: '700px',
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200')",
              backgroundSize: 'cover',
              backgroundPosition:
                'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(rgba(79,70,229,.88), rgba(236,72,153,.85))',
              }}
            />

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

              <h3
                className="mt-4"
                style={{
                  fontWeight: 700,
                }}
              >
                Mulai Jual & Beli
                Sekarang
              </h3>

              <p
                className="mt-3"
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                }}
              >
                Bergabunglah dengan
                marketplace mahasiswa
                untuk menjual produk,
                menerima pesanan,
                dan mengembangkan
                usaha Anda dengan
                lebih mudah.
              </p>

              <div className="mt-4">
                <div className="mb-3">
                  🚀 Bangun Bisnis
                  Mahasiswa
                </div>

                <div className="mb-3">
                  📦 Kelola Pesanan
                  dengan Mudah
                </div>

                <div className="mb-3">
                  🛒 Marketplace
                  Terintegrasi
                </div>

                <div className="mb-3">
                  🔒 Verifikasi Seller
                  Aman
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="col-md-6 p-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2
                className="fw-bold"
                style={{
                  color: '#4f46e5',
                }}
              >
                Register
              </h2>

              <button
                className="btn-close"
                onClick={onClose}
              />
            </div>

            <p className="text-muted mb-4">
              Buat akun baru untuk
              mulai menggunakan
              Orderly.
            </p>

            <form
              onSubmit={handleRegister}
            >
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Daftar Sebagai
                </label>

                <select
                  className="form-select form-select-lg"
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value
                    )
                  }
                >
                  <option value="buyer">
                    Pembeli
                  </option>

                  <option value="seller">
                    Penjual
                  </option>
                </select>
              </div>

              {role === 'seller' && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Upload KTM
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      setKtm(
                        e.target
                          .files?.[0] ||
                          null
                      )
                    }
                    required
                  />

                  <small className="text-muted">
                    KTM digunakan
                    untuk proses
                    verifikasi seller.
                  </small>
                </div>
              )}

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
                  : 'Register'}
              </button>
            </form>

            <div className="text-center mt-4">
              Sudah punya akun?

              <button
                type="button"
                className="btn btn-link text-decoration-none fw-semibold"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}