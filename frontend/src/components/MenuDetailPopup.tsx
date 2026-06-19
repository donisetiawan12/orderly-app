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

  // 🔥 FIX ALAMAT IP BENTROK KE 127.0.0.1
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/products/${product.id}/reviews`);
          const result = await res.json();
          if (result.status === 'success' || result.data) {
            const dataUlasan: Review[] = result.data || [];
            setReviews(dataUlasan);
            
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


  const handleAddToCart = async () => {
    // 1. Validasi awal di frontend sebelum loading jalan bray
    if (isPoProduct && qty > sisaKuota) {
      triggerAlert(`⚠️ Waduh bray, sisa kuota PO tinggal ${sisaKuota} Pcs, lu gak bisa pesan sampai ${qty} Pcs.`, "error");
      return; 
    }

    setIsSubmitting(true); // Mulai loading memproses...

    try {
      const token = localStorage.getItem('token'); 

      if (!token) {
        triggerAlert("🔒 Waduh, Kamu harus login dulu sebelum masukin menu ke keranjang!", "error");
        return;
      }

      // Tembak pake IP 127.0.0.1 biar klop sama CORS baru backend lu bray
      const response = await fetch('http://127.0.0.1:5000/api/cart', {
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

      // Proteksi kalau backend ngaco / ngasih status salah alamat biar gak crash di browser
      if (response.status === 404) {
        triggerAlert("❌ Gagal (Error 404): Alamat API tidak ditemukan atau token ditolak backend bray!", "error");
        return;
      }

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        triggerAlert(`🎉 Mantap ! ${qty} ${product.name} berhasil masuk keranjang.`, "success");
      } else {
        const pesanError = result?.message || result?.msg || 'Ada masalah pada server backend bray';
        triggerAlert(`Gagal masuk keranjang: ${pesanError}`, "error");
      }

    } catch (error) {
      console.error("Error Add to Cart:", error);
      triggerAlert("❌ Koneksi ke server backend putus atau crash bray!", "error");
    } finally {
      // 🔥 JAMINAN ANTI-STUCK ABADI: Apapun hasilnya, tulisan memproses WAJIB MATI DI SINI!
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
      {/* 🚀 CUSTOM POP-UP ALERT BOX DI TENGAH LAYAR */}
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

            {/* 🔥 BUTTON SAKTI: DI SINI IS_SUBMITTING DIPAKSA FALSE SAAT DIKLIK OKE */}
            <button
              onClick={() => {
                const isSuccess = customAlert.type === 'success';
                setCustomAlert(prev => ({ ...prev, show: false }));
                setIsSubmitting(false); // RESET UTAMA BIAR GAK STUCK MEMPROSES
                if (isSuccess) {
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
            src={product.image ? `http://127.0.0.1:5000/uploads/products/${product.image}` : '/img/default.jpg'} 
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

          {isPoProduct && (
            <div style={{ marginBottom: '16px', backgroundColor: isQuotaFull ? '#fef2f2' : '#f0fdf4', padding: '12px 16px', borderRadius: '14px', border: `1px solid ${isQuotaFull ? '#fee2e2' : '#dcfce7'}`, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: isQuotaFull ? '#ef4444' : '#15803d' }}>
                  {isQuotaFull ? '🚫 Status Kuota: Full Hancur bray!' : '📦 Status Kuota: Masih Open PO'}
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

          {isQuotaFull ? (
            <button 
              disabled={true}
              style={{ 
                width: '100%', padding: '15px', backgroundColor: '#94a3b8', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              ❌ Kuota PO Sudah Penuh Bray!
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
    </div>
  );
}