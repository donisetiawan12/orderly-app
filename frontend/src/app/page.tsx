'use client';

import { useState } from 'react';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
          setActiveFilter('all');

          setTimeout(() => {
            const menuSection =
              document.getElementById('menu-section');

            if (menuSection) {
              menuSection.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }, 100);
        }}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
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

      <Navbar
        onSearchOpen={() => setIsSearchOpen(true)}
        onLoginOpen={() => setShowLogin(true)}
      />

      <main>
        <Hero onSearchOpen={() => setIsSearchOpen(true)} 
          onLoginOpen={() => setShowLogin(true)} />

        <Marquee />

        <Categories
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        <Menu
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onOpenDetail={setSelectedProduct}
          onClearSearch={() => setSearchTerm('')}
        />

        <HowItWorks />

        <MenuDetailPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        <About />

        <Contact />
      </main>

      <Footer />
    </>
  );
}