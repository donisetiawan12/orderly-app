export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row g-5">
          {/* Logo & Sosmed */}
          <div className="col-lg-4">
            <div className="fnm">Order<span>ly</span></div>
            <p className="fdesc">Mudahkan harimu dengan layanan pesan-antar kampus terbaik. Cepat, murah, dan terpercaya. Karena mahasiswa berhak makan enak tanpa harus ribet.</p>
            <div className="fsoc">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">Quick Links</div>
            <ul className="flinks ps-0">
              <li><a href="#hero"><i className="fas fa-chevron-right"></i>Home</a></li>
              <li><a href="#about"><i className="fas fa-chevron-right"></i>About Us</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Our Menu</a></li>
              <li><a href="#reservation"><i className="fas fa-chevron-right"></i>Reservation</a></li>
              <li><a href="#blog"><i className="fas fa-chevron-right"></i>Blog</a></li>
              <li><a href="#contact-section"><i className="fas fa-chevron-right"></i>Contact</a></li>
            </ul>
          </div>

          {/* Menu */}
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">Our Menu</div>
            <ul className="flinks ps-0">
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Burgers</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Pizza</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Fried Chicken</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Wraps &amp; Rolls</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Pasta</a></li>
              <li><a href="#menu"><i className="fas fa-chevron-right"></i>Desserts</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4">
            <div className="ftit">Get In Touch</div>
            <div className="fci">
              <div className="fciico"><i className="fas fa-map-marker-alt"></i></div>
              <div className="fciinfo"><strong>Address</strong>42 Flavor Street, Manhattan, NY 10001</div>
            </div>
            <div className="fci">
              <div className="fciico"><i className="fas fa-phone-alt"></i></div>
              <div className="fciinfo"><strong>Phone</strong>+1 (800) 123-4567</div>
            </div>
            <div className="fci">
              <div className="fciico"><i className="fas fa-envelope"></i></div>
              <div className="fciinfo"><strong>Email</strong>hello@Orderlyfood.com</div>
            </div>
            <div className="fci">
              <div className="fciico"><i className="fas fa-clock"></i></div>
              <div className="fciinfo"><strong>Hours</strong>Wed - Sun: 09 AM - 11 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="fbot">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="mb-0">
              &copy; 2026 <span>Orderly Restaurant</span>. All Rights Reserved. 
              <br /> Made with <span><i className="fas fa-heart"></i></span>
            </p>
            <div>
              <a href="#" className="me-2">Privacy Policy</a>
              <a href="#" className="me-2">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}