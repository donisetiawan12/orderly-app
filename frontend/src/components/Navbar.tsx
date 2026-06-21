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

  // 🔥 STATE DARI HERO YANG DIPINDAHKAN KE NAVBAR (UNTUK POP-UP PESANAN SAYA)
  const [showOrdersPop, setShowOrdersPop] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [updatingNotesId, setUpdatingNotesId] = useState<number | null>(null);

  const [reviewRating, setReviewRating] = useState<Record<number, number>>({});
  const [reviewComment, setReviewComment] = useState<Record<number, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);

  const [visibleLimits, setVisibleLimits] = useState<Record<string, number>>({
    pending: 3, paid: 3, confirmed: 3, shipped: 3, completed: 3, cancelled: 3,
  });

  const handleShowMoreStatus = (statusKey: string) => {
    setVisibleLimits(prev => ({ ...prev, [statusKey]: (prev[statusKey] || 3) + 3 }));
  };

  const handleShowLessStatus = (statusKey: string) => {
    setVisibleLimits(prev => ({ ...prev, [statusKey]: 3 }));
  };

const [isNavOpen, setIsNavOpen] = useState(false);
  
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
      const res = await fetch('http://orderly.web.id/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      
      if (res.ok) {
        const items = result.data || [];
        setCartItems(items);
        setCartCount(items.length);
      }
    } catch (err) {
      console.error("Gagal mengambil data keranjang :", err);
    } finally {
      loadingCart && setLoadingCart(false);
    }
  };

  // 🔥 FUNGSI AMBIL DATA PESANAN SAYA
  const fetchMyOrders = async (isCountOnly = false) => {
    const token = localStorage.getItem('token'); 
    if (!token) return;

    if (!isCountOnly) setLoadingOrders(true);
    try {
      const res = await fetch(`http://orderly.web.id/api/orders`, {
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isCountOnly) setLoadingOrders(false);
    }
  };

  // FETCH DATA SAAT USER LOAD
  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchCartData();
      fetchMyOrders(true);
    }
  }, [user]);

  // EVENT LISTENER UPDATE DATA REALTIME
  useEffect(() => {
    const handleCartUpdateEvent = () => {
      fetchCartData();
    };
    const handleOrderUpdateEvent = () => {
      fetchMyOrders(); 
    };

    window.addEventListener('cartUpdated', handleCartUpdateEvent);
    window.addEventListener('orderUpdated', handleOrderUpdateEvent);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdateEvent);
      window.removeEventListener('orderUpdated', handleOrderUpdateEvent);
    };
  }, []);

  // 🚀 FUNGSI HAPUS ITEM KERANJANG
  const handleDeleteItem = async (cartId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://orderly.web.id/api/cart/${cartId}`, {
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
      triggerAlert("Keranjang lu kosong, gak ada yang bisa dicheckout!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToOrder = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const res = await fetch('http://orderly.web.id/api/orders', {
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
        window.dispatchEvent(new Event('orderUpdated'));
        triggerAlert("🎉 Selamat! Pre-Order Anda berhasil dibuat. Silakan Lanjutkan Pembayaran Di Pesanan Saya Untuk Melanjutkan Pesanan Anda!", "success");
        setCartItems([]); 
        setCartCount(0); 
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

  // 🚀 ACTION BUTTONS UNTUK MODAL PESANAN SAYA
  const handleCancelOrder = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`http://orderly.web.id/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
    } finally {
      setCancellingId(null);
    }
  };

  const handleUpdateNotes = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setUpdatingNotesId(orderId);
    try {
      const res = await fetch(`http://orderly.web.id/api/orders/${orderId}/notes`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotes[orderId] || '' })
      });
      if (res.ok) {
        triggerAlert("📌 Catatan pesanan berhasil diperbarui bray!", "success");
        fetchMyOrders(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingNotesId(null);
    }
  };

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
      triggerAlert("Gagal download QRIS otomatis bray, screenshot aja!", "error");
    }
  };

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
      const res = await fetch(`http://orderly.web.id/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        triggerAlert("🎉 Bukti pembayaran berhasil dikirim! Menunggu verifikasi seller bray.", "success");
        setSelectedFile(null);
        fetchMyOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  };

  const handleSendReview = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const rating = reviewRating[orderId] || 5; 
    const comment = reviewComment[orderId] || '';
    setSubmittingReviewId(orderId);
    try {
      const res = await fetch(`http://orderly.web.id/api/orders/review`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, rating, comment })
      });
      if (res.ok) {
        triggerAlert("🎉 Ulasan lu berhasil dikirim bray!", "success");
        setReviewComment(prev => ({ ...prev, [orderId]: '' }));
        fetchMyOrders(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const totalBelanja = cartItems.reduce((acc, item) => acc + (Number(item.price || 0) * item.quantity), 0);

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
      {/* 🚀 POP-UP ALERT DI TENGAH LAYAR */}
      {customAlert.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'navPopScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: customAlert.type === 'success' ? '#ecfeff' : customAlert.type === 'error' ? '#fef2f2' : '#eff6ff', color: customAlert.type === 'success' ? '#06b6d4' : customAlert.type === 'error' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 20px auto', border: `2px solid ${customAlert.type === 'success' ? '#cffafe' : customAlert.type === 'error' ? '#fee2e2' : '#dbeafe'}` }}>
              {customAlert.type === 'success' ? '✓' : customAlert.type === 'error' ? '✕' : 'ℹ'}
            </div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{customAlert.type === 'success' ? 'Berhasil!' : customAlert.type === 'error' ? 'Ups, Gagal!' : 'Informasi'}</h4>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5', fontWeight: '500' }}>{customAlert.message}</p>
            <button onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))} style={{ width: '100%', padding: '12px', backgroundColor: customAlert.type === 'success' ? '#06b6d4' : customAlert.type === 'error' ? '#ef4444' : '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Oke, Siap !</button>
          </div>
        </div>
      )}

      {/* -- START NAVBAR HTML -- */}
   <nav className="navbar navbar-expand-lg navbar-light bg-white" id="nav" style={{ padding: '12px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
    <div className="container">
      
      {/* BRAND LOGO (Otomatis d-none d-lg-block di laptop diganti versi bawah, di mobile pakai link ini) */}
      <a className="navbar-brand" href="#" style={{ zIndex: 10 }}>
        <div className="blogo">
          {/* 🔥 LOGO MENGGUNAKAN IMG.JPEG BULAT */}
          <div className="bico" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%' }}>
            <img src="/img/img.jpeg" alt="Logo Orderly" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div className="bname">Order<span>ly</span></div>
            <div className="bsub">Marketplace Pre-Order Mahasiswa</div>
          </div>
        </div>
      </a>

      {/* 📱 AREA TOMBOL AKSI KHUSUS MOBILE (Hanya muncul di layar HP < 992px) */}
      <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2" style={{ zIndex: 10 }}>
        {/* Tombol Search Mobile */}
        <button onClick={onSearchOpen} className="btn btn-light rounded-circle" style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-search" style={{ fontSize: '0.95rem' }}></i>
        </button>

        {user && user.role === 'buyer' && (
          <>
            {/* Tombol Pesanan Mobile */}
            <button
              onClick={() => { fetchMyOrders(); setShowOrdersPop(true); }}
              className="btn btn-light rounded-circle"
              style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#f1f5f9', border: 'none', color: '#334155' }}
            >
              <i className="fas fa-receipt" style={{ fontSize: '0.95rem' }}></i>
              {activeOrdersCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ffffff' }}>
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Tombol Keranjang Mobile */}
            <button
              onClick={() => { fetchCartData(); setShowCartPop(true); }}
              className="btn btn-light rounded-circle"
              style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#f1f5f9', border: 'none', color: '#334155' }}
            >
              <i className="fas fa-shopping-bag" style={{ fontSize: '0.95rem' }}></i>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #ffffff' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* 📱 HAMBURGER BUTTON (Mepet kanan setelah deretan tombol di mobile) */}
      <button className="navbar-toggler border-0 p-1" type="button" onClick={() => setIsNavOpen(!isNavOpen)} aria-expanded={isNavOpen}>
        <i className="fas fa-bars" style={{ color: 'var(--primary)', fontSize: '1.35rem' }}></i>
      </button>

      {/* 💻 CONTAINER MENU UTAMA (100% Persis Struktur Asli Lu Pas di Laptop) */}
      <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navmenu">
        <ul className="navbar-nav mx-auto text-center text-lg-start my-3 my-lg-0">
          <li className="nav-item"><a className="nav-link" href="#hero" onClick={() => setIsNavOpen(false)}>Home</a></li>
          <li className="nav-item"><a className="nav-link" href="#about" onClick={() => setIsNavOpen(false)}>Tentang</a></li>
          <li className="nav-item"><a className="nav-link" href="#menu-section" onClick={() => setIsNavOpen(false)}>Produk</a></li>
          <li className="nav-item"><a className="nav-link" href="#hours" onClick={() => setIsNavOpen(false)}>Cara Kerja</a></li>
          <li className="nav-item"><a className="nav-link" href="#contact-section" onClick={() => setIsNavOpen(false)}>Kontak</a></li>
        </ul>

        {/* 💻 AREA KANAN (Hanya Aktif & Kelihatan di Laptop) */}
        <div className="d-flex flex-column flex-lg-row align-items-center gap-2 mt-2 mt-lg-0">
          
          {/* Tombol Search Desktop */}
          <button onClick={onSearchOpen} id="navSearchBtn" className="btn btn-light rounded-circle d-none d-lg-flex" style={{ width: '42px', height: '42px', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-search"></i>
          </button>

          {user ? (
            <>
              {user.role === 'buyer' && (
                <div className="d-none d-lg-flex align-items-center gap-2">
                  {/* Tombol Pesanan Saya Desktop */}
                  <button
                    onClick={() => { fetchMyOrders(); setShowOrdersPop(true); }}
                    className="btn btn-light rounded-circle"
                    style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#f1f5f9', border: 'none', color: '#334155' }}
                    title="Pesanan Saya"
                  >
                    <i className="fas fa-receipt" style={{ fontSize: '1.1rem' }}></i>
                    {activeOrdersCount > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>

                  {/* Tombol Keranjang Saya Desktop */}
                  <button
                    onClick={() => { fetchCartData(); setShowCartPop(true); }}
                    className="btn btn-light rounded-circle"
                    style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#f1f5f9', border: 'none', color: '#334155' }}
                    title="Keranjang Saya"
                  >
                    <i className="fas fa-shopping-bag" style={{ fontSize: '1.1rem' }}></i>
                    {cartCount > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                        {cartCount}
                  </span>
                    )}
                  </button>
                </div>
              )}

             {user.role === 'seller' && (
  <a 
    href="/dashboard/seller" 
    className="nav-cta border-0 text-center px-3" 
    style={{ 
      textDecoration: 'none', 
      background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      borderRadius: '50px', 
      color: '#fff', 
      fontSize: '0.82rem', 
      fontWeight: '600',
      height: '38px', // 🔑 Ngunci tinggi biar pas sama tombol logout
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap' // Biar teksnya ga kepotong/turun ke bawah
    }} 
    onClick={() => setIsNavOpen(false)}
  >
    <i className="fas fa-store me-2"></i>Dashboard Seller
  </a>
)}

{user.role === 'admin' && (
  <a 
    href="/dashboard/admin" 
    className="nav-cta border-0 text-center px-3" 
    style={{ 
      textDecoration: 'none', 
      background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
      borderRadius: '50px', 
      color: '#fff', 
      fontSize: '0.82rem', 
      fontWeight: '600',
      height: '38px', // 🔑 Ngunci tinggi biar pas sama tombol logout
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap'
    }} 
    onClick={() => setIsNavOpen(false)}
  >
    <i className="fas fa-user-shield me-2"></i>Dashboard Admin
  </a>
)}

              <button onClick={() => { onLogout(); setIsNavOpen(false); }} className="nav-link nav-cta border-0 text-center w-100 w-lg-auto" style={{ borderRadius: '50px', padding: '10px 24px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', backgroundColor: '#64748b', color: '#fff' }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => { onLoginOpen(); setIsNavOpen(false); }} className="nav-link nav-cta border-0 text-center w-100 w-lg-auto" style={{ cursor: 'pointer', padding: '10px 24px', borderRadius: '50px' }}>
              <i className="fas fa-shopping-bag me-2"></i>Pesan Sekarang
            </button>
          )}
        </div>
      </div>

    </div>
  </nav>

      {/* POP-UP KERANJANG BELANJAAN */}
      {showCartPop && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%' }} onClick={() => setShowCartPop(false)}></div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px', maxHeight: '80vh', backgroundColor: '#ffffff', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', animation: 'navPopScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>🛒 Keranjang Belanjaan Anda</h3>
              <button onClick={() => setShowCartPop(false)} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {loadingCart ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', padding: '24px 0' }}>Sedang mengambil data belanjaan...</p>
              ) : cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.cart_id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: '12px', border: '1px solid #f1f5f9' }}>
                    <img src={item.image ? `http://orderly.web.id/uploads/products/${item.image}` : '/img/default.jpg'} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#e2e8f0' }} onError={(e) => { (e.target as HTMLImageElement).src = '/img/default.jpg'; }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.name || 'Menu Tidak Diketahui'}</h4>
                      <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>Rp {Math.trunc(Number(item.price || 0)).toLocaleString('id-ID')} <span style={{ color: '#94a3b8', fontWeight: '500', fontSize: '11px', marginLeft: '6px' }}>x{item.quantity}</span></div>
                    </div>
                    <button onClick={() => handleDeleteItem(item.cart_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', fontSize: '14px' }} title="Hapus menu"><i className="fas fa-trash-alt"></i></button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛒</div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Keranjang belanja masih kosong !</p>
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Pembayaran:</span>
                  <span style={{ fontSize: '18px', color: '#ef4444', fontWeight: '900' }}>Rp {totalBelanja.toLocaleString('id-ID')}</span>
                </div>
                <button onClick={handleCheckout} disabled={isSubmitting} style={{ width: '100%', padding: '14px', backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.25)' }}>
                  <i className="fas fa-shopping-bag"></i> {isSubmitting ? 'Sedang Memproses...' : 'Lanjutkan Pre-Order (Checkout)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 POP-UP MODAL UTAMA: PESANAN SAYA (LENGKAP DENGAN PROSES PEMBAYARAN & REVIEW) */}
      {showOrdersPop && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }} onClick={() => setShowOrdersPop(false)}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(25px)', borderRadius: '30px', width: '100%', maxWidth: '480px', maxHeight: '82vh', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.45)', position: 'relative', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#111827' }}>📦 Pesanan Saya</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Verifikasi pembayaran & track menu PO </span>
              </div>
              <button onClick={() => setShowOrdersPop(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', color: '#111827', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {loadingOrders ? (
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>Melacak pesanan aktif lu bray...</p>
              ) : orders.length > 0 ? (
                (() => {
                  const statusOrderPriority = ['pending', 'paid', 'confirmed', 'shipped', 'completed', 'cancelled'];
                  const uniqueOrders = orders.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

                  const groupedOrders: { [key: string]: any[] } = {};
                  uniqueOrders.forEach((order: any) => {
                    const key = order.created_at;
                    if (!groupedOrders[key]) groupedOrders[key] = [];
                    groupedOrders[key].push(order);
                  });

                  const timeKeys = Object.keys(groupedOrders);
                  timeKeys.sort((a, b) => {
                    const statusA = groupedOrders[a][0]?.status || 'pending';
                    const statusB = groupedOrders[b][0]?.status || 'pending';
                    return statusOrderPriority.indexOf(statusA) - statusOrderPriority.indexOf(statusB);
                  });

                  const ordersByStatus: { [key: string]: string[] } = {
                    pending: [], paid: [], confirmed: [], shipped: [], completed: [], cancelled: []
                  };
                  timeKeys.forEach(key => {
                    const currentStatus = groupedOrders[key][0]?.status || 'pending';
                    if (ordersByStatus[currentStatus]) ordersByStatus[currentStatus].push(key);
                  });

                  return statusOrderPriority.map((statusKey) => {
                    const keysInStatus = ordersByStatus[statusKey] || [];
                    if (keysInStatus.length === 0) return null;

                    const currentLimit = visibleLimits[statusKey] || 3;
                    const visibleKeys = keysInStatus.slice(0, currentLimit);

                    return (
                      <div key={statusKey} style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '4px', borderBottom: '2px solid rgba(0,0,0,0.03)' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.05em' }}>
                            Kelompok {statusKey === 'paid' ? 'Dicek Seller' : statusKey === 'confirmed' ? 'Sedang Dimasak' : statusKey === 'shipped' ? 'Sedang Diantar' : statusKey} ({keysInStatus.length})
                          </span>
                        </div>

                        {visibleKeys.map((timeKey) => {
                          const currentGroup = groupedOrders[timeKey];
                          const representative = currentGroup[0];
                          const grandTotalPrice = currentGroup.reduce((sum, item) => sum + Number(item.total_price), 0);

                          return (
                            <div key={timeKey} style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '22px', padding: '18px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '14px', boxShadow: '0 6px 16px rgba(0,0,0,0.03)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '10px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
                                  📆 {new Date(timeKey).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} WIB
                                </span>
                                {renderStatusBadge(representative.status)}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {currentGroup.map((order: any) => (
                                  <div key={order.id} style={{ paddingBottom: '8px', borderBottom: '1px dashed rgba(0,0,0,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>{order.product_name}</h4>
                                        <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>Jumlah: {order.quantity} Porsi</p>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151' }}>
                                          Rp {Math.trunc(order.total_price).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>

                                    {order.status === 'completed' && (
                                      <div style={{ marginTop: '8px', padding: '10px', backgroundColor: order.review_rating ? 'rgba(34, 197, 94, 0.05)' : 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                                        {order.review_rating ? (
                                          <div>
                                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', display: 'block' }}>✅ Ulasan Lu:</label>
                                            <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} style={{ fontSize: '12px', color: star <= order.review_rating ? '#eab308' : '#d1d5db' }}>★</span>
                                              ))}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '11px', color: '#4b5563', fontStyle: 'italic' }}>"{order.review_comment || 'Tanpa komentar teks.'}"</p>
                                          </div>
                                        ) : (
                                          <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#0891b2', marginBottom: '4px' }}>⭐️ Kasih Nilai Menu Ini:</label>
                                            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setReviewRating({ ...reviewRating, [order.id]: star })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: star <= (reviewRating[order.id] || 5) ? '#eab308' : '#d1d5db', padding: 0 }}>★</button>
                                              ))}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                              <textarea rows={1} placeholder="Tulis ulasan lu bray..." value={reviewComment[order.id] || ''} onChange={(e) => setReviewComment({ ...reviewComment, [order.id]: e.target.value })} style={{ width: '100%', fontSize: '11px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #c2e7f0', background: '#fff', resize: 'none' }} />
                                              <button type="button" onClick={() => handleSendReview(order.id)} disabled={submittingReviewId === order.id} style={{ width: '100%', padding: '6px', backgroundColor: '#0891b2', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: submittingReviewId === order.id ? 'not-allowed' : 'pointer' }}>
                                                {submittingReviewId === order.id ? 'Mengirim...' : '🚀 Kirim Ulasan'}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '8px 0', borderTop: '2px solid rgba(0,0,0,0.04)' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>💰 Total Tagihan:</span>
                                <span style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>
                                  Rp {Math.trunc(grandTotalPrice).toLocaleString('id-ID')}
                                </span>
                              </div>

                              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '4px' }}>📌 Catatan Pesanan:</span>
                                {representative.status === 'pending' ? (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <input type="text" value={editingNotes[representative.id] || ''} onChange={(e) => setEditingNotes({ ...editingNotes, [representative.id]: e.target.value })} placeholder="Contoh: Sambal dipisah..." style={{ flex: 1, fontSize: '12px', padding: '6px 12px', borderRadius: '10px', border: '1px solid #d1d5db', background: '#fff' }} />
                                    <button onClick={() => handleUpdateNotes(representative.id)} disabled={updatingNotesId === representative.id} style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>{updatingNotesId === representative.id ? 'Save...' : 'Simpan'}</button>
                                  </div>
                                ) : (
                                  <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>"{representative.notes || 'Tidak ada catatan'}"</p>
                                )}
                              </div>

                              {representative.status === 'pending' && (
                                <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#15803d', marginBottom: '6px' }}>🏦 TUJUAN TRANSFER SELLER:</span>
                                  <div style={{ fontSize: '12px', color: '#1f2937' }}>
                                    <p style={{ margin: '0 0 2px 0' }}><b>Nama Seller:</b> {representative.seller_account_name || 'Seller Utama'}</p>
                                    {representative.seller_bank_name && <p style={{ margin: '0 0 2px 0' }}><b>Bank:</b> {representative.seller_bank_name}</p>}
                                    <p style={{ margin: '0 0 2px 0' }}><b>No. HP / Rek:</b> <span style={{ color: '#0284c7', fontWeight: '700' }}>{representative.seller_account_number || '08X-XXXX-XXXX'}</span></p>
                                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#15803d', marginBottom: '6px' }}>Scan QRIS Resmi Seller:</span>
                                      <img src={representative.seller_qris_image ? `http://orderly.web.id/uploads/payments/${representative.seller_qris_image}` : 'https://placehold.co/150?text=QRIS+Ready'} alt="QRIS Seller" style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '14px', backgroundColor: '#fff', padding: '6px', border: '1px solid #e5e7eb' }} />
                                      <button type="button" onClick={() => handleDownloadQris(`http://orderly.web.id/uploads/payments/${representative.seller_qris_image}`, representative.id)} style={{ marginTop: '8px', padding: '6px 14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>📥 Unduh Gambar QRIS</button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {representative.status === 'pending' && (
                                <div style={{ marginTop: '14px', padding: '12px 14px', backgroundColor: 'rgba(249, 115, 22, 0.08)', borderRadius: '16px', border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#c2410c', marginBottom: '6px' }}>📸 Pilihan Aksi Pesanan:</label>
                                  <div style={{ marginBottom: '10px' }}><input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ fontSize: '11px', width: '100%' }} /></div>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleCancelOrder(representative.id)} disabled={cancellingId === representative.id} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: cancellingId === representative.id ? 'not-allowed' : 'pointer' }}><i className="fas fa-ban"></i> {cancellingId === representative.id ? 'Membatalkan...' : 'Batalkan'}</button>
                                    <button onClick={() => handleUploadProof(representative.id)} disabled={uploadingId === representative.id} style={{ padding: '8px 14px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: uploadingId === representative.id ? 'not-allowed' : 'pointer' }}><i className="fas fa-paper-plane"></i> {uploadingId === representative.id ? 'Uploading...' : 'Kirim Bukti'}</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                          {keysInStatus.length > currentLimit && (
                            <button type="button" onClick={() => handleShowMoreStatus(statusKey)} style={{ background: 'rgba(2, 132, 199, 0.1)', border: 'none', color: '#0284c7', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>➕ Lihat Nota Lainnya (+{keysInStatus.length - currentLimit})</button>
                          )}
                          {currentLimit > 3 && (
                            <button type="button" onClick={() => handleShowLessStatus(statusKey)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>➖ Sembunyikan</button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}><p style={{ margin: 0, fontSize: '13px' }}>Belum ada riwayat pre-order bray.</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Global Efek Denyut */}
      <style>{`
        @keyframes navPopScale { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulseCartNotify {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </>
  );
}