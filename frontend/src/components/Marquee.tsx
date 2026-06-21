'use client';
import { useEffect, useState } from 'react';

export default function Marquee() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // 🚀 Tembak rute publik landing-page yang aman tanpa token JWT bray
        const response = await fetch('http://orderly.web.id/api/products/landing-page');
        const json = await response.json();
        
        // Memastikan data array produk masuk dengan aman
        if (json && json.data && Array.isArray(json.data.products)) {
          setProducts(json.data.products);
        }
      } catch (error) {
        console.error("Gagal load data marquee bray:", error);
      }
    }
    fetchProducts();
  }, []);

  // 🔥 TRIK UTAMA: Kalau isi DB masih dikit (< 10), kita panjangin baris antreannya 
  // biar looping animasi CSS template lu gak tabrakan atau double di ujung.
  const displayProducts = products.length > 0 && products.length < 10 
    ? [...products, ...products, ...products] 
    : products;

  return (
    <div className="mqsec">
      <div className="mqtrack">
        {displayProducts.length > 0 ? (
          displayProducts.map((item, index) => (
            <div className="mqitem" key={`mq-${item.id}-${index}`}>
              <i className="fas fa-circle"></i>
              {item.name}
            </div>
          ))
        ) : (
          // Fallback tampilan statis berjalan pas server/DB lu lagi loading bray
          <>
            <div className="mqitem"><i className="fas fa-circle"></i>Memuat Menu Pilihan Kampus...</div>
            <div className="mqitem"><i className="fas fa-circle"></i>Memuat Menu Pilihan Kampus...</div>
            <div className="mqitem"><i className="fas fa-circle"></i>Memuat Menu Pilihan Kampus...</div>
          </>
        )}
      </div>
    </div>
  );
}