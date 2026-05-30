'use client';

export default function Contact() {
  return (
    <section id="contact-section">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">Hubungi Kami</span>
          <h2 className="stitle">Ada Pertanyaan? <span>Sapa Kami</span></h2>
          <div className="sline mx-auto"></div>
          <p className="sdesc mx-auto" style={{ maxWidth: '480px' }}>
            Punya pertanyaan, saran, atau ingin berkolaborasi? Kami senang mendengarnya.
          </p>
        </div>

        <div className="row g-4">
          {/* Bagian Kiri: Info Kontak */}
          <div className="col-lg-4" data-aos="fade-right">
            <div className="ctdark">
              <h4>Mari Berbincang</h4>
              <p className="ctsub">Kami dapat merespons anda dengan sebaik mungkin.</p>
              
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="ctinfo"><strong>Lokasi</strong><span>Kampus STT Nurul Fikri, Depok<br />Jawa Barat</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-phone-alt"></i></div>
                <div className="ctinfo"><strong>WhatsApp</strong><span>+62 812-3456-7890</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-envelope"></i></div>
                <div className="ctinfo"><strong>Email</strong><span>halo@orderly.id</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-clock"></i></div>
                <div className="ctinfo"><strong>Jam Operasional</strong><span>Senin - Sabtu: 09:00 - 21:00</span></div>
              </div>
              <div className="ctsocrow">
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-tiktok"></i></a>
                <a href="#"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Form */}
          <div className="col-lg-8" data-aos="fade-left">
            <div className="fcard">
              <form className="row g-3">
                <div className="col-sm-6">
                  <label className="flbl">Nama Lengkap *</label>
                  <input type="text" className="fctrl" placeholder="John Doe" required />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Email *</label>
                  <input type="email" className="fctrl" placeholder="you@email.com" required />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Nomor HP/WA</label>
                  <input type="tel" className="fctrl" placeholder="+62 812..." />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Topik *</label>
                  <select className="fctrl" required>
                    <option>Pertanyaan Umum</option>
                    <option>Catering & Acara</option>
                    <option>Saran & Feedback</option>
                    <option>Kolaborasi Kampus</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="flbl">Pesan *</label>
                  <textarea className="fctrl" rows={5} placeholder="Tulis pesanmu di sini..." required></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn-red" id="ctcBtn">
                    <i className="fas fa-paper-plane me-2"></i>Kirim Pesan
                  </button>
                </div>
              </form>
              
              {/* Pesan Sukses - bisa di-toggle dengan useState nantinya */}
              <div className="sucmsg" id="ctcOk" style={{ display: 'none' }}>
                <i className="fas fa-check-circle"></i>
                <p>Pesan terkirim! Kami akan segera membalasmu.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}