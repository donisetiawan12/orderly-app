'use client';
import { useState } from 'react';

export default function MenuDetailPopup({ product, onClose }: any) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <div id="menuPop" className="open">
      <div className="mpbox">
        <button className="mpclose" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        {/* BAGIAN GAMBAR DIPERBAIKI DI SINI */}
        <div className="mpimg">
            <img 
              // Tambahkan 'products/' agar sesuai dengan struktur backend kamu
              src={product.image ? `http://localhost:5000/uploads/products/${product.image}` : '/img/default.jpg'} 
              alt={product.name} 
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/img/default.jpg'; }}
            />
        </div>
        
        <div className="mpbody">
          {/* Kamu bisa menambahkan logika untuk menampilkan nama kategori daripada hanya ID */}
          <div id="mpCat" style={{ fontSize: '.8rem', color: '#ff4757', textTransform: 'uppercase' }}>
            Category ID: {product.category_id}
          </div>
          
          <div id="mpTitle" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {product.name}
          </div>
          
          <div style={{ fontSize: '.9rem', color: '#f39c12', marginBottom: '10px' }}>
            <i className="fas fa-star"></i> {Number(product.avg_rating || 0).toFixed(1)} 
            <span style={{ color: '#aaa' }}> ({product.total_reviews || 0} ulasan)</span>
          </div>
          
          <div style={{ fontSize: '.85rem', color: '#555', marginBottom: '15px' }}>
            Dijual oleh: <strong>{product.seller_name || 'Merchant'}</strong> di {product.location || 'Kampus'}
          </div>
          
          <div id="mpDesc" style={{ fontSize: '0.95rem', color: '#666', marginBottom: '20px' }}>
            {product.description}
          </div>
          
          <div id="mpPrice" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4757', marginBottom: '20px' }}>
            Rp {Number(product.price).toLocaleString()}
          </div>
          
          <div className="mpqty" style={{ marginBottom: '20px' }}>
            <button className="mpqbtn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
            <span className="mpqnum" style={{ margin: '0 15px', fontWeight: 'bold' }}>{qty}</span>
            <button className="mpqbtn" onClick={() => setQty(q => q + 1)}>+</button>
            <span style={{ fontSize: '.82rem', color: '#aaa', marginLeft: '9px' }}>portion</span>
          </div>
          
          <button className="mpaddcart" onClick={() => alert(`Added ${qty} ${product.name} to cart!`)}>
            <i className="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}