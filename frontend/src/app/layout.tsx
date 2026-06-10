'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Plus_Jakarta_Sans } from 'next/font/google';


import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
});
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* SEMUA LINK CSS HARUS ADA DI SINI */}
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