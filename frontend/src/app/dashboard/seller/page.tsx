'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      router.push('/');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Background */}
      <div className="absolute w-full bg-blue-500 min-h-75"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main wrapper */}
      <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
        
        {/* Navbar */}
        <Navbar />

        {/* Content area */}
        <div className="px-6 py-6">
          {/* nanti isi dashboard cards / table di sini */}
        </div>

      </main>
    </>
  );
}