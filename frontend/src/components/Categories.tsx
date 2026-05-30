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
          {categories.map((cat) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={cat.id}>
              <div 
                className={`catcard ${String(activeFilter) === String(cat.id) ? 'active' : ''}`}
                onClick={() => setActiveFilter(String(cat.id))}
                style={{ cursor: 'pointer' }}
              >
                {/* LOGIKA GAMBAR: */}
                {/* 1. Jika cat.id adalah 'all', pakai gambar default */}
                {/* 2. Jika ada cat.image, ambil dari folder /uploads/categories/ */}
                <img 
                  className="catimg" 
                  src={cat.id === 'all' 
                        ? '/img/all-icon.jpg' 
                        : (cat.image ? `http://localhost:5000/uploads/categories/${cat.image}` : '/img/default-cat.jpg')
                  } 
                  alt={cat.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }}
                  onError={(e) => { e.currentTarget.src = '/img/default-cat.jpg'; }}
                />
                <div className="catnm">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}