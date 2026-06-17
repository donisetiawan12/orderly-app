'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 🚀 PATH IMPORT SINKRON DENGAN FOLDER SELLER LU BRO
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
import Footer from '../seller/Footer';

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  created_at: string;
  product_name: string;
  product_image: string;
  buyer_name: string;
}

export default function SellerReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Maksimal 6 ulasan per halaman demi anti-melar
  
  // 🚀 SEKARANG SUDAH DINAMIS OTOMATIS, GAK DI-HARDCODE MANUAL LAGI BRAY!
  const [sellerId, setSellerId] = useState<number | null>(null);

  useEffect(() => {
    // 🔒 PROTEKSI LOGIN & AMBIL DATA SESSION
    const userSession = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userSession || !token) {
      router.push('/');
      return;
    }

    // 📥 PARSE STRING JSON BIAR JADI OBJEK, TERUS AMBIL ID SELLER-NYA
    try {
      const parsedUser = JSON.parse(userSession);
      if (parsedUser && parsedUser.id) {
        setSellerId(parsedUser.id); // 🔥 ID otomatis terisi sesuai id user yang login bray
      } else {
        // Jika data id tidak valid, tendang ke halaman utama
        router.push('/');
      }
    } catch (error) {
      console.error("Gagal membaca data user session:", error);
      router.push('/');
    }
  }, [router]);

  // 📥 FETCH DATA ULASAN (Hanya berjalan jika sellerId sudah berhasil didapatkan)
  useEffect(() => {
    if (!sellerId) return; // Tunggu sampai sellerId kelar diambil dari localStorage

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/products/seller/reviews/${sellerId}`);
        if (res.ok) {
          const resData = await res.json();
          // Menyesuaikan format sendResponse controller baru lu: { status, message, data: [...] }
          setReviews(resData.data || []);
        }
      } catch (error) {
        console.error("Gagal fetch ulasan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sellerId]); // 👈 Memicu fetch ulang secara otomatis begitu sellerId bernilai angka

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // ================= 📊 RACIKAN HITUNG LOGIC 4 CARDS REAL-TIME =================
  const totalReviews = reviews.length;
  
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";

  const totalBintangLima = reviews.filter(rev => rev.rating === 5).length;
  
  // Card 4: Persentase ulasan positif (Rating 4 dan 5)
  const positiveReviews = reviews.filter(rev => rev.rating >= 4).length;
  const satisfactionRate = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center font-sans font-bold text-slate-600 bg-slate-100">
        🔄 Sinkronisasi Data Ulasan...
      </div>
    );
  }

  return (
    <>
      {/* Background Khas Argon */}
      <div className="absolute w-full bg-blue-500 min-h-75"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main wrapper */}
      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col justify-between">
        
        <div>
          {/* Navbar */}
          <Navbar />

          {/* Content area */}
          <div className="px-6 py-6 mx-auto w-full max-w-full block box-border overflow-x-hidden">
            
            {/* ================= BARIS 1: 4 CARDS STATISTIK KILAS ULASAN (SIMETRIS) ================= */}
            <div className="flex flex-wrap -mx-3 mb-6">
              
              {/* Card 1: Total Ulasan Masuk */}
              <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Total Ulasan</p>
                          <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                            {totalReviews} Feedback
                          </h5>
                          <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                            Semua ulasan dari <span className="font-bold text-emerald-500">pelanggan</span> Anda
                          </p>
                        </div>
                      </div>
                     <div className="px-3 text-right basis-1/3">
                       <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
                            <i className="fa fa-comment text-lg relative top-3.5 text-white"></i>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Rata-Rata Rating Toko */}
              <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Rata-rata Rating</p>
                          <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                            ⭐ {avgRating} / 5.0
                          </h5>
                          <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                            Reputasi skor <span className="font-bold text-emerald-500">kualitas produk</span> Anda
                          </p>
                        </div>
                      </div>
                    <div className="px-3 text-right basis-1/3">
                        <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-yellow-500">
                            <i className="fa fa-star text-lg relative top-3.5 text-white"></i>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Jumlah Ulasan Bintang 5 */}
              <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Kepuasan Maksimal</p>
                          <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                            {totalBintangLima} Ulasan
                          </h5>
                          <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                            Mendapat ulasan <span className="font-bold text-emerald-500">Bintang 5</span> sempurna
                          </p>
                        </div>
                      </div>
                      <div className="px-3 text-right basis-1/3">
                        <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400">
                            <i className="fa fa-smile text-lg relative top-3.5 text-white"></i>
                            </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Persentase Kepuasan Pembeli */}
              <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Tingkat Kepuasan</p>
                          <h5 className={`mb-2 font-bold text-lg ${satisfactionRate >= 80 ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                            {satisfactionRate}% Positif
                          </h5>
                          <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                            {satisfactionRate >= 75 ? (
                              <span>Toko Anda berstatus <span className="font-bold text-emerald-500">Sangat Baik</span></span>
                            ) : (
                              <span>Perlu tingkatkan <span className="font-bold text-amber-500">kualitas produk</span></span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 text-right basis-1/3">
                        <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-red-600 to-orange-600">
                            <i className="fa fa-thumbs-up text-lg relative top-3.5 text-white"></i>
                            </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* =========================================================================
                🎯 CONTAINER PUTIH UTAMA: TETEP FULL SEISI HALAMAN (w-full)
            ========================================================================= */}
            <div className="w-full max-w-full bg-white dark:bg-slate-850 rounded-2xl shadow-xl p-6 border-0 block overflow-hidden text-left">
            
              {/* Header Title */}
              <div className="mb-6">
                  <h6 className="dark:text-white font-bold text-base text-slate-800">💬 Ulasan dan Feedback Pembeli</h6>
                  <p className="text-xs text-slate-400 font-medium">Dengarkan apa kata pelanggan tentang kualitas produk Kamu.</p>
              </div>

              {/* =========================================================================
                  📦 PEMBUNGKUS UTAMA: PAKAI FLEX-WRAP (Sama persis kayak barisan boks statistik lu)
              ========================================================================= */}
              <div className="flex flex-wrap -mx-3">
                {reviews.length > 0 ? (
                  reviews
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((rev) => (
                    
                    /* KUNCINYA DI SINI BRAY! Mengunci ukuran boks biar pas terbagi 3 kolom ke kanan (xl:w-1/3) */
                    <div 
                        key={rev.review_id} 
                        className="w-full max-w-full px-3 min-w-0 sm:w-1/2 sm:flex-none xl:w-1/3 xl:flex-none mb-6"
                    >
                        {/* Box Card yang ukurannya compact / gak bakalan melar panjang lagi */}
                        <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-md rounded-2xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <div className="flex flex-row -mx-3 items-start">
                              
                              {/* Sektor Kiri (Lebar 2/3): Teks Data Ulasan */}
                              <div className="flex-none w-2/3 max-w-full px-3">
                                <div>
                                    {/* Nama Pembeli & Tanggal */}
                                    <p className="mb-0 font-sans text-[11px] font-bold uppercase text-slate-400 truncate">
                                    {rev.buyer_name} <span className="text-[9px] font-normal lowercase opacity-80">• {new Date(rev.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                    </p>
                                    
                                    {/* Rating Bintang */}
                                    <h5 className="mb-0 font-bold text-sm text-amber-500 tracking-wide mt-1">
                                    {renderStars(rev.rating)}
                                    </h5>
                                    
                                    {/* Nama Produk */}
                                    <p className="mb-1 dark:text-white text-[11px] font-semibold text-emerald-500 truncate">
                                    {rev.product_name}
                                    </p>
                                    
                                    {/* Isi Komentar (Kunci line-clamp biar tingginya sama rata) */}
                                    <p className="mb-0 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-none break-words whitespace-normal line-clamp-2 italic leading-snug">
                                    "{rev.comment || <span className="text-slate-300">Hanya memberikan rating.</span>}"
                                    </p>
                                </div>
                              </div>

                              {/* Sektor Kanan (Lebar 1/3): Bulatan Foto Produk */}
                              <div className="px-3 text-right basis-1/3 flex justify-end items-start flex-shrink-0">
                                <div className="inline-block w-12 h-12 rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500 flex items-center justify-center p-1.5 shadow-sm">
                                    <div className="w-9 h-9 rounded-circle overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={rev.product_image ? `http://${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${rev.product_image}` : 'https://placehold.co/100?text=No+Img'} 
                                        alt={rev.product_name}
                                        className="w-full h-full object-cover aspect-square"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=No+Img'; }}
                                    />
                                    </div>
                                </div>
                              </div>

                          </div>
                        </div>
                    </div>
                    ))
                ) : (
                  <div className="w-full p-8 text-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-gray-200 mx-3">
                      📭 Belum ada ulasan masuk untuk produk Anda.
                  </div>
                )}
              </div>

              {/* ================= TOMBOL NAVIGASI PAGINATION ================= */}
              {reviews.length > itemsPerPage && (
                  <div className="w-full flex justify-between items-center mt-2 border-t border-gray-100 pt-4">
                    <span className="text-[12px] text-slate-500 font-medium">
                        Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, reviews.length)} - {Math.min(currentPage * itemsPerPage, reviews.length)} dari {reviews.length} Ulasan
                    </span>
                    
                    <div className="flex gap-1.5">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
                                color: currentPage === 1 ? '#cbd5e1' : '#334155',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                            className={`px-3 py-1 text-[12px] font-bold rounded-lg border border-slate-200 transition-all ${
                                currentPage === 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                            >
                            ◀ Prev
                            </button>
                        <button
                            disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0',
                                backgroundColor: currentPage === Math.ceil(reviews.length / itemsPerPage) ? '#f8fafc' : '#ffffff',
                                color: currentPage === Math.ceil(reviews.length / itemsPerPage) ? '#cbd5e1' : '#334155',
                                cursor: currentPage === Math.ceil(reviews.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                            }}
                            className={`px-3 py-1 text-[12px] font-bold rounded-lg border border-slate-200 transition-all ${
                                currentPage === Math.ceil(reviews.length / itemsPerPage) ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                            >
                            Next ▶
                            </button>
                    </div>
                  </div>
              )}

            </div>

          </div>
        </div>

        {/* Footer */}
        <Footer />
         
      </main>
    </>
  );
}