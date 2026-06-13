'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
// IMPORT SWEETALERT2 SAKTI
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  location?: string;
  image: string | null;
  po_quota: number;       
  po_deadline: string | null; 
  category_id: number | null; 
  sold_quantity: number; 
}

interface Category {
  id: number;
  name: string;
}

// Interface untuk data statistik atas
interface DashboardStats {
  total_order: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Kampus A'); // Default disamakan dengan DB
  
  // State untuk Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Batasan 5 baris per halaman
  
  // State Input Form Utama
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(''); 
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State Khusus Pre-Order (PO)
  const [poQuota, setPoQuota] = useState('');
  const [poDeadline, setPoDeadline] = useState('');

  // State Kategori Produk
  const [categoryId, setCategoryId] = useState('');

  // ================= 1. FETCH DATA STATISTIK ATAS =================
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/orders/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.status === 'success') {
        setDashboardData(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data statistik:", err);
    }
  };

  // ================= 2. READ (AMBIL DATA PRODUK & KATEGORI) =================
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      
      if (result.status === 'success' && result.data.products) {
        setProducts(result.data.products);
      } else if (result.data) {
        setProducts(result.data);
      } else {
        setProducts(result);
      }
    } catch (err) {
      console.error("Gagal mengambil data produk:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.status === 'success' && result.data) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    }
  };

  useEffect(() => {
    // Jalankan semua fetch data saat komponen di-mount
    fetchDashboardStats();
    fetchProducts();
    fetchCategories(); 
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentProductId(null);
    setName('');
    setPrice('');
    setStock('');
    setDescription('');
    setImageFile(null);
    setPoQuota('');    
    setPoDeadline(''); 
    setCategoryId(''); 
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditMode(true);
    setCurrentProductId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.quantity.toString());
    setDescription(product.description || '');
    setLocation(product.location || 'Kampus A');
    setImageFile(null);
    
    const formattedDate = product.po_deadline ? product.po_deadline.substring(0, 16) : '';
    setPoQuota(product.po_quota !== undefined && product.po_quota !== null ? product.po_quota.toString() : '');
    setPoDeadline(formattedDate);
    setCategoryId(product.category_id ? product.category_id.toString() : ''); 
    setIsModalOpen(true);
  };

  // ================= 3. CREATE & UPDATE =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const userData = localStorage.getItem('user');
    let sellerId = "";
    if (userData) {
      const parsedUser = JSON.parse(userData);
      sellerId = parsedUser.id; 
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('quantity', stock); 
    formData.append('seller_id', sellerId);
    formData.append('status', 'active');
    formData.append('po_quota', poQuota || '0');
    formData.append('po_deadline', poDeadline || '');
    formData.append('category_id', categoryId); 

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const url = isEditMode 
      ? `http://localhost:5000/api/products/${currentProductId}`
      : 'http://localhost:5000/api/products';
      
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json();
      if (res.ok || result.status === 'success') {
        setIsModalOpen(false);
        fetchProducts(); 
        fetchDashboardStats(); // Refresh stats setelah manipulasi produk

        Swal.fire({
          title: isEditMode ? 'Berhasil Diperbarui!' : 'Berhasil Ditambahkan!',
          text: isEditMode ? 'Data katalog produk berhasil diubah.' : 'Katalog produk baru sudah Siap Di CO!',
          icon: 'success',
          confirmButtonText: 'Oke!',
          confirmButtonColor: '#10b981',
          didOpen: () => {
            const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
            if (confirmBtn) {
              confirmBtn.style.setProperty('color', '#ffffff', 'important');
              confirmBtn.style.setProperty('background-color', '#10b981', 'important');
              confirmBtn.style.setProperty('display', 'inline-block', 'important');
              confirmBtn.style.setProperty('padding', '10px 24px', 'important');
            }
          }
        });

      } else {
        Swal.fire({
          title: 'Gagal Menyimpan!',
          text: result.message || 'Periksa kembali inputan lu, bro.',
          icon: 'error',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error Sistem!',
        text: 'Terjadi masalah saat menghubungi API backend.',
        icon: 'error',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // ================= 4. DELETE =================
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin Mau Hapus Produk?',
      text: "Data produk yang dihapus tidak akan bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Iya, Hapus Aja!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        if (confirmBtn) {
          confirmBtn.style.setProperty('color', '#ffffff', 'important');
          confirmBtn.style.setProperty('background-color', '#ef4444', 'important');
        }
        if (cancelBtn) {
          cancelBtn.style.setProperty('color', '#ffffff', 'important');
          cancelBtn.style.setProperty('background-color', '#94a3b8', 'important');
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            fetchProducts();
            fetchDashboardStats(); // Refresh stats atas setelah hapus produk
            Swal.fire({
                title: 'Terhapus Tuntas!',
                text: 'Katalog produk berhasil dieliminasi.',
                icon: 'success',
                confirmButtonText: 'Selesai',
                confirmButtonColor: '#10b981',
                // 🚀 KUNCI UTAMA: Matikan efek hover via CSS internal Swal
                didOpen: () => {
                  const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
                  if (confirmBtn) {
                    // Setel warna teks putih murni
                    confirmBtn.style.setProperty('color', '#ffffff', 'important');
                    // Setel warna background ijo lu
                    confirmBtn.style.setProperty('background-color', '#10b981', 'important');
                    // Matikan efek transisi box-shadow biar pas di-klik atau di-hover gak ada efek kedip
                    confirmBtn.style.setProperty('box-shadow', 'none', 'important');
                    
                    // 🛠️ TRICK ANTI HOVER: Paksa warna background tetep sama pas mouse masuk/keluar
                    confirmBtn.onmouseenter = () => confirmBtn.style.setProperty('background-color', '#10b981', 'important');
                    confirmBtn.onmouseleave = () => confirmBtn.style.setProperty('background-color', '#10b981', 'important');
                  }
                }
              });
          } else {
            Swal.fire({
              title: 'Gagal!',
              text: 'Gagal menghapus produk.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
          }
        } catch (err) {
          Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan jaringan.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Menyiapkan Gudang Produk...</p>
      </div>
    );
  }

  return (
    <div className="m-0 font-sans text-base antialiased font-normal dark:bg-slate-900 leading-default bg-gray-50 text-slate-500 min-h-screen">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 z-0"></div>

      <Sidebar />

      <main className="relative h-full max-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl z-10">
        <Navbar />

        <div className="px-6 py-6 mx-auto w-full max-w-full block box-border overflow-x-hidden">
          
        {/* ================= BARIS 1: 4 CARDS STATISTIK KILAS TOKO ================= */}
          <div className="flex flex-wrap -mx-3 mb-6">
            {/* Card 1: Total Revenue */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Pendapatan</p>
                        <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                          {/* 🚀 FIX: Dipaksa jadi Number dulu biar titik ribuannya muncul sempurna */}
                          Rp {Number(dashboardData?.total_revenue || 0).toLocaleString('id-ID')}
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Semua <span className="font-bold text-emerald-500">Pendapatan</span> Anda
                        </p>
                      </div>
                    </div>
                     <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-emerald-500 to-teal-400">
                        <i className="ni ni-money-coins text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Total Transaksi & Info Pelanggan */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        {/* 🚀 JUDUL UTAMA DIGANTI JADI TOTAL TRANSAKSI */}
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Pelanggan</p>
                        <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                          {/* 🚀 VARIABEL DIGANTI KE total_order */}
                          {dashboardData?.total_order || 0} Orang
                        </h5>
                        {/* 💡 KETERANGAN DI BAWAH TETEP INFO PELANGGAN */}
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Semua <span className="font-bold text-emerald-500">Pelanggan</span> Anda
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-red-600 to-orange-600">
                        <i className="ni ni-world text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Active Products */}
            <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Produk</p>
                        <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                          {dashboardData?.total_products || 0} Items
                        </h5>
                        <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                          Total Semua <span className="font-bold text-emerald-500">Produk</span> Anda
                        </p>
                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-blue-500 to-violet-500">
                        <i className="ni ni-paper-diploma text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 Card 4: Butuh Validasi Pesanan Masuk (Udah Sinkron dengan Fitur Anti-Jail) */}
            <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
              <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
                <div className="flex-auto p-4">
                  <div className="flex flex-row -mx-3">
                    <div className="flex-none w-2/3 max-w-full px-3">
                      <div>
                        <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">PESANAN</p>
                        
                        {/* 🔄 Menghitung jumlah pesanan aktif yang berstatus 'pending' atau 'paid' */}
                        {(() => {
                         const activeCount = (dashboardData as any)?.recent_orders?.filter(
                            (o: any) => o.status === 'paid' || o.status === 'pending'
                          ).length || 0;

                          return (
                            <>
                              <div className="flex items-center gap-2 mt-0.5 mb-2">
                                <h5 className={`mb-0 font-bold text-lg ${activeCount > 0 ? 'text-red-500' : 'text-slate-700 dark:text-white'}`}>
                                  {activeCount} Pesanan
                                </h5>
                              
                              </div>
                              <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                                
                                {activeCount > 0 ? (
                                  <span className="text-red-500 font-bold animate-pulse">Perlu tindakan seller segera!</span>
                                ) : (
                                  <span>Semua pesanan <span className="font-bold text-emerald-500">aman/clear</span></span>
                                )}
                              </p>
                            </>
                          );
                        })()}

                      </div>
                    </div>
                    <div className="px-3 text-right basis-1/3">
                      <div className="inline-block w-12 h-12 text-center rounded-circle bg-gradient-to-tl from-orange-500 to-yellow-500">
                        <i className="ni ni-cart text-lg relative top-3.5 text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BARIS 2: HEADER MANAJEMEN PRODUK ================= */}
         

    {/* TABEL DATA PRODUK */}
<div className="w-full bg-white dark:bg-slate-850 rounded-2xl shadow-xl p-4 border-0 block overflow-hidden">
  <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
    <h6 className="mb-4 dark:text-white font-bold text-base text-slate-800">📦 Manajemen Katalog Produk</h6>
    <button 
      onClick={openAddModal}
      style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
    >
      ➕ Tambah Produk Baru
    </button>
  </div>
  
  <div className="overflow-x-auto w-full">
    <table className="items-center w-full mb-0 align-top border-collapse">
      <thead>
        <tr className="text-slate-400 text-xs uppercase text-left border-b border-gray-100">
          <th className="py-3 font-bold text-center" style={{ width: '50px', textAlign: 'center' }}>No</th>
          <th className="py-3 font-bold" style={{ minWidth: '80px' }}>Foto</th>
          <th className="py-3 font-bold">Nama Produk</th>
          <th className="py-3 font-bold text-center">Harga Jual</th>
          <th className="py-3 font-bold text-center">Stok / Qty Ready</th>
          <th className="py-3 font-bold text-center">Kuota Sisa PO</th>
          <th className="py-3 font-bold text-center">Batas Waktu PO</th>
          {/* Header Alamat */}
          <th className="py-3 font-bold text-center" style={{ minWidth: '120px', textAlign: 'center' }}>Alamat / Stand</th>
          <th className="py-3 font-bold">Deskripsi</th>
          <th className="py-3 font-bold text-center">Aksi Manajemen</th>
        </tr>
      </thead>
      <tbody>
        {products.length > 0 ? (
          /* 🚀 LOGIKA DINAMIS PAGINATION: Memotong data otomatis per 5 baris sesuai halaman aktif */
          products
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((product, index) => {
              let deadlineDisplay = "Tanpa Batas";
              if (product.po_deadline) {
                const dateObj = new Date(product.po_deadline);
                deadlineDisplay = dateObj.toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }

              // 🚀 FIX CRITICAL: Amankan data string lokasi dari nilai NULL database dan spasi gaib
              const safeLocation = (product.location || 'Kampus A').trim();

              return (
                <tr key={product.id} className="border-b border-gray-50 last:border-none hover:bg-slate-50">
                  <td className="py-4 align-middle text-sm text-center font-medium text-slate-500" style={{ textAlign: 'center' }}>
                    {(currentPage - 1) * itemsPerPage + index + 1} {/* Nomor urut dinamis antar halaman */}
                  </td>
                  <td className="py-4 align-middle">
                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                      <img 
                        src={product.image ? `http://localhost:5000/uploads/products/${product.image}` : 'https://placehold.co/100?text=No+Img'} 
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=No+Img'; }}
                      />
                    </div>
                  </td>
                  <td className="py-4 align-middle text-sm font-bold text-slate-800">
                    {product.name}
                  </td>
                  
                  <td className="py-4 align-middle text-sm text-center font-semibold text-slate-700" style={{ textAlign: 'center' }}>
                    Rp. {Math.trunc(Number(product.price || 0)).toLocaleString('id-ID')}
                  </td>
                  
                  <td className="py-4 align-middle text-center" style={{ textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: product.quantity > 5 ? '#ecfdf5' : '#fef2f2', 
                      color: product.quantity > 5 ? '#065f46' : '#991b1b', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontWeight: 'bold', 
                      fontSize: '11px', 
                      display: 'inline-block' 
                    }}>
                      {product.quantity} Pcs
                    </span>
                  </td>

                  <td className="py-4 align-middle text-center text-sm font-bold text-blue-600" style={{ textAlign: 'center', minWidth: '140px' }}>
                    {product.po_quota > 0 ? (
                      <div className="whitespace-nowrap">
                        <span className="text-slate-800">
                          {product.po_quota - (product.sold_quantity || 0)} Pcs <span className="text-xs font-normal text-slate-400">sisa </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          dari {product.po_quota} Pcs
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">-</span>
                    )}
                  </td>

                  <td className="py-4 align-middle text-center text-xs font-medium text-slate-600" style={{ textAlign: 'center' }}>
                    {product.po_deadline ? (
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200 inline-block font-semibold">
                        ⏳ {deadlineDisplay}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* 🚀 TD ALAMAT: WARNA BARU KHUSUS ALAMAT BEBAS/CUSTOM BIAR TETEP NYALA */}
                      <td className="py-4 align-middle text-center" style={{ textAlign: 'center' }}>
                        {(() => {
                          // Bersihkan text dan pastikan aman dari nilai null
                          const currentLoc = product.location ? String(product.location).trim() : 'Kampus A';
                          
                          // Tentukan jenis lokasi berdasarkan kata kunci
                          const isKampusB = currentLoc.toLowerCase().includes('kampus b');
                          const isKampusA = currentLoc.toLowerCase().includes('kampus a');

                          // 🎨 RACIKAN WARNA BARU:
                          // Jika Kampus B = Biru
                          // Jika Kampus A = Hijau
                          // Jika Alamat Custom/Luar Kampus (Jl. Kesadaran, dll) = Oranye/Amber hangat biar gak pudar!
                          const bgColor = isKampusB ? '#eff6ff' : isKampusA ? '#f0fdf4' : '#fffbeb';
                          const textColor = isKampusB ? '#1d4ed8' : isKampusA ? '#166534' : '#b45309';
                          const borderColor = isKampusB ? '#bfdbfe' : isKampusA ? '#bbf7d0' : '#fde68a';

                          return (
                            <span style={{ 
                              backgroundColor: bgColor,
                              color: textColor,
                              borderColor: borderColor,
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              fontWeight: 'bold', 
                              fontSize: '12px',
                              border: '1px solid',
                              display: 'inline-block',
                              minWidth: '100px',
                              whiteSpace: 'normal', 
                              wordBreak: 'break-word',
                              maxWidth: '180px'
                            }}>
                              📍 {currentLoc}
                            </span>
                          );
                        })()}
                      </td>

                  {/* 🚀 TD DESKRIPSI: FIX TEKS PANJANG OTOMATIS TURUN KE BAWAH */}
                    <td className="py-4 align-middle text-sm text-slate-500">
                      <div style={{ 
                        whiteSpace: 'normal', 
                        wordBreak: 'break-word', // Memotong kata di spasi yang normal
                        overflowWrap: 'break-word',
                        // Khusus buat teks dempet panjang tanpa spasi seperti 'sasasasaaaaa...', paksa patah pakai baris bawah ini:
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // 🔒 MAKSIMAL TAMPIL 3 BARIS: Biar kalau deskripsinya se-novel gak ngerusak tinggi tabel
                        WebkitBoxOrient: 'vertical',
                        maxWidth: '220px' // Batas lebar maksimal kolom deskripsi
                      }}>
                        {product.description || <span className="italic text-slate-300">Tidak ada deskripsi</span>}
                      </div>
                    </td>
                  <td className="py-4 align-middle text-center" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => openEditModal(product)}
                        style={{ backgroundColor: '#f59e0b', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
        ) : (
          <tr>
            <td colSpan={10} className="p-6 text-center text-sm text-slate-400 font-medium">
              Belum ada katalog produk terdaftar.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* 🚀 TOMBOL NAVIGASI PAGINATION DI POJOK KANAN BAWAH */}
  {products.length > itemsPerPage && (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
        Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, products.length)} - {Math.min(currentPage * itemsPerPage, products.length)} dari {products.length} Produk
      </span>
      
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0',
            backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ◀ Prev
        </button>
        
        {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px',
              border: currentPage === i + 1 ? '1px solid #10b981' : '1px solid #e2e8f0',
              backgroundColor: currentPage === i + 1 ? '#10b981' : '#ffffff',
              color: currentPage === i + 1 ? '#ffffff' : '#334155',
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
          onClick={() => setCurrentPage(prev => prev + 1)}
          style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #e2e8f0',
            backgroundColor: currentPage === Math.ceil(products.length / itemsPerPage) ? '#f8fafc' : '#ffffff',
            color: currentPage === Math.ceil(products.length / itemsPerPage) ? '#cbd5e1' : '#334155',
            cursor: currentPage === Math.ceil(products.length / itemsPerPage) ? 'not-allowed' : 'pointer'
          }}
        >
          Next ▶
        </button>
      </div>
    </div>
  )}
</div>

        </div>
      </main>

      {/* ================= MODAL DIALOG POP-UP (TAMBAH / EDIT) ================= */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} // 🔍 Diperbaiki ke C kapital
          >
          <div className="absolute inset-0 w-full h-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full" style={{ width: '460px', zIndex: 1000000, position: 'relative', boxSizing: 'border-box' }}>
            <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> {/* 🔍 Diperbaiki ke C kapital */}              <h5 className="font-bold text-base text-slate-900 m-0" style={{ color: '#1e293b', margin: 0 }}>
                {isEditMode ? '📝 Modifikasi Data Produk' : '🚀 Tambah Katalog Baru'}
              </h5>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', display: 'block', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* DROPDOWN PILIHAN KATEGORI */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Kategori Produk</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                >
                  <option value="">-- Pilih Kategori Produk --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* INPUT NAMA BARANG */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Barang</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Contoh: Kopi Susu Gula Aren" style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              {/* INPUT HARGA JUAL */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Harga Jual (Rp)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="15000" style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>

              <hr style={{ border: '0', borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />

              {/* LOGIKA PEMILIHAN SISTEM JUALAN */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', marginBottom: '8px' }}>⚙️ Sistem Penjualan</label>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="is_po" 
                      checked={parseInt(poQuota) === 0 || poQuota === ''} 
                      onChange={() => { setPoQuota('0'); setStock(''); }} 
                    />
                    Ready Stock (Reguler)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="is_po" 
                      checked={parseInt(poQuota) > 0} 
                      onChange={() => { setPoQuota('50'); setStock('0'); }} 
                    />
                    Pre-Order (PO)
                  </label>
                </div>

                {(parseInt(poQuota) === 0 || poQuota === '') ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Jumlah Stok Ready</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required placeholder="Contoh: 25" style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Target/Kuota PO (Pcs)</label>
                      <input 
                        type="number" 
                        value={poQuota} 
                        onChange={(e) => setPoQuota(e.target.value)} 
                        required
                        placeholder="Maks pesanan"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Batas Tutup PO</label>
                      <input 
                        type="datetime-local" 
                        value={poDeadline} 
                        required
                        onChange={(e) => setPoDeadline(e.target.value)} 
                        style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              <div>
  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
    Alamat / Lokasi Stand
  </label>
  
  {parseInt(poQuota) > 0 ? (
    /* 🔒 JIKA PO: Dropdown */
    <select
      value={location || 'Kampus A'} // 👈 Kasih fallback 'Kampus A' jika state sempat null
      onChange={(e) => {
        console.log("Dropdown diganti ke:", e.target.value); // 💡 Debugger kecil biar keliatan di console
        setLocation(e.target.value);
      }}
      required
      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
    >
      <option value="Kampus A">📍 Kampus A</option>
      <option value="Kampus B">📍 Kampus B</option>
    </select>
  ) : (
    /* 🔓 JIKA READY STOCK: Input Text Bebas */
    <input 
      type="text" 
      value={location || ''} 
      onChange={(e) => {
        console.log("Alamat diketik:", e.target.value); // 💡 Debugger kecil
        setLocation(e.target.value);
      }}
      required 
      placeholder="Contoh: Kantin Gedung C, Stand Utama Belakang" 
      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
    />
  )}
</div>

              <hr style={{ border: '0', borderTop: '1px dashed #e2e8f0', margin: '4px 0' }} />

              {/* INPUT DESKRIPSI */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Deskripsi Ringkas</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detail komposisi, rasa, ukuran atau catatan varian..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'none' }} />
              </div>

              {/* INPUT FILE GAMBAR */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Upload Banner/Foto Produk</label>
                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setImageFile(e.target.files[0]); }} style={{ width: '100%', fontSize: '12px' }} />
              </div>

              {/* TOMBOL AKSI FORM */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  style={{ display: 'inline-block', backgroundColor: '#94a3b8', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  {isEditMode ? '💾 Simpan Perubahan' : '🚀 Publish Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}