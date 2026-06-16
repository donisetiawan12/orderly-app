'use client';
import { useState, useEffect, useRef } from 'react';

interface Review {
  id: number;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function MenuDetailPopup({ product, onClose }: any) {
  const [qty, setQty] = useState(1);
  const [showReviewsPop, setShowReviewsPop] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 STATE TAMBAHAN UNTUK SINKRONISASI DATA RATING REALTIME
  const [liveTotalReviews, setLiveTotalReviews] = useState(Number(product?.total_reviews || 0));
  const [liveAvgRating, setLiveAvgRating] = useState(Number(product?.avg_rating || 0));

  // 🚀 STATE UNTUK POP-UP MODAL ALERT DI TENGAH LAYAR
  const [customAlert, setCustomAlert] = useState<AlertState>({
    show: false,
    message: '',
    type: 'info'
  });

  const mainBoxRef = useRef<HTMLDivElement>(null);

  // 🔥 VALIDASI KUOTA PO SECARA LOKAL
  const isPoProduct = Number(product?.po_quota) > 0;
  const soldQty = Number(product?.sold_quantity || 0);
  const maxQuota = Number(product?.po_quota || 0);
  const sisaKuota = maxQuota - soldQty;
  const isQuotaFull = isPoProduct && soldQty >= maxQuota;

  // Fungsi memicu Custom Alert Box 
  const triggerAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomAlert({ show: true, message, type });
  };

  // 🔥 FITUR AUTOMATIC SYNC: Fetch ulasan langsung jalan pas modal detail menu ini terbuka
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`);
          const result = await res.json();
          if (result.status === 'success' || result.data) {
            const dataUlasan: Review[] = result.data || [];
            setReviews(dataUlasan);
            
            // 🌟 Hitung total dan rata-rata rating secara live dari database!
            setLiveTotalReviews(dataUlasan.length);
            if (dataUlasan.length > 0) {
              const totalBintang = dataUlasan.reduce((acc, curr) => acc + Number(curr.rating), 0);
              setLiveAvgRating(totalBintang / dataUlasan.length);
            } else {
              setLiveAvgRating(0);
            }
          }
        } catch (err) {
          console.error("Gagal mengambil data ulasan:", err);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [product?.id]);

  // 🚀 FUNGSI ADD TO CART DENGAN NOTIFIKASI MODAL SAKTI
  const handleAddToCart = async () => {
    // Validasi double-check di frontend sebelum melempar API
    if (isPoProduct && qty > sisaKuota) {
      triggerAlert(`⚠️ Waduh, sisa kuota PO tinggal ${sisaKuota} Pcs, Kamu gak bisa pesan sampai ${qty} Pcs.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token'); 

      if (!token) {
        triggerAlert("🔒 Waduh , Kamu harus login dulu sebelum masukin menu ke keranjang!", "error");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: qty
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // =========================================================================
        // 🔥 TERIAK KE SELURUH PENJURU WEB BIAR NAVBAR UPDATE ANGKA SECARA REALTIME!
        // =========================================================================
        window.dispatchEvent(new Event('cartUpdated'));

        triggerAlert(`🎉 Mantap ! ${qty} ${product.name} berhasil masuk keranjang.`, "success");
      } else {
        triggerAlert(`Gagal masuk keranjang: ${result.message || 'Ada masalah '}`, "error");
      }
    } catch (error) {
      console.error("Error Add to Cart:", error);
      triggerAlert("Koneksi ke server backend putus !", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mainBoxRef.current && !mainBoxRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <div 
      id="menuPop" 
      className="open"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px', boxSizing: 'border-box'
      }}
    >
      {/* 🚀 CUSTOM POP-UP ALERT BOX DI TENGAH LAYAR (MODAL PREMIUM) */}
      {customAlert.show && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1500, padding: '16px' 
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          <div 
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px',
              maxWidth: '380px', width: '100%', textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'popUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div 
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: customAlert.type === 'success' ? '#ecfeff' : customAlert.type === 'error' ? '#fef2f2' : '#eff6ff',
                color: customAlert.type === 'success' ? '#06b6d4' : customAlert.type === 'error' ? '#ef4444' : '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', margin: '0 auto 20px auto',
                border: `2px solid ${customAlert.type === 'success' ? '#cffafe' : customAlert.type === 'error' ? '#fee2e2' : '#dbeafe'}`
              }}
            >
              {customAlert.type === 'success' ? '✓' : customAlert.type === 'error' ? '✕' : 'ℹ'}
            </div>

            <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {customAlert.type === 'success' ? 'Berhasil!' : customAlert.type === 'error' ? 'Ups, Gagal!' : 'Informasi'}
            </h4>

            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5', fontWeight: '500' }}>
              {customAlert.message}
            </p>

            <button
              onClick={() => {
                setCustomAlert(prev => ({ ...prev, show: false }));
                if (customAlert.type === 'success') {
                  onClose(); 
                }
              }}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: customAlert.type === 'success' ? '#10b981' : customAlert.type === 'error' ? '#ef4444' : '#3b82f6',
                color: '#ffffff', border: 'none', borderRadius: '14px',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Oke, Siap !
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popUpScale {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* BOX UTAMA DETAIL PRODUK */}
      <div 
        ref={mainBoxRef}
        className="mpbox"
        style={{
          backgroundColor: '#ffffff', borderRadius: '24px', width: '100%',
          maxWidth: '460px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          position: 'relative', display: 'flex', flexDirection: 'column',
          maxHeight: '92vh', boxSizing: 'border-box'
        }}
      >
        <button 
          className="mpclose" 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#1e293b'
          }}
        >
          <i className="fas fa-times" style={{ fontSize: '14px' }}></i>
        </button>
        
        <div className="mpimg" style={{ position: 'relative', width: '100%', height: '250px', flexShrink: 0 }}>
          <img 
            src={product.image ? `http://localhost:5000/uploads/products/${product.image}` : '/img/default.jpg'} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/img/default.jpg'; }}
          />
          <span style={{
            position: 'absolute', bottom: '16px', left: '20px', backgroundColor: '#2563eb',
            color: '#ffffff', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem',
            fontWeight: '700', boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
          }}>
            📍 {product.location || 'Kampus'}
          </span>
        </div>
        
        <div className="mpbody" style={{ padding: '24px 20px 12px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
          <h2 id="mpTitle" style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1.2', width: '100%' }}>
            {product.name}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '12px', flexShrink: 0 }}>
              <i className="fas fa-star" style={{ color: '#f59e0b', fontSize: '13px' }}></i> 
              <span style={{ color: '#78350f', fontWeight: '700', fontSize: '13px' }}>
                {liveAvgRating.toFixed(1)}
              </span>
            </div>
            
            <span 
              onClick={(e) => {
                e.stopPropagation(); 
                setShowReviewsPop(true);
              }}
              style={{ 
                color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem',
                fontWeight: '600', padding: '5px 12px', borderRadius: '8px',
                border: '1px solid #bfdbfe', backgroundColor: '#eff6ff',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dbeafe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
            > 
              ({liveTotalReviews} Ulasan Pembeli - Lihat 👁️)
            </span>
          </div>

          {/* DISPLAY LIVE KUOTA PO DI POP-UP BIAR CLEAR */}
          {isPoProduct && (
            <div style={{ marginBottom: '16px', backgroundColor: isQuotaFull ? '#fef2f2' : '#f0fdf4', padding: '12px 16px', borderRadius: '14px', border: `1px solid ${isQuotaFull ? '#fee2e2' : '#dcfce7'}`, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: isQuotaFull ? '#ef4444' : '#15803d' }}>
                  {isQuotaFull ? '🚫 Status Kuota: Tunggu Minggu Berikutnya!' : '📦 Status Kuota: Masih Open PO'}
                </span>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>{soldQty} / {maxQuota} Pcs</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((soldQty / maxQuota) * 100, 100)}%`, height: '100%', backgroundColor: isQuotaFull ? '#ef4444' : '#22c55e', transition: 'width 0.4s' }}></div>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '0.87rem', color: '#64748b', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #f1f5f9', width: '100%', boxSizing: 'border-box' }}>
            🧑‍🍳 Dijual oleh: <strong style={{ color: '#334155' }}>{product.seller_name || 'Merchant'}</strong>
          </div>
          
          <p id="mpDesc" style={{ fontSize: '0.95rem', color: '#475569', margin: '0', lineHeight: '1.6', width: '100%', boxSizing: 'border-box' }}>
            {product.description || 'Gak ada deskripsi untuk menu ini .'}
          </p>
        </div>

        <div style={{ padding: '16px 20px 20px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Harga Satuan</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', color: '#ef4444' }}>
                <span style={{ fontSize: '16px', fontWeight: '800' }}>Rp</span>
                <span id="mpPrice" style={{ fontSize: '26px', fontWeight: '900' }}>
                  {Math.trunc(Number(product.price || 0)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Stepper Quantity (Otomatis Lock jika Kuota Habis) */}
            <div className="mpqty" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))} 
                disabled={isQuotaFull}
                style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: isQuotaFull ? '#e2e8f0' : '#ffffff', border: 'none', fontWeight: 'bold', cursor: isQuotaFull ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                -
              </button>
              <span className="mpqnum" style={{ minWidth: '36px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: isQuotaFull ? '#94a3b8' : '#1e293b' }}>
                {isQuotaFull ? 0 : qty}
              </span>
              <button 
                onClick={() => setQty(q => isPoProduct ? Math.min(sisaKuota, q + 1) : q + 1)} 
                disabled={isQuotaFull || (isPoProduct && qty >= sisaKuota)}
                style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: (isQuotaFull || (isPoProduct && qty >= sisaKuota)) ? '#e2e8f0' : '#ffffff', border: 'none', fontWeight: 'bold', cursor: (isQuotaFull || (isPoProduct && qty >= sisaKuota)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                +
              </button>
            </div>
          </div>

          {/* 🔥 DAH DI-FIX: Tombol Utama Add To Cart Otomatis Nge-block Skenario Kuota Penuh */}
          {isQuotaFull ? (
            <button 
              disabled={true}
              style={{ 
                width: '100%', padding: '15px', backgroundColor: '#94a3b8', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              ❌ Kuota PO Sudah Penuh!
            </button>
          ) : (
            <button 
              className="mpaddcart" 
              onClick={handleAddToCart} 
              disabled={isSubmitting}
              style={{ 
                width: '100%', padding: '15px', backgroundColor: isSubmitting ? '#a7f3d0' : '#10b981', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.25)' 
              }}
            >
              <i className="fas fa-shopping-cart"></i> 
              {isSubmitting ? 'Memproses...' : `Tambah Ke Keranjang (Rp ${(Math.trunc(Number(product.price || 0)) * qty).toLocaleString('id-ID')})`}
            </button>
          )}
        </div>
      </div>

      {/* POP-UP DAFTAR ULASAN */}
      {showReviewsPop && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, padding: '16px'
          }}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%' }} onClick={(e) => { e.stopPropagation(); setShowReviewsPop(false); }}></div>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', maxHeight: '480px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>⭐ Ulasan ({product.name})</h3>
              <button onClick={(e) => { e.stopPropagation(); setShowReviewsPop(false); }} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {loadingReviews ? (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', padding: '16px 0' }}>Memuat ulasan pembeli...</p>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', borderRadius: '14px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>{review.buyer_name}</strong>
                      <span style={{ fontSize: '11px', color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '8px', fontWeight: '700' }}>⭐ {Number(review.rating).toFixed(0)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>{review.comment || <em style={{ color: '#94a3b8' }}>Gak ada komentar tekstual.</em>}</p>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '6px', textAlign: 'right' }}>{new Date(review.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>💬</div>
                  <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic' }}>Belum ada ulasan untuk menu ini .</p>
                </div>
              )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); setShowReviewsPop(false); }} style={{ width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginTop: '14px' }}>Kembali ke Detail</button>
          </div>
        </div>
      )}
    </div>
  );
}