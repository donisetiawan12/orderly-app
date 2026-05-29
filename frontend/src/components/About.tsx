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
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Bagian Foto */}
          <div className="col-lg-5" data-aos="fade-right">
            <div className="astack">
              <div className="aexp">
                <span className="anum">24/7</span>
                <small>Always<br/>Available</small>
              </div>
              <div className="amain">
                <img src="/img/about.jpg" alt="Mahasiswa" />
              </div>
              <div className="asm">
                <img src="/img/about2.jpg" alt="Transaksi" />
              </div>
            </div>
          </div>

          {/* Bagian Teks */}
          <div className="col-lg-7" data-aos="fade-left">
            <span className="slbl">Solusi Kampus</span>
            <h2 className="stitle text-start">
              Dibuat oleh Mahasiswa, <span>Untuk Mahasiswa</span>
            </h2>
            <div className="sline lft"></div>
            <p className="sdesc mb-4">
              Kita paham banget susahnya nyari barang atau makanan pas lagi tugas numpuk. 
              Platform ini hadir biar transaksimu makin gampang, aman, dan pastinya 
              tetap ramah di kantong sesama anak kampus.
            </p>

            <div className="mb-4">
              {/* Fitur 1 */}
              <div className="fti mb-3">
                <div className="ftico r"><i className="fas fa-handshake"></i></div>
                <div>
                  <h6>Terpercaya Sesama Kampus</h6>
                  <p>Keamanan transaksi lebih terjamin karena kita berada di komunitas yang sama.</p>
                </div>
              </div>
              
              {/* Fitur 2 */}
              <div className="fti mb-3">
                <div className="ftico y"><i className="fas fa-tag"></i></div>
                <div>
                  <h6>Harga Teman Mahasiswa</h6>
                  <p>Dapatkan penawaran harga spesial yang cuma bisa didapetin kalau lu mahasiswa.</p>
                </div>
              </div>

              {/* Fitur 3 */}
              <div className="fti mb-3">
                <div className="ftico g"><i className="fas fa-bolt"></i></div>
                <div>
                  <h6>Cepat & Praktis</h6>
                  <p>Nggak perlu ribet, pesan lewat handphone, barang/makanan langsung sampai di kosan.</p>
                </div>
              </div>
            </div>

            <a href="#menu" className="btn-red">
              <i className="fas fa-shopping-cart"></i> Mulai Belanja
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}