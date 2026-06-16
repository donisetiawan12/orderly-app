'use client';
import { useState, useEffect } from 'react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onSearchOpen: () => void;
  onLoginOpen: () => void;
}

interface CartItem {
  cart_id: number;     
  product_id: number;  
  name: string;        
  price: number;       
  image: string;       
  quantity: number;    
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Navbar({
  user,
  onLogout,
  onSearchOpen,
  onLoginOpen,
}: NavbarProps) {
  const [showCartPop, setShowCartPop] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 STATE JUMLAH NOTIFIKASI ITEM DI KERANJANG
  const [cartCount, setCartCount] = useState<number>(0);

  // 🚀 STATE UNTUK NOTIFIKASI POP-UP DI TENGAH LAYAR
  const [customAlert, setCustomAlert] = useState<AlertState>({
    show: false,
    message: '',
    type: 'info'
  });

  const triggerAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomAlert({ show: true, message, type });
  };

  // 🚀 FUNGSI AMBIL DATA KERANJANG
  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoadingCart(true);
    try {
      const res = await fetch('/api/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      
      if (res.ok) {
        const items = result.data || [];
        setCartItems(items);
        // Hitung total item unik di keranjang untuk badge notifikasi
        setCartCount(items.length);
      }
    } catch (err) {
      console.error("Gagal mengambil data keranjang :", err);
    } finally {
      setLoadingCart(false);
    }
  };

  // 🔥 FETCH JUMLAH KERANJANG SECARA SILENT PAS USER PERTAMA KALI LOGIN / LOAD
  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCartData();
    }
  }, [user]);

// 🔥 DENGERIN EVENT BIAR BADGE UPDATE REALTIME TANPA REFRESH
useEffect(() => {
  const handleCartUpdateEvent = () => {
    fetchCartData(); // Ambil data baru otomatis pas ada kode di atas teriak
  };

  // Pasang kuping buat dengerin event 'cartUpdated'
  window.addEventListener('cartUpdated', handleCartUpdateEvent);

  // Bersihin kuping pas komponen gak dipake biar gak bocor memorinya
  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdateEvent);
  };
}, []);

  // 🚀 FUNGSI HAPUS ITEM 
  const handleDeleteItem = async (cartId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/api/cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await res.json();

      if (res.ok) {
        triggerAlert("Menu berhasil dihapus dari keranjang !", "success");
        fetchCartData(); 
      } else {
        triggerAlert(`Gagal menghapus: ${result.message || 'Error server'}`, "error");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Koneksi terputus pas mau menghapus !", "error");
    }
  };

// 🚀 FUNGSI PROSES CHECKOUT PRE-ORDER
  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (cartItems.length === 0) {
      triggerAlert("Keranjang lu kosong , gak ada yang bisa dicheckout!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToOrder = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await fetch('/api/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          total_price: totalBelanja,
          notes: "Pre-order via web",
          items: itemsToOrder
        })
      });

      const result = await res.json();

      if (res.ok) {
        // =========================================================================
        // 🔥 TERIAK BIAR HALAMAN "PESANAN SAYA" LANGSUNG UPDATE DATA TANPA REFRESH!
        // =========================================================================
        window.dispatchEvent(new Event('orderUpdated'));

        triggerAlert("🎉 Selamat ! Pre-Order Anda berhasil dibuat. Silakan Lanjutkan Pembayaran Di Pesanan Saya Untuk Melanjutkan Pesanan Anda!", "success");
        setCartItems([]); 
        setCartCount(0); // Reset notifikasi jadi nol bray
        setShowCartPop(false); 
      } else {
        triggerAlert(`Gagal checkout: ${result.message || 'Ada masalah di server'}`, "error");
      }
    } catch (err) {
      console.error("Error Checkout:", err);
      triggerAlert("Koneksi gagal saat memproses checkout !", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBelanja = cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);

  return (
    <>
      {/* 🚀 POP-UP ALERT DI TENGAH LAYAR (MODAL PREMIUM) */}
      {customAlert.show && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px',
              maxWidth: '380px', width: '100%', textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'navPopScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
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
              onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: customAlert.type === 'success' ? '#06b6d4' : customAlert.type === 'error' ? '#ef4444' : '#3b82f6',
                color: '#ffffff', border: 'none', borderRadius: '14px',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              Oke, Siap !
            </button>
          </div>
        </div>
      )}

      {/* -- START NAVBAR HTML -- */}
      <nav className="navbar navbar-expand-lg" id="nav">
        <div className="container">
          <a className="navbar-brand" href="#">
            <div className="blogo">
              <div className="bico"><i className="fas fa-store"></i></div>
              <div>
                <div className="bname">Order<span>ly</span></div>
                <div className="bsub">Marketplace Pre-Order Mahasiswa</div>
              </div>
            </div>
          </a>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
            <i className="fas fa-bars" style={{ color: 'var(--primary)', fontSize: '1.35rem' }}></i>
          </button>

          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><a className="nav-link" href="#hero">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="#about">Tentang</a></li>
              <li className="nav-item"><a className="nav-link" href="#menu-section">Produk</a></li>
              <li className="nav-item"><a className="nav-link" href="#hours">Cara Kerja</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact-section">Kontak</a></li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <button onClick={onSearchOpen} id="navSearchBtn" className="btn btn-light rounded-circle">
                <i className="fas fa-search"></i>
              </button>

              {user ? (
                <>
                  {user.role === 'buyer' && (
                    <button
                      onClick={() => setShowCartPop(true)}
                      className="nav-link nav-cta border-0"
                      style={{
                        borderRadius: '50px', padding: '8px 16px', fontSize: '0.85rem',
                        fontWeight: '600', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', backgroundColor: '#10b981', color: '#ffffff',
                        position: 'relative'
                      }}
                    >
                      <i className="fas fa-shopping-bag me-2"></i>Keranjang Saya

                      {/* Bulatan Merah Angka Notifikasi Keranjang */}
                      {cartCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-4px',
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
                          animation: 'pulseCartNotify 2s infinite'
                        }}>
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  {user.role === 'seller' && (
                    <a href="/dashboard/seller" className="nav-link nav-cta border-0" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      <i className="fas fa-store me-2"></i>Dashboard Seller
                    </a>
                  )}

                  {user.role === 'admin' && (
                    <a href="/dashboard/admin" className="nav-link nav-cta border-0" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                      <i className="fas fa-user-shield me-2"></i>Dashboard Admin
                    </a>
                  )}

                  <button onClick={onLogout} className="nav-link nav-cta border-0" style={{ borderRadius: '50px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={onLoginOpen} className="nav-link nav-cta border-0" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-shopping-bag me-2"></i>Pesan Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* POP-UP KERANJANG BELANJAAN */}
      {showCartPop && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1200, padding: '16px', boxSizing: 'border-box'
          }}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%' }} onClick={() => setShowCartPop(false)}></div>
          
          <div 
            style={{
              position: 'relative', width: '100%', maxWidth: '440px', maxHeight: '80vh',
              backgroundColor: '#ffffff', borderRadius: '24px', padding: '20px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex',
              flexDirection: 'column', boxSizing: 'border-box',
              animation: 'navPopScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛒 Keranjang Belanjaan Anda
              </h3>
              <button 
                onClick={() => setShowCartPop(false)}
                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {/* List Item Area */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {loadingCart ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', padding: '24px 0' }}>Sedang mengambil data belanjaan...</p>
              ) : cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div 
                    key={item.cart_id} 
                    style={{ 
                      display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', 
                      backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: '12px',
                      border: '1px solid #f1f5f9' 
                    }}
                  >
                    <img 
                      src={item.image ? `/api/uploads/products/${item.image}` : '/img/default.jpg'} 
                      alt={item.name}
                      style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#e2e8f0' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/img/default.jpg'; }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        {item.name || 'Menu Tidak Diketahui'}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                        Rp {Math.trunc(Number(item.price || 0)).toLocaleString('id-ID')} 
                        <span style={{ color: '#94a3b8', fontWeight: '500', fontSize: '11px', marginLeft: '6px' }}>x{item.quantity}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteItem(item.cart_id)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', fontSize: '14px' }}
                      title="Hapus menu"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛒</div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Keranjang belanja masih kosong !</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Pembayaran:</span>
                  <span style={{ fontSize: '18px', color: '#ef4444', fontWeight: '900' }}>
                    Rp {totalBelanja.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '14px', backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb', color: '#ffffff',
                    border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 10px 15px -3px rgba(37,99,235,0.25)'
                  }}
                >
                  <i className="fas fa-shopping-bag"></i> 
                  {isSubmitting ? 'Sedang Memproses...' : 'Lanjutkan Pre-Order (Checkout)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Style Global Efek Denyut & Scale Pop-up */}
      <style>{`
        @keyframes navPopScale { 
          from { transform: scale(0.88); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
        @keyframes pulseCartNotify {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}