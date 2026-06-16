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
  const [phone, setPhone] = useState('');     // TAMBAHAN SESUAI DB
  const [address, setAddress] = useState(''); // TAMBAHAN SESUAI DB
  const [ktm, setKtm] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Gunakan FormData karena ada file upload (KTM)
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      formData.append('phone', phone);       // Kirim ke backend
      formData.append('address', address);   // Kirim ke backend

      if (role === 'seller' && ktm) {
        formData.append('ktm', ktm);
      }

      // 🔄 LOGIKA DINAMIS: Deteksi ENV Vercel, kalau gak ada fallback ke localhost laptop bray
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/api';
      
      // Bersihkan jika ada double slash akibat salah ketik env
      const cleanUrl = `${baseUrl.replace(/\/$/, '')}/auth/register`;

      console.log('🚀 Nembak API Register ke:', cleanUrl);

      const response = await fetch(cleanUrl, {
        method: 'POST',
        body: formData, // Mengirim data multipart/form-data
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Registrasi gagal!');
        return;
      }

      alert(data.message || 'Registrasi berhasil! Silakan login.');

      // Reset Form
      setName('');
      setEmail('');
      setPassword('');
      setRole('buyer');
      setPhone('');
      setAddress('');
      setKtm(null);

      onClose();
      onOpenLogin(); // Langsung arahkan ke modal login
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: 'rgba(0,0,0,.65)',
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
          maxHeight: '90vh', // Mencegah modal kepotong di layar kecil
          overflowY: 'auto',  // Mengaktifkan scroll internal modal
        }}
      >
        <div className="row g-0">
          {/* LEFT IMAGE DISPLAY */}
          <div
            className="col-md-6 position-relative d-none d-md-block"
            style={{
              minHeight: '700px',
              backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(rgba(79,70,229,.88), rgba(236,72,153,.85))',
              }}
            />

            <div
              className="position-relative h-100 d-flex flex-column justify-content-center p-5 text-white"
              style={{ zIndex: 2 }}
            >
              <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>
                Orderly
              </h1>

              <p className="mt-3" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                Bergabunglah dengan marketplace mahasiswa untuk menjual produk,
                menerima pesanan, dan mengembangkan usaha Anda dengan lebih mudah.
              </p>

              <div className="mt-4">
                <div className="mb-3">🚀 Bangun Bisnis Mahasiswa</div>
                <div className="mb-3">📦 Kelola Pesanan dengan Mudah</div>
                <div className="mb-3">🛒 Marketplace Terintegrasi</div>
                <div className="mb-3">🔒 Verifikasi Seller Aman</div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="col-md-6 p-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">
                Register
              </h2>
              <button className="btn-close" onClick={onClose} />
            </div>

            <p className="text-muted mb-4">
              Buat akun baru untuk mulai menggunakan Orderly.
            </p>

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan nama lengkap"
                  style={{
                    borderRadius: '14px',
                    height: '55px',
                    border: '1px solid #e5e7eb',
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Masukkan email resmi"
                  style={{
                    borderRadius: '14px',
                    height: '55px',
                    border: '1px solid #e5e7eb',
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control "
                  placeholder="Masukkan password"
                  style={{
                    borderRadius: '14px',
                    height: '55px',
                    border: '1px solid #e5e7eb',
                  }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* BARU: NOMOR TELEPON / WHATSAPP */}
              <div className="mb-3">
                <label className="form-label fw-semibold">No. WhatsApp / Telepon</label>
                <input
                  type="tel"
                  className="form-control "
                  placeholder="Contoh: 0812345678xx"
                  style={{
                    borderRadius: '14px',
                    height: '55px',
                    border: '1px solid #e5e7eb',
                  }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Daftar Sebagai</label>
                <select
                  className="form-select"
                  style={{
                    borderRadius: '14px',
                    height: '55px',
                    border: '1px solid #e5e7eb',
                  }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="buyer">Pembeli (Mahasiswa)</option>
                  <option value="seller">Penjual (UMKM Kampus)</option>
                </select>
              </div>

              {/* KONDISIONAL UPLOAD KTM JIKA DAFTAR SELLER */}
              {role === 'seller' && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">Upload KTM (Kartu Tanda Mahasiswa)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setKtm(e.target.files?.[0] || null)}
                    required
                  />
                  <small className="text-muted">
                    KTM wajib diunggah untuk verifikasi status kepemilikan lapak seller di lingkungan kampus.
                  </small>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 py-3"
                style={{
                  background: 'linear-gradient(90deg,#4f46e5,#ec4899)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                {loading ? 'Memproses Pendaftaran...' : 'Register Akun'}
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
                Login di sini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}