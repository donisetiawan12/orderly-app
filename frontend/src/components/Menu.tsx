'use client';
import { useEffect, useState, useMemo } from 'react';

export default function Menu({ searchTerm, activeFilter }: { searchTerm: string, activeFilter: string }) {
  // Pastikan inisialisasi state adalah array kosong
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const json = await response.json();
        
        // DEBUGGING: Cek apa isi json di console
        console.log("Respon API:", json);

        // LOGIKA AMAN: 
        // Kalau json.data itu array, ambil itu. Kalau json itu sendiri array, ambil itu.
        if (Array.isArray(json)) {
          setProducts(json);
        } else if (json.data && Array.isArray(json.data)) {
          setProducts(json.data);
        } else if (json.data && json.data.products && Array.isArray(json.data.products)) {
          setProducts(json.data.products);
        } else {
          setProducts([]); // Fallback kalau gak ketemu array-nya
        }
      } catch (error) {
        console.error("Gagal load dari backend:", error);
      }
    }
    fetchProducts();
  }, []); 

  const filteredProducts = useMemo(() => {
    // TAMBAHAN: Cek apakah products memang array sebelum difilter
    if (!Array.isArray(products)) return [];
    
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeFilter === 'all' || String(p.category_id) === String(activeFilter);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeFilter]);

  return (
    <section className="menu-section py-5">
      <div className="container">
        <div className="row">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <div className="col-md-4" key={item.id}>
                 <div className="menu-card">
                   <h3>{item.name}</h3>
                   {/* ... render lainnya ... */}
                 </div>
              </div>
            ))
          ) : (
            <p className="text-center">Menu tidak ditemukan.</p>
          )}
        </div>
      </div>
    </section>
  );
}