'use client';
import { useState, useEffect } from 'react';

export default function MenuDetailPopup({ product, onClose }: any) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <div id="menuPop" className="open">
      <div className="mpbox">
        <button className="mpclose" onClick={onClose}><i className="fas fa-times"></i></button>
        <div className="mpimg">
            <img src={`http://localhost:5000/uploads/${product.image}`} alt={product.name} />
        </div>
        <div className="mpbody">
          <div id="mpCat">{product.category_id}</div>
          <div id="mpTitle" style={{fontSize: '24px', fontWeight: 'bold'}}>{product.name}</div>
          
                <div style={{fontSize: '.9rem', color: '#f39c12', marginBottom: '10px'}}>
                <i className="fas fa-star"></i> {Number(product.avg_rating).toFixed(1)} 
                <span style={{color: '#aaa'}}> ({product.total_reviews} ulasan)</span>
                </div>
                <div style={{fontSize: '.85rem', color: '#555'}}>
                Dijual oleh: <strong>{product.seller_name}</strong> di {product.location}
                </div>
          <div id="mpDesc">{product.description}</div>
          <div id="mpPrice" style={{fontSize: '20px', color: '#ff4757'}}>Rp {Number(product.price).toLocaleString()}</div>
          
          <div className="mpqty">
            <button className="mpqbtn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
            <span className="mpqnum">{qty}</span>
            <button className="mpqbtn" onClick={() => setQty(q => q + 1)}>+</button>
            <span style={{fontSize: '.82rem', color: '#aaa', marginLeft: '9px'}}>portion</span>
          </div>
          
          <button className="mpaddcart" onClick={() => alert(`Added ${qty} ${product.name} to cart!`)}>
            <i className="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}