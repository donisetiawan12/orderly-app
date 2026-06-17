'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
// import Footer from '../seller/Footer';
import Swal from 'sweetalert2';

interface RecentOrder {
  id: number;
  buyer_name: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_proof: string | null;
  notes: string | null;
}

interface DashboardStats {
  total_order: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
}

export default function PesananPage() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProof, setActiveProof] = useState<string | null>(null);

  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 5; // Batasan maksimal 5 baris per halaman

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://${process.env.NEXT_PUBLIC_API_URL}/api/orders/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.status === 'success') {
        if (result.data?.recent_orders) setRecentOrders(result.data.recent_orders);
        
        setStats({
          total_order: result.data?.total_order || 0,
          total_revenue: result.data?.total_revenue || 0,
          total_products: result.data?.total_products || 0,
          total_customers: result.data?.total_customers || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Auto-polling tiap 10 detik biar notifikasi & data langsung sinkron otomatis tanpa refresh!
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

const handleUpdateStatus = async (orderId: number, nextStatus: string, buyerName: string) => {
    let kataAksi = '';
    let warnaAksi = '#3085d6'; 
    
    if (nextStatus === 'confirmed') { kataAksi = 'Konfirmasi Pembayaran'; warnaAksi = '#10b981'; } 
    if (nextStatus === 'cancelled') { kataAksi = 'Tolak & Batalkan Pembayaran'; warnaAksi = '#ef4444'; } 
    if (nextStatus === 'shipped') { kataAksi = 'Kirim & Siapkan Produk'; warnaAksi = '#06b6d4'; }
    if (nextStatus === 'completed') { kataAksi = 'Selesaikan Pesanan'; warnaAksi = '#4f46e5'; }

    Swal.fire({
      title: nextStatus === 'cancelled' ? 'Tolak Pesanan?' : 'Proses Pesanan?',
      // 🚀 TAMPILAN TEXT: Full pake nama pembeli biar ramah di mata seller
      text: nextStatus === 'cancelled' 
        ? `Yakin ingin MENOLAK pembayaran dari ${buyerName}? Bukti dianggap tidak sah!` 
        : `Yakin ingin merubah status pesanan milik ${buyerName} menjadi ${nextStatus.toUpperCase()}?`,
      icon: nextStatus === 'cancelled' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: nextStatus === 'cancelled' ? `Ya, Tolak Pesanan!` : ` Ya, ${kataAksi}!`,
      cancelButtonText: 'Batal',
      confirmButtonColor: warnaAksi,
      cancelButtonColor: '#94a3b8',
      buttonsStyling: true,
      didOpen: () => {
        const style = document.createElement('style');
        style.innerHTML = `
          .swal2-styled.swal2-confirm {
            background-color: ${warnaAksi} !important;
            color: #ffffff !important;
            font-weight: bold !important;
            box-shadow: none !important;
          }
          .swal2-styled.swal2-cancel {
            background-color: #94a3b8 !important;
            color: #ffffff !important;
          }
        `;
        document.head.appendChild(style);
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          // 🔒 BACKEND SAFETY: Endpoint URL wajib tetep pake orderId biar database ga pusing nyari data!
          const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: nextStatus })
          });

          const result = await res.json();
          if (result.status === 'success') {
            Swal.fire({
              title: nextStatus === 'cancelled' ? 'Pesanan Ditolak!' : 'Berhasil Diupdate!',
              // 🚀 MODAL SUKSES: Juga informatif pake nama pembeli
              text: nextStatus === 'cancelled' 
                ? `Pesanan milik ${buyerName} telah ditolak. Bukti Transfer Tidak Valid.`
                : `Pesanan milik ${buyerName} sekarang berstatus: ${nextStatus.toUpperCase()}`,
              icon: nextStatus === 'cancelled' ? 'error' : 'success',
              confirmButtonColor: '#10b981'
            });
            fetchOrders();
          } else {
            Swal.fire({ title: 'Gagal!', text: result.message || 'Gagal mengubah status.', icon: 'error', confirmButtonColor: '#ef4444' });
          }
        } catch (err) {
          Swal.fire({ title: 'Error!', text: 'Terjadi gangguan koneksi jaringan.', icon: 'error', confirmButtonColor: '#ef4444' });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Memuat Transaksi Masuk...</p>
      </div>
    );
  }

  const pendingOrders = recentOrders.filter(o => o.status === 'paid' || o.status === 'pending');
  const pendingCount = pendingOrders.length;

  return (
    <div className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default bg-gray-50 text-slate-500 min-h-screen">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 z-0"></div>

      <Sidebar />

      <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl z-10">
        <Navbar />

        <div className="px-6 py-6 mx-auto w-full max-w-full block box-border overflow-x-hidden">
          
          {/* ================= BARIS CARDS STATISTIK ATAS PESANAN ================= */}
         {/* ================= BARIS CARDS STATISTIK ATAS PESANAN (100% SINKRON DB) ================= */}
          <div className="flex flex-wrap -mx-3 mb-6">

             {/* Card 1: Total Omset Sukses */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Pendapatan</p>
                        <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                            Rp {Number(stats?.total_revenue || 0).toLocaleString('id-ID')}
                          </h5>
                         <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Semua <span className="font-bold text-emerald-500">Pendapatan</span> Anda
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400">
                        <i className="ni ni-money-coins text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Total Pelanggan Unik (FIXED: Pake total_customers dari DB!) */}
            <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4 mb-6 xl:mb-0">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Pelanggan</p>
                        <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                          {/* 🚀 FIX: Sekarang beneran nampilin jumlah pelanggan unik dari DB, bukan total order */}
                          {stats?.total_customers || 0} Orang
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Semua <span className="font-bold text-emerald-500">Pelanggan</span> Anda
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-red-600 to-orange-600">
                        <i className="ni ni-single-02 text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Perlu Validasi Pembayaran (Pending) */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">PESANAN MASUK</p>
                        <div className="flex items-center gap-2 mt-0.5 mb-2">
                          <h5 className={`mb-0 font-bold text-lg ${pendingCount > 0 ? 'text-blue-500' : 'text-slate-700 dark:text-white'}`}>
                            {pendingCount} Pesanan
                          </h5>
                        </div>
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs">
                          {pendingCount > 0 ? (
                            <span className="text-blue-500 font-bold animate-pulse">Perlu tindakan validasi</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">Semua pesanan clear</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-yellow-500">
                        <i className="ni ni-cart text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Pesanan Dibatalkan (Menggantikan Card Produk Lama) */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">DIBATALKAN</p>
                        <h5 className={`mb-2 font-bold text-lg ${recentOrders.filter(o => o.status?.trim().toLowerCase().startsWith('cancel')).length > 0 ? 'text-red-500' : 'text-slate-700 dark:text-white'}`}>
                          {recentOrders.filter(o => o.status?.trim().toLowerCase().startsWith('cancel')).length} Pesanan
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Pesanan yang <span className="font-bold text-red-500">Ditolak</span>
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3 flex justify-end items-center">
                      {/* 🚀 FIX BORDER BULETAN: Ditambahkan border putih halus + shadow biar makin glowing */}
                      <div 
                        className="bg-gradient-to-tl from-red-500 to-pink-500 flex items-center justify-center"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          minWidth: '48px',
                          border: '2px solid rgba(239, 68, 68, 0.2)', // Border halus transparan di luar buletan
                          boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.4), 0 2px 4px -1px rgba(244, 63, 94, 0.2)' // Efek shadow merah menyala
                        }}
                      >
                        <span className="text-lg" style={{ lineHeight: '1' }}>❌</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

         {/* ================= AREA UTAMA: TABEL VALIDASI PESANAN MASUK ================= */}
          <div className="flex flex-wrap mt-6 -mx-3">
            <div className="w-full max-w-full px-3 mt-0 mb-6 lg:w-12/12">
              <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl dark:bg-slate-850 rounded-2xl bg-clip-border p-4">
                <h6 className="mb-4 dark:text-white font-bold text-base text-slate-800">📋 Daftar Validasi Pesanan Masuk</h6>
                <div className="overflow-x-auto px-2">
                  <table className="items-center w-full mb-4 align-top border-collapse">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase border-b border-gray-100 dark:border-white/10 text-center">
                        <th className="py-3 font-bold text-center" style={{ width: '50px' }}>No</th>
                        <th className="py-3 font-bold text-left">Info Pembeli & Produk</th>
                        <th className="py-3 text-center font-bold">Total Belanja</th>
                        <th className="py-3 text-center font-bold">Status Sekarang</th>
                        <th className="py-3 text-center font-bold">Bukti Bayar</th>
                        <th className="py-3 text-center font-bold">Aksi Seller</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length > 0 ? (
                        /* 🚀 FIX PAGINATION: Membalikkan data terlebih dahulu, baru kemudian dipotong per 5 data */
                        recentOrders
                          .slice()
                          .reverse()
                          .slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage)
                          .map((order, index) => {
                            const currentStatus = (order.status || 'pending').trim().toLowerCase();

                            return (
                              <tr key={order.id} className="border-b border-gray-50 dark:border-white/5 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/30 text-center">
                                {/* Nomor urut dinamis agar tidak reset kembali ke 1 saat pindah ke halaman 2 */}
                                <td className="py-4 align-middle text-sm text-center font-medium text-slate-500">
                                  {(orderPage - 1) * ordersPerPage + index + 1}
                                </td>
                                <td className="py-4 align-middle text-sm text-left">
                                  <div className="font-bold dark:text-white text-slate-800">{order.buyer_name}</div>
                                  <div className="text-xs text-slate-500 font-medium dark:text-slate-400">
                                    {order.product_name} <span className="text-slate-400 font-normal">(x{order.quantity})</span>
                                  </div>
                                </td>
                                <td className="py-4 align-middle text-sm text-center dark:text-white font-semibold text-slate-700">
                                  Rp. {Math.trunc(Number(order.total_price || 0)).toLocaleString('id-ID')}
                                </td>
                                <td className="py-4 align-middle text-center">
                                  <span style={{ 
                                    display: 'inline-block', padding: '6px 14px', borderRadius: '30px', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.1)',
                                    backgroundColor: 
                                      currentStatus === 'pending' ? '#f59e0b' : 
                                      currentStatus === 'paid' ? '#3b82f6' :    
                                      currentStatus === 'confirmed' ? '#a855f7' : 
                                      currentStatus === 'shipped' ? '#06b6d4' : 
                                      currentStatus === 'cancelled' ? '#ef4444' : '#10b981'                                  
                                  }}>
                                    {currentStatus.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-4 align-middle text-sm text-center">
                                  {order.payment_proof ? (
                                    <button type="button" onClick={() => setActiveProof(`http://${process.env.NEXT_PUBLIC_API_URL}/uploads/payments/${order.payment_proof}`)} style={{ display: 'inline-block', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', fontWeight: 'bold', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                      Lihat Foto 👁️
                                    </button>
                                  ) : (
                                    <span style={{ display: 'inline-block', fontSize: '11px', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '6px', fontStyle: 'italic' }}>Belum Upload</span>
                                  )}
                                </td>
                                <td className="py-4 align-middle text-center">
                                  {(currentStatus === 'pending' || currentStatus === 'paid') ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <button 
                                        type="button" 
                                        onClick={() => handleUpdateStatus(order.id, 'confirmed', order.buyer_name)} 
                                        style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                      >
                                        Terima 
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => handleUpdateStatus(order.id, 'cancelled', order.buyer_name)} 
                                        style={{ backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                      >
                                        Tolak 
                                      </button>
                                    </div>
                                  ) : currentStatus === 'confirmed' ? (
                                    <button 
                                      type="button" 
                                      onClick={() => handleUpdateStatus(order.id, 'shipped', order.buyer_name)} 
                                      style={{ backgroundColor: '#06b6d4', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                    >
                                      Kirim/Siapkan Produk 
                                    </button>
                                  ) : currentStatus === 'shipped' ? (
                                    <button 
                                      type="button" 
                                      onClick={() => handleUpdateStatus(order.id, 'completed', order.buyer_name)} 
                                      style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                    >
                                      Selesaikan Pesanan 
                                    </button>
                                  ) : (
                                    <span className="text-emerald-600 bg-emerald-50 font-bold text-xs px-3 py-1.5 rounded-md inline-block">✨ Selesai</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-sm text-slate-400 font-medium">Belum ada pesanan masuk.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 🚀 TOMBOL NAVIGASI PAGINATION PESANAN DI POJOK KANAN BAWAH */}
                {recentOrders.length > ordersPerPage && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                      Menampilkan {Math.min((orderPage - 1) * ordersPerPage + 1, recentOrders.length)} - {Math.min(orderPage * ordersPerPage, recentOrders.length)} dari {recentOrders.length} Pesanan
                    </span>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        disabled={orderPage === 1}
                        onClick={() => setOrderPage(prev => prev - 1)}
                        style={{
                          padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0',
                          backgroundColor: orderPage === 1 ? '#f8fafc' : '#ffffff',
                          color: orderPage === 1 ? '#cbd5e1' : '#334155',
                          cursor: orderPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ◀ Prev
                      </button>
                      
                      {Array.from({ length: Math.ceil(recentOrders.length / ordersPerPage) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setOrderPage(i + 1)}
                          style={{
                            padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px',
                            border: orderPage === i + 1 ? '1px solid #10b981' : '1px solid #e2e8f0',
                            backgroundColor: orderPage === i + 1 ? '#10b981' : '#ffffff',
                            color: orderPage === i + 1 ? '#ffffff' : '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        disabled={orderPage === Math.ceil(recentOrders.length / ordersPerPage)}
                        onClick={() => setOrderPage(prev => prev + 1)}
                        style={{
                          padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0',
                          backgroundColor: orderPage === Math.ceil(recentOrders.length / ordersPerPage) ? '#f8fafc' : '#ffffff',
                          color: orderPage === Math.ceil(recentOrders.length / ordersPerPage) ? '#cbd5e1' : '#334155',
                          cursor: orderPage === Math.ceil(recentOrders.length / ordersPerPage) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        {/* <Footer /> */}
      </main>

      {/* LIGHTBOX POP-UP */}
      {activeProof && typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setActiveProof(null)}></div>
          <div style={{ width: '340px', height: '460px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', zIndex: 1000000, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>📄 Bukti Transfer Buyer</h5>
              <button type="button" onClick={() => setActiveProof(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ width: '100%', height: '330px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={activeProof} alt="Bukti Transfer" style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300?text=Error+Load+Gambar'; }} />
            </div>
            <button type="button" onClick={() => setActiveProof(null)} style={{ width: '100%', height: '35px', backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: 'bold', fontSize: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Tutup Dokumen</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}