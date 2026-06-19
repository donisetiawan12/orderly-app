'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Untuk redirect halaman

import Navbar from '../components/Navbar';
import SearchOverlay from '../components/SearchOverlay';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Footer from '../components/Footer';
import Categories from '../components/Categories';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import Menu from '../components/Menu';
import Contact from '../components/Contact';
import MenuDetailPopup from '../components/MenuDetailPopup';

import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

export default function Home() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State User Global
  const [user, setUser] = useState<any>(null);
  const [logoutMessage, setLogoutMessage] = useState(false);

  // Cek session user saat halaman pertama kali dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);

    setLogoutMessage(true);

    setTimeout(() => {
      setLogoutMessage(false);
    }, 3000);

    router.push('/');
  };

  return (
    <>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={(val: string) => {
          setSearchTerm(val);
          setActiveFilter('all');
          setTimeout(() => {
            // ✅ DISINKRONKAN: Menuju ke target id baru agar konsisten
            const menuSection = document.getElementById('main-shop-section');
            if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        setUser={setUser} // Oper setUser ke modal login
        onOpenRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      {/* REGISTER MODAL */}
      <RegisterModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
        onOpenLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      {/* NAVBAR */}
      <Navbar
        user={user} // Oper data user ke navbar
        onLogout={handleLogout}
        onSearchOpen={() => setIsSearchOpen(true)}
        onLoginOpen={() => setShowLogin(true)}
      />

      <main>
        {/* HERO (Popup mini dengan fitur auto-scroll internal bawaan bray) */}
        <Hero
          user={user}
          logoutMessage={logoutMessage}
          onSearchOpen={() => setIsSearchOpen(true)}
          onLoginOpen={() => setShowLogin(true)}
        />

        <Marquee />

        {/* 🔥 KUNCINYA DI SINI BRAY! 
          Kita bungkus Categories dan Menu ke dalam satu div dengan id="main-shop-section"
          Biar pas 1 detik setelah landing page ke-load, Hero otomatis nembak scroll-nya tepat ke sini!
        */}
        <div id="main-shop-section" style={{ scrollMarginTop: '20px' }}>
          <Categories activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          <Menu
            searchTerm={searchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onOpenDetail={setSelectedProduct}
            onClearSearch={() => setSearchTerm('')}
          />
        </div>

        <HowItWorks />

        <MenuDetailPopup product={selectedProduct} onClose={() => setSelectedProduct(null)} />

        <About />

        <Contact />
      </main>

      <Footer />
    </>
  );
}