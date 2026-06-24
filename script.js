/* ================================================================
   HATS JOE — script.js v2.0
   Navbar · Particles · Cart · WhatsApp · Form · CSV Export · Reveal
   ================================================================ */

'use strict';

/* ============================
   CONFIG — Cambia tu número aquí
   ============================ */
const WA_NUMBER  = '525635927867'; // ← Número de WhatsApp de Hats Joe
const WA_MSG_DEFAULT = 'Hola, me interesa adquirir una gorra de la colección Hats Joe. Quiero empezar a vivir la experiencia.';
const BRAND_NAME = 'Hats Joe';

/* ============================
   STATE
   ============================ */
let cartItems  = [];
let cartCount  = 0;
let savedOrders = JSON.parse(localStorage.getItem('hj_orders') || '[]');

/* ============================
   NAVBAR — Scroll behavior
   ============================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ============================
   HAMBURGER / MOBILE DRAWER
   ============================ */
const hamburger    = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobile-drawer');

hamburger.addEventListener('click', () => {
  const isOpen = mobileDrawer.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileDrawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ============================
   SCROLL REVEAL (IntersectionObserver)
   ============================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

/* ============================
   PARTICLES — Hero
   ============================ */
function spawnParticles() {
  const container = document.getElementById('particles');
  const colors = [
    'rgba(200,168,75,0.8)',
    'rgba(232,201,106,0.6)',
    'rgba(155,170,184,0.5)',
    'rgba(255,255,255,0.3)',
    'rgba(200,168,75,0.4)',
  ];

  for (let i = 0; i < 35; i++) {
    const pt = document.createElement('div');
    pt.className = 'pt';
    const size = Math.random() * 3 + 0.8;
    pt.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 10 + 7}s;
      animation-delay: ${Math.random() * 10}s;
      border-radius: 50%;
    `;
    container.appendChild(pt);
  }
}

spawnParticles();

/* ============================
   CURSOR GLOW (desktop only)
   ============================ */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.getElementById('cursor-glow');
  let mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animGlow() {
    gx += (mx - gx) * 0.07;
    gy += (my - gy) * 0.07;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(animGlow);
  })();
}

/* ============================
   TOAST NOTIFICATION
   ============================ */
const toast    = document.getElementById('toast');
const tIcon    = document.getElementById('t-icon');
const tTitle   = document.getElementById('t-title');
const tBody    = document.getElementById('t-body');
let toastTimer = null;

function showToast(title, body, icon = '✦', type = 'gold') {
  tTitle.textContent = title;
  tBody.textContent  = body;
  tIcon.textContent  = icon;
  toast.className    = 'toast show' + (type === 'silver' ? ' silver-toast' : '');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ============================
   CART
   ============================ */
const cartBadge = document.getElementById('cart-badge');

function addToCart(name, type, price) {
  cartCount++;
  cartItems.push({ name, type, price, ts: Date.now() });
  cartBadge.textContent = cartCount;

  // Pop animation
  cartBadge.classList.remove('pop');
  void cartBadge.offsetWidth;
  cartBadge.classList.add('pop');
  setTimeout(() => cartBadge.classList.remove('pop'), 400);

  const icon = type === 'gold' ? '✦' : '◈';
  showToast('Añadido al carrito', `${name} — $${price.toLocaleString()}`, icon, type);
}

function notifyMe(name) {
  showToast('¡Te avisaremos!', `${name} llegará muy pronto.`, '🔔', 'gold');
}

// Expose globally
window.addToCart = addToCart;
window.notifyMe  = notifyMe;

/* ============================
   WHATSAPP INTEGRATION
   ============================ */
function openWhatsApp(customMsg) {
  const msg  = customMsg || WA_MSG_DEFAULT;
  const url  = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

window.openWhatsApp = openWhatsApp;

// FAB
document.getElementById('wa-fab').addEventListener('click', () => openWhatsApp());

/* ============================
   ORDER FORM — Submit + WhatsApp
   ============================ */
const orderForm = document.getElementById('order-form');

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    id:        `HJ-${Date.now()}`,
    fecha:     new Date().toLocaleString('es-MX'),
    nombre:    document.getElementById('f-nombre').value.trim(),
    whatsapp:  document.getElementById('f-whatsapp').value.trim(),
    ciudad:    document.getElementById('f-ciudad').value.trim(),
    talla:     document.getElementById('f-talla').value,
    modelo:    document.getElementById('f-modelo').value,
    pago:      document.getElementById('f-pago').value,
    notas:     document.getElementById('f-notas').value.trim(),
    estado:    'Pendiente',
  };

  // Validate
  if (!data.nombre || !data.whatsapp || !data.ciudad || !data.talla || !data.modelo || !data.pago) {
    showToast('Campos incompletos', 'Por favor llena todos los campos requeridos.', '⚠', 'silver');
    return;
  }

  // Map prices for PayPal
  const prices = {
    'The Golden Tear Snapback': 890,
    'Silver Shadow Cap': 820
  };
  const price = prices[data.modelo] || 890;
  
  // Build PayPal link
  const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=zhnlljoel@icloud.com&amount=${price}&item_name=Gorra+Hats+Joe+-+${encodeURIComponent(data.modelo)}&currency_code=MXN`;

  // Save to localStorage for CSV export
  savedOrders.push(data);
  localStorage.setItem('hj_orders', JSON.stringify(savedOrders));

  // Build WhatsApp message
  const waMsg = [
    `🎩 *PEDIDO HATS JOE*`,
    ``,
    `👤 Nombre: ${data.nombre}`,
    `📍 Ciudad: ${data.ciudad}`,
    `📐 Talla: ${data.talla}`,
    `🏷️ Modelo: ${data.modelo}`,
    `💳 Pago: ${data.pago === 'PayPal' ? 'PayPal (zhnlljoel@icloud.com)' : 'Acordar por WhatsApp'}`,
    `${data.pago === 'PayPal' ? `🔗 Link de Pago: ${paypalUrl}` : ''}`,
    `${data.notas ? `📝 Notas: ${data.notas}` : ''}`,
    ``,
    `Hola, me interesa adquirir una gorra de la colección Hats Joe. Quiero empezar a vivir la experiencia.`,
    ``,
    `ID Pedido: ${data.id}`,
  ].filter(Boolean).join('\n');

  // Show confirmation toast
  if (data.pago === 'PayPal') {
    showToast('¡Pedido enviado!', `Abriendo WhatsApp y PayPal para pagar, ${data.nombre}.`, '✦', 'gold');
    // Open PayPal in new tab
    setTimeout(() => {
      window.open(paypalUrl, '_blank', 'noopener,noreferrer');
    }, 100);
  } else {
    showToast('¡Pedido enviado!', `Abriendo WhatsApp con tu pedido, ${data.nombre}.`, '✦', 'gold');
  }

  // Reset form
  orderForm.reset();

  // Open WhatsApp after brief delay
  setTimeout(() => openWhatsApp(waMsg), 900);
});

/* ============================
   CSV EXPORT — Orders & Contacts
   ============================ */
function exportCSV() {
  const orders = JSON.parse(localStorage.getItem('hj_orders') || '[]');

  if (orders.length === 0) {
    showToast('Sin pedidos', 'No hay pedidos guardados aún.', '📋', 'silver');
    return;
  }

  const headers = ['ID', 'Fecha', 'Nombre', 'WhatsApp', 'Ciudad', 'Talla', 'Modelo', 'Notas', 'Método Pago', 'Estado'];
  const rows = orders.map(o => [
    o.id        || '',
    o.fecha     || '',
    o.nombre    || '',
    o.whatsapp  || '',
    o.ciudad    || '',
    o.talla     || '',
    o.modelo    || '',
    (o.notas    || '').replace(/,/g, ';'),
    o.pago      || 'Acordar por WhatsApp',
    o.estado    || 'Pendiente',
  ]);

  // Build CSV string with BOM for Excel UTF-8
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\r\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href     = url;
  link.download = `HatsJoe_Pedidos_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Exportado ✓', `${orders.length} pedido(s) exportados a CSV.`, '⬇', 'gold');
}

window.exportCSV = exportCSV;

/* ============================
   FILTER TABS — Catalog
   ============================ */
const filterBtns = document.querySelectorAll('.f-pill');
const prodCards  = document.querySelectorAll('.p-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    prodCards.forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.style.display = '';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          });
        });
      } else {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(16px)';
        setTimeout(() => {
          if (btn.classList.contains('active') && btn.dataset.filter !== 'all' && card.dataset.category !== btn.dataset.filter) {
            card.style.display = 'none';
          }
        }, 320);
      }
    });
  });
});

/* ============================
   SMOOTH ANCHOR SCROLL
   ============================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================
   CART ICON — Show summary
   ============================ */
document.getElementById('cart-btn-nav').addEventListener('click', () => {
  if (cartCount === 0) {
    showToast('Carrito vacío', 'Agrega gorras desde la colección.', '🛒', 'silver');
  } else {
    const total = cartItems.reduce((s, i) => s + (i.price || 0), 0);
    showToast(`${cartCount} artículo(s)`, `Total: $${total.toLocaleString()} MXN`, '✦', 'gold');
  }
});

/* ============================
   CONSOLE WELCOME
   ============================ */
console.log(
  '%c HATS JOE %c Sad Boy Vibes — v2.0 ',
  'background:#c8a84b;color:#060608;font-weight:bold;padding:4px 8px;',
  'background:#141419;color:#c8a84b;padding:4px 8px;'
);
console.log('%c Para exportar pedidos, llama: exportCSV()', 'color:#9baab8;');
