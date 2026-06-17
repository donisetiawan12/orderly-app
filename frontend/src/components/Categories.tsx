'use client';
import { useEffect, useState } from 'react';

export default function Categories({ activeFilter, setActiveFilter }: any) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://${process.env.NEXT_PUBLIC_API_URL}/api/categories');
        const json = await response.json();
        if (json && json.data) {
          const allOption = { id: 'all', name: 'All Items', image: null };
          setCategories([allOption, ...json.data]);
        }
      } catch (error) {
        console.error("Gagal load kategori:", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section id="category" className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="stitle">Jelajahi <span>Kategori</span> Pilihan</h2>
          <p className="sdesc mx-auto" style={{ maxWidth: '450px', color: '#666', fontSize: '0.95rem' }}>
            Temukan berbagai kebutuhan kampusmu dengan cepat. Pilih kategori yang kamu butuhkan dan dapatkan akses mudah ke produk terbaik di sekitar area kampus.
          </p>
          <div className="sline mx-auto mb-3"></div>
        </div>
        
        <div className="row g-3 justify-content-center">
          {categories.map((cat) => {
            // Tentukan URL Gambar
            let imageUrl = '/img/default-cat.jpg'; // default fallback
            
            if (cat.id === 'all') {
              imageUrl = '/img/all-icon.jpg';
            } else if (cat.image) {
              // Jika di DB string-nya sudah mengandung 'http', pakai langsung. 
              // Jika tidak, gabungkan dengan URL upload backend.
              imageUrl = cat.image.startsWith('http') 
                ? cat.image 
                : `http://${process.env.NEXT_PUBLIC_API_URL}/uploads/categories/${cat.image}`;
            }

            return (
              <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={cat.id}>
                <div 
                  className={`catcard ${String(activeFilter) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => setActiveFilter(String(cat.id))}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    className="catimg" 
                    src={imageUrl} 
                    alt={cat.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => { 
                      // Jika url dari backend crash/404, paksa ganti ke gambar default lokal di public/img/
                      e.currentTarget.onerror = null; // Menghindari infinite loop jika default-cat juga hilang
                      e.currentTarget.src = '/img/default-cat.jpg'; 
                    }}
                  />
                  <div className="catnm">{cat.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}