'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// 🚀 PATH IMPORT SINKRON DENGAN FOLDER SELLER LU BRO
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
import Footer from '../seller/Footer'; 

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  
  // State Modal & Indikator User Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  // State Form Rekening & File QRIS bray
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  

  // 📈 STATE BARU: STATISTIK PENDAPATAN LANGSUNG (OMZET)
  const [totalOmzet, setTotalOmzet] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  // --- STATE UNTUK TOAST NOTIFIKASI SAKTI ---
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  // --- FUNGSI MANGGIL TOAST (AUTO ILANG 3 DETIK) ---
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- Fungsi ambil ID Seller dari LocalStorage ---
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.id || 1;
      }
    }
    return 1;
  };

  // --- 🔄 AMBIL DATA DARI TABEL BARU ---
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      router.push('/');
      return;
    }

    const loadPaymentDataBaru = async () => {
      try {
        const rawId = getUserId();
        const cleanUserId = String(rawId).replace(/\D/g, ''); 
        const targetUrl = `http://orderly.web.id/api/payments/get-payment?userId=${cleanUserId}`;
        
        console.log("🚀 Next.js lagi nembak ke URL ini bray:", targetUrl);

        const res = await axios.get(targetUrl);
        
        if (res.data && res.data.data) {
          const payment = res.data.data;
          
          setBankName(payment.bank_name || '');
          setAccountName(payment.account_name || '');
          setAccountNumber(payment.account_number || '');
          
          // 🚀 DATA RINGKASAN OMZET LANGSUNG DARI TRANSAKSI TABEL LU BRAY
          setTotalOmzet(Number(payment.total_omzet) || 0);
          setTotalSalesCount(Number(payment.total_sales) || 0);
          
          // KUNCI PAKE DATA DARI DATABASE ASLI BRAY!
          if (payment.bank_name && payment.account_number) {
            setIsNewUser(false);
          } else {
            setIsNewUser(true);
          }

          if (payment.qris_image) {
            setPreviewUrl(`http://orderly.web.id/uploads/payments/${payment.qris_image}`);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data dari tabel baru bray:', err);
        showToast('Gagal memuat data rekening otomatis bray!', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentDataBaru();
  }, [router]);

  // Handler pas milih gambar QRIS (Preview lokal sebelum di-upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- Fungsi Kirim Data Rekening ---
  const handleSaveBank = async () => {
    if (!bankName || !accountName || !accountNumber) {
      return showToast('Isi semua data rekeningnya dulu bray, jangan dikosongin!', 'error');
    }

    setBtnLoading(true);
    try {
      const res = await axios.post('http://orderly.web.id/api/payments/save-bank', {
        user_id: getUserId(),
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber
      });
      if (res.data.success) {
        setIsNewUser(false); // Kunci form jadi read-only bray
        showToast('DATA REKENING BERHASIL DISIMPAN! 🔥', 'success');
      }
    } catch (err) {
      showToast('Gagal simpan data bank bray! Cek koneksi backend.', 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  // --- Fungsi Kirim File QRIS ---
  const handleUploadQRIS = async () => {
    if (!selectedFile) return showToast('Pilih foto QRIS-nya terlebih dahulu baru klik upload!', 'error');

    const formData = new FormData();
    formData.append('qris', selectedFile);
    formData.append('user_id', getUserId().toString());

    setBtnLoading(true);
    try {
      const res = await axios.post('http://orderly.web.id/api/payments/upload-qris', formData);
      
      if (res.data.success) {
        showToast('QRIS TOKO BERHASIL DIUPLOAD ABANGKUH! 🚀', 'success');
        setPreviewUrl(`http://orderly.web.id/uploads/payments/${res.data.filename}`);
      }
    } catch (err) {
      showToast('Gagal upload QRIS bray! Cek terminal backend lu.', 'error');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center text-white font-bold bg-blue-500">
        Loading Payment System...
      </div>
    );
  }

  return (
    <>
      {/* Background Biru Khas Argon */}
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 -z-10"></div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main wrapper */}
      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col justify-between">
        
        <div>
          {/* Navbar */}
           <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          {/* Content area */}
          <div className="px-6 py-6 mx-auto w-full">
            
            {/* 💰 BARIS ATAS: STATISTIK PENDAPATAN TOKO (COCOK BUAT LANGSUNG REKENING) */}
            <div className="flex flex-wrap -mx-3 mb-6">
              {/* Card Total Pendapatan Langsung */}
              <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:w-1/2 xl:mb-0">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-slate-400">Total Pendapatan Toko (Omzet)</p>
                          <h5 className="mb-0 font-bold text-slate-700">
                            Rp {totalOmzet.toLocaleString('id-ID')}
                          </h5>
                        </div>
                      </div>
                      <div className="px-3 text-right basis-1/3">
                        <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400">
                          <i className="fa fa-money-bill-wave text-lg relative top-3.5 text-white"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Total Transaksi Sukses */}
              <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/2">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border">
                  <div className="flex-auto p-4">
                    <div className="flex flex-row -mx-3">
                      <div className="flex-none w-2/3 max-w-full px-3">
                        <div>
                          <p className="mb-0 font-sans text-sm font-semibold leading-normal uppercase text-slate-400">Pesanan Berhasil / Selesai</p>
                          <h5 className="mb-0 font-bold text-slate-700">
                            {totalSalesCount} Pesanan
                          </h5>
                        </div>
                      </div>
                      <div className="px-3 text-right basis-1/3">
                        <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-cyan-400">
                          <i className="fa fa-shopping-basket text-lg relative top-3.5 text-white"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 BARIS BAWAH: FORM INPUT REKENING & UPLOAD QRIS */}
            <div className="flex flex-wrap -mx-3">
              
              {/* 💳 SEKSI KIRI: TAMBAH / UPDATE REKENING BANK */}
              <div className="w-full lg:w-7/12 px-3 mb-6 lg:mb-0">
                <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border p-6">
                  
                  {/* HEADER SECTION */}
                  <div className="flex justify-between items-center border-b border-solid border-slate-100 pb-4 mb-4">
                    <div>
                      <h5 className="font-bold text-slate-700 mb-0">
                        <i className="fa fa-university text-blue-500 mr-2"></i> Pengaturan Rekening Toko
                      </h5>
                      <p className="text-xs text-slate-400 mb-0">
                        {isNewUser 
                          ? "Silakan isi data rekening baru tokomu di bawah bray." 
                          : "Data pencairan dana utama tokomu bray."}
                      </p>
                    </div>
                    
                    {/* 🔧 TOMBOL EDIT UTAMA */}
                    {!isNewUser ? (
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          borderRadius: '6px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        <i className="fa fa-pencil mr-1" style={{ color: '#ffffff' }}></i> Edit Rekening
                      </button>
                    ) : null}
                  </div>
                  
                  {/* BODY SECTION */}
                  <div className="flex-auto">
                    {/* 1. NAMA BANK / E-WALLET */}
                    <div className="mb-4">
                      <label className="text-sm font-bold text-slate-600 mb-2 block">Nama Bank / E-Wallet</label>
                      {isNewUser ? (
                        <input 
                          type="text" 
                          placeholder="Contoh: BCA, Mandiri, Dana, GoPay"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                        />
                      ) : (
                        <div className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium select-none">
                          {bankName || <span className="text-slate-400 italic">Belum diatur bray</span>}
                        </div>
                      )}
                    </div>

                    {/* 2. NAMA PEMILIK REKENING */}
                    <div className="mb-4">
                      <label className="text-sm font-bold text-slate-600 mb-2 block">Nama Pemilik Rekening</label>
                      {isNewUser ? (
                        <input 
                          type="text" 
                          placeholder="Contoh: Asep Katsu"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                        />
                      ) : (
                        <div className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium select-none">
                          {accountName || <span className="text-slate-400 italic">Belum diatur bray</span>}
                        </div>
                      )}
                    </div>

                    {/* 3. NOMOR REKENING / NO. HP */}
                    <div className="mb-6">
                      <label className="text-sm font-bold text-slate-600 mb-2 block">Nomor Rekening / No. HP</label>
                      {isNewUser ? (
                        <input 
                          type="text" 
                          placeholder="Contoh: 0123456789 / 0812xxx"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800"
                        />
                      ) : (
                        <div className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium select-none">
                          {accountNumber || <span className="text-slate-400 italic">Belum diatur bray</span>}
                        </div>
                      )}
                    </div>

                    {/* TOMBOL SIMPAN UTAMA */}
                    {isNewUser ? (
                      <button
                        onClick={async () => {
                          await handleSaveBank();
                        }}
                        disabled={btnLoading}
                        style={{
                          width: '100%', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase',
                          borderRadius: '8px', border: 'none', backgroundColor: btnLoading ? '#94a3b8' : '#2563eb', color: '#ffffff',
                          cursor: btnLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {btnLoading ? 'Menyimpan...' : 'Simpan Rekening Baru'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* 🚀 MODAL POP-UP EDIT REKENING */}
              {isModalOpen && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 9999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '16px'
                }}>
                  <div 
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      position: 'fixed', inset: 0, 
                      backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                      backdropFilter: 'blur(4px)'
                    }}
                  ></div>
                  
                  <div style={{
                    position: 'relative', width: '100%', maxWidth: '440px',
                    backgroundColor: '#ffffff', borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    zIndex: 10000, padding: '24px', display: 'block'
                  }}>
                    
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px'
                    }}>
                      <h5 style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155', margin: 0 }}>
                        <i className="fa fa-university mr-2" style={{ color: '#3b82f6' }}></i> Ubah Data Rekening
                      </h5>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Nama Bank / E-Wallet</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: BCA, Mandiri, Dana, GoPay"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', backgroundColor: '#ffffff' }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Nama Pemilik Rekening</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: Asep Katsu"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', backgroundColor: '#ffffff' }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Nomor Rekening / No. HP</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: 0123456789 / 0812xxx"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', backgroundColor: '#ffffff' }}
                        />
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px'
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        style={{
                          padding: '10px 20px', fontSize: '13px', fontWeight: 'bold',
                          textTransform: 'uppercase',
                          color: '#ffffff', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px',
                          cursor: 'pointer', display: 'inline-block'
                        }}
                      >
                        <i className="fa fa-ban mr-1"></i> Batal
                      </button>
                      
                      <button
                        type="button"
                        disabled={btnLoading}
                        onClick={async () => {
                          await handleSaveBank(); 
                          setIsModalOpen(false); 
                        }}
                        style={{
                          padding: '10px 20px', fontSize: '13px', fontWeight: 'bold',
                          textTransform: 'uppercase',
                          color: '#ffffff', backgroundColor: btnLoading ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: '8px',
                          cursor: btnLoading ? 'not-allowed' : 'pointer', display: 'inline-block'
                        }}
                      >
                        {btnLoading ? (
                          <span><i className="fa fa-spinner fa-spin mr-1"></i> Menyimpan...</span>
                        ) : (
                          <span><i className="fa fa-check mr-1"></i> Simpan Perubahan</span>
                        )}
                      </button>   
                    </div>

                  </div>
                </div>
              )}

              {/* 🖼️ SEKSI KANAN: UPLOAD / UPDATE QRIS */}
              <div className="w-full lg:w-5/12 px-3">
                <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border p-6">
                  <div className="rounded-t-2xl border-b-0 border-solid pb-0 mb-4">
                    <h5 className="font-bold text-slate-700">
                      <i className="fa fa-qrcode text-emerald-500 mr-2"></i> Pengaturan QRIS Toko
                    </h5>
                    <p className="text-xs text-slate-400">Pilih berkas baru kapan saja untuk mengganti foto QRIS bray.</p>
                  </div>

                  <div className="flex-auto flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl border-slate-200 bg-slate-50 min-h-52">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview QRIS" className="object-contain w-44 h-44 mb-3 rounded-lg shadow" />
                      ) : (
                        <div className="text-center py-6">
                          <i className="mb-2 text-5xl fa fa-qrcode text-slate-300 block"></i>
                          <span className="text-xs text-slate-400 font-semibold">Belum ada QRIS di-upload</span>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 file:cursor-pointer hover:file:bg-emerald-100"
                      />
                    </div>

                    <button
                      onClick={handleUploadQRIS}
                      disabled={btnLoading}
                      style={{
                        width: '100%', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', 
                        borderRadius: '8px', border: 'none', backgroundColor: btnLoading ? '#94a3b8' : '#10b981', color: '#ffffff',
                        cursor: btnLoading ? 'not-allowed' : 'pointer', marginTop: '16px'
                      }}
                      className="transition-all hover:bg-emerald-600 shadow-md"
                    >
                      <i className="fa fa-cloud-upload mr-1"></i> {btnLoading ? 'Uploading...' : 'Upload QRIS Baru'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Footer */}
        <Footer />
         
      </main>

      {/* 🚀 TOAST NOTIFICATION SYSTEM */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 99999, padding: '16px 24px', borderRadius: '12px',
          color: '#ffffff', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
          <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} style={{ fontSize: '18px' }}></i>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}