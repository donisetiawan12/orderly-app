'use client';

import { useEffect, useState } from 'react';

// Interface disesuaikan sama kebutuhan 4 cards lu bray
interface DashboardCardsAdminProps {
  allSellers: any[]; // Nerima data array seller dari page utama buat dihitung real-time
}

export default function DashboardCardsAdmin({ allSellers }: DashboardCardsAdminProps) {
  const [totalBuyers, setTotalBuyers] = useState<number>(0);

  // 🔥 TRIK SAKTI: Hitung otomatis real-time langsung dari database seller yang masuk
  const activeSellersCount = allSellers.filter(s => s.verification_status === 'approved').length;
  const pendingSellersCount = allSellers.filter(s => s.verification_status === 'pending').length;
  const rejectedSellersCount = allSellers.filter(s => s.verification_status === 'rejected').length;

  useEffect(() => {
    const fetchTotalBuyers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/api/auth/admin/total-buyers', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        // 🔥 Kalau sukses, set state pake data asli dari DB Node.js lu abangkuh
        if (res.ok && result.total_buyers !== undefined) {
          setTotalBuyers(result.total_buyers);
        } else {
          setTotalBuyers(0); 
        }
      } catch (err) {
        console.error("Gagal load data buyer asli bray:", err);
        setTotalBuyers(0); 
      }
    };

    fetchTotalBuyers();
  }, [allSellers]); // Update otomatis kalau ada perubahan data seller

  return (
    <div className="flex flex-wrap -mx-3 mb-6">
      
      {/* 🟢 CARD 1: SELLER AKTIF */}
      <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
        <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
          <div className="flex-auto p-4">
            <div className="flex flex-row -mx-3 items-center">
              <div className="flex-none w-2/3 max-w-full px-3">
                <div>
                  <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Seller Aktif</p>
                  <h5 className="mb-1 font-bold text-lg text-slate-800">
                    {activeSellersCount} <span className="text-xs text-slate-400 font-normal">Toko</span>
                  </h5>
                  <p className="mb-0 text-xs text-slate-400">
                    Mahasiswa <span className="font-bold text-emerald-500">Lolos Verifikasi</span>
                  </p>
                </div>
              </div>
              <div className="px-3 text-right basis-1/3">
                <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400 flex items-center justify-center shadow">
                  <i className="ni ni-shop text-lg text-white" style={{ lineHeight: '0' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🟡 CARD 2: BUTUH VERIFIKASI */}
      <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
        <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
          <div className="flex-auto p-4">
            <div className="flex flex-row -mx-3 items-center">
              <div className="flex-none w-2/3 max-w-full px-3">
                <div>
                  <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Butuh Verifikasi</p>
                  <h5 className="mb-1 font-bold text-lg text-amber-500 animate-pulse">
                    {pendingSellersCount} <span className="text-xs text-slate-400 font-normal">Akun</span>
                  </h5>
                  <p className="mb-0 text-xs text-slate-400">
                    Menunggu <span className="font-bold text-amber-500">Review KTM</span>
                  </p>
                </div>
              </div>
              <div className="px-3 text-right basis-1/3">
                <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-amber-400 flex items-center justify-center shadow">
                  <i className="ni ni-badge text-lg text-white" style={{ lineHeight: '0' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔵 CARD 3: BUYER AKTIF */}
      <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
        <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
          <div className="flex-auto p-4">
            <div className="flex flex-row -mx-3 items-center">
              <div className="flex-none w-2/3 max-w-full px-3">
                <div>
                  <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Buyer Aktif</p>
                  <h5 className="mb-1 font-bold text-lg text-slate-800">
                    {totalBuyers} <span className="text-xs text-slate-400 font-normal">Orang</span>
                  </h5>
                  <p className="mb-0 text-xs text-slate-400">
                    Total <span className="font-bold text-blue-500">Pelanggan</span> Terdaftar
                  </p>
                </div>
              </div>
             <div className="px-3 text-right basis-1/3 flex justify-end">
                {/* 🔥 KITA KUNCI PAKE INLINE STYLE BIAR WARNA GRADASI BIRU NYA KELUAR SOLID BRAY! */}
                <div 
                  className="w-12 h-12 text-center rounded-full flex items-center justify-center shadow"
                  style={{ 
                    background: 'linear-gradient(135deg, #152de6ff 0%, #2dcecc 100%)', // Gradasi Cyan Teal khas Argon bray
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* 🔥 Icon diganti pake ni-circle-08 murni bawaan template lu */}
                  <i className="ni ni-circle-08 text-lg text-white" style={{ lineHeight: '0', color: '#ffffff' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 CARD 4: SELLER DI TOLAK VERIFIKASI */}
      <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
        <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
          <div className="flex-auto p-4">
            <div className="flex flex-row -mx-3 items-center">
              <div className="flex-none w-2/3 max-w-full px-3">
                <div>
                  <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Sellers Ditolak</p>
                  <h5 className="mb-1 font-bold text-lg text-red-500">
                    {rejectedSellersCount} <span className="text-xs text-slate-400 font-normal">Akun</span>
                  </h5>
                  <p className="mb-0 text-xs text-slate-400">
                    KTM <span className="font-bold text-red-500">Tidak Valid / Ditolak</span>
                  </p>
                </div>
              </div>
             <div className="px-3 text-right basis-1/3 flex justify-end">
                <div 
                  className="w-12 h-12 text-center rounded-full flex items-center justify-center shadow"
                  style={{ 
                    background: 'linear-gradient(135deg, #ff0000ff 0%, #03152dff 100%)', // Biru Cyan info murni Argon bray
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* 🔥 IKON DIGANTI KE ni-single-02 BIAR MUNCUL USERNYA BRAY! */}
                  <i className="ni ni-single-02 text-lg text-white" style={{ lineHeight: '0', color: '#ffffff' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}