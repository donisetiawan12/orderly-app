'use client';
import { useState } from 'react'; // Pastikan useState sudah ada di import
import Navbar from '../components/Navbar';
import SearchOverlay from '../components/SearchOverlay';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Categories from '../components/Categories'; 
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import ScriptLoader from '../components/ScriptLoader';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // TAMBAHKAN DUA BARIS INI:
  const [activeFilter, setActiveFilter] = useState('all'); 

  return (
    <>
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <Navbar onSearchOpen={() => setIsSearchOpen(true)} />
      
      <main>
        <Hero />
        <Marquee />
        
        {/* Sekarang activeFilter dan setActiveFilter sudah terdefinisi */}
        <Categories 
           activeFilter={activeFilter} 
           setActiveFilter={setActiveFilter} 
        />
        
        
        <Menu 
          searchTerm={searchTerm} // Pastikan ini variabel yang sama yang di-update oleh SearchOverlay
          activeFilter={activeFilter} 
        />
      </main>
      
      <Footer />
      <ScriptLoader />
    </>
  );
}