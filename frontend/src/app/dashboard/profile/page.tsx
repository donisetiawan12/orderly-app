'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../seller/Sidebar';
import Navbar from '../seller/Navbar';
import Footer from '../seller/Footer'; 
import Swal from 'sweetalert2';

interface UserData {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  verification_status: 'pending' | 'approved' | 'rejected';
  phone: string;
  address: string;
  profile_picture: string;
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    role: 'seller',
    verification_status: 'pending',
    phone: '',
    address: '',
    profile_picture: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔄 Fetch data profil dari backend /api/auth/me pas halaman dibuka
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        console.log("📦 DATA USER DARI BACKEND:", result);
        
        if (result.status === 200 && result.user) {
          setFormData({
            name: result.user.name || '',
            email: result.user.email || '',
            role: result.user.role || 'seller',
            verification_status: result.user.verification_status || 'pending',
            phone: result.user.phone || '',
            address: result.user.address || '',
            profile_picture: result.user.profile_picture || ''
          });
        }
      } catch (err) {
        console.error("Gagal memuat data profil bray:", err);
      }
    };

    fetchProfileData();
  }, []);

  // ✍️ FUNGSI INPUT HANDLER TEXT
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 📸 FUNGSI INPUT HANDLER FILE GAMPANG PILIH FOTO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Buat nampilin preview lokal sebelum diupload bray
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

// 💾 Handle simpan update profile ke backend /api/auth/update-profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      
      if (selectedFile) {
        // 🔥 KUNCI SUKSES: Ganti 'image' jadi 'ktm' biar sinkron sama Multer backend bray!
        data.append('ktm', selectedFile); 
      }

      const res = await fetch('http://127.0.0.1:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });
      const result = await res.json();
      
      if (res.ok || result.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil, Abangkuh! 🔥',
          text: 'Data profil beserta foto lu udah diperbarui ke database.',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update',
          text: result.message || 'Coba cek koneksi backend lu bray.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Terjadi kesalahan pada sistem server backend bray.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Path fallback gambar template lu bray
  const defaultAvatar = "/assets/img/about.jpg"; 

  const getProfileImageUrl = () => {
    // 1. Kalau user baru milih gambar lokal, langsung tampilin preview lokalnya bray
    if (previewUrl) return previewUrl;

    // 2. Kalau di database statusnya null atau string kosong, pakai avatar bawaan template
    if (!formData.profile_picture) return defaultAvatar;
    
    // 3. Kalau isi datanya string link utuh (http://...)
    if (formData.profile_picture.startsWith('http')) return formData.profile_picture;
    
    // 4. Diarahkan ke subfolder /uploads/ktm/ sesuai backend lu abangkuh!
    return `http://127.0.0.1:5000/uploads/ktm/${formData.profile_picture}`;
  };

  return (
    <>
      {/* 🟦 Background Biru Atas */}
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 -z-10"></div>

      {/* 📋 Sidebar Kiri */}
      <Sidebar />

      {/* 🚀 Main Content Wrapper */}
      <main className="relative h-full min-h-screen transition-all duration-200 ease-in-out xl:ml-68 rounded-xl flex flex-col">
        <Navbar />

        {/* 👤 Container Form Profile */}
        <div className="px-6 py-6 mx-auto w-full mt-20">
          
          {/* CARD INFORMASI SEKILAS */}
          <div className="relative w-full mx-auto mb-6">
            <div className="relative flex flex-col flex-auto min-w-0 p-4 overflow-hidden break-words bg-white border-0 dark:bg-slate-850 dark:shadow-dark-xl shadow-3xl rounded-2xl bg-clip-border">
              <div className="flex flex-wrap -mx-3">
                <div className="flex-none w-auto max-w-full px-3">
                  <div className="relative inline-flex items-center justify-center text-white transition-all duration-200 ease-in-out text-base h-19 w-19 rounded-xl">
                    <img 
                      src={getProfileImageUrl()} 
                      alt="profile_image" 
                      className="w-full shadow-2xl rounded-xl object-cover h-19" 
                    />
                  </div>
                </div>
                <div className="flex-none w-auto max-w-full px-3 my-auto">
                  <div className="h-full">
                    <h5 className="mb-1 dark:text-white font-bold">{formData.name || 'Nama Belum Diisi'}</h5>
                    <p className="mb-0 font-semibold leading-normal text-xs uppercase text-blue-500 tracking-wider">
                      Role: {formData.role} 
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] text-white ${formData.verification_status === 'approved' ? 'bg-emerald-500' : formData.verification_status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}>
                        {formData.verification_status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3">
            
            {/* SISI KIRI: INPUT FORM */}
            <div className="w-full max-w-full px-3 shrink-0 md:w-8/12 md:flex-0">
              <form onSubmit={handleSubmit} className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
                <div className="border-black/12.5 rounded-t-2xl border-b-0 border-solid p-6 pb-0">
                  <div className="flex items-center">
                    <p className="mb-0 font-bold dark:text-white/80 text-slate-700 text-base">Edit Akun Profile</p>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="inline-block px-8 py-2 mb-4 ml-auto font-bold leading-normal text-center text-white align-middle transition-all ease-in bg-blue-500 border-0 rounded-lg shadow-md cursor-pointer text-xs hover:shadow-xs hover:-translate-y-px active:opacity-85 focus:outline-none disabled:bg-slate-400"
                    >
                      {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
                
                <div className="flex-auto p-6">
                  <p className="leading-normal uppercase text-blue-500 font-bold text-xs tracking-wider mb-4">Informasi Pengguna</p>
                  <div className="flex flex-wrap -mx-3">
                    <div className="w-full max-w-full px-3 shrink-0 md:w-6/12 md:flex-0">
                      <div className="mb-4">
                        <label className="inline-block mb-2 ml-1 font-bold text-xs text-slate-700 dark:text-white/80">Nama Lengkap (Name)</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          className="focus:shadow-primary-outline dark:bg-slate-850 dark:text-white text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" 
                          required
                        />
                      </div>
                    </div>
                    <div className="w-full max-w-full px-3 shrink-0 md:w-6/12 md:flex-0">
                      <div className="mb-4">
                        <label className="inline-block mb-2 ml-1 font-bold text-xs text-slate-700 dark:text-white/80">Alamat Email (Tidak Bisa Diubah)</label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email}
                          disabled
                          className="focus:shadow-primary-outline dark:bg-slate-800 dark:text-slate-400 text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-slate-100 bg-clip-padding px-3 py-2 font-normal text-gray-500 outline-none cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="h-px mx-0 my-4 bg-transparent border-0 opacity-25 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                  
                  <p className="leading-normal uppercase text-blue-500 font-bold text-xs tracking-wider mb-4">Informasi Kontak</p>
                  <div className="flex flex-wrap -mx-3">
                    <div className="w-full max-w-full px-3 shrink-0 md:w-6/12 md:flex-0">
                      <div className="mb-4">
                        <label className="inline-block mb-2 ml-1 font-bold text-xs text-slate-700 dark:text-white/80">Nomor Telepon (Phone)</label>
                        <input 
                          type="text" 
                          name="phone" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Contoh: 08123456789"
                          className="focus:shadow-primary-outline dark:bg-slate-850 dark:text-white text-sm leading-5.6 ease block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none" 
                        />
                      </div>
                    </div>
                    <div className="w-full max-w-full px-3 shrink-0 md:w-full md:flex-0">
                      <div className="mb-4">
                        <label className="inline-block mb-2 ml-1 font-bold text-xs text-slate-700 dark:text-white/80">Alamat Rumah Lengkap (Address)</label>
                        <textarea 
                          name="address" 
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="focus:shadow-primary-outline dark:bg-slate-850 dark:text-white text-sm block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 📸 INPUT BARU: FITUR UBAH FOTO PROFIL BIAR KAGAK NULL LAGI BRAY */}
                    <div className="w-full max-w-full px-3 shrink-0 md:w-full md:flex-0">
                      <div className="mb-4">
                        <label className="inline-block mb-2 ml-1 font-bold text-xs text-slate-700 dark:text-white/80">Ganti Foto Profile</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="focus:shadow-primary-outline dark:bg-slate-850 dark:text-white text-sm block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-[11px] text-gray-400 mt-1 ml-1">*Pilih foto baru kalau mau ganti tampilan avatar lu abangkuh.</p>
                      </div>
                    </div>

                  </div>
                </div>
              </form>
            </div>
{/* SISI KANAN: PREVIEW CARD PROFIL */}
            <div className="w-full max-w-full px-3 mt-6 shrink-0 md:w-4/12 md:flex-0 md:mt-0">
              <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border overflow-visible"> {/* 👈 KUNCI 1: Ganti overflow-hidden jadi overflow-visible biar kepala avatar gak kepotong */}
                <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl"></div>
                
                <div className="flex flex-wrap justify-center -mx-3">
                  <div className="w-4/12 max-w-full px-3 flex-0">
                    {/* 👈 KUNCI 2: Margin-top negatif kita turunin dikit jadi -mt-10 biar posisinya pas di tengah garis */}
                    <div className="-mt-10 mb-2 flex justify-center relative z-10"> 
                      <img 
                        className="h-24 w-24 object-cover border-4 border-white border-solid rounded-full shadow-lg bg-white" 
                        src={getProfileImageUrl()} 
                        alt="profile preview" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-auto p-6 pt-4">
                  <div className="mt-2 text-center"> {/* 👈 KUNCI 3: mt-4 diturunin jadi mt-2 biar teks gak terlalu jauh ke bawah */}
                    <h5 className="dark:text-white font-bold text-lg">
                      {formData.name || 'Nama User'}
                    </h5>
                    <div className="mb-2 font-semibold text-sm text-slate-400">
                      {formData.email}
                    </div>
                    <div className="mt-4 mb-2 font-medium text-sm text-slate-600 dark:text-white/80">
                      <i className="mr-2 ni ni-badge text-blue-500"></i>
                      Status Akun: <span className="capitalize font-bold">{formData.verification_status}</span>
                    </div>
                    <div className="mb-2 font-medium text-sm text-slate-600 dark:text-white/80">
                      <i className="mr-2 ni ni-mobile-button text-orange-500"></i>
                      {formData.phone || 'Belum isi nomor HP bray'}
                    </div>
                    <div className="font-medium text-sm text-slate-600 dark:text-white/80 max-w-xs mx-auto truncate">
                      <i className="mr-2 ni ni-pin-3 text-emerald-500"></i>
                      {formData.address || 'Alamat belum diatur'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
        <Footer />
      </main>
    </>
  );
}