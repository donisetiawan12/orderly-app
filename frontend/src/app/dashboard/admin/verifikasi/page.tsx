'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarAdmin from '../SidebarAdmin';    
import NavbarAdmin from '../NavbarAdmin';    
import Footer from '../../seller/Footer';      
import DashboardCardsAdmin from '../DashboardCardsAdmin'; // 🔥 4 Cards Utama Admin
import Swal from 'sweetalert2';

interface SellerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  profile_picture: string; 
}

export default function VerifikasiSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allSellers, setAllSellers] = useState<SellerData[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 🔥 STATE PAGINATION KHUSUS BARIS SELLER (MAX 7 BARIS)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/');
      return;
    }
    
    fetchAllSellers();
  }, [router]);

  const fetchAllSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://orderly.web.id/api/auth/admin/pending-sellers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (res.ok && result.data) {
        // 🔥 KUNCI MATI DI SINI BRAY: Cuma lolos kalau punya berkas KTM mahasiswa (Sellers pendaftar). 
        // Kalau role-nya murni Buyer pasti ktm_path-nya kosong/null, otomatis langsung dibuang!
        const murniSellerSaja = result.data
          .filter((user: any) => user.ktm_path && user.ktm_path.trim() !== '') 
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            verification_status: user.verification_status, 
            profile_picture: user.ktm_path 
          }));

        setAllSellers(murniSellerSaja);
      }
    } catch (err) {
      console.error("Gagal ngambil data seller bray:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (id: number, status: 'approved' | 'rejected') => {
    const warnaKonfirmasi = status === 'approved' ? '#10b981' : '#ef4444';

    Swal.fire({
      title: `<span style="color: #1e293b; font-weight: bold;">Yakin mau mengubah status seller ini?</span>`,
      html: `<span style="color: #64748b; font-size: 15px;">Status akan diubah menjadi <b>${status === 'approved' ? 'ACC (Aktif)' : 'Ditolak'}</b>.</span>`,
      icon: 'question',
      showCancelButton: true,
      reverseButtons: true, 
      confirmButtonText: 'Ya, Eksekusi!',
      cancelButtonText: 'Batal',
      customClass: { confirmButton: 'anti-hover-confirm', cancelButton: 'anti-hover-cancel' },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();
        if (confirmBtn) {
          confirmBtn.style.backgroundColor = warnaKonfirmasi; confirmBtn.style.color = '#ffffff';
          confirmBtn.style.fontWeight = 'bold'; confirmBtn.style.borderRadius = '8px'; confirmBtn.style.border = 'none';
          confirmBtn.style.padding = '10px 20px'; confirmBtn.style.boxShadow = 'none'; confirmBtn.style.transition = 'none';
          confirmBtn.onmouseover = () => confirmBtn.style.backgroundColor = warnaKonfirmasi;
          confirmBtn.onmouseleave = () => confirmBtn.style.backgroundColor = warnaKonfirmasi;
        }
        if (cancelBtn) {
          cancelBtn.style.backgroundColor = '#64748b'; cancelBtn.style.color = '#ffffff';
          cancelBtn.style.fontWeight = 'bold'; cancelBtn.style.borderRadius = '8px'; cancelBtn.style.border = 'none';
          cancelBtn.style.padding = '10px 20px'; cancelBtn.style.boxShadow = 'none'; cancelBtn.style.transition = 'none';
          cancelBtn.onmouseover = () => cancelBtn.style.backgroundColor = '#64748b';
          cancelBtn.onmouseleave = () => cancelBtn.style.backgroundColor = '#64748b';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(id);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://orderly.web.id/api/auth/admin/verify-seller/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
          });

          if (res.ok) {
            Swal.fire({
              icon: 'success',
              title: `<span style="color: #1e293b; font-weight: bold;">Status Diperbarui! 🔥</span>`,
              confirmButtonText: 'Mantap',
              didOpen: () => {
                const btn = Swal.getConfirmButton();
                if (btn) {
                  btn.style.backgroundColor = '#3b82f6'; btn.style.color = '#ffffff'; btn.style.borderRadius = '8px';
                  btn.style.border = 'none'; btn.style.padding = '10px 20px'; btn.style.transition = 'none';
                  btn.onmouseover = () => btn.style.backgroundColor = '#3b82f6';
                  btn.onmouseleave = () => btn.style.backgroundColor = '#3b82f6';
                }
              }
            });
            setAllSellers(prev => prev.map(seller => seller.id === id ? { ...seller, verification_status: status } : seller));
          } else {
            Swal.fire({ icon: 'error', title: `<span style="color: #1e293b; font-weight: bold;">Gagal</span>`, html: `<span style="color: #64748b;">Gagal mengubah status database bray.</span>`, confirmButtonText: 'Tutup' });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({ icon: 'error', title: `<span style="color: #1e293b; font-weight: bold;">Oops</span>`, html: `<span style="color: #64748b;">Koneksi backend bermasalah bray.</span>`, confirmButtonText: 'Tutup' });
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex justify-center items-center font-bold text-slate-700">
        Memuat Halaman Verifikasi Seller... 🛡️
      </div>
    );
  }

  // 🔥 HITUNG PAGINATION BERDASARKAN HASIL FILTER SELLER MURNI
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSellers = allSellers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allSellers.length / itemsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 -z-10"></div>
      
      <SidebarAdmin />

      <main className="relative flex-1 flex flex-col transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
        <NavbarAdmin />

        <div className="px-6 py-6 mx-auto w-full mt-20 flex-1">
          
          <DashboardCardsAdmin allSellers={allSellers} />
          
          {/* TABEL TOTAL MANAJEMEN MURNI SELLER */}
          <div className="relative flex flex-col min-w-0 break-words bg-white border-0 shadow-xl rounded-2xl bg-clip-border overflow-hidden mt-6">
            <div className="p-6 pb-2 bg-white border-b border-solid border-slate-100 flex items-center justify-between">
              <h6 className="font-bold text-slate-700 mb-0 flex items-center">
                <i className="ni ni-bullet-list-67 text-blue-500 mr-2 text-lg"></i>
                Daftar Riwayat Seluruh Pendaftar Seller ({allSellers.length})
              </h6>
            </div>
            
            <div className="flex-auto px-0 pt-0 pb-2">
              <div className="p-0 overflow-x-auto">
                <table className="items-center w-full mb-0 align-top border-collapse text-slate-500">
                  <thead className="align-bottom bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75 w-16">No</th>
                      <th className="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Nama & Email Seller</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Nomor HP</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Status Verifikasi</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Foto KTM Mahasiswa</th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 text-xxs tracking-wider text-slate-400 opacity-75">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSellers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-sm font-semibold text-slate-400">
                          📭 Belum ada data pendaftaran seller.
                        </td>
                      </tr>
                    ) : (
                      currentSellers.map((seller, idx) => {
                        const urutanNormal = indexOfFirstItem + idx + 1;
                        return (
                          <tr key={seller.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-2 align-middle text-center text-sm font-bold text-slate-700">{urutanNormal}</td>
                            <td className="p-2 align-middle">
                              <div className="flex px-2 py-1">
                                <div className="flex flex-col">
                                  <h6 className="mb-0 text-sm font-bold text-slate-800">{seller.name}</h6>
                                  <p className="mb-0 text-xs text-slate-400">{seller.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-center align-middle text-sm font-semibold text-slate-600">{seller.phone || '-'}</td>
                            <td className="p-2 text-center align-middle text-sm font-bold">
                              {seller.verification_status === 'approved' && <span className="bg-emerald-100 text-emerald-700 text-[11px] px-2.5 py-1 rounded-pill">Aktif (ACC)</span>}
                              {seller.verification_status === 'pending' && <span className="bg-amber-100 text-amber-700 text-[11px] px-2.5 py-1 rounded-pill animate-pulse">Pending</span>}
                              {seller.verification_status === 'rejected' && <span className="bg-red-100 text-red-700 text-[11px] px-2.5 py-1 rounded-pill">Di Tolak</span>}
                            </td>
                            <td className="p-2 align-middle text-center" style={{ color: '#475569' }}>
                              {seller.profile_picture ? (
                                <div 
                                  onClick={() => {
                                    Swal.fire({
                                      title: `<span style="color: #1e293b; font-weight: bold;">KTM - ${seller.name}</span>`,
                                      imageUrl: `http://orderly.web.id/uploads/ktm/${seller.profile_picture}`,
                                      imageAlt: 'Foto KTM Mahasiswa',
                                      imageWidth: 400, confirmButtonColor: '#3b82f6',
                                      confirmButtonText: '<span style="color: #ffffff; font-weight: bold;">Tutup</span>',
                                      customClass: { popup: 'swal-modal-fix', image: 'rounded-xl shadow-inner object-contain max-h-[300px]' }
                                    });
                                  }}
                                  className="inline-block cursor-pointer"
                                  style={{ opacity: 1, filter: 'none', display: 'inline-block' }}
                                >
                                  <img src={`http://orderly.web.id/uploads/ktm/${seller.profile_picture}`} alt="KTM" className="w-16 h-10 object-cover rounded border border-gray-200 shadow-md" style={{ opacity: '1 !important', filter: 'none' }} />
                                </div>
                              ) : (
                                <span className="italic font-semibold" style={{ color: '#94a3b8 !important', fontSize: '12px', display: 'block' }}>No File</span>
                              )}
                            </td>
                            <td className="p-2 align-middle text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button type="button" disabled={actionLoading === seller.id || seller.verification_status === 'approved'} onClick={() => handleVerifyAction(seller.id, 'approved')} style={{ backgroundColor: seller.verification_status === 'approved' ? '#e2e8f0' : '#10b981', color: seller.verification_status === 'approved' ? '#94a3b8' : '#ffffff', border: 'none', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: seller.verification_status === 'approved' ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}>ACC</button>
                                <button type="button" disabled={actionLoading === seller.id || seller.verification_status === 'rejected'} onClick={() => handleVerifyAction(seller.id, 'rejected')} style={{ backgroundColor: seller.verification_status === 'rejected' ? '#e2e8f0' : '#ef4444', color: seller.verification_status === 'rejected' ? '#94a3b8' : '#ffffff', border: 'none', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: seller.verification_status === 'rejected' ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}>Tolak</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* CONTROLLER NAVIGASI HALAMAN */}
              {allSellers.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-gray-100 flex-wrap gap-2">
                  <div className="text-xs font-semibold text-slate-500">
                    Menampilkan <span className="text-slate-700 font-bold">{indexOfFirstItem + 1}</span> sampai{' '}
                    <span className="text-slate-700 font-bold">
                      {Math.min(indexOfLastItem, allSellers.length)}
                    </span>{' '}
                    dari <span className="text-slate-700 font-bold">{allSellers.length}</span> Seller
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