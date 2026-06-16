'use client';
import { useEffect, useState, useMemo } from 'react';

export default function Menu({ searchTerm, activeFilter, setActiveFilter, onOpenDetail, onClearSearch }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // 🚀 BIKIN FUNGSI FETCH TERPISAH BIAR BISA DIPANGGIL KAPAN SAJA
  const fetchFreshData = async () => {
    try {
      const [resP1, resP2, resCat] = await Promise.all([
        fetch('http://localhost:5000/api/products?page=1'),
        fetch('http://localhost:5000/api/products?page=2'),
        fetch('http://localhost:5000/api/categories')
      ]);
      
      const jsonP1 = await resP1.json();
      const jsonP2 = await resP2.json();
      const jsonCat = await resCat.json();
      
      const rawProducts = [...(jsonP1.data?.products || []), ...(jsonP2.data?.products || [])];
      const uniqueProducts = Array.from(new Map(rawProducts.map(item => [item.id, item])).values());
      
      setProducts(uniqueProducts);
      setCategories(jsonCat.data || []);
    } catch (error) {
      console.error("Gagal load data menu terbaru bray:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch data pas pertama kali komponen nongol
  useEffect(() => {
    setLoading(true);
    fetchFreshData();
  }, []);

  // 🔥 2. SELEBRITI EVENT LISTENER: Otomatis Fetch Ulang jika ada event update order/checkout!
  useEffect(() => {
    const handleOrderOrCartUpdate = () => {
      console.log("🔔 Ada aktivitas checkout/order! Sinkronisasi ulang kuota PO...");
      fetchFreshData(); // Tarik data sold_quantity terbaru murni dari DB!
    };

    window.addEventListener('orderUpdated', handleOrderOrCartUpdate);
    window.addEventListener('cartUpdated', handleOrderOrCartUpdate);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderOrCartUpdate);
      window.removeEventListener('cartUpdated', handleOrderOrCartUpdate);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes((searchTerm || '').toLowerCase());
      const pCatId = String(p.category_id || '');
      const activeId = String(activeFilter || 'all');
      return matchesSearch && (activeId === 'all' || pCatId === activeId);
    });
    
    return (activeFilter === 'all' && !searchTerm && !showAll) ? filtered.slice(0, 9) : filtered;
  }, [products, searchTerm, activeFilter, showAll]);

  return (
    <section id="menu-section" className="py-5">
      <div className="container">
       <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">Menu Favorit</span>
          <h2 className="stitle">Pilihan Menu <span>Andalan Mahasiswa</span></h2>
          <div className="sline mx-auto mb-4"></div>
        </div>

        {/* --- TOMBOL FILTER --- */}
        <div className="text-center mb-4">
          <button 
            className={`filtbtn ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => { setActiveFilter('all'); setShowAll(false); }}
            style={{ margin: '5px', padding: '8px 20px', cursor: 'pointer' }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`filtbtn ${activeFilter === String(cat.id) ? 'active' : ''}`} 
              onClick={() => { setActiveFilter(String(cat.id)); setShowAll(false); }}
              style={{ margin: '5px', padding: '8px 20px', cursor: 'pointer' }}
            >
              {cat.name}
            </button>
          ))}

            {/* --- TOMBOL CLEAR SEARCH --- */}
            {searchTerm && (
              <div className="text-center mb-4">
                <p>Hasil pencarian untuk: <strong>"{searchTerm}"</strong></p>
                <button 
                  onClick={() => {
                    onClearSearch(); 
                    setShowAll(false);
                  }} 
                  className="btn btn-sm btn-outline-danger"
                  style={{ marginTop: '5px' }}
                >
                  <i className="fas fa-times"></i> Hapus Pencarian
                </button>
              </div>
            )}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="row g-4" id="mgrid">
          {loading ? <p className="text-center">Memuat menu...</p> : 
           filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              <div className="col-sm-6 col-lg-4" key={`${item.id}-${index}`}>
                <div className="mcard" onClick={() => onOpenDetail(item)} style={{ cursor: 'pointer', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="mimg" style={{ position: 'relative' }}>
                    <img 
                      src={item.image ? `http://localhost:5000/uploads/products/${item.image}` : '/img/default.jpg'} 
                      alt={item.name} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/img/default.jpg'; }}
                    />
                    
                   {/* --- BADGE DEADLINE (FIXED TIMEZONE & ACCURATE DAYS) --- */}
                      {item.po_deadline && (() => {
                          // 1. Buat objek tanggal sekarang (WIB) tapi set jamnya ke 00:00:00 biar adil bray
                          const sekarang = new Date();
                          sekarang.setHours(0, 0, 0, 0);

                          // 2. Ambil tanggal deadline, potong stringnya ambil tanggalnya aja (YYYY-MM-DD)
                          // Cara ini ampuh bray buat nge-bypass bug jam/timezone MySQL!
                          const stringTanggalSaja = item.po_deadline.split(' ')[0]; // dapet "2026-06-30"
                          const deadline = new Date(stringTanggalSaja);
                          deadline.setHours(0, 0, 0, 0);

                          // 3. Hitung selisih hari murni
                          const diffTime = deadline.getTime() - sekarang.getTime();
                          const diffDays = Math.floor(diffTime / (1000 * 3600 * 24)); // Gunakan Math.floor bray

                          if (diffDays < 0) return null; // Kalo udah lewat deadline, badge ilang

                          return (
                            <div style={{
                              position: 'absolute', top: '10px', right: '10px',
                              backgroundColor: diffDays <= 2 ? '#ef4444' : '#f59e0b', 
                              color: '#fff', padding: '4px 10px', borderRadius: '20px',
                              fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                              <i className={diffDays <= 2 ? "fas fa-exclamation-triangle" : "far fa-clock"}></i> 
                              {diffDays === 0 ? 'Terakhir Hari Ini!' : `${diffDays} Hari Lagi`}
                            </div>
                          );
                        })()}
                  </div>
              
                  <div className="mbody" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#333' }}>{item.seller_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#f39c12', fontWeight: 'bold' }}>
                        <i className="fas fa-star"></i> {Number(item.avg_rating || 0).toFixed(1)}
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px', display: 'inline-block' }}>
                      <div style={{ color: '#6366f1', backgroundColor: '#eef2ff', border: '1px solid #6366f1', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#ef4444' }}></i>
                        <span>Lokasi: {item.location || 'Kampus A'}</span>
                      </div>
                    </div>
                    
                    {/* Title & Desc */}
                    <div className="mtit" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{item.name}</div>
                    <div className="mdesc" style={{ fontSize: '0.85rem', color: '#666', height: '2.8em', overflow: 'hidden' }}>{item.description}</div>
                    
                    {/* --- 🚀 PROGRESS BAR DENGAN VALUASI REAL-TIME --- */}
                    {Number(item.po_quota) > 0 && (
                      <div className="mt-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                          <span>Kuota PO Terisi</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {item.sold_quantity || 0}/{item.po_quota} Pcs
                          </span>
                        </div>
                        
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.min(((Number(item.sold_quantity) || 0) / Number(item.po_quota)) * 100, 100)}%`, 
                            height: '100%', 
                            backgroundColor: (Number(item.sold_quantity) || 0) >= Number(item.po_quota) ? '#ef4444' : '#10b981', 
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-in-out'
                          }}></div>
                        </div>
                      </div>
                    )}

                    {/* Footer Price */}
                    {/* Footer Price */}
                      <div className="mfoot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <div className="mprice" style={{ fontWeight: 'bold', color: '#1e293b' }}>
                          Rp. {Math.trunc(Number(item.price || 0)).toLocaleString('id-ID')}
                        </div>
                        
                        {/* 🔥 FIX: Blokir tombol plus jika kuota PO sudah penuh */}
                        {Number(item.po_quota) > 0 && (item.sold_quantity || 0) >= item.po_quota ? (
                          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                            🚫 Habis
                          </span>
                        ) : (
                          <button className="madd" style={{ padding: '5px 10px' }}><i className="fas fa-plus"></i></button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            ))
          ) : <div className="col-12 text-center"><p>Menu tidak ditemukan.</p></div>}
        </div>

        {/* --- TOMBOL VIEW ALL --- */}
        {!searchTerm && activeFilter === 'all' && products.length > 9 && (
          <div className="text-center mt-5">
            <button 
              onClick={() => setShowAll(!showAll)} 
              className="btn btn-outline-primary"
              style={{ padding: '10px 30px', borderRadius: '25px' }}
            >
              <i className={`fas ${showAll ? 'fa-chevron-up' : 'fa-th-large'}`}></i> 
              {showAll ? ' Show Less' : ' View Full Menu'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}