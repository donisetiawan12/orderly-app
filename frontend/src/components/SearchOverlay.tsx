'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchOverlay({ isOpen, onClose, searchTerm, setSearchTerm }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAllProducts() {
      if (!isOpen) return;
      try {
        const [res1, res2] = await Promise.all([
          fetch('http://${process.env.NEXT_PUBLIC_API_URL}/api/products?page=1'),
          fetch('http://${process.env.NEXT_PUBLIC_API_URL}/api/products?page=2')
        ]);
        const json1 = await res1.json();
        const json2 = await res2.json();

        const allProducts = [...(json1.data?.products || []), ...(json2.data?.products || [])];
        
        // Hapus duplikat
        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Gagal fetch search:", error);
      }
    }
    fetchAllProducts();
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!searchTerm) return [];
    return products
      .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 8); 
  }, [searchTerm, products]);

  const handleSelectProduct = (item: any) => {
    setSearchTerm(item.name); 
    onClose();

    setTimeout(() => {
      const menuSection = document.getElementById('menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div id="searchOv" className="open">
      <button type="button" className="sovclose" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      
      <div className="sovbox">
        <h4>Apa Yang Sedang Kamu Cari?</h4>
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
            <div className="sovcat" key={item.id} onClick={() => handleSelectProduct(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img 
                // PERBAIKAN: Menambahkan /uploads/products/ agar sesuai dengan struktur backend
                src={item.image ? `http://${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.image}` : '/img/default.jpg'} 
                alt={item.name} 
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px', marginRight: '15px' }}
                onError={(e: any) => { e.target.src = '/img/default.jpg'; }}
              />
              <span>{item.name}</span>
            </div>
          ))}
          
          {searchTerm && filtered.length === 0 && (
            <p className="text-center mt-3" style={{ color: '#888' }}>Tidak ada hasil untuk "{searchTerm}".</p>
          )}
        </div>
      </div>
    </div>
  );
}