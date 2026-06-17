'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// 🔥 Kita satukan interface biar TypeScript gak bingung pas mapping data gabungan
interface UnifiedOrder {
  id?: number;
  buyer_id?: number;
  buyer_name?: string;
  product_name?: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string; 
}

interface DashboardData {
  total_order: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  recent_orders: UnifiedOrder[];
  chart_orders?: UnifiedOrder[]; 
}

type TimeFilterType = '1w' | '1m' | '1y';
type MetricType = 'revenue' | 'customers' | 'products' | 'orders';

export default function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('1y');
  const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');

  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartDataset, setChartDataset] = useState<number[]>([]);

  const [dynamicStats, setDynamicStats] = useState({
    revenue: 0,
    customers: 0,
    products: 0,
    orders: 0
  });

  const carouselItems = [
    {
      icon: 'ni-camera-compact',
      title: 'Mulai jualan bersama Orderly',
      desc: 'Kelola seluruh produk, cek data pesanan masuk, dan pantau grafik profit kamu secara real-time.',
      img: '/img/hero.jpeg'
    },
    {
      icon: 'ni-bulb-61',
      title: 'Analisis Grafik Lebih Cepat',
      desc: 'Gunakan data grafik penjualan untuk menentukan strategi produk terlaris kamu.',
      img: '/img/grafik.png'
    },
    {
      icon: 'ni-trophy',
      title: 'Bagikan Tips Desain Kamu Sekarang!',
      desc: 'Jangan takut salah langkah, karena kepuasan pelanggan adalah trophy terbaik seorang seller.',
      img: '/img/presen.jpeg'
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://127.0.0.1:5000/api/orders/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (result.status === 'success') setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!data) return;

    const sekarang = new Date();
    
    // 1. Ambil chart_orders sebagai basis utama grafik biar gak tumpang tindih
    const orders: UnifiedOrder[] = data.chart_orders && data.chart_orders.length > 0 
      ? data.chart_orders 
      : data.recent_orders;

    const parseSqlDate = (dateStr: any): Date => {
      if (!dateStr) return new Date();
      const formatted = String(dateStr).replace(' ', 'T');
      const d = new Date(formatted);
      return isNaN(d.getTime()) ? new Date(dateStr) : d;
    };

    let totalRevenueFiltered = 0;
    let totalOrdersFiltered = 0;
    let totalProductsFiltered = 0;
    const pelangganUnikSet = new Set();

    const isOrderInTimeRange = (orderDate: Date, limitDays: number) => {
      const selisihWaktu = sekarang.getTime() - orderDate.getTime();
      const selisihHari = Math.floor(selisihWaktu / (1000 * 60 * 60 * 24));
      return selisihHari >= 0 && selisihHari < limitDays;
    };

    const isOrderInMonthRange = (orderDate: Date, limitMonths: number) => {
      const selisihBulan = (sekarang.getFullYear() - orderDate.getFullYear()) * 12 + (sekarang.getMonth() - orderDate.getMonth());
      return selisihBulan >= 0 && selisihBulan < limitMonths;
    };

    // Filter range waktu data
    const filteredOrders = orders.filter(order => {
      const tgl = parseSqlDate(order.created_at);
      if (timeFilter === '1w') return isOrderInTimeRange(tgl, 7);
      if (timeFilter === '1m') return isOrderInTimeRange(tgl, 30);
      if (timeFilter === '1y') return isOrderInMonthRange(tgl, 12);
      return true;
    });

 // 📊 Hitung Akumulasi Box Atas (Sesuai Logika Database)
    filteredOrders.forEach(order => {
      const statusValid = ['paid', 'confirmed', 'shipped', 'completed'];
      
      // Revenue cuma ngitung status sukses bray
      if (statusValid.includes(order.status || '')) {
        totalRevenueFiltered += Number(order.total_price || 0);
      }
      
      totalOrdersFiltered += 1;
      
      // 🔥 PASTIKAN DI SINI: Apakah di data order lu namanya 'quantity'? 
      // Kalau di JSON order namanya 'quantity', dia bakal nambahin sesuai jumlah yang dibeli di transaksi itu.
      totalProductsFiltered += Number(order.quantity || 0);
      
      const buyerKey = order.buyer_id || order.buyer_name || 'anon';
      pelangganUnikSet.add(buyerKey);
    });

    setDynamicStats({
      revenue: totalRevenueFiltered,
      orders: totalOrdersFiltered,
      // 💡 JIKA LU INGIN PRODUK TERJUAL SELALU SAMA DENGAN DATABASE UTAMA (MUTLAK 20 ITEMS):
      // Ganti baris di bawah ini jadi: products: data.total_products || 0,
      products: totalProductsFiltered, 
      customers: pelangganUnikSet.size
    });

    setDynamicStats({
      revenue: totalRevenueFiltered,
      orders: totalOrdersFiltered,
      products: totalProductsFiltered,
      customers: pelangganUnikSet.size
    });

    // 📅 Map Data Masuk Ke Sumbu Grafik
    const dapatkanNilaiMetrik = (order: UnifiedOrder) => {
      if (activeMetric === 'revenue') {
        const statusValid = ['paid', 'confirmed', 'shipped', 'completed'];
        if (order.status && !statusValid.includes(order.status)) return 0;
        return Number(order.total_price || 0);
      }
      if (activeMetric === 'orders') return 1; 
      if (activeMetric === 'products') return Number(order.quantity || 0); 
      return 0;
    };

    if (timeFilter === '1w') {
      const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const hitunganHari = new Array(7).fill(0);
      const labelHari: string[] = [];
      const pelangganHari: Set<any>[] = Array.from({ length: 7 }, () => new Set());

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(sekarang.getDate() - i);
        labelHari.push(namaHari[d.getDay()]);
      }

      filteredOrders.forEach((order) => {
        const tgl = parseSqlDate(order.created_at);
        const selisihHari = Math.floor((sekarang.getTime() - tgl.getTime()) / (1000 * 60 * 60 * 24));
        if (selisihHari >= 0 && selisihHari < 7) {
          const targetIdx = 6 - selisihHari;
          if (activeMetric === 'customers') {
            pelangganHari[targetIdx].add(order.buyer_id || order.buyer_name || 'anon');
          } else {
            hitunganHari[targetIdx] += dapatkanNilaiMetrik(order);
          }
        }
      });

      setChartLabels(labelHari);
      setChartDataset(activeMetric === 'customers' ? pelangganHari.map(s => s.size) : hitunganHari);

    } else if (timeFilter === '1m') {
      const hitunganMinggu = new Array(4).fill(0);
      const pelangganMinggu: Set<any>[] = Array.from({ length: 4 }, () => new Set());

      filteredOrders.forEach((order) => {
        const tgl = parseSqlDate(order.created_at);
        const selisihHari = Math.floor((sekarang.getTime() - tgl.getTime()) / (1000 * 60 * 60 * 24));
        if (selisihHari >= 0 && selisihHari < 30) {
          const indexMinggu = Math.floor(selisihHari / 7);
          if (indexMinggu < 4) {
            const targetIdx = 3 - indexMinggu;
            if (activeMetric === 'customers') {
              pelangganMinggu[targetIdx].add(order.buyer_id || order.buyer_name || 'anon');
            } else {
              hitunganMinggu[targetIdx] += dapatkanNilaiMetrik(order);
            }
          }
        }
      });

      setChartLabels(['3 Minggu Lalu', '2 Minggu Lalu', '1 Minggu Lalu', 'Minggu Ini']);
      setChartDataset(activeMetric === 'customers' ? pelangganMinggu.map(s => s.size) : hitunganMinggu);

    } else if (timeFilter === '1y') {
      const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const hitunganBulan = new Array(12).fill(0);
      const labelBulan: string[] = [];
      const pelangganBulan: Set<any>[] = Array.from({ length: 12 }, () => new Set());

      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(sekarang.getMonth() - i);
        labelBulan.push(namaBulan[d.getMonth()]);
      }

      filteredOrders.forEach((order) => {
        const tgl = parseSqlDate(order.created_at);
        const selisihBulan = (sekarang.getFullYear() - tgl.getFullYear()) * 12 + (sekarang.getMonth() - tgl.getMonth());
        if (selisihBulan >= 0 && selisihBulan < 12) {
          const targetIdx = 11 - selisihBulan;
          if (activeMetric === 'customers') {
            pelangganBulan[targetIdx].add(order.buyer_id || order.buyer_name || 'anon');
          } else {
            hitunganBulan[targetIdx] += dapatkanNilaiMetrik(order);
          }
        }
      });

      setChartLabels(labelBulan);
      setChartDataset(activeMetric === 'customers' ? pelangganBulan.map(s => s.size) : hitunganBulan);
    }

  }, [timeFilter, activeMetric, data]);

  if (loading) return <p className="text-white opacity-80 animate-pulse text-sm px-4 py-2">Mengambil data transaksi...</p>;

  const pendingCount = data?.recent_orders
    ? data.recent_orders.filter((o: UnifiedOrder) => o.status === 'paid' || o.status === 'pending').length
    : 0;

  const labelNamaDataset = 
    activeMetric === 'revenue' ? 'Omset Penjualan (Rp)' :
    activeMetric === 'customers' ? 'Jumlah Pelanggan' :
    activeMetric === 'products' ? 'Produk Terjual (Items)' : 'Total Order';

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: labelNamaDataset,
        data: chartDataset,
        fill: true,
        backgroundColor: 'rgba(94, 114, 228, 0.12)',
        borderColor: '#5e72e4',
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#5e72e4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        tension: 0.4, 
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            if (activeMetric === 'revenue') {
              return ` Omset: Rp ${context.raw.toLocaleString('id-ID')}`;
            }
            return ` Total: ${context.raw.toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: {
          color: '#8898aa',
          font: { size: 11 },
          callback: function (value: any) {
            if (activeMetric === 'revenue') {
              return 'Rp ' + value.toLocaleString('id-ID');
            }
            return value.toLocaleString('id-ID');
          }
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#8898aa', font: { size: 11 } },
      },
    },
  };

  const timeLabelText = timeFilter === '1w' ? '7 Hari Terakhir' : timeFilter === '1m' ? '30 Hari Terakhir' : '12 Bulan Terakhir';

  return (
    <>
      {/* ================= BARIS 1: CARDS ATAS (SINKRON & TIDAK ERROR) ================= */}
      <div className="flex flex-wrap -mx-3">
        {/* Card 1: Pendapatan */}
        <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
          <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
            <div className="flex-auto p-4">
              <div className="flex flex-row -mx-3">
                <div className="flex-none w-2/3 max-w-full px-3">
                  <div>
                    <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Pendapatan</p>
                    <h5 className="mb-2 font-bold dark:text-white text-lg">
                      Rp {dynamicStats.revenue.toLocaleString('id-ID')}
                    </h5>
                    <p className="mb-0 dark:text-white dark:opacity-60 text-xs">
                      Total <span className="font-bold text-emerald-500">{timeLabelText}</span>
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

        {/* Card 2: Pelanggan */}
        <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
          <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
            <div className="flex-auto p-4">
              <div className="flex flex-row -mx-3">
                <div className="flex-none w-2/3 max-w-full px-3">
                  <div>
                    <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">PELANGGAN</p>
                    <h5 className="mb-2 font-bold dark:text-white text-lg text-slate-800">
                      {dynamicStats.customers} Orang
                    </h5>
                    <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
                      Pelanggan <span className="font-bold text-emerald-500">{timeLabelText}</span>
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

        {/* Card 3: Produk Terjual */}
        <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
          <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
            <div className="flex-auto p-4">
              <div className="flex flex-row -mx-3">
                <div className="flex-none w-2/3 max-w-full px-3">
                  <div>
                    <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">Total Produk Terjual</p>
                    <h5 className="mb-2 font-bold dark:text-white text-lg">
                      {dynamicStats.products} Pcs
                    </h5>
                    <p className="mb-0 dark:text-white dark:opacity-60 text-xs">
                      Terjual <span className="font-bold text-emerald-500">{timeLabelText}</span>
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

        {/* Card 4: Total Order Masuk Dinamis (Udah Sinkron sama Halaman Produk) */}
<div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
  <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 rounded-2xl">
    <div className="flex-auto p-4">
      <div className="flex flex-row -mx-3">
        <div className="flex-none w-2/3 max-w-full px-3">
          <div>
            <p className="mb-0 font-sans text-xs font-bold uppercase text-slate-400">TOTAL ORDER</p>
            <div className="flex items-center gap-2 mt-0.5 mb-2">
              <h5 className="mb-0 font-bold text-lg text-slate-700 dark:text-white">
                {dynamicStats.orders} Pesanan
              </h5>
            </div>
            
            {/* 🚀 LOGIKA SINKRONISASI: Biar sama persis kayak di halaman produk */}
            <p className="mb-0 dark:text-white dark:opacity-60 text-xs text-slate-400">
              {pendingCount > 0 ? (
                <span className="text-red-500 font-bold animate-pulse">
                   {pendingCount} pending perlu tindakan seller! ⚠️
                </span>
              ) : (
                <span>
                  Semua pesanan <span className="font-bold text-emerald-500">aman/clear</span>
                </span>
              )}
            </p>

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

      {/* ================= BARIS 2: GRAFIK & CAROUSEL ================= */}
      <div className="flex flex-wrap mt-6 -mx-3">
        {/* Kolom Kiri: Line Chart */}
        <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
          <div className="border-black/12.5 dark:bg-slate-850 dark:shadow-dark-xl shadow-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
            <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-0 flex flex-col gap-4 flex-none">
              <div className="flex flex-row justify-between items-start w-full">
                <div>
                  <h6 className="capitalize dark:text-white font-bold text-slate-700 mb-1">Ringkasan Penjualan</h6>
                  <p className="mb-0 text-xs leading-normal dark:text-white dark:opacity-60 flex items-center gap-1">
                    <i className="fa fa-arrow-up text-emerald-500"></i>
                    <span className="text-slate-400">Angka di atas dan grafik otomatis sinkron dengan filter</span>
                  </p>
                </div>
                <div className="flex-none">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as TimeFilterType)}
                    className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer shadow-sm outline-none focus:border-blue-500 transition-all"
                    style={{ width: '120px' }}
                  >
                    <option value="1w">📅 1 Minggu</option>
                    <option value="1m">📅 1 Bulan</option>
                    <option value="1y">📅 1 Tahun</option>
                  </select>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1 flex-wrap self-start">
                <button 
                  type="button"
                  onClick={() => setActiveMetric('revenue')} 
                  className={`px-3 py-2 rounded-lg border-none cursor-pointer transition-all ${activeMetric === 'revenue' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Total Pendapatan
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveMetric('customers')} 
                  className={`px-3 py-2 rounded-lg border-none cursor-pointer transition-all ${activeMetric === 'customers' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Pelanggan
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveMetric('products')} 
                  className={`px-3 py-2 rounded-lg border-none cursor-pointer transition-all ${activeMetric === 'products' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Produk Terjual
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveMetric('orders')} 
                  className={`px-3 py-2 rounded-lg border-none cursor-pointer transition-all ${activeMetric === 'orders' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Total Pesanan
                </button>
              </div>
            </div>
            <div className="flex-auto p-4 mt-2 flex-grow flex flex-col justify-end">
              <div className="w-full" style={{ height: '410px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Carousel Slider */}
        <div className="w-full max-w-full px-3 mb-6 lg:w-5/12 lg:flex-none flex flex-col">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-xl flex-grow min-h-[400px] lg:min-h-0">
            {carouselItems.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.55)), url(${slide.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="block text-start ml-12 left-0 bottom-0 absolute right-[15%] pt-5 pb-14 text-white">
                  <div className="inline-block w-8 h-8 mb-4 text-center text-slate-700 bg-white rounded-lg leading-8">
                    <i className={`ni ${slide.icon} text-sm relative top-0.5`}></i>
                  </div>
                  <h5 className="mb-1 text-white font-bold text-lg">{slide.title}</h5>
                  <p className="text-sm text-white/90 font-light leading-relaxed">{slide.desc}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
              className="absolute z-20 w-10 h-10 left-4 top-4 text-white bg-black/20 hover:bg-black/40 rounded-full border-none cursor-pointer flex items-center justify-center transition-all"
            >
              ❮
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
              className="absolute z-20 w-10 h-10 right-4 top-4 text-white bg-black/20 hover:bg-black/40 rounded-full border-none cursor-pointer flex items-center justify-center transition-all"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </>
  );
}