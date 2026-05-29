'use client';
import { useEffect, useState, useMemo } from 'react';

export default function Menu({ searchTerm, activeFilter, setActiveFilter, onOpenDetail, onClearSearch }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // State untuk list kategori
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Produk
        const [resP1, resP2, resCat] = await Promise.all([
          fetch('http://localhost:5000/api/products?page=1'),
          fetch('http://localhost:5000/api/products?page=2'),
          fetch('http://localhost:5000/api/categories') // Asumsi endpoint kategori ada
        ]);
        
        const jsonP1 = await resP1.json();
        const jsonP2 = await resP2.json();
        const jsonCat = await resCat.json();
        
        const rawProducts = [...(jsonP1.data?.products || []), ...(jsonP2.data?.products || [])];
        const uniqueProducts = Array.from(new Map(rawProducts.map(item => [item.id, item])).values());
        
        setProducts(uniqueProducts);
        setCategories(jsonCat.data || []); // Simpan data kategori
      } catch (error) {
        console.error("Gagal load data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes((searchTerm || '').toLowerCase());
      const pCatId = String(p.category_id || '');
      const activeId = String(activeFilter || 'all');
      return matchesSearch && (activeId === 'all' || pCatId === activeId);
    }).slice(0, (activeFilter === 'all' && !searchTerm && !showAll) ? 9 : undefined);
  }, [products, searchTerm, activeFilter, showAll]);

  return (
    <section id="menu-section" className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="slbl">What's Cooking</span>
          <h2 className="stitle">Our Delicious <span>Menu</span></h2>
          <div className="sline mx-auto mb-4"></div>
        </div>

        {/* --- TOMBOL FILTER --- */}
        <div className="text-center mb-4">
          <button 
            className={`filtbtn ${activeFilter === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveFilter('all')}
            style={{ margin: '5px', padding: '8px 20px', cursor: 'pointer' }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`filtbtn ${activeFilter === String(cat.id) ? 'active' : ''}`} 
              onClick={() => setActiveFilter(String(cat.id))}
              style={{ margin: '5px', padding: '8px 20px', cursor: 'pointer' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- TOMBOL CLEAR SEARCH --- */}
        {searchTerm && (
          <div className="text-center mb-4">
            <p>Hasil pencarian untuk: <strong>"{searchTerm}"</strong></p>
            <button onClick={onClearSearch} className="btn btn-sm btn-outline-danger">
              <i className="fas fa-times"></i> Hapus Pencarian
            </button>
          </div>
        )}

        {/* --- PRODUCT GRID --- */}
        <div className="row g-4" id="mgrid">
          {loading ? <p className="text-center">Memuat menu...</p> : 
           filteredProducts.length > 0 ? (
            filteredProducts.map((item, index) => (
              // ... di dalam mapping filteredProducts.map((item, index) => (...
<div className="col-sm-6 col-lg-4" key={`${item.id}-${index}`}>
  <div className="mcard" onClick={() => onOpenDetail(item)} style={{ cursor: 'pointer', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
    {/* BAGIAN GAMBAR */}
    <div className="mimg" style={{ position: 'relative' }}>
      <img 
        src={item.image ? `http://localhost:5000/${item.image}` : '/img/default.jpg'} 
        alt={item.name} 
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />
      <div className="mhrt" style={{ position: 'absolute', top: '10px', right: '10px' }}><i className="far fa-heart"></i></div>
    </div>
    
    {/* BAGIAN BODY */}
    <div className="mbody" style={{ padding: '15px' }}>
      {/* Seller & Rating */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <strong style={{ fontSize: '0.9rem', color: '#333' }}>{item.seller_name}</strong>
        <div style={{ fontSize: '0.8rem', color: '#f39c12', fontWeight: 'bold' }}>
          <i className="fas fa-star"></i> {Number(item.avg_rating || 0).toFixed(1)} 
        </div>
      </div>

      {/* Location */}
      <div style={{ fontSize: '0.75rem', color: '#ff4757', fontWeight: 'bold', marginBottom: '8px' }}>
        <span style={{ color: '#555', marginRight: '4px' }}>Location:</span>
        <i className="fas fa-map-marker-alt"></i> {item.location || 'Kampus A'}
      </div>
      
      {/* Title */}
      <div className="mtit" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{item.name}</div>

      {/* Description */}
      <div className="mdesc" style={{ 
        fontSize: '0.85rem', color: '#666', marginBottom: '10px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', height: '2.8em' 
      }}>
        {item.description}
      </div>
      
      {/* Footer (Price & Button) */}
      <div className="mfoot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mprice" style={{ fontWeight: 'bold', color: '#333' }}>
            Rp {Number(item.price).toLocaleString()}
          </div>
          <button className="madd">
            <i className="fas fa-plus"></i>
          </button>
      </div>
    </div>
  </div>
</div>
            ))
          ) : <div className="col-12 text-center"><p>Menu tidak ditemukan.</p></div>}
        </div>

        {/* --- VIEW ALL BUTTON --- */}
        {!searchTerm && activeFilter === 'all' && products.length > 9 && (
          <div className="text-center mt-5">
            <button onClick={() => setShowAll(!showAll)} className="btn-red">
              <i className={`fas ${showAll ? 'fa-minus' : 'fa-th-large'}`}></i> 
              {showAll ? ' Show Less' : ' View Full Menu'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}