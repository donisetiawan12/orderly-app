'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // State User Global
  const [user, setUser] = useState<any>(null);
  const [logoutMessage, setLogoutMessage] = useState<boolean>(false);

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
    <div id="landing-page-wrapper" style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
      
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={(val: string) => {
          setSearchTerm(val);
          setActiveFilter('all');
          setTimeout(() => {
            const menuSection = document.getElementById('main-shop-section');
            if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        setUser={setUser}
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
        user={user}
        onLogout={handleLogout}
        onSearchOpen={() => setIsSearchOpen(true)}
        onLoginOpen={() => setShowLogin(true)}
      />

      <main>
        {/* HERO */}
        <Hero
          user={user}
          logoutMessage={logoutMessage}
          onSearchOpen={() => setIsSearchOpen(true)}
          onLoginOpen={() => setShowLogin(true)}
        />

        <Marquee />

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
    </div>
  );
}