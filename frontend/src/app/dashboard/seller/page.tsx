'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      router.push('/'); // Tendang ke home jika belum login
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.role !== 'seller') {
      router.push('/'); // Tendang jika bukan seller
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Mini Navbar Dashboard */}
      <nav className="navbar navbar-dark bg-dark shadow-sm py-3">
        <div className="container">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#">
            <i className="fas fa-store text-warning"></i> Orderly Seller Panel
          </a>
          <button onClick={() => router.push('/')} className="btn btn-outline-light btn-sm rounded-pill">
            <i className="fas fa-arrow-left me-1"></i> Kembali ke Marketplace
          </button>
        </div>
      </nav>

      
    </div>
  );
}