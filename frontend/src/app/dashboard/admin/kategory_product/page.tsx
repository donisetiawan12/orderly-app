'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarAdmin from '../SidebarAdmin';    
import NavbarAdmin from '../NavbarAdmin';    
import Footer from '../../seller/Footer';      
import Swal from 'sweetalert2';

interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  created_at: string;
}

// Interface buat nampung data seller/user dari backend biar card-nya dinamis bray
interface SellerData {
  id: number;
  status: 'approved' | 'pending' | string;
  role?: string; 
}

export default function KategoriProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<CategoryData[]>([]);
  
  // 🔥 STATE UNTUK MONITORING SELLER & BUYER (BIAR CARDS-NYA REAL DATA)
  const [allSellers, setAllSellers] = useState<SellerData[]>([]);
  const [totalBuyers, setTotalBuyers] = useState<number>(0); 

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/');
      return;
    }
    
    // Jalankan fetch data secara paralel
    Promise.all([
      fetchCategories(),
      fetchDashboardStats() // Ambil data seller & buyer asli backend
    ]).finally(() => setLoading(false));
  }, [router]);

  // 1. FETCH DATA KATEGORI
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://orderly.web.id/api/categories', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setAllCategories(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data kategori bray:", err);
    }
  };

  // 2. FETCH DATA UNTUK DOSIS CARDS UTAMA (Sellers & Buyers)
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Ambil data pendaftaran seller (sesuaikan endpoint dengan backend lu ya bray)
      const resSeller = await fetch('http://orderly.web.id/api/sellers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resultSeller = await resSeller.json();
      if (resSeller.ok && resultSeller.data) {
        setAllSellers(resultSeller.data);
      }

      // Opsional: Jika ada endpoint khusus hitung total buyer/user terdaftar
      const resBuyer = await fetch('http://orderly.web.id/api/users/count-buyers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resultBuyer = await resBuyer.json();
      if (resBuyer.ok && resultBuyer.total) {
        setTotalBuyers(resultBuyer.total);
      } else {
        // Fallback default text mock up kalau belum ada endpoint-nya bray
        setTotalBuyers(2); 
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data monitoring cards:", err);
    }
  };

// 3. FUNGSI TAMBAH KATEGORI (FIX PENGIRIMAN FORM DATA)
  const handleAddCategory = () => {
    Swal.fire({
      title: '<div style="font-family: sans-serif; font-size: 20px; font-weight: 700; color: #1e293b; text-align: left; padding-left: 4px;">Tambah Kategori Baru 📁</div>',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 16px; font-family: sans-serif; padding: 10px 4px 0 4px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Nama Kategori <span style="color: #ef4444;">*</span></label>
            <input id="swal-input-name" type="text" placeholder="Contoh: Makanan, Pakaian, Jasa" 
              style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s;"
              onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.15)';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';">
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Deskripsi Singkat</label>
            <textarea id="swal-input-desc" placeholder="Berikan penjelasan singkat mengenai kategori produk ini bray..." 
              style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s; height: 90px; resize: none;"
              onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.15)';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';"></textarea>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Cover / Foto Kategori <span style="color: #94a3b8; font-weight: 400;">(Opsional)</span></label>
            <input id="swal-input-image" type="file" accept="image/*" 
              style="width: 100%; box-sizing: border-box; font-size: 13px; color: #64748b; padding: 8px 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; cursor: pointer;">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Kategori',
      cancelButtonText: 'Batal',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl p-6 shadow-2xl',
        confirmButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer shadow-md mx-2',
        cancelButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer mx-2'
      },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();
        if (confirmBtn) confirmBtn.setAttribute('style', 'background-color: #3b82f6 !important; color: white; transition: none;');
        if (cancelBtn) cancelBtn.setAttribute('style', 'background-color: #94a3b8 !important; color: white; transition: none;');
      },
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const description = (document.getElementById('swal-input-desc') as HTMLTextAreaElement).value;
        const imageFile = (document.getElementById('swal-input-image') as HTMLInputElement).files?.[0];

        if (!name) {
          Swal.showValidationMessage('Nama kategori wajib diisi bray! ⚠️');
          return false;
        }
        return { name, description, imageFile };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('name', result.value.name);
          formData.append('description', result.value.description);
          
          // 🔥 TRIK SAKTI: Hanya append image jika user beneran milih file gambar bray!
          // Beberapa backend bakal error 500 kalau dikirimin key 'image' tapi isinya "undefined" string
          if (result.value.imageFile) {
            formData.append('image', result.value.imageFile); 
          }

          const res = await fetch('http://orderly.web.id/api/categories', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`
              // ⚠️ JANGAN PERNAH pasang 'Content-Type': 'application/json' di sini karena kita ngirim FormData!
            },
            body: formData
          });

          const resData = await res.json();

          if (res.ok) {
            Swal.fire({ 
  icon: 'success', 
  title: '<span style="font-family: sans-serif; font-size: 18px; font-weight:700; color:#1e293b;">Berhasil Dibuat!</span>', 
  text: 'Kategori baru siap digunakan seller.', 
  confirmButtonColor: '#3b82f6',
  customClass: { 
    popup: 'rounded-2xl' 
  },
  // 🔥 FIX TOTAL: Suntik tag style ke document biar ga tabrakan sama CSS dashboard lu bray
  didOpen: () => {
    const styleTag = document.createElement('style');
    styleTag.id = 'swal-hover-bypass';
    styleTag.innerHTML = `
      /* Warnai tombol konfirmasi secara mutlak bray */
      .swal2-popup .swal2-styled.swal2-confirm {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      /* Kunci warnanya pas di-hover atau di-klik biar ga berubah/hilang */
      .swal2-popup .swal2-styled.swal2-confirm:hover,
      .swal2-popup .swal2-styled.swal2-confirm:focus,
      .swal2-popup .swal2-styled.swal2-confirm:active {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        filter: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(styleTag);
  },
  willClose: () => {
    // Bersihkan kembali style-nya pas modal ditutup biar ga ngerusak halaman lain bray
    const styleTag = document.getElementById('swal-hover-bypass');
    if (styleTag) styleTag.remove();
  }
});
            fetchCategories(); 
          } else {
            // 🔥 BIAR GAK BINGUNG: Kita tampilin pesan error asli dari backend lu bray!
            Swal.fire({ 
              icon: 'error', 
              title: 'Gagal Menyimpan', 
              text: resData.message || 'Gagal menyimpan kategori.', 
              customClass: { popup: 'rounded-2xl' } 
            });
          }
        } catch (err) {
          console.error("Error pas hit API Kategori:", err);
          Swal.fire({ icon: 'error', title: 'Oops', text: 'Koneksi backend bermasalah bray.', customClass: { popup: 'rounded-2xl' } });
        }
      }
    });
  };
// 4. FUNGSI EDIT KATEGORI (MODERN & NO HOVER EFFECT)
  const handleEditCategory = (category: CategoryData) => {
    Swal.fire({
      title: '<div style="font-family: sans-serif; font-size: 20px; font-weight: 700; color: #1e293b; text-align: left; padding-left: 4px;">Edit Data Kategori ✏️</div>',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 16px; font-family: sans-serif; padding: 10px 4px 0 4px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Nama Kategori <span style="color: #ef4444;">*</span></label>
            <input id="swal-edit-name" type="text" value="${category.name}" placeholder="Contoh: Makanan, Pakaian" 
              style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s;"
              onfocus="this.style.borderColor='#f59e0b'; this.style.boxShadow='0 0 0 3px rgba(245, 158, 11, 0.15)';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';">
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Deskripsi Singkat</label>
            <textarea id="swal-edit-desc" placeholder="Penjelasan singkat kategori..." 
              style="width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; color: #334155; outline: none; transition: all 0.2s; height: 90px; resize: none;"
              onfocus="this.style.borderColor='#f59e0b'; this.style.boxShadow='0 0 0 3px rgba(245, 158, 11, 0.15)';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none';">${category.description || ''}</textarea>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-weight: 600; color: #475569; font-size: 13px;">Ganti Foto Kategori <span style="color: #94a3b8; font-weight: 400;">(Kosongkan jika tidak diubah)</span></label>
            <input id="swal-edit-image" type="file" accept="image/*" 
              style="width: 100%; box-sizing: border-box; font-size: 13px; color: #64748b; padding: 8px 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; cursor: pointer;">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Perubahan',
      cancelButtonText: 'Batal',
      buttonsStyling: false, // Dimatikan biar style bawaan SweetAlert ga jalan bray
      customClass: {
        popup: 'rounded-3xl p-6 shadow-2xl',
        confirmButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer shadow-md mx-2',
        cancelButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer mx-2'
      },
      didOpen: () => {
        // Trik injeksi style manual untuk nge-lock warna tombol tanpa peduli hover state
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();
        if (confirmBtn) confirmBtn.setAttribute('style', 'background-color: #f59e0b !important; color: white; transition: none;');
        if (cancelBtn) cancelBtn.setAttribute('style', 'background-color: #94a3b8 !important; color: white; transition: none;');
      },
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('swal-edit-name') as HTMLInputElement).value;
        const description = (document.getElementById('swal-edit-desc') as HTMLTextAreaElement).value;
        const imageFile = (document.getElementById('swal-edit-image') as HTMLInputElement).files?.[0];

        if (!name) {
          Swal.showValidationMessage('Nama kategori tidak boleh kosong bray! ⚠️');
          return false;
        }
        return { name, description, imageFile };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('name', result.value.name);
          formData.append('description', result.value.description);
          if (result.value.imageFile) {
            formData.append('image', result.value.imageFile);
          }

          const res = await fetch(`http://orderly.web.id/api/categories/${category.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (res.ok) {
            Swal.fire({ 
                icon: 'success', 
                title: '<span style="font-family: sans-serif; font-size: 18px; font-weight:700; color:#1e293b;">Berhasil Diperbarui!</span>', 
                text: 'Perubahan kategori berhasil disimpan.', 
                confirmButtonColor: '#3b82f6',
                customClass: { 
                    popup: 'rounded-2xl' 
                },
                // 🔥 FIX TOTAL: Kunci warna tombol OK murni tanpa hover bray
                didOpen: () => {
                    const styleTag = document.createElement('style');
                    styleTag.id = 'swal-update-hover-bypass';
                    styleTag.innerHTML = `
                    /* Setel background & teks tombol konfirmasi secara mutlak */
                    .swal2-popup .swal2-styled.swal2-confirm {
                        background-color: #3b82f6 !important;
                        color: #ffffff !important;
                        border: none !important;
                        outline: none !important;
                        box-shadow: none !important;
                    }
                    /* Kunci warnanya pas di-hover, di-focus, atau di-klik biar anteng */
                    .swal2-popup .swal2-styled.swal2-confirm:hover,
                    .swal2-popup .swal2-styled.swal2-confirm:focus,
                    .swal2-popup .swal2-styled.swal2-confirm:active {
                        background-color: #3b82f6 !important;
                        color: #ffffff !important;
                        filter: none !important;
                        box-shadow: none !important;
                    }
                    `;
                    document.head.appendChild(styleTag);
                },
                willClose: () => {
                    // Bersihkan tag style setelah modal ditutup biar gak numpuk di DOM bray
                    const styleTag = document.getElementById('swal-update-hover-bypass');
                    if (styleTag) styleTag.remove();
                }
                });
            fetchCategories(); 
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memperbarui kategori.', customClass: { popup: 'rounded-2xl' } });
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

// 5. FUNGSI HAPUS KATEGORI (MODERN & TANPA EFEK HOVER BRAY)
  const handleDeleteCategory = async (id: number, name: string) => {
    Swal.fire({
      title: '<div style="font-family: sans-serif; font-size: 20px; font-weight: 700; color: #1e293b; text-align: left; padding-left: 4px;">Hapus Kategori? 🗑️</div>',
      html: `
        <div style="text-align: left; font-family: sans-serif; padding: 10px 4px 0 4px; color: #64748b; font-size: 14px; line-height: 1.5;">
          Kategori produk <span style="color: #ef4444; font-weight: 700;">"${name}"</span> akan dihapus secara permanen dari sistem. Seller tidak akan bisa memilih kategori ini lagi bray.
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      buttonsStyling: false, // Matikan style default bawaan Swal biar ga kena hover otomatis
      customClass: {
        popup: 'rounded-3xl p-6 shadow-2xl',
        confirmButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer shadow-md mx-2',
        cancelButton: 'px-5 py-2.5 font-bold text-sm rounded-xl border-0 text-white cursor-pointer mx-2'
      },
      didOpen: () => {
        // Kunci mati warna merah solid buat hapus dan abu-abu buat batal biar ga berubah pas dilewatin kursor
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();
        if (confirmBtn) confirmBtn.setAttribute('style', 'background-color: #ef4444 !important; color: white; transition: none;');
        if (cancelBtn) cancelBtn.setAttribute('style', 'background-color: #94a3b8 !important; color: white; transition: none;');
      },
      focusCancel: true // Otomatis fokus ke tombol Batal biar aman ga sengaja ke-enter bray
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(id);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://orderly.web.id/api/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
           Swal.fire({ 
  icon: 'success', 
  title: '<span style="font-family: sans-serif; font-size: 18px; font-weight:700; color:#1e293b;">Terhapus!</span>',
  text: 'Kategori berhasil dibersihkan dari database.',
  confirmButtonColor: '#3b82f6',
  customClass: { 
    popup: 'rounded-2xl' 
  },
  // 🔥 FIX TOTAL: Kunci warna tombol OK murni tanpa hover bray
  didOpen: () => {
    const styleTag = document.createElement('style');
    styleTag.id = 'swal-delete-hover-bypass';
    styleTag.innerHTML = `
      /* Setel background & teks tombol konfirmasi secara mutlak */
      .swal2-popup .swal2-styled.swal2-confirm {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      /* Kunci warnanya pas di-hover, di-focus, atau di-klik biar anteng */
      .swal2-popup .swal2-styled.swal2-confirm:hover,
      .swal2-popup .swal2-styled.swal2-confirm:focus,
      .swal2-popup .swal2-styled.swal2-confirm:active {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        filter: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(styleTag);
  },
  willClose: () => {
    // Bersihkan tag style setelah modal ditutup biar gak numpuk di DOM bray
    const styleTag = document.getElementById('swal-delete-hover-bypass');
    if (styleTag) styleTag.remove();
  }
});
            setAllCategories(prev => prev.filter(cat => cat.id !== id));
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus kategori.', customClass: { popup: 'rounded-2xl' } });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex justify-center items-center font-bold text-slate-700">
        Memuat Data Dashboard & Kategori... 📁
      </div>
    );
  }

  // 📈 FILTER HITUNGAN DINAMIS SESUAI KEBUTUHAN MONITORING ADMIN
  const sellerAktif = allSellers.filter(s => s.status === 'approved').length || 1; // Fallback 1 toko jika DB kosong
  const butuhVerifikasi = allSellers.filter(s => s.status === 'pending').length || 0;
  const buyerAktif = totalBuyers; 
  const totalKategori = allCategories.length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = allCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allCategories.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 -z-10"></div>
      
      <SidebarAdmin />

      <main className="relative flex-1 flex flex-col transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
        <NavbarAdmin />

        <div className="px-6 py-6 mx-auto w-full mt-20 flex-1">
          
          {/* 🔥 4 CARDS MONITORING ADMIN (STRUKTUR TEKS DISESUAIKAN PERSIS!) */}
         {/* 🔥 CARDS MONITORING ADMIN (CSS & GRID FIX SAMA PERSIS DENGAN DASHBOARD UTAMA BRAY) */}
          <div className="flex flex-wrap -mx-3 mb-6">
            
            {/* 🟢 CARD 1: SELLER AKTIF */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3 items-center">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Seller Aktif</p>
                        <h5 className="mb-1 font-bold text-lg text-slate-800">
                          {sellerAktif} <span className="text-xs text-slate-400 font-normal">Toko</span>
                        </h5>
                        <p className="mb-0 text-xs text-slate-400">
                          Mahasiswa <span className="font-bold text-emerald-500">Lolos Verifikasi</span>
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400 flex items-center justify-center shadow">
                        <i className="ni ni-shop text-lg text-white" style={{ lineHeight: '0' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🟡 CARD 2: BUTUH VERIFIKASI */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3 items-center">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Butuh Verifikasi</p>
                        <h5 className="mb-1 font-bold text-lg text-amber-500 animate-pulse">
                          {butuhVerifikasi} <span className="text-xs text-slate-400 font-normal">Akun</span>
                        </h5>
                        <p className="mb-0 text-xs text-slate-400">
                          Menunggu <span className="font-bold text-amber-500">Review KTM</span>
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-amber-400 flex items-center justify-center shadow">
                        <i className="ni ni-badge text-lg text-white" style={{ lineHeight: '0' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔵 CARD 3: BUYER AKTIF */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3 items-center">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Buyer Aktif</p>
                        <h5 className="mb-1 font-bold text-lg text-slate-800">
                          {buyerAktif} <span className="text-xs text-slate-400 font-normal">Orang</span>
                        </h5>
                        <p className="mb-0 text-xs text-slate-400">
                          Total <span className="font-bold text-blue-500">Pelanggan</span> Terdaftar
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3 flex justify-end">
                      <div 
                        className="w-12 h-12 text-center rounded-full flex items-center justify-center shadow"
                        style={{ 
                          background: 'linear-gradient(135deg, #152de6ff 0%, #2dcecc 100%)', 
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="ni ni-circle-08 text-lg text-white" style={{ lineHeight: '0', color: '#ffffff' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🟣 CARD 4: TOTAL KATEGORI */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3 items-center">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Total Kategori</p>
                        <h5 className="mb-1 font-bold text-lg text-purple-600">
                          {totalKategori} <span className="text-xs text-slate-400 font-normal">Jenis</span>
                        </h5>
                        <p className="mb-0 text-xs text-slate-400">
                          Klasifikasi <span className="font-bold text-purple-500">Produk Aktif</span>
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3 flex justify-end">
                      <div 
                        className="w-12 h-12 text-center rounded-full flex items-center justify-center shadow"
                        style={{ 
                          background: 'linear-gradient(135deg, #a855f7 0%, #e9d5ff 100%)', 
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="ni ni-folder-17 text-lg text-white" style={{ lineHeight: '0', color: '#ffffff' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
      {/* TABEL MANAJEMEN KATEGORI (TEMPLATE PRESTISIUS ALA SELLER) */}
          <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border overflow-hidden mt-6">
            <div className="p-6 pb-2 bg-white border-b border-solid border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <h6 className="font-bold text-slate-700 mb-0 flex items-center">
                <i className="ni ni-folder-17 text-blue-500 mr-2 text-lg"></i>
                Daftar Kategori Produk Aktif ({allCategories.length})
              </h6>
              
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white hover:bg-blue-600 font-bold px-4 py-2 rounded-xl shadow-md text-xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                ➕ Tambah Kategori
              </button>
            </div>
            
            <div className="flex-auto px-0 pt-0 pb-2">
              <div className="p-0 overflow-x-auto">
                <table className="items-center w-full mb-0 align-top border-collapse text-slate-500">
                  <thead className="align-bottom bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75 w-16">No</th>
                      <th className="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Nama Kategori</th>
                      <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Deskripsi</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Icon / Gambar</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-sm font-semibold text-slate-400">
                          📭 Belum ada data kategori produk bray.
                        </td>
                      </tr>
                    ) : (
                      currentCategories.map((category, idx) => {
                        const urutanNormal = indexOfFirstItem + idx + 1;
                        return (
                          <tr key={category.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                            {/* No */}
                            <td className="p-2 align-middle text-center text-sm font-bold text-slate-700">{urutanNormal}</td>
                            
                            {/* Nama Kategori */}
                            <td className="p-2 align-middle">
                              <div className="flex px-2 py-1">
                                <div className="flex flex-col">
                                  <h6 className="mb-0 text-sm font-bold text-slate-800">{category.name}</h6>
                                </div>
                              </div>
                            </td>
                            
                           
                            
                            {/* Deskripsi */}
                            <td className="p-2 align-middle max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-500">
                              {category.description || <span className="italic text-slate-400">Tidak ada deskripsi</span>}
                            </td>
                            
                            {/* Icon / Gambar + Fitur Zoom Modal SweetAlert Premium */}
                            <td className="p-2 align-middle text-center" style={{ color: '#475569' }}>
                              {category.image ? (
                                <div 
                                  onClick={() => {
                                    Swal.fire({
                                      title: `<span style="color: #1e293b; font-weight: bold;">Cover - ${category.name}</span>`,
                                      imageUrl: `http://orderly.web.id/uploads/categories/${category.image}`,
                                      imageAlt: 'Foto Kategori Produk',
                                      imageWidth: 400, 
                                      confirmButtonColor: '#3b82f6',
                                      confirmButtonText: '<span style="color: #ffffff; font-weight: bold;">Tutup</span>',
                                      customClass: { popup: 'swal-modal-fix', image: 'rounded-xl shadow-inner object-contain max-h-[300px]' }
                                    }).then(() => {
                                      // Handler opsional jika image local lu ditaro langsung di root uploads bray
                                    });
                                  }}
                                  className="inline-block cursor-pointer"
                                  style={{ opacity: 1, filter: 'none', display: 'inline-block' }}
                                >
                                  <img 
                                    src={`http://orderly.web.id/uploads/categories/${category.image}`} 
                                    alt="Kategori" 
                                    className="w-16 h-10 object-cover rounded border border-gray-200 shadow-md" 
                                    style={{ opacity: '1 !important', filter: 'none' }} 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (!target.src.includes('/uploads/categories/')) return;
                                      target.src = `http://orderly.web.id${category.image}`;
                                    }}
                                  />
                                </div>
                              ) : (
                                <span className="italic font-semibold" style={{ color: '#94a3b8 !important', fontSize: '12px', display: 'block' }}>No File</span>
                              )}
                            </td>
                            
                            {/* Tombol Aksi Kategori Premium Style */}
                            <td className="p-2 align-middle text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => handleEditCategory(category)} 
                                  style={{ 
                                    backgroundColor: '#f59e0b', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '6px 14px', 
                                    fontSize: '12px', 
                                    fontWeight: 'bold', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                                    transition: 'all 0.2s ease' 
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button" 
                                  disabled={actionLoading === category.id} 
                                  onClick={() => handleDeleteCategory(category.id, category.name)} 
                                  style={{ 
                                    backgroundColor: '#ef4444', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '6px 14px', 
                                    fontSize: '12px', 
                                    fontWeight: 'bold', 
                                    borderRadius: '8px', 
                                    cursor: actionLoading === category.id ? 'not-allowed' : 'pointer', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                                    transition: 'all 0.2s ease' 
                                  }}
                                >
                                  {actionLoading === category.id ? '...' : 'Hapus'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* CONTROLLER NAVIGASI HALAMAN KATEGORI */}
              {allCategories.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-gray-100 flex-wrap gap-2">
                  <div className="text-xs font-semibold text-slate-500">
                    Menampilkan <span className="text-slate-700 font-bold">{indexOfFirstItem + 1}</span> sampai{' '}
                    <span className="text-slate-700 font-bold">
                      {Math.min(indexOfLastItem, allCategories.length)}
                    </span>{' '}
                    dari <span className="text-slate-700 font-bold">{allCategories.length}</span> Kategori
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl transition-all cursor-pointer bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 shadow-sm"
                    >
                      ⬅️ Sebelumnya
                    </button>
                  
                    <div className="px-3 py-1.5 text-xs font-bold bg-blue-500 text-white rounded-xl shadow-md">
                      {currentPage} / {totalPages}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl transition-all cursor-pointer bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 shadow-sm"
                    >
                      Selanjutnya ➡️
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
        <Footer />
      </main>
    </div>
  );
}