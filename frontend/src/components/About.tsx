'use client';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
  <section id="about" className="py-5">
  <div className="container py-lg-4"> {/* Padding tambahan biar nggak nempel banget */}
    <div className="row align-items-center g-5">
      
      {/* Bagian Foto - Tetap seperti punyamu */}
      <div className="col-lg-5" data-aos="fade-right">
        <div className="astack">
          <div className="aexp">
            <span className="anum">24/7</span>
            <small>Always<br/>Available</small>
          </div>
          <div className="amain">
            <img src="/img/about.jpg" alt="Mahasiswa" className="img-fluid rounded-4" />
          </div>
          <div className="asm">
            <img src="/img/about2.jpg" alt="Transaksi" className="img-fluid rounded-4" />
          </div>
        </div>
      </div>

      {/* Bagian Teks */}
      <div className="col-lg-7" data-aos="fade-left">
        <span className="slbl" style={{ color: '#60a5fa' }}>Solusi Kampus</span>
        <h2 className="stitle text-start">
          Dibuat oleh Mahasiswa, <span>Untuk Mahasiswa</span>
        </h2>
        <div className="sline lft" style={{ marginLeft: 0 }}></div>
        
        <p className="sdesc mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          Kita paham banget susahnya nyari barang atau makanan pas lagi tugas numpuk. 
          Platform ini hadir biar transaksimu makin gampang, aman, dan pastinya 
          tetap ramah di kantong sesama anak kampus.
        </p>

        {/* Fitur dengan jarak yang lebih rapi */}
        <div className="row g-3">
          {[
            { icon: "fa-handshake", color: "r", title: "Terpercaya", desc: "Transaksi aman komunitas kampus." },
            { icon: "fa-tag", color: "y", title: "Harga Teman", desc: "Penawaran spesial anak kampus." },
            { icon: "fa-bolt", color: "g", title: "Cepat & Praktis", desc: "Pesan, langsung sampai di kosan." }
          ].map((item, i) => (
            <div className="col-md-12" key={i}>
              <div className="fti d-flex align-items-start gap-3">
                <div className={`ftico ${item.color}`} style={{ flexShrink: 0 }}><i className={`fas ${item.icon}`}></i></div>
                <div>
                  <h6 className="mb-1">{item.title}</h6>
                  <p className="mb-0" style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <a href="#menu" className="btn-red" style={{ padding: '12px 30px' }}>
            <i className="fas fa-shopping-cart me-2"></i> Mulai Belanja
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}