'use client';
import { useEffect } from 'react';

export default function ScriptLoader() {
  useEffect(() => {
    // 1. Load library yang aman duluan
    const loadScript = (src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Penting untuk urutan
      document.body.appendChild(script);
    };

    // 2. Load dalam urutan yang benar
    loadScript('/js/jquery-3.7.1.min.js');
    loadScript('/js/bootstrap.bundle.min.js');
    loadScript('/js/aos.js');
    loadScript('/js/swiper-bundle.min.js');
    loadScript('/js/jquery.magnific-popup.min.js');

    // 3. Load main.js PALING TERAKHIR setelah semuanya siap
   // Ganti bagian setTimeout di ScriptLoader.tsx jadi ini:
setTimeout(() => {
  const script = document.createElement('script');
  script.src = '/js/main.js';
  script.async = true; 
  document.body.appendChild(script);
}, 1000); // Tunggu 1 detik agar React selesai render semua komponen
    
  }, []);

  return null;
}