'use client';
import { useEffect, useState, useMemo } from 'react';

export default function Menu({ searchTerm, activeFilter, setActiveFilter, onOpenDetail, onClearSearch }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
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
        console.error("Gagal load data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    // Logika filter produk
    const filtered = products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes((searchTerm || '').toLowerCase());
      const pCatId = String(p.category_id || '');
      const activeId = String(activeFilter || 'all');
      return matchesSearch && (activeId === 'all' || pCatId === activeId);
    });
    
    // Potong jadi 9 item jika sedang di "All" dan tidak sedang mencari
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
                    onClearSearch(); // Fungsi untuk mereset searchTerm jadi ''
                    setShowAll(false);
                  }} 
                  className="btn btn-sm btn-outline-danger"
                  style={{ marginTop: '5px' }}
                >
                  <i className="fas fa-times"></i> Hapus Pencarian
                </button>
              </div>
            )}

            {/* ... lanjut ke PRODUCT GRID ... */}
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
                    {/* --- BADGE DEADLINE --- */}
                    {item.po_deadline && (() => {
                        const diffTime = new Date(item.po_deadline).getTime() - Date.now();
                        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

                        if (diffDays < 0) return null; 

                        return (
                          <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            backgroundColor: diffDays <= 2 ? '#f59e0b' : '#ef4444', 
                            color: '#fff', padding: '4px 10px', borderRadius: '20px',
                            fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                          }}>
                            <i className={diffDays <= 2 ? "fas fa-exclamation-triangle "  : "far fa-clock"}></i> 
                            {diffDays} Hari Lagi
                          </div>
                        );
                      })()}
                  </div>
              
                  <div className="mbody" style={{ padding: '15px' }}>
                    {/* Rating & Seller */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#333' }}>{item.seller_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#f39c12', fontWeight: 'bold' }}>
                        <i className="fas fa-star"></i> {Number(item.avg_rating || 0).toFixed(1)}
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      marginBottom: '10px',
                      display: 'inline-block'
                    }}>
                      <div style={{ 
                        color: '#6366f1',           
                        backgroundColor: '#eef2ff', 
                        border: '1px solid #6366f1',
                        padding: '4px 10px',        
                        borderRadius: '6px',        
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#ef4444' }}></i>
                        <span>Lokasi: {item.location || 'Kampus A'}</span>
                      </div>
                    </div>
                    
                    {/* Title & Desc */}
                    <div className="mtit" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{item.name}</div>
                    <div className="mdesc" style={{ fontSize: '0.85rem', color: '#666', height: '2.8em', overflow: 'hidden' }}>{item.description}</div>
                    
                    {/* --- 🚀 FIX BAGIAN KUOTA: Menghitung Berdasarkan po_quota DB Asli --- */}
                    {item.po_quota > 0 && (
                      <div className="mt-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                          <span>Kuota PO Terisi</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {item.sold_quantity || 0}/{item.po_quota} Pcs
                          </span>
                        </div>
                        
                        {/* Progress Bar Container */}
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          backgroundColor: '#e0e0e0', 
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          {/* Progress Bar Fill */}
                          <div style={{ 
                            width: `${Math.min(((item.sold_quantity || 0) / item.po_quota) * 100, 100)}%`, 
                            height: '100%', 
                            backgroundColor: (item.sold_quantity || 0) >= item.po_quota ? '#ef4444' : '#10b981', // Merah jika Full, Hijau jika belum penuh
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-in-out'
                          }}></div>
                        </div>
                      </div>
                    )}

                    {/* Footer Price */}
                    <div className="mfoot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      {/* --- 🚀 FIX FORMAT HARGA JUAL: Rp. 100.000 (Pakai Spasi Setelah Titik) --- */}
{/* 🚀 TERBARU: Potong desimal murni tanpa perkalian */}
<div className="mprice" style={{ fontWeight: 'bold', color: '#1e293b' }}>
  Rp. {Math.trunc(Number(item.price || 0)).toLocaleString('id-ID')}
</div>
                      <button className="madd" style={{ padding: '5px 10px' }}><i className="fas fa-plus"></i></button>
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

      