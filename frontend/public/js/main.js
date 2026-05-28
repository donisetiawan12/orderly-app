(function() {
    // 1. Fungsi bantu untuk pasang listener dengan aman
    function safeListen(id, event, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, callback);
        }
    }

    // 2. Fungsi bantu untuk classList aman
    function safeToggle(id, className, condition) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle(className, condition);
        }
    }

    // --- JALANKAN LOGIKA LU DI SINI ---
    
    // Back to top (Baris 10)
    window.addEventListener('scroll', () => {
        safeToggle('btt', 'show', window.scrollY > 300);
    });

    // Menu Pop Up
    const menuPop = document.querySelector('.menuPop');
    if (menuPop) {
        safeListen('mpClose', 'click', closeMenuPop);
        menuPop.addEventListener('click', function(e) {
            if (e.target === this) closeMenuPop();
        });
    }

    // Cart & Counter
    safeListen('mpPlus', 'click', function() {
        const q = document.getElementById('mpQnum');
        if (q) q.textContent = ++mpQty;
    });

    safeListen('mpMinus', 'click', function() {
        const q = document.getElementById('mpQnum');
        if (q && mpQty > 1) q.textContent = --mpQty;
    });

    // Forms
    safeListen('ctcBtn', 'click', function() {
        var btn = this;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            btn.disabled = false;
            const ok = document.getElementById('ctcOk');
            if (ok) {
                ok.style.display = 'block';
                ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 1500);
    });

})();