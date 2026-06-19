'use client';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css'; // 👈 Next.js otomatis naruh ini di paling bawah untuk override stylesheet di atasnya!

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 1. KUNCI UTAMA ANTI-ZOOM RAKSASA */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* 2. SEMUA LINK CSS BAWAAN TEMPLATE (Ditaruh di head biar di-load duluan) */}
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/aos.css" rel="stylesheet" />
        <link href="/css/swiper-bundle.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/css/all.min.css" />
        <link rel="stylesheet" href="/css/magnific-popup.css" />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body className={jakarta.className}>
        {children}
      </body>
    </html>
  );
}