'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchOverlay from '../components/SearchOverlay'; // Pastikan nama folder tanpa spasi
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Footer from '../components/Footer';
import Categories from '../components/Categories'; 
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import Menu from '../components/Menu';
import Contact from '../components/Contact';
import MenuDetailPopup from '../components/MenuDetailPopup';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null); 

  return (
    <>
     
        <SearchOverlay 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)}
          searchTerm={searchTerm}
          setSearchTerm={(val: string) => {
            setSearchTerm(val);
            setActiveFilter('all'); // PENTING: Reset ke 'all' saat mencari
            
            // Auto-scroll ke section menu
            setTimeout(() => {
              const menuSection = document.getElementById('menu-section');
              if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      
      <Navbar onSearchOpen={() => setIsSearchOpen(true)} />
      
      <main>
        <Hero />
        <Marquee />
        
        <Categories 
           activeFilter={activeFilter} 
           setActiveFilter={setActiveFilter} 
        />
       <Menu 
          searchTerm={searchTerm} 
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter} // <--- Tambahkan baris ini!
          onOpenDetail={setSelectedProduct}
          onClearSearch={() => setSearchTerm('')}
        />
        
        <HowItWorks />  {/* <--- PASTIIN BAGIAN INI ADA! */}
          
        <MenuDetailPopup 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
        <About /> {/* Pastikan About di sini */}
        <Contact /> {/* Pastikan Contact di sini */}
      </main>
      
      <Footer />
    </>
  );
}