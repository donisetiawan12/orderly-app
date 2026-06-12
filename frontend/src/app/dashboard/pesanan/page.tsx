'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
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

export default function PesananPage() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProof, setActiveProof] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/orders/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.status === 'success' && result.data?.recent_orders) {
        setRecentOrders(result.data.recent_orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    let kataAksi = '';
    let warnaAksi = '';
    
    if (nextStatus === 'confirmed') { kataAksi = 'Konfirmasi Pembayaran'; warnaAksi = '#10b981'; }
    if (nextStatus === 'shipped') { kataAksi = 'Kirim & Siapkan Produk'; warnaAksi = '#06b6d4'; }
    if (nextStatus === 'completed') { kataAksi = 'Selesaikan Pesanan'; warnaAksi = '#4f46e5'; }

    Swal.fire({
      title: 'Proses Pesanan, Bro?',
      text: `Yakin ingin merubah status Order #${orderId} menjadi ${nextStatus.toUpperCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `👍 Ya, ${kataAksi}!`,
      cancelButtonText: 'Batal',
      confirmButtonColor: warnaAksi,
      cancelButtonColor: '#94a3b8',
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        if (confirmBtn) {
          confirmBtn.style.setProperty('color', '#ffffff', 'important');
          confirmBtn.style.setProperty('background-color', warnaAksi, 'important');
          confirmBtn.style.setProperty('display', 'inline-block', 'important');
          confirmBtn.style.setProperty('padding', '10px 22px', 'important');
          confirmBtn.style.setProperty('font-weight', 'bold', 'important');
          confirmBtn.style.setProperty('border-radius', '6px', 'important');
        }
        if (cancelBtn) {
          cancelBtn.style.setProperty('color', '#ffffff', 'important');
          cancelBtn.style.setProperty('background-color', '#94a3b8', 'important');
          cancelBtn.style.setProperty('display', 'inline-block', 'important');
          cancelBtn.style.setProperty('padding', '10px 22px', 'important');
          cancelBtn.style.setProperty('font-weight', 'bold', 'important');
          cancelBtn.style.setProperty('border-radius', '6px', 'important');
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
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
              title: 'Berhasil Diupdate!',
              text: `Pesanan #${orderId} sekarang berstatus: ${nextStatus.toUpperCase()}`,
              icon: 'success',
              confirmButtonColor: '#10b981',
              didOpen: () => {
                const sConfirm = document.querySelector('.swal2-confirm') as HTMLElement;
                if (sConfirm) sConfirm.style.setProperty('color', '#ffffff', 'important');
              }
            });
            fetchOrders();
          } else {
            Swal.fire({ title: 'Gagal!', text: result.message || 'Gagal mengubah status.', icon: 'error' });
          }
        } catch (err) {
          Swal.fire({ title: 'Error!', text: 'Terjadi gangguan koneksi jaringan.', icon: 'error' });
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

  return (
    <div className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default bg-gray-50 text-slate-500 min-h-screen">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 z-0"></div>

      <Sidebar />

      <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl z-10">
        <Navbar />

        <div className="px-6 py-6 mx-auto w-full max-w-full block box-border overflow-x-hidden">
          
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
                        recentOrders.slice().reverse().map((order, index) => {
                          const currentStatus = (order.status || 'pending').trim().toLowerCase();

                          return (
                            <tr key={order.id} className="border-b border-gray-50 dark:border-white/5 last:border-none hover:bg-slate-50 dark:hover:bg-slate-800/30 text-center">
                              <td className="py-4 align-middle text-sm text-center font-medium text-slate-500">{index + 1}</td>
                              <td className="py-4 align-middle text-sm text-left">
                                <div className="font-bold dark:text-white text-slate-800">{order.buyer_name}</div>
                                <div className="text-xs text-slate-500 font-medium dark:text-slate-400">
                                  {order.product_name} <span className="text-slate-400 font-normal">(x{order.quantity})</span>
                                </div>
                              </td>
                              <td className="py-4 align-middle text-sm text-center dark:text-white font-semibold text-slate-700">
                                Rp {order.total_price.toLocaleString('id-ID')}
                              </td>
                              <td className="py-4 align-middle text-center">
                                <span style={{ 
                                  display: 'inline-block', padding: '6px 14px', borderRadius: '30px', color: '#ffffff', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.1)',
                                  backgroundColor: 
                                    currentStatus === 'pending' ? '#f59e0b' : 
                                    currentStatus === 'paid' ? '#3b82f6' :    
                                    currentStatus === 'confirmed' ? '#a855f7' : 
                                    currentStatus === 'shipped' ? '#06b6d4' : '#10b981'                                   
                                }}>
                                  {currentStatus.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 align-middle text-sm text-center">
                                {order.payment_proof ? (
                                  <button type="button" onClick={() => setActiveProof(`http://localhost:5000/uploads/payments/${order.payment_proof}`)} style={{ display: 'inline-block', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', fontWeight: 'bold', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                    Lihat Foto 👁️
                                  </button>
                                ) : (
                                  <span style={{ display: 'inline-block', fontSize: '11px', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '6px', fontStyle: 'italic' }}>Belum Upload</span>
                                )}
                              </td>
                              <td className="py-4 align-middle text-center">
                                {(currentStatus === 'pending' || currentStatus === 'paid') ? (
                                  <button type="button" onClick={() => handleUpdateStatus(order.id, 'confirmed')} style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                    Konfirmasi Pembayaran ✅
                                  </button>
                                ) : currentStatus === 'confirmed' ? (
                                  <button type="button" onClick={() => handleUpdateStatus(order.id, 'shipped')} style={{ backgroundColor: '#06b6d4', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                    Kirim/Siapkan Produk 📦
                                  </button>
                                ) : currentStatus === 'shipped' ? (
                                  <button type="button" onClick={() => handleUpdateStatus(order.id, 'completed')} style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                    Selesaikan Pesanan 🏁
                                  </button>
                                ) : (
                                  <span className="text-emerald-600 bg-emerald-50 font-bold fontSize-12 px-3 py-1.5 rounded-md inline-block">✨ Selesai</span>
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
              </div>
            </div>
          </div>

        </div>
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