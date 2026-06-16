'use client';
import { useEffect, useState } from 'react';

export default function Marquee() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/api/products');
        const json = await response.json();
        
        // Sesuai dengan struktur JSON lu: json.data.products
        if (json && json.data && Array.isArray(json.data.products)) {
          setProducts(json.data.products);
        }
      } catch (error) {
        console.error("Gagal load data marquee:", error);
      }
    }
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="mqsec">
      <div className="mqtrack">
        {[...products, ...products].map((item, index) => (
          <div className="mqitem" key={index} style={{ marginRight: '38px' }}>
            <i className="fas fa-circle"></i>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}