export default function Hero() {
  return (
    <section id="hero">
      {/* Background patterns bisa lu sesuaikan */}
      <div className="hs hs1"></div>
      <div className="hs hs2"></div>
      
      <div className="container">
        <div className="row align-items-center g-5" style={{ minHeight: "88vh" }}>
          <div className="col-lg-6">
            <div className="hbadge">
              <div className="hbi"><i className="fas fa-shopping-basket"></i></div>
              <span>#1 Marketplace Pre-Order Mahasiswa</span>
            </div>
            
            <h1 className="htitle">
              Pesan makan anti drama,<span className="hl">Orderly</span><br/>
             Bikin Rapih Bersama.
            </h1>
            
            <p className="hdesc">
              Orderly hadir untuk mengakhiri salah catat dan keterlambatan informasi. 
              Kelola pesanan, pantau pembayaran, dan pastikan setiap PO mahasiswa terorganisir dalam satu platform transparan.
            </p>
            
            <div className="d-flex flex-wrap gap-3 mb-2">
              <a href="#menu" className="btn-red">
                <i className="fas fa-search"></i> Cari Produk PO
              </a>
              <a href="/register" className="btn-play">
                <div className="pico"><i className="fas fa-user-plus"></i></div>
                <span>Daftar Sekarang</span>
              </a>
            </div>

            {/* Stats Orderly */}
            <div className="hstats d-flex gap-3 flex-wrap mt-4">
              <div className="hstat"><span className="snum">PO<em>+</em></span><small>Transaksi Aman</small></div>
              <div className="sdiv"></div>
              <div className="hstat"><span className="snum">100<em>%</em></span><small>Transparan</small></div>
              <div className="sdiv"></div>
              <div className="hstat"><span className="snum">MUDAH</span><small>Sistem Terukur</small></div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div style={{ position: "relative", textAlign: "center" }}>
              <div className="hcircle">
                {/* Gambar ilustrasi marketplace atau dashboard Orderly */}
                <img src="/img/hero.jpeg" alt="Orderly Marketplace" className="img-fluid" />
              </div>
              
              {/* Feature Cards untuk Seller/Buyer */}
              <div className="fcard fc1">
                <div className="fcoi r"><i className="fas fa-clock"></i></div>
                <div><span className="fcnum">Deadline</span><span className="fcsm">PO Terjadwal</span></div>
              </div>
              <div className="fcard fc2">
                <div className="fcoi y"><i className="fas fa-check-double"></i></div>
                <div><span className="fcnum">Verifikasi</span><span className="fcsm">Pembayaran Aman</span></div>
              </div>
              <div className="fcard fc3">
                <div className="fcoi g"><i className="fas fa-receipt"></i></div>
                <div><span className="fcnum">Tracking</span><span className="fcsm">Status Pesanan</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}