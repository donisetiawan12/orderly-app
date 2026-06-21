'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarAdmin from './SidebarAdmin';    
import NavbarAdmin from './NavbarAdmin';    
import Footer from '../seller/Footer';      
import DashboardCardsAdmin from './DashboardCardsAdmin'; 
import Swal from 'sweetalert2';

// Import modul Chart.js bray
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2'; 
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface UserData {
  id: number;
  role: 'seller' | 'buyer';
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string; 
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);

  // 🔑 STATE UTAMA BUAT BUKA TUTUP SIDEBAR PAS DI HP BRAY
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State filter waktu bawaan template bray
  const [timeFilter, setTimeFilter] = useState<'1w' | '1m' | '1y'>('1m');
  const [activeMetric, setActiveMetric] = useState<'all' | 'buyer' | 'seller' | 'rejected'>('all'); 

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== 'admin') {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak!',
          text: 'Halaman ini khusus Admin abangkuh! ⛔',
          confirmButtonColor: '#ef4444'
        });
        router.push('/dashboard/seller'); 
        return;
      }
      
      fetchSummaryData();
    } catch (err) {
      console.error(err);
      router.push('/');
    }
  }, [router]);

  const fetchSummaryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/auth/admin/pending-sellers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (res.ok && result.data) {
        setAllUsers(result.data);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dashboard bray:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter kelompok user murni DB bray
  const activeSellersFromDB = allUsers.filter(u => u.role === 'seller' && u.verification_status === 'approved');
  const rejectedSellersFromDB = allUsers.filter(u => u.role === 'seller' && u.verification_status === 'rejected');
  const buyersFromDB = allUsers.filter(u => u.role === 'buyer');

  let labels: string[] = [];
  let slotSize = 0;

  if (timeFilter === '1w') {
    labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    slotSize = 7;
  } else if (timeFilter === '1m') {
    labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    slotSize = 4;
  } else {
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    slotSize = 12;
  }

  const getDynamicCounts = (dataArray: any[]) => {
    const counts = new Array(slotSize).fill(0);
    const now = new Date();

    dataArray.forEach(item => {
      if (!item.created_at) return;
      const itemDate = new Date(item.created_at);

      if (timeFilter === '1w') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        if (itemDate >= oneWeekAgo && itemDate <= now) {
          let dayIndex = itemDate.getDay() - 1;
          if (dayIndex === -1) dayIndex = 6;
          counts[dayIndex] += 1;
        }
      } 
      else if (timeFilter === '1m') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(now.getDate() - 30);
        if (itemDate >= oneMonthAgo && itemDate <= now) {
          const diffTime = Math.abs(now.getTime() - itemDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) counts[3] += 1;
          else if (diffDays <= 14) counts[2] += 1;
          else if (diffDays <= 21) counts[1] += 1;
          else if (diffDays <= 30) counts[0] += 1;
        }
      } 
      else {
        const monthIndex = itemDate.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          counts[monthIndex] += 1;
        }
      }
    });

    let totalAkumulasi = 0;
    return counts.map(count => {
      totalAkumulasi += count;
      return totalAkumulasi;
    });
  };

  const realSellerChartData = getDynamicCounts(activeSellersFromDB);
  const realBuyerChartData = getDynamicCounts(buyersFromDB);
  const realRejectedChartData = getDynamicCounts(rejectedSellersFromDB);

  const datasets = [];
  
  if (activeMetric === 'all' || activeMetric === 'buyer') {
    datasets.push({
      label: 'Buyer Aktif',
      data: realBuyerChartData, 
      borderColor: '#11cdef', 
      backgroundColor: 'rgba(17, 205, 239, 0.1)',
      tension: 0.4,
      fill: true,
    });
  }
  
  if (activeMetric === 'all' || activeMetric === 'seller') {
    datasets.push({
      label: 'Seller Aktif',
      data: realSellerChartData, 
      borderColor: '#2dce89', 
      backgroundColor: 'rgba(45, 206, 137, 0.1)',
      tension: 0.4,
      fill: true,
    });
  }

  if (activeMetric === 'all' || activeMetric === 'rejected') {
    datasets.push({
      label: 'Seller Ditolak',
      data: realRejectedChartData, 
      borderColor: '#f5365c', 
      backgroundColor: 'rgba(245, 54, 92, 0.1)',
      tension: 0.4,
      fill: true,
    });
  }

  const chartData = { labels, datasets };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(226, 232, 240, 0.4)' },
        ticks: {
          stepSize: 1, 
          precision: 0, 
          callback: function(value: any) {
            if (value % 1 === 0) return value;
          }
        }
      },
      x: { grid: { display: false } }
    }
  };

  const pureSellersOnly = allUsers.filter(u => u.role === 'seller') as any;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="absolute w-full bg-blue-500 min-h-75 top-0 left-0 -z-10"></div>
      
      {/* 🔑 HUBUNGKAN STATE KE SIDEBAR: Biar dia tau kapan kudu sliding nongol */}
      <SidebarAdmin isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="relative flex-1 flex flex-col transition-all duration-200 ease-in-out xl:ml-68 rounded-xl">
        {/* 🔑 HUBUNGKAN TRIGGER KE NAVBAR: Biar pas Hamburger diklik, dia ngerubah statenya */}
        <NavbarAdmin toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="px-6 py-6 mx-auto w-full mt-20 flex-1">
          <DashboardCardsAdmin allSellers={pureSellersOnly} />
          
          <div className="flex flex-wrap mt-6 -mx-3">
            <div className="w-full max-w-full px-3 mt-0"> 
              <div className="border-black/12.5 dark:bg-slate-850 dark:shadow-dark-xl shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border w-full">
                
                <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0 flex flex-col gap-4 flex-none">
                  <div className="flex flex-row justify-between items-start w-full">
                    <div>
                      <h6 className="capitalize dark:text-white font-bold text-slate-700 mb-1">Analisis Pertumbuhan Pengguna</h6>
                      <p className="mb-0 text-xs leading-normal dark:text-white dark:opacity-60 flex items-center gap-1">
                        <i className="fa fa-arrow-up text-emerald-500"></i>
                        <span className="text-slate-400">Data grafik murni sinkron terhubung dengan database</span>
                      </p>
                    </div>
                    
                    <div className="flex-none">
                      <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer shadow-sm outline-none focus:border-blue-500 transition-all"
                        style={{ width: '120px' }}
                      >
                        <option value="1w">📅 1 Minggu</option>
                        <option value="1m">📅 1 Bulan</option>
                        <option value="1y">📅 1 Tahun</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex p-1 text-xs font-bold gap-1 flex-wrap self-start">
                    <button 
                      type="button"
                      onClick={() => setActiveMetric('all')} 
                      className="px-3 py-2 rounded-lg border-none cursor-pointer font-bold text-xs transition-all shadow-none"
                      style={{ 
                        backgroundColor: activeMetric === 'all' ? '#3b82f6' : 'transparent',
                        color: activeMetric === 'all' ? '#ffffff' : '#475569',
                      }}
                    >
                      Semua Pengguna
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setActiveMetric('buyer')} 
                      className="px-3 py-2 rounded-lg border-none cursor-pointer font-bold text-xs transition-all shadow-none"
                      style={{ 
                        backgroundColor: activeMetric === 'buyer' ? '#06b6d4' : 'transparent',
                        color: activeMetric === 'buyer' ? '#ffffff' : '#475569',
                      }}
                    >
                      Khusus Buyer ({buyersFromDB.length})
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setActiveMetric('seller')} 
                      className="px-3 py-2 rounded-lg border-none cursor-pointer font-bold text-xs transition-all shadow-none"
                      style={{ 
                        backgroundColor: activeMetric === 'seller' ? '#10b981' : 'transparent',
                        color: activeMetric === 'seller' ? '#ffffff' : '#475569',
                      }}
                    >
                      Khusus Seller ({activeSellersFromDB.length})
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setActiveMetric('rejected')} 
                      className="px-3 py-2 rounded-lg border-none cursor-pointer font-bold text-xs transition-all shadow-none"
                      style={{ 
                        backgroundColor: activeMetric === 'rejected' ? '#ef4444' : 'transparent',
                        color: activeMetric === 'rejected' ? '#ffffff' : '#475569',
                      }}
                    >
                      Sellers Ditolak ({rejectedSellersFromDB.length})
                    </button>
                  </div>
                </div>

                <div className="flex-auto p-4 mt-2 w-full">
                  <div className="w-full relative" style={{ height: '450px' }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        <Footer />
      </main>
    </div>
  );
}