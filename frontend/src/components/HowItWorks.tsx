export default function HowItWorks() {
  const steps = [
    { icon: "fa-list-check", title: "Pilih Produk", desc: "Jelajahi menu favoritmu" },
    { icon: "fa-cart-plus", title: "Pre-Order", desc: "Amankan slot pesanan" },
    { icon: "fa-credit-card", title: "Pembayaran", desc: "Selesaikan transaksi mudah" },
    { icon: "fa-truck-fast", title: "Terima Barang", desc: "Pesanan siap diantar" },
  ];

  return (
    <section id="hours" className="py-5">
      <div className="hrsbg"></div>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="text-center mb-5" data-aos="fade-up">
            <span className="slbl" style={{ color: '#818cf8' }}>Cara Kerja</span>
            <h2 className="stitle" style={{ color: '#fff' }}>
                Pesan Makanan Tak Pernah <span>Semudah Ini</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px' }}>
                Ikuti langkah sederhana di bawah ini dan biarkan kami yang mengurus sisanya.
            </p>
            <div className="sline mx-auto mb-4"></div>
            </div>

        <div className="row g-2 justify-content-center align-items-center">
          {steps.map((step, index) => (
            // GANTI REACT.FRAGMENT JADI TAG KOSONG SEPERTI INI:
            <>
              <div className="col-lg-2 col-md-5" key={index} data-aos="zoom-in" data-aos-delay={index * 100}>
                <div className="hrscard" style={{ textAlign: 'center', height: '100%', padding: '20px 10px' }}>
                  <div className="hrsrow" style={{ border: 'none', justifyContent: 'center' }}>
                    <i className={`fas ${step.icon} fa-2x mb-3`} style={{ color: 'var(--secondary)' }}></i>
                  </div>
                  <div className="hrsrow" style={{ border: 'none', flexDirection: 'column', padding: '0' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>{step.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '0.8rem', marginBottom: '10px' }}>{step.desc}</p>
                  </div>
                  <div className="hrsrow" style={{ border: 'none', justifyContent: 'center' }}>
                    <span className="btnw" style={{ fontSize: '0.7rem', padding: '5px 15px' }}>Step {index + 1}</span>
                  </div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="col-lg-1 text-center d-none d-lg-block" data-aos="fade-in">
                  <i className="fas fa-arrow-right fa-2x" style={{ color: 'rgba(255,255,255,0.3)' }}></i>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}