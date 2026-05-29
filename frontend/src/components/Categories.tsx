'use client';
import { useEffect, useState } from 'react';

export default function Categories({ activeFilter, setActiveFilter }: any) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const json = await response.json();
        if (json && json.data) {
          const allOption = { id: 'all', name: 'All Items' };
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
          <span className="slbl">Solusi Cepat Mahasiswa</span>
          <h2 className="stitle">Jelajahi <span>Kategori</span> Pilihan</h2>
          <div className="sline mx-auto mb-3"></div>
          <p className="sdesc mx-auto" style={{ maxWidth: '480px' }}>
            Biar semangat belajar terus terjaga, manfaatin kemudahan akses ke berbagai kebutuhan lokal di sekitar kampus, tinggal pilih kategori dan semua langsung tersedia.
          </p>
        </div>
        
        <div className="row g-3 justify-content-center">
          {categories.map((cat) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={cat.id}>
              <div 
                  className={`catcard ${String(activeFilter) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => setActiveFilter(String(cat.id))} // Pastikan jadi String
                >
                {/* Pastikan file ini ada di public/img/category/1.jpg sampai 6.jpg */}
                <img 
                  className="catimg" 
                  src={`/img/category/${cat.id === 'all' ? 1 : cat.id}.jpg`} 
                  alt={cat.name}
                    // Ganti bagian onError menjadi begini:
                    onError={(e) => { 
                    e.currentTarget.style.display = 'none'; // Sembunyikan gambarnya kalau error
                    // Atau ganti ke gambar yang sudah pasti ada di public/img/logo.png (misal)
                    // e.currentTarget.src = '/img/logo.png'; 
                    }}                />
                <div className="catnm">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}