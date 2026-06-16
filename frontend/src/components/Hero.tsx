'use client';

import { useEffect, useState } from 'react';

interface HeroProps {
  user: any;
  logoutMessage: boolean;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
}

interface Order {
  id: number;
  status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  total_price: number;
  quantity: number;
  notes: string;
  product_name: string;
  created_at: string;
  payment_proof: string | null;
  seller_bank_name?: string | null;
  seller_account_name?: string | null;
  seller_account_number?: string | null;
  seller_qris_image?: string | null;
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Hero({
  user,
  logoutMessage,
  onSearchOpen,
  onLoginOpen,
}: HeroProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  
  // STATE UTAMA MODAL PESANAN SAYA & TRACKING
  const [showOrdersPop, setShowOrdersPop] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  
  // STATE UNTUK LOADING BATALKAN PESANAN
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // 🔥 STATE UNTUK INPUT ULASAN DINAMIS BERDASARKAN ID ORDER
  const [reviewRating, setReviewRating] = useState<Record<number, number>>({});
  const [reviewComment, setReviewComment] = useState<Record<number, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);

  // STATE JUMLAH NOTIFIKASI PESANAN AKTIF
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);

  // STATE UNTUK EDIT CATATAN (NOTES)
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [updatingNotesId, setUpdatingNotesId] = useState<number | null>(null);

  // State Custom Alert Tengah Layar
  const [customAlert, setCustomAlert] = useState<AlertState>({
    show: false,
    message: '',
    type: 'info'
  });

  const triggerAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomAlert({ show: true, message, type });
  };

  useEffect(() => {
    if (user) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // FETCH JUMLAH PESANAN AKTIF PAS AWAL LOAD NYALA
  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchMyOrders(true);
    }
  }, [user]);

  // FETCH DATA PESANAN BUYER DARI DATABASE
  const fetchMyOrders = async (isCountOnly = false) => {
    const token = localStorage.getItem('token'); 
    if (!token) return;

    if (!isCountOnly) setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await res.json();
      
      if (res.ok) {
        const fetchedOrders = result.data || result || [];
        setOrders(fetchedOrders);
        
        const activeCount = fetchedOrders.filter((o: Order) => o.status !== 'completed' && o.status !== 'cancelled').length;
        setActiveOrdersCount(activeCount);

        const initialNotes: Record<number, string> = {};
        fetchedOrders.forEach((order: Order) => {
          initialNotes[order.id] = order.notes || '';
        });
        setEditingNotes(initialNotes);
      } else {
        if (!isCountOnly) triggerAlert(result.message || "Gagal mengambil pesanan bray.", "error");
      }
    } catch (err) {
      console.error(err);
      if (!isCountOnly) triggerAlert("Gagal tersambung ke server backend bray!", "error");
    } finally {
      if (!isCountOnly) setLoadingOrders(false);
    }
  };

  useEffect(() => {
    const handleOrderUpdateEvent = () => {
      fetchMyOrders(); 
    };
    window.addEventListener('orderUpdated', handleOrderUpdateEvent);
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdateEvent);
    };
  }, []);

  // FUNGSI MEMBATALKAN PESANAN
  const handleCancelOrder = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setCancellingId(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      if (res.ok) {
        triggerAlert("🛑 Pre-order lu berhasil dibatalkan bray!", "success");
        fetchMyOrders(); 
      } else {
        triggerAlert(result.message || "Gagal membatalkan pesanan.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Koneksi bermasalah saat membatalkan pesanan!", "error");
    } finally {
      setCancellingId(null);
    }
  };

  // FUNGSI UPDATE CATATAN (NOTES) SEBELUM BAYAR
  const handleUpdateNotes = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setUpdatingNotesId(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/notes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: editingNotes[orderId] || '' })
      });

      const result = await res.json();
      if (res.ok) {
        triggerAlert("📌 Catatan pesanan berhasil diperbarui bray!", "success");
        fetchMyOrders(); 
      } else {
        triggerAlert(result.message || "Gagal memperbarui catatan.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Koneksi bermasalah saat update catatan!", "error");
    } finally {
      setUpdatingNotesId(null);
    }
  };

  // FUNGSI DOWNLOAD GAMBAR QRIS SECARA FORCE
  const handleDownloadQris = async (imgUrl: string, orderId: number) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QRIS-Order-${orderId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      triggerAlert("Gagal download QRIS otomatis bray, screenshot aja!", "error");
    }
  };

  // FUNGSI UPLOAD BUKTI PEMBAYARAN
  const handleUploadProof = async (orderId: number) => {
    if (!selectedFile) {
      triggerAlert("Pilih file gambar bukti transfernya dulu bray!", "error");
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payment_proof', selectedFile);

    setUploadingId(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        triggerAlert("🎉 Bukti pembayaran berhasil dikirim! Menunggu verifikasi seller bray.", "success");
        setSelectedFile(null);
        fetchMyOrders();
      } else {
        triggerAlert(result.message || "Gagal upload bukti bayar bray.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Koneksi bermasalah saat upload bray!", "error");
    } finally {
      setUploadingId(null);
    }
  };

  // 🔥 FUNGSI KIRIM ULASAN KE BACKEND
  const handleSendReview = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const rating = reviewRating[orderId] || 5; 
    const comment = reviewComment[orderId] || '';

    setSubmittingReviewId(orderId);
    try {
      const res = await fetch('http://localhost:5000/api/orders/review', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_id: orderId, rating, comment })
      });

      const result = await res.json();
      if (res.ok) {
        triggerAlert("🎉 Ulasan lu berhasil dikirim bray! Produk ini terbantu banget.", "success");
        setReviewComment(prev => ({ ...prev, [orderId]: '' }));
        fetchMyOrders(); 
      } else {
        triggerAlert(result.message || "Gagal mengirim ulasan bray.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Koneksi bermasalah saat mengirim ulasan!", "error");
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fee2e2', text: '#ef4444', label: '⏳ Belum Bayar' },
      paid: { bg: '#e0f2fe', text: '#0369a1', label: '💳 Dicek Seller' },
      confirmed: { bg: '#eff6ff', text: '#2563eb', label: '🧑‍🍳 Sedang Dimasak' },
      shipped: { bg: '#f3e8ff', text: '#6b21a8', label: '🛵 Sedang Diantar' },
      completed: { bg: '#d1fae5', text: '#065f46', label: '✅ Selesai' },
      cancelled: { bg: '#f1f5f9', text: '#475569', label: '🛑 Dibatalkan' },
    };
    const current = styles[status] || { bg: '#f1f5f9', text: '#475569', label: status };
    return (
      <span style={{ backgroundColor: current.bg, color: current.text, padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
        {current.label}
      </span>
    );
  };

  return (
    <>
      {/* Welcome Toast */}
      {user && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, opacity: showWelcome ? 1 : 0, transform: showWelcome ? 'translateY(0)' : 'translateY(-20px)', transition: 'all .4s ease', pointerEvents: showWelcome ? 'auto' : 'none' }}>
          <div style={{ minWidth: '340px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(15px)', borderRadius: '20px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}><i className="fas fa-check"></i></div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Login berhasil</div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>Selamat datang 👋</div>
                  <div style={{ fontSize: '14px', color: '#4b5563' }}>{user.name}</div>
                </div>
              </div>
              <button onClick={() => setShowWelcome(false)} style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL UTAMA: PESANAN SAYA */}
      {showOrdersPop && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setShowOrdersPop(false)}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(25px)', borderRadius: '30px', width: '100%', maxWidth: '480px', maxHeight: '82vh', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.45)', position: 'relative', display: 'flex', flexDirection: 'column', animation: 'heroPopScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#111827' }}>📦 Pesanan Saya</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Verifikasi pembayaran & track menu PO lu</span>
              </div>
              <button onClick={() => setShowOrdersPop(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: '#111827', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {loadingOrders ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>Melacak pesanan aktif lu bray...</p>
              ) : orders.length > 0 ? (
                orders.map((order: any) => (
                  <div key={order.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '22px', padding: '18px', border: '1px solid rgba(0,0,0,0.04)', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    
                    {/* 🔥 FIX TYPO DI SINI: justifyContent udah bener huruf C besar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '10px', marginBottom: '12px' }}>
                      {renderStatusBadge(order.status)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>{order.product_name}</h4>
                        <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>Jumlah: {order.quantity} Porsi</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Total</span>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626' }}>Rp {Math.trunc(order.total_price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* FIELD UPDATE CATATAN PESANAN */}
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>📌 Catatan Pesanan:</span>
                      {order.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="text"
                            value={editingNotes[order.id] || ''}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [order.id]: e.target.value })}
                            placeholder="Contoh: Paha aja bray, sambal dipisah..."
                            style={{ flex: 1, fontSize: '12px', padding: '6px 12px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff' }}
                          />
                          <button
                            onClick={() => handleUpdateNotes(order.id)}
                            disabled={updatingNotesId === order.id}
                            style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            {updatingNotesId === order.id ? 'Save...' : 'Simpan'}
                          </button>
                        </div>
                      ) : (
                        <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                          "{order.notes || 'Tidak ada catatan'}"
                        </p>
                      )}
                    </div>

                    {/* DETAIL REKENING & QRIS DOWNLOAD */}
                    {order.status === 'pending' && (
                      <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>🏦 TUJUAN TRANSFER SELLER:</span>
                        {order.seller_bank_name ? (
                          <div style={{ fontSize: '12px', color: '#1f2937' }}>
                            <p style={{ margin: '0 0 2px 0' }}><b>Bank:</b> {order.seller_bank_name}</p>
                            <p style={{ margin: '0 0 2px 0' }}><b>No. Rekening:</b> <span style={{ color: '#0284c7', fontWeight: '700' }}>{order.seller_account_number}</span></p>
                            <p style={{ margin: '0 0 12px 0' }}><b>Atas Nama:</b> {order.seller_account_name}</p>
                            
                            {order.seller_qris_image && (
                              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#15803d', marginBottom: '6px' }}>Scan / Unduh QRIS bray:</span>
                                <img src={`http://localhost:5000/uploads/payments/${order.seller_qris_image}`} alt="QRIS Seller" style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '14px', backgroundColor: '#fff', padding: '6px', border: '1px solid #e5e7eb' }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/150?text=QRIS+Error'; }} />
                                <button type="button" onClick={() => handleDownloadQris(`http://localhost:5000/uploads/payments/${order.seller_qris_image}`, order.id)} style={{ marginTop: '8px', padding: '6px 14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>📥 Unduh Gambar QRIS</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>Seller belum mengatur data rekening bray.</p>
                        )}
                      </div>
                    )}

                    {/* AREA UPLOAD BUKTI & TOMBOL BATALKAN PESANAN */}
                    {order.status === 'pending' && (
                      <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '16px', border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#c2410c', marginBottom: '6px' }}>📸 Pilihan Aksi Pesanan:</label>
                        
                        <div style={{ marginBottom: '10px' }}>
                          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ fontSize: '11px', width: '100%' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* 🛑 TOMBOL BATALKAN PESANAN */}
                          <button 
                            onClick={() => handleCancelOrder(order.id)} 
                            disabled={cancellingId === order.id} 
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: '#ef4444', 
                              color: '#ffffff', 
                              border: 'none', 
                              borderRadius: '10px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              cursor: cancellingId === order.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-ban"></i>
                            {cancellingId === order.id ? 'Membatalkan...' : 'Batalkan Pesanan'}
                          </button>

                          {/* 💳 TOMBOL KIRIM BUKTI */}
                          <button 
                            onClick={() => handleUploadProof(order.id)} 
                            disabled={uploadingId === order.id} 
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: '#ea580c', 
                              color: '#ffffff', 
                              border: 'none', 
                              borderRadius: '10px', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              cursor: uploadingId === order.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-paper-plane"></i>
                            {uploadingId === order.id ? 'Mengupload...' : 'Kirim Bukti'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 🔥🌟 AREA COBA ULASAN KHUSUS STATUS COMPLETED (FORM INPUT ATAU DISPLAY REVIEWS) */}
{order.status === 'completed' && (
  <div style={{ marginTop: '14px', padding: '14px', backgroundColor: order.review_rating ? 'rgba(34, 197, 94, 0.08)' : 'rgba(6, 182, 212, 0.08)', borderRadius: '16px', border: order.review_rating ? '1px solid rgba(34, 197, 94, 0.15)' : '1px solid rgba(6, 182, 212, 0.15)' }}>
    
    {order.review_rating ? (
      /* SKENARIO A: JIKA BUYER SUDAH PERNAH NGASIH ULASAN (DI-BLOCK + TAMPILIN HASILNYA) */
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>
            ✅ Lu Udah Kasih Ulasan Bray:
          </label>
          <span style={{ fontSize: '10px', color: '#9ca3af' }}>
            {new Date(order.review_created_at).toLocaleDateString('id-ID')}
          </span>
        </div>

        {/* Display Rating Bintang yang Pernah Dipilih */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                fontSize: '16px',
                color: star <= order.review_rating ? '#eab308' : '#d1d5db',
              }}
            >
              ★
            </span>
          ))}
          <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '700', alignSelf: 'center', marginLeft: '4px' }}>
            {order.review_rating}.0 / 5.0
          </span>
        </div>

        {/* Display Isi Komentar Text */}
        <p style={{ margin: 0, fontSize: '12px', color: '#374151', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontStyle: 'italic' }}>
          "{order.review_comment || 'Tanpa komentar teks bray.'}"
        </p>
      </div>
    ) : (
      /* SKENARIO B: JIKA BELUM PERNAH ULAS (TAMPILIN FORM SEPERTI BIASA) */
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0891b2', marginBottom: '8px' }}>
          ⭐️ Kasih Nilai Produk Ini Bray:
        </label>
        
        {/* Pilihan Bintang 1-5 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReviewRating({ ...reviewRating, [order.id]: star })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: star <= (reviewRating[order.id] || 5) ? '#eab308' : '#d1d5db',
                padding: 0
              }}
            >
              ★
            </button>
          ))}
          <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px', alignSelf: 'center' }}>
            ({reviewRating[order.id] || 5} Bintang)
          </span>
        </div>

        {/* Input Komentar Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            rows={2}
            placeholder="Tulis ulasan lu bray (Contoh: Makanannya enak, mantap jasjus!)..."
            value={reviewComment[order.id] || ''}
            onChange={(e) => setReviewComment({ ...reviewComment, [order.id]: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '8px 12px', borderRadius: '10px', border: '1px solid #c2e7f0', background: '#fff', resize: 'none' }}
          />
          <button
            type="button"
            onClick={() => handleSendReview(order.id)}
            disabled={submittingReviewId === order.id}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#0891b2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: submittingReviewId === order.id ? 'not-allowed' : 'pointer'
            }}
          >
            {submittingReviewId === order.id ? 'Mengirim Ulasan...' : '🚀 Kirim Ulasan Produk'}
          </button>
        </div>
      </div>
    )}

  </div>
)}

                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>Belum ada riwayat pre-order bray.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM CUSTOM ALERT POP-UP */}
      {customAlert.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'heroPopScale 0.3s' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: customAlert.type === 'success' ? '#ecfeff' : '#fef2f2', color: customAlert.type === 'success' ? '#06b6d4' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px auto' }}>
              {customAlert.type === 'success' ? '✓' : '✕'}
            </div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {customAlert.type === 'success' ? 'Berhasil!' : 'Ups, Gagal!'}
            </h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              {customAlert.message}
            </p>
            <button onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))} style={{ width: '100%', padding: '12px', backgroundColor: customAlert.type === 'success' ? '#10b981' : '#ef4444', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Oke, Siap Bray!
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes heroPopScale { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

      {/* MAIN HERO VIEW */}
      <section id="hero">
        <div className="container">
          <div className="row align-items-center g-5" style={{ minHeight: '88vh' }}>
            <div className="col-lg-6">
              <div className="hbadge"><span style={{marginLeft: '6px'}}>#1 Marketplace Mahasiswa</span></div>
              <h1 className="htitle">Pesan produk anti drama, <span className="hl">Orderly</span><br />Bikin Rapih Bersama.</h1>
              <p className="hdesc">Orderly hadir untuk membantu mahasiswa menjual dan membeli berbagai produk dengan lebih terorganisir.</p>

              <div className="d-flex flex-wrap gap-3 mb-2">
                <button type="button" onClick={() => onSearchOpen()} className="btn-red" style={{ zIndex: 10, position: 'relative' }}>
                  <i className="fas fa-search me-2"></i> Cari Produk
                </button>

                {user ? (
                  <>
                    {user.role === 'buyer' && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowOrdersPop(true);
                        }}
                        className="btn-play"
                        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', zIndex: 11 }}
                      >
                        <div className="pico"><i className="fas fa-receipt"></i></div>
                        <span>Pesanan Saya</span>
                        
                        {activeOrdersCount > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '800',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #ffffff',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                            animation: 'pulseNotify 2s infinite'
                          }}>
                            {activeOrdersCount}
                          </span>
                        )}
                      </a>
                    )}

                    {user.role === 'seller' && <a href="/dashboard/seller" className="btn-play"><div className="pico"><i className="fas fa-tachometer-alt"></i></div><span>Dashboard Seller</span></a>}
                    {user.role === 'admin' && <a href="/dashboard/admin" className="btn-play"><div className="pico"><i className="fas fa-user-shield"></i></div><span>Dashboard Admin</span></a>}
                  </>
                ) : (
                  <button type="button" onClick={onLoginOpen} className="btn-play" style={{ cursor: 'pointer', border: 'none' }}><div className="pico"><i className="fas fa-user-plus"></i></div><span>Daftar Sekarang</span></button>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div className="hcircle"><img src="/img/hero.jpeg" alt="Orderly" className="img-fluid" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulseNotify {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}