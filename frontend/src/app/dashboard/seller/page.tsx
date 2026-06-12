'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardCards from './DashboardCards'; // Import komponen baru di sini

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
      <div className="h-screen w-screen flex justify-center items-center">
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
      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col justify-between">
        
        <div>
          {/* Navbar */}
          <Navbar />

          {/* Content area */}
          <div className="px-6 py-6 mx-auto w-full">
            {/* Komponen Cards Dinamis */}
            <DashboardCards />
            
            {/* Tempat untuk row tabel atau grafik selanjutnya */}
          </div>
        </div>

        {/* FOOTER SEKARANG DI SINI (DI DALAM MAIN)! 
          Biar dia dapet margin kiri otomatis dari 'xl:ml-68' bawaan tag main,
          jadi posisinya dijamin sejajar rapi sama grafik dan card atasnya.
        */}
        <Footer />
         
      </main>
    </>
  );
}