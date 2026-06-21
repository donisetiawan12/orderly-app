'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
import Footer from '../seller/Footer';
import Swal from 'sweetalert2';

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  reply_comment?: string; 
  replied_at?: string;     
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
  const itemsPerPage = 6; 
  
  const [sellerId, setSellerId] = useState<number | null>(null);


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // 1. PROTEKSI LOGIN & AMBIL DATA SESSION
  useEffect(() => {
    const userSession = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userSession || !token) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userSession);
      if (parsedUser && parsedUser.id) {
        setSellerId(parsedUser.id); 
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Gagal membaca data user session:", error);
      router.push('/');
    }
  }, [router]);

  // 2. FETCH DATA ULASAN
  useEffect(() => {
    if (!sellerId) return; 

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://orderly.web.id/api/products/seller/reviews/${sellerId}`);
        
        if (res.ok) {
          const resData = await res.json();
          if (resData && resData.data) {
            setReviews(Array.isArray(resData.data) ? resData.data : []);
          } else if (Array.isArray(resData)) {
            setReviews(resData);
          } else {
            setReviews([]);
          }
        }
      } catch (error) {
        console.error("Gagal fetch ulasan bray:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sellerId]);

  // 🚀 LOGIC FUNGSI RE-TEMBAK API UNTUK KIRIM BALASAN SELLER
 const handleSendReply = async (reviewId: number, replyText: string) => {
  if (!replyText.trim()) {
    // Alert Keren kalau inputan kosong
    Swal.fire({
      icon: 'warning',
      title: 'Waduh...',
      text: 'Teks balasan toko gak boleh kosong!',
      confirmButtonColor: '#3b82f6',
    });
    return;
  }

  try {
    const res = await fetch(`http://orderly.web.id/api/products/seller/reviews/reply/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reply_comment: replyText })
    });

    const resJson = await res.json();

    if (res.ok) {
      // 🔥 POP-UP INVESTASI PREMIUM BERHASIL
      Swal.fire({
        icon: 'success',
        title: 'Berhasil! 🔥',
        text: 'Balasan ulasan toko Anda telah disimpan.',
        showConfirmButton: false,
        timer: 2000, // Hilang otomatis dalam 2 detik
        timerProgressBar: true,
        background: '#ffffff',
        iconColor: '#10b981',
      });
      
      // Update state lokal secara real-time biar ga usah dipaksa reload
      setReviews(prevReviews => 
        prevReviews.map(rev => 
          rev.review_id === reviewId 
            ? { ...rev, reply_comment: replyText } 
            : rev
        )
      );
    } else {
      // Alert Keren kalau gagal dari backend
      Swal.fire({
        icon: 'error',
        title: 'Aksi Ditolak!',
        text: resJson.message || 'Gagal mengirim balasan, cek hak akses toko.',
        confirmButtonColor: '#ef4444',
      });
    }
  } catch (error) {
    console.error("Error reply:", error);
    Swal.fire({
      icon: 'error',
      title: 'Koneksi Bermasalah',
      text: 'Terjadi kesalahan jaringan bray, coba lagi nanti.',
      confirmButtonColor: '#ef4444',
    });
  }
};

  const renderStars = (rating: number) => {
    const cleanRating = Math.round(Number(rating || 0));
    const finalRating = Math.max(0, Math.min(5, cleanRating)); 
    return '⭐'.repeat(finalRating) + '☆'.repeat(5 - finalRating);
  };

  // ================= 📊 RACIKAN HITUNG LOGIC 4 CARDS REAL-TIME =================
  const totalReviews = reviews.length;
  
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, rev) => sum + Number(rev.rating || 0), 0) / totalReviews).toFixed(1) 
    : "0.0";

  const totalBintangLima = reviews.filter(rev => Math.round(Number(rev.rating)) === 5).length;
  
  const positiveReviews = reviews.filter(rev => Number(rev.rating) >= 4).length;
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
      <div className="absolute w-full bg-blue-500 min-h-75"></div>

       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col justify-between">
        <div>
         <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="px-6 py-6 mx-auto w-full max-w-full block box-border overflow-x-hidden">
            
            {/* ================= BARIS 1: 4 CARDS STATISTIK KILAS ULASAN ================= */}
            <div className="flex flex-wrap -mx-3 mb-6">
              
              {/* Card 1: Total Ulasan */}
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

              {/* Card 2: Rata-Rata Rating */}
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

              {/* Card 3: Bintang 5 */}
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

              {/* Card 4: Persentase Kepuasan */}
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
            
            {/* ================= CONTAINER PUTIH UTAMA LIST REVIEW ================= */}
            <div className="w-full max-w-full bg-white dark:bg-slate-850 rounded-2xl shadow-xl p-6 border-0 block overflow-hidden text-left">
              <div className="mb-6">
                <h6 className="dark:text-white font-bold text-base text-slate-800">💬 Ulasan dan Feedback Pembeli</h6>
                <p className="text-xs text-slate-400 font-medium">Dengarkan apa kata pelanggan tentang kualitas produk Kamu.</p>
              </div>

              <div className="flex flex-wrap -mx-3">
                {reviews.length > 0 ? (
                  reviews
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((rev) => {
                      // State lokal penampung ketikan text per review item id
                      let currentInputValue = "";

                      return (
                        <div key={rev.review_id} className="w-full max-w-full px-3 min-w-0 sm:w-1/2 sm:flex-none xl:w-1/3 xl:flex-none mb-6">
                          <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-md rounded-2xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <div className="flex flex-row -mx-3 items-start">
                              
                              {/* Kiri: Deskripsi Teks */}
                              <div className="flex-none w-2/3 max-w-full px-3">
                                <div>
                                  <p className="mb-0 font-sans text-[11px] font-bold uppercase text-slate-400 truncate">
                                    {rev.buyer_name || 'Pembeli Misterius'} <span className="text-[9px] font-normal lowercase opacity-80">• {rev.created_at ? new Date(rev.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : ''}</span>
                                  </p>
                                  
                                  <h5 className="mb-0 font-bold text-sm text-amber-500 tracking-wide mt-1">
                                    {renderStars(rev.rating)}
                                  </h5>
                                  
                                  <p className="mb-1 dark:text-white text-[11px] font-semibold text-emerald-500 truncate">
                                    {rev.product_name}
                                  </p>
                                  
                                  <p className="mb-2 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-none break-words whitespace-normal line-clamp-2 italic leading-snug">
                                    "{rev.comment || <span className="text-slate-300">Hanya memberikan rating.</span>}"
                                  </p>

                                 {/* ================= AREA INPUT ATAU HASIL BALASAN SELLER (VERSI FIXED RAPI BRAY) ================= */}
<div className="mt-3 pt-3 border-t border-dashed border-slate-100 dark:border-slate-800 w-full block text-left">
  {rev.reply_comment ? (
    // JIKA SUDAH DIBALAS
    <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-blue-950/20 dark:to-transparent p-3 rounded-xl border border-blue-100/60 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-1.5 mb-1">
        <i className="fa fa-reply text-[10px] text-blue-500"></i>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0">Balasan Anda</p>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium break-words italic leading-relaxed mb-0 pl-1">
        "{rev.reply_comment}"
      </p>
    </div>
  ) : (
    // JIKA BELUM DIBALAS (FIXED LAYOUT GRID/FLEX)
    <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 block box-border">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-0.5 flex items-center gap-1">
        <span>✏️ Belum dibalas</span>
      </p>
      
      {/* Container utama input + tombol dipaksa items-center agar sejajar lurus */}
      <div className="flex flex-row items-center justify-between gap-2 w-full min-w-0">
        <input 
          type="text" 
          placeholder="Tulis pesan balasan toko..." 
          onChange={(e) => { currentInputValue = e.target.value; }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendReply(rev.review_id, currentInputValue);
            }
          }}
          className="flex-1 w-full bg-white dark:bg-slate-800 text-xs px-3 py-2 h-9 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 dark:text-white placeholder:text-slate-400 transition-all m-0 min-w-0"
        />
       <button 
  onClick={() => handleSendReply(rev.review_id, currentInputValue)}
  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600  active:scale-95 text-white text-xs font-bold px-5 h-9 rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all duration-200 flex-shrink-0 flex items-center justify-center gap-2 border-0 m-0 cursor-pointer self-center tracking-wide"
  style={{ minHeight: '36px' }} 
>
  <span>Kirim</span>
  <i className="fa fa-paper-plane text-[10px] opacity-90 relative top-[0.5px]"></i>
</button>
      </div>
    </div>
  )}
</div>

                                </div>
                              </div>

                              {/* Kanan: Gambar Bulat */}
                              <div className="px-3 text-right basis-1/3 flex justify-end items-start flex-shrink-0">
                                <div className="inline-block w-12 h-12 rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500 flex items-center justify-center p-1.5 shadow-sm">
                                  <div className="w-9 h-9 rounded-circle overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                    <img 
                                      src={rev.product_image ? `http://orderly.web.id/uploads/products/${rev.product_image}` : 'https://placehold.co/100?text=No+Img'} 
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
                      );
                    })
                ) : (
                  <div className="w-full p-8 text-center text-sm text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-gray-200 mx-3">
                    📭 Belum ada ulasan masuk untuk produk Anda bray.
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
                      className={`px-3 py-1 text-[12px] font-bold rounded-lg border border-slate-200 transition-all ${
                        currentPage === 1 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ◀ Prev
                    </button>
                    <button
                      disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
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

        <Footer />
      </main>
    </>
  );
}