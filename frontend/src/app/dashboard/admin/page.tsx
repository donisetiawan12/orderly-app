'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data pending seller langsung dari backend kamu
  const fetchPendingSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/pending-sellers', {
        headers: {
          'Authorization': `Bearer ${token}` // Membawa token untuk bypass authMiddleware
        }
      });
      const resData = await response.json();
      if (response.ok) {
        setPendingSellers(resData.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data pending seller:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/'); // Tendang jika bukan admin
      return;
    }
    fetchPendingSellers();
  }, [router]);

  // Aksi Approve Seller terintegrasi ke backend controller lu bro
  const handleApprove = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin memverifikasi lapak seller: ${name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/admin/approve-seller/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Gagal menyetujui seller');
        return;
      }

      alert(data.message || 'Seller berhasil disetujui!');
      fetchPendingSellers(); // Refresh list otomatis tanpa reload halaman
    } catch (error) {
      console.error("Error approve seller:", error);
      alert("Terjadi kesalahan jaringan");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-light min-vh-100">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-black shadow-sm py-3">
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#">
            <i className="fas fa-user-shield text-danger"></i> Orderly Core Admin Panel
          </a>
          <button onClick={() => router.push('/')} className="btn btn-outline-danger btn-sm rounded-pill">
            <i className="fas fa-home me-1"></i> Home Utama
          </button>
        </div>
      </nav>

      
    </div>
  );
}