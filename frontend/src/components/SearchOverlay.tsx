'use client';
import { useEffect, useState } from 'react';

export default function SearchOverlay({ isOpen, onClose, searchTerm, setSearchTerm }: any) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const json = await response.json();
        // Sesuaikan dengan struktur API lu, pastikan jadi Array
        if (json && json.data) {
          // Kalau strukturnya json.data.products, pakai json.data.products
          setProducts(Array.isArray(json.data) ? json.data : json.data.products || []);
        }
      } catch (error) {
        console.error("Gagal fetch search:", error);
      }
    }
    
    if (isOpen) fetchProducts();
  }, [isOpen]);

  // Logika filter lokal
  const filtered = products.filter((p) =>
    (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div id="searchOv" className="open">
      <button type="button" className="sovclose" onClick={onClose}><i className="fas fa-times"></i></button>
      
      <div className="sovbox">
        <h4>What are you craving today?</h4>
        <div className="sovinput">
          <input 
            type="text" 
            placeholder="Cari menu favoritmu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            autoFocus
          />
        </div>

        <div className="sovcats">
          {searchTerm && filtered.map((item) => (
            <div className="sovcat" key={item.id} onClick={onClose}>
              {/* Pastikan path gambar backend lu sudah benar */}
              <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
              {item.name}
            </div>
          ))}
          {searchTerm && filtered.length === 0 && <p>Tidak ada hasil.</p>}
        </div>
      </div>
    </div>
  );
}