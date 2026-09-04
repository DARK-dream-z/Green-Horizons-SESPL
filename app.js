// Sunshine Solar Solutions - Application Logic & Interactive Features

// Products will be loaded from admin localStorage at initialization
let productsData = [];
let categoriesData = [];

// State Variables
let currentFilter = 'all';
let selectedProductForEnquiry = null;

// Simple OOP form handler with client-side AES-GCM encryption (session key)
class FormHandler {
  constructor(endpoint = '/submit') {
    this.endpoint = endpoint;
    this.key = null;
    this.initKey();
  }

  async initKey() {
    try {
      this.key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      console.warn('Crypto unavailable:', e);
      this.key = null;
    }
  }

  async encryptPayload(obj) {
    if (!this.key) return { plaintext: obj };
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(obj));
    const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, data);
    const ctArr = new Uint8Array(ct);
    const ctB64 = btoa(String.fromCharCode(...ctArr));
    const ivB64 = btoa(String.fromCharCode(...iv));
    return { ciphertext: ctB64, iv: ivB64 };
  }

  async handleSubmit(formEl, extra = {}) {
    const formData = new FormData(formEl);
    const payload = {};
    formData.forEach((v, k) => (payload[k] = v));
    Object.assign(payload, extra);

    const encrypted = await this.encryptPayload(payload);

    // Try to POST to configured endpoint. If unreachable, persist locally.
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: encrypted }),
      });
    } catch (err) {
      console.warn('Submission failed — saved locally.', err);
      const pending = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
      pending.push({ time: Date.now(), payload: encrypted });
      localStorage.setItem('pendingSubmissions', JSON.stringify(pending));
    }

    return encrypted;
  }
}

// Default products for initial load (if admin hasn't added any)
const DEFAULT_PRODUCTS = [
  {
    id: 'aisl-15w',
    code: 'AISL33100115ML/MP',
    sub: 'All In One Solar Street Light - 15W 1900 Lumens',
    category: 'street-lights',
    status: 'New',
    desc: 'High-efficiency streetlight with built-in LiFePO4 battery and 40W panel.',
    image: 'assets/solar_street_light.png',
    pills: ['15W LED', '2000 Lumens', '40W Solar Panel', 'LiFePO4 Battery']
  },
  {
    id: 'roof-5kw',
    code: 'SS-GRID-5KW',
    sub: '5kW Solar Rooftop Power Plant - On-Grid',
    category: 'power-plants',
    status: 'Offer',
    desc: 'Complete rooftop plant with net meter compatibility and cloud monitoring.',
    image: 'assets/solar_rooftop.png',
    pills: ['5 kWp System', 'Net Meter Ready', 'App Monitoring']
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'street-lights', name: 'Solar Street Lights' },
  { id: 'power-plants', name: 'Solar Rooftop' },
  { id: 'water-heaters', name: 'Solar Water Heaters' },
  { id: 'solar-pumps', name: 'Solar Pumps' }
];

function syncAdminProductsIntoSite() {
  try {
    const adminProductsKey = 'gh_admin_products';
    let storedProducts = JSON.parse(localStorage.getItem(adminProductsKey) || '[]');
    
    // If no products in localStorage, initialize with defaults
    if (!Array.isArray(storedProducts) || !storedProducts.length) {
      localStorage.setItem(adminProductsKey, JSON.stringify(DEFAULT_PRODUCTS));
      storedProducts = DEFAULT_PRODUCTS;
    }
    
    productsData.splice(0, productsData.length, ...storedProducts);
  } catch (error) {
    console.warn('Could not sync admin products:', error);
  }
}

function syncAdminCategoriesIntoSite() {
  try {
    const adminCategoriesKey = 'gh_admin_categories';
    let storedCategories = JSON.parse(localStorage.getItem(adminCategoriesKey) || '[]');
    
    // If no categories in localStorage, initialize with defaults
    if (!Array.isArray(storedCategories) || !storedCategories.length) {
      localStorage.setItem(adminCategoriesKey, JSON.stringify(DEFAULT_CATEGORIES));
      storedCategories = DEFAULT_CATEGORIES;
    }
    
    categoriesData.splice(0, categoriesData.length, ...storedCategories);
  } catch (error) {
    console.warn('Could not sync admin categories:', error);
  }
}

function renderCategoryTabs() {
  const tabContainer = document.querySelector('.category-tabs');
  if (!tabContainer) return;

  const tabs = [
    { id: 'all', label: 'All Products' },
    ...categoriesData.map(cat => ({ id: cat.id, label: cat.name }))
  ];

  tabContainer.innerHTML = tabs.map(tab => 
    `<button class="tab-btn ${tab.id === 'all' ? 'active' : ''}" data-filter="${tab.id}">${tab.label}</button>`
  ).join('');

  // Re-attach event listeners
  setupFilterTabs();
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  syncAdminCategoriesIntoSite();
  syncAdminProductsIntoSite();
  renderCategoryTabs();
  renderProducts();
  setupCalculator();
  setupModalEvents();
  initCarousel();
  initCounterAnimation();
  setupScrollSpy();
  initScrollReveal();
  attachClickRipples();
  setupContactForm();

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // instantiate global form handler
  window._formHandler = new FormHandler();
  initTestimonials();
  renderStateProjects();
  setupStateShowcase();
  initHeaderCarousel();
  initFeaturedProjectsCarousel();
  initSectionAnimations();
});

  // Testimonials data & video slider
  const testimonialsData = [
    { id:1, title: 'Ask Automotive', videoId: 'dQw4w9WgXcQ', thumb: 'assets/solar_street_light.png' , from: 'Ask Automotive' },
    { id:2, title: 'Gyan Dairy', videoId: 'dQw4w9WgXcQ', thumb: 'assets/solar_rooftop.png', from: 'Gyan Dairy' },
    { id:3, title: 'Revent Engineering', videoId: 'dQw4w9WgXcQ', thumb: 'assets/solar_water_pump.png', from: 'Revent Engineering' },
    { id:4, title: 'Community Project', videoId: 'dQw4w9WgXcQ', thumb: 'assets/solar_water_heater.png', from: 'Community' }
  ];

  function initTestimonials() {
    const container = document.getElementById('testimonialsSlider');
    if (!container) return;
    container.innerHTML = testimonialsData.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-thumb" data-video="${t.videoId}">
          <img src="${t.thumb}" alt="${t.title}">
          <div class="play-overlay" data-video="${t.videoId}"><i class="fas fa-play"></i></div>
        </div>
        <div class="testimonial-body">
          <div class="testimonial-title">${t.title}</div>
          <div style="color:var(--text-muted); font-size:0.95rem;">${t.from}</div>
        </div>
      </div>
    `).join('');

    // hook play overlays
    container.querySelectorAll('.play-overlay, .testimonial-thumb').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-video');
        if (id) openVideoModal(id);
      });
    });

    // carousel controls
    const prev = document.getElementById('testimonialPrev');
    const next = document.getElementById('testimonialNext');
    let idx = 0;
    const cards = Array.from(container.children);
    function render() {
      const width = cards[0]?.offsetWidth + 18 || 340;
      container.scrollTo({ left: idx * width, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', () => { idx = Math.max(0, idx - 1); render(); });
    if (next) next.addEventListener('click', () => { idx = Math.min(cards.length - 1, idx + 1); render(); });

    // auto advance
    setInterval(() => { idx = (idx + 1) % cards.length; render(); }, 4200);
  }

  // State-wise project data
  const stateProjects = [
    { id:'p1', state:'Karnataka', title:'Rooftop 5kW - Bangalore', image:'assets/solar_rooftop.png' },
    { id:'p2', state:'Tamil Nadu', title:'Agriculture Pump - Coimbatore', image:'assets/solar_water_pump.png' },
    { id:'p3', state:'Maharashtra', title:'Street Lighting - Pune', image:'assets/solar_street_light.png' },
    { id:'p4', state:'Rajasthan', title:'Water Heater - Jodhpur', image:'assets/solar_water_heater.png' },
    { id:'p5', state:'Karnataka', title:'Community Plant - Mysore', image:'assets/solar_rooftop.png' },
    { id:'p6', state:'Mizoram', title:'Rural Electrification - Aizawl', image:'assets/solar_rooftop.png' }
  ];

  // state background images (fallback to existing assets)
  const stateImages = {
    'Karnataka': 'assets/solar_rooftop.png',
    'Tamil Nadu': 'assets/solar_water_pump.png',
    'Maharashtra': 'assets/solar_street_light.png',
    'Rajasthan': 'assets/solar_water_heater.png',
    'Mizoram': 'assets/solar_rooftop.png',
    'all': ''
  };

  // positions for floating map dots (approximate)
  const statePositions = {
    'Karnataka': { left: '34%', top: '62%' },
    'Tamil Nadu': { left: '50%', top: '78%' },
    'Maharashtra': { left: '30%', top: '42%' },
    'Rajasthan': { left: '18%', top: '18%' },
    'Mizoram': { left: '86%', top: '34%' }
  };

  function renderStateProjects(filter = 'all') {
    const grid = document.getElementById('stateProjectsGrid');
    if (!grid) return;
    const filtered = filter === 'all' ? stateProjects : stateProjects.filter(p => p.state === filter);
    grid.innerHTML = filtered.map(p => `
      <div class="project-card">
        <img src="${p.image}" alt="${p.title}">
        <h4>${p.title}</h4>
        <div style="color:var(--text-muted); font-size:0.9rem;">${p.state}</div>
      </div>
    `).join('');
  }

  function setupStateFilter() {
    const container = document.getElementById('stateFilter');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-state]');
      if (!btn) return;
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStateProjects(btn.getAttribute('data-state'));
    });
  }

  // New: setup the interactive showcase: state buttons, floating map dots, and preview area
  function setupStateShowcase() {
    const list = document.getElementById('stateList');
    const display = document.getElementById('stateDisplay');
    const displayLabel = document.getElementById('stateDisplayLabel');
    const floating = document.getElementById('floatingMap');

    if (!list || !display || !floating) return;

    const states = ['all', ...Array.from(new Set(stateProjects.map(s => s.state)))];

    // render buttons
    list.innerHTML = states.map(s => `<button class="state-btn" data-state="${s}">${s}</button>`).join('');

    // attach click handlers
    list.querySelectorAll('.state-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const st = btn.getAttribute('data-state');
        list.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStateProjects(st);
        displayLabel.innerText = st === 'all' ? 'All Projects' : st;
        // try to load a real SVG outline for this state from assets/maps/<State>.svg
        loadStateSVG(st, display, stateImages[st]);
      });
    });

    // build floating SVG silhouette map + tooltip
    floating.innerHTML = `
      <svg class="state-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="false">
        <g id="states">
          <polygon class="state-path" id="Karnataka" points="60,120 82,110 95,130 74,142" data-name="Karnataka"></polygon>
          <polygon class="state-path" id="TamilNadu" points="110,150 126,140 132,156 118,166" data-name="Tamil Nadu"></polygon>
          <polygon class="state-path" id="Maharashtra" points="54,80 76,70 88,92 66,102" data-name="Maharashtra"></polygon>
          <polygon class="state-path" id="Rajasthan" points="28,38 56,32 62,52 40,64" data-name="Rajasthan"></polygon>
          <polygon class="state-path" id="Mizoram" points="168,78 186,70 192,92 174,102" data-name="Mizoram"></polygon>
        </g>
      </svg>
      <div class="map-tooltip" id="mapTooltip"></div>
    `;

    const svg = floating.querySelector('.state-svg');
    const tooltip = floating.querySelector('#mapTooltip');
    const paths = svg.querySelectorAll('.state-path');

    // helper to get count for a state name
    const getCount = (name) => stateProjects.filter(p => p.state === name || p.state === name.replace(/\s+/g, '') ).length;

    paths.forEach((path, i) => {
      const stateName = path.getAttribute('data-name');
      const count = getCount(stateName);
      // annotate with small label (optional)
      path.setAttribute('data-count', count);

      // hover
      path.addEventListener('mouseenter', (ev) => {
        tooltip.innerText = `${stateName} — ${count} project(s)`;
        tooltip.classList.add('visible');
        const pRect = path.getBoundingClientRect();
        const fRect = floating.getBoundingClientRect();
        const x = pRect.left - fRect.left + (pRect.width / 2);
        const y = pRect.top - fRect.top;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        // highlight
        paths.forEach(p => p.classList.add('dim'));
        path.classList.remove('dim');
        path.classList.add('active');
      });
      path.addEventListener('mousemove', (ev) => {
        const pRect = path.getBoundingClientRect();
        const fRect = floating.getBoundingClientRect();
        const x = pRect.left - fRect.left + (pRect.width / 2);
        const y = pRect.top - fRect.top;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });
      path.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
        paths.forEach(p => { p.classList.remove('dim'); p.classList.remove('active'); });
      });

      // click: select state and update showcase
      path.addEventListener('click', () => {
        // remove active on SVG
        paths.forEach(p => p.classList.remove('active'));
        path.classList.add('active');
        // trigger the corresponding state button if present
        const btn = list.querySelector(`.state-btn[data-state="${stateName}"]`);
        if (btn) btn.click();
        // animate preview
        display.classList.add('faded');
        display.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 380 });
        setTimeout(() => display.classList.remove('faded'), 420);
      });
    });

    // scroll-based draw animation for the SVG paths
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          paths.forEach((p, idx) => setTimeout(() => p.classList.add('drawn'), idx * 80));
          o.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    obs.observe(floating);

    // activate 'all' by default
    const defBtn = list.querySelector('.state-btn[data-state="all"]');
    if (defBtn) defBtn.classList.add('active');
  }

  // Try to fetch and display a high-fidelity SVG outline for the selected state.
  // Looks for files under `assets/maps/<State>.svg` (case-insensitive fallback).
  async function loadStateSVG(stateName, displayEl, fallbackImage) {
    if (!displayEl) return;
    // clear previous content
    displayEl.style.backgroundImage = '';
    displayEl.innerHTML = '<div class="state-display-label" id="stateDisplayLabelInner">' + (stateName === 'all' ? 'All Projects' : stateName) + '</div>';

    if (!stateName || stateName === 'all') {
      // restore fallback
      if (fallbackImage) displayEl.style.backgroundImage = `url('${fallbackImage}')`;
      return;
    }

    const safeName = stateName.replace(/\s+/g, '_');
    const candidates = [
      `assets/maps/${stateName}.svg`,
      `assets/maps/${safeName}.svg`,
      `assets/maps/${stateName.toLowerCase()}.svg`,
      `assets/maps/${safeName.toLowerCase()}.svg`
    ];

    let svgText = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const txt = await res.text();
        if (txt && txt.trim().startsWith('<svg')) { svgText = txt; break; }
      } catch (e) {
        // ignore and try next
      }
    }

    if (svgText) {
      // inject sanitized SVG (basic) and apply class
      displayEl.innerHTML = `<div class="state-svg-large">${svgText}</div>`;
      // ensure SVG scales to container
      const svgEl = displayEl.querySelector('svg');
      if (svgEl) {
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgEl.style.width = '100%';
        svgEl.style.height = '100%';
        // add a subtle drop shadow
        svgEl.style.filter = 'drop-shadow(0 10px 30px rgba(2,12,27,0.12))';
      }
      // optionally animate fill/stroke
      requestAnimationFrame(() => {
        displayEl.querySelectorAll('path, polygon, rect').forEach((p, i) => {
          p.classList.add('drawn');
          setTimeout(() => p.classList.add('active'), i * 40);
        });
      });
    } else if (fallbackImage) {
      // fallback to image
      displayEl.style.backgroundImage = `url('${fallbackImage}')`;
    } else {
      // generic placeholder
      displayEl.style.background = 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(59,130,246,0.04))';
    }
  }

  // Setup interactive map markers (counts) on the map canvas
  function setupStateMap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    // compute counts
    const counts = stateProjects.reduce((acc, p) => { acc[p.state] = (acc[p.state] || 0) + 1; return acc; }, {});
    // approximate marker positions (percent offsets)
    const positions = {
      'Karnataka': { left: '30%', top: '60%' },
      'Tamil Nadu': { left: '48%', top: '78%' },
      'Maharashtra': { left: '28%', top: '44%' },
      'Rajasthan': { left: '18%', top: '18%' }
    };

    canvas.innerHTML = '';
    Object.keys(positions).forEach(state => {
      const cnt = counts[state] || 0;
      const pos = positions[state];
      const marker = document.createElement('div');
      marker.className = 'map-marker';
      marker.setAttribute('data-state', state);
      marker.style.left = pos.left;
      marker.style.top = pos.top;
      marker.innerHTML = `<div class="pin">${cnt}</div><div class="label">${state}</div>`;
      marker.addEventListener('click', () => {
        // update active button
        const filterBtns = document.getElementById('stateFilter');
        if (filterBtns) filterBtns.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`#stateFilter button[data-state="${state}"]`);
        if (btn) btn.classList.add('active');
        renderStateProjects(state);
        // highlight selection
        canvas.querySelectorAll('.map-marker .pin').forEach(p => p.style.background = 'var(--accent-gold)');
        marker.querySelector('.pin').style.background = '#15325b';
      });
      canvas.appendChild(marker);
    });

    // add 'All' reset marker at bottom-right
    const allBtn = document.createElement('div');
    allBtn.className = 'map-marker';
    allBtn.style.right = '16px';
    allBtn.style.left = 'auto';
    allBtn.style.top = '86%';
    allBtn.innerHTML = `<div class="pin" style="background:#fff;color:#0f172a;border:1px solid #e2e8f0;width:46px;height:28px;border-radius:14px;font-size:0.9rem;">All</div>`;
    allBtn.addEventListener('click', () => {
      document.getElementById('stateFilter')?.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      document.querySelector(`#stateFilter button[data-state="all"]`)?.classList.add('active');
      renderStateProjects('all');
      canvas.querySelectorAll('.map-marker .pin').forEach(p => p.style.background = 'var(--accent-gold)');
    });
    canvas.appendChild(allBtn);
  }

  // Fade-in on scroll for sections
  function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.12 });
    sections.forEach(s => { s.classList.add('animate-fade'); observer.observe(s); });
  }

  function initScrollReveal() {
    const items = document.querySelectorAll('.animate-card, .hero-card, .about-feature-card, .project-card, .testimonial-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    items.forEach(item => {
      item.classList.add('animate-card-hidden');
      observer.observe(item);
    });
  }

  function attachClickRipples() {
    const rippleTargets = document.querySelectorAll('.btn-primary, .btn-gold, .btn-view-details, .tab-btn, .nav-link, .product-card');
    rippleTargets.forEach(el => {
      el.addEventListener('pointerdown', createRipple);
    });
  }

  function createRipple(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    target.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 600);
  }

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const filtered = currentFilter === 'all' 
    ? productsData 
    : productsData.filter(p => p.category === currentFilter);

  grid.innerHTML = filtered.map(p => {
    const statusBadge = p.status && p.status !== 'blank' ? `<span class="status-badge status-${getStatusClass(p.status)}">${p.status}</span>` : '';
    return `
    <div class="product-card animate-card" data-id="${p.id}">
      <div class="card-img-wrapper">
        <span class="category-tag">${getCategoryName(p.category)}</span>
        ${statusBadge}
        <img src="${p.image}" alt="${p.code}" />
      </div>
      <div class="card-body">
        <h3 class="product-code">${p.code}</h3>
        <div class="product-sub">${p.sub}</div>
        <p class="product-snippet">${p.desc}</p>
        <div class="spec-pills">
          ${p.pills.map(pill => `<span class="pill"><i class="fas fa-check-circle"></i> ${pill}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn-view-details" onclick="openProductModal('${p.id}')">
            <i class="fas fa-list-alt"></i> Details & Specs
          </button>
          <button class="btn-primary" onclick="openEnquiryModal('${p.code}')">
            <i class="fas fa-paper-plane"></i> Enquire Now
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function getCategoryName(catId) {
  const category = categoriesData.find(c => c.id === catId);
  return category ? category.name : 'Solar Solution';
}

function getStatusClass(status) {
  const map = {
    'New': 'new',
    'Offer': 'offer',
    'Popular': 'popular',
    'Best Seller': 'best-seller',
    'Discontinued': 'discontinued',
    'Coming Soon': 'coming-soon',
    'blank': ''
  };
  return map[status] || 'new';
}

// Category Tabs Interaction
function setupFilterTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      renderProducts();
    });
  });
}

// Open Detailed Specs Modal (Exact reference layout from user screenshot)
window.openProductModal = function(productId) {
  const p = productsData.find(prod => prod.id === productId);
  if (!p) return;

  const modalBody = document.getElementById('specModalContent');
  if (!modalBody) return;

  const rowsHtml = Object.entries(p.specs).map(([key, val]) => `
    <tr>
      <td>${key}</td>
      <td>${val}</td>
    </tr>
  `).join('');

  const bulletsHtml = p.bullets.map(b => `<li>${b}</li>`).join('');

  modalBody.innerHTML = `
    <div class="modal-product-layout">
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.code}" />
      </div>
      <div>
        <div class="product-detail-header">
          <h2>${p.code}</h2>
          <div class="sub-title">${p.sub}</div>
          <p>${p.desc}</p>
        </div>

        <table class="specs-table">
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="specs-bullets">
          <h4>Specifications</h4>
          <ul>
            ${bulletsHtml}
          </ul>
        </div>

        <button class="btn-primary" style="background:#3f51b5; padding:12px 28px; font-size:1rem;" onclick="closeProductModal(); openEnquiryModal('${p.code}');">
          Enquire Now
        </button>
      </div>
    </div>
  `;

  document.getElementById('specModal').classList.add('active');
};

window.closeProductModal = function() {
  document.getElementById('specModal').classList.remove('active');
};

// Open Quick Enquiry Modal
window.openEnquiryModal = function(productCode = '') {
  const enquiryProductInput = document.getElementById('enquiryProduct');
  if (enquiryProductInput) {
    enquiryProductInput.value = productCode ? `Enquiry for ${productCode}` : 'General Solar Enquiry';
  }
  document.getElementById('enquiryModal').classList.add('active');
};

window.closeEnquiryModal = function() {
  document.getElementById('enquiryModal').classList.remove('active');
};

function setupModalEvents() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeEnquiryModal();
      closeVideoModal();
    }
  });

  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const extra = { source: 'enquiryModal', product: document.getElementById('enquiryProduct')?.value };
      await window._formHandler.handleSubmit(enquiryForm, extra);
      alert('Thank you! Your enquiry has been received. Our team will contact you within 24 hours.');
      closeEnquiryModal();
      enquiryForm.reset();
    });
  }
}

// Solar Savings Calculator Logic
function setupCalculator() {
  const billInput = document.getElementById('monthlyBill');
  const rateInput = document.getElementById('unitRate');

  function calculate() {
    const bill = parseFloat(billInput?.value || 5000);
    const rate = parseFloat(rateInput?.value || 8);

    const unitsPerMonth = bill / rate;
    const unitsPerDay = unitsPerMonth / 30;
    
    // 1kW solar produces ~4 units per day
    const recommendedKW = Math.ceil((unitsPerDay / 4) * 10) / 10;
    
    const annualSavings = (bill * 12) * 0.90; // ~90% savings
    const co2Reduction = (recommendedKW * 1.4).toFixed(1); // Tons/year
    const estimatedCost = recommendedKW * 50000; // ~₹50k per kW
    const paybackYears = (estimatedCost / annualSavings).toFixed(1);

    document.getElementById('calcSystemKW').innerText = `${recommendedKW} kW`;
    document.getElementById('calcAnnualSavings').innerText = `₹ ${Math.round(annualSavings).toLocaleString('en-IN')}`;
    document.getElementById('calcCO2').innerText = `${co2Reduction} Tons/Yr`;
    document.getElementById('calcPayback').innerText = `${paybackYears} Years`;
  }

  if (billInput && rateInput) {
    billInput.addEventListener('input', calculate);
    rateInput.addEventListener('input', calculate);
    calculate();
  }
}

// Stat Increment Counter Effect
function initCounterAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800; // milliseconds
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth easeOutCubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * target);

      el.innerText = currentVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.innerText = target + suffix;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statNumbers.forEach(num => observer.observe(num));
}

// Scroll Spy to highlight navbar link based on section in viewport
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Contact Section Form Handling
function setupContactForm() {
  const contactForm = document.getElementById('contactSectionForm');
  const warrantyToggle = document.getElementById('warrantyClaimToggle');
  const warrantyFields = document.getElementById('warrantyClaimFields');
  const warrantyMessage = document.getElementById('warrantyValidationMessage');
  const warrantyInputs = [
    document.getElementById('warrantyHologramNo'),
    document.getElementById('warrantyPurchaseDate'),
    document.getElementById('warrantyIssue')
  ];

  function setWarrantyMessage(message, type = 'error') {
    if (!warrantyMessage) return;
    warrantyMessage.textContent = message;
    warrantyMessage.className = `form-message ${type}`;
    warrantyMessage.hidden = !message;
  }

  function isPurchaseWithinWarrantyWindow(value) {
    if (!value) return false;

    const purchaseDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(purchaseDate.getTime())) return false;
    if (purchaseDate > today) return false;

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return purchaseDate >= oneYearAgo && purchaseDate <= today;
  }

  function toggleWarrantyFields() {
    const isVisible = Boolean(warrantyToggle && warrantyToggle.checked);
    if (warrantyFields) {
      warrantyFields.hidden = !isVisible;
    }

    warrantyInputs.forEach((input) => {
      if (!input) return;
      input.required = isVisible;
      input.disabled = !isVisible;
      if (!isVisible) {
        input.value = '';
      }
    });

    if (!isVisible) {
      setWarrantyMessage('');
    }
  }

  if (warrantyToggle) {
    warrantyToggle.addEventListener('change', toggleWarrantyFields);
    toggleWarrantyFields();
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (warrantyToggle && warrantyToggle.checked) {
        const missing = warrantyInputs.filter((input) => input && !input.value.trim());
        if (missing.length) {
          const firstMissing = missing[0];
          firstMissing.focus();
          firstMissing.reportValidity();
          setWarrantyMessage('Please complete all warranty claim details before submitting the claim.');
          return;
        }

        const purchaseDateInput = document.getElementById('warrantyPurchaseDate');
        if (purchaseDateInput && !isPurchaseWithinWarrantyWindow(purchaseDateInput.value)) {
          purchaseDateInput.focus();
          setWarrantyMessage('This product warranty period has ended. Warranty claims are accepted only within 12 months from the purchase date.');
          return;
        }

        setWarrantyMessage('Warranty claim is valid and ready to submit.', 'success');
      }

      const extra = { source: 'contactSection' };
      await window._formHandler.handleSubmit(contactForm, extra);
      const name = document.getElementById('cName')?.value || 'Valued Customer';
      alert(`Thank you, ${name}! Your message has been received by Swastik Enterprises Solar Pvt. Ltd. Our technical team will reach out to you within 24 hours.`);
      contactForm.reset();
      toggleWarrantyFields();
    });
  }
}

// Simple hero carousel
function initCarousel() {
  const container = document.getElementById('heroCarousel');
  if (!container) return;
  const slides = Array.from(container.querySelectorAll('.carousel-slide'));
  let idx = 0;
  slides.forEach(s => { s.style.position = 'absolute'; s.style.top = '0'; s.style.left = '0'; s.style.width = '100%'; s.style.height = '100%'; s.style.objectFit = 'cover'; s.style.transition = 'opacity 600ms ease'; s.style.opacity = '0'; });
  container.style.position = 'relative';
  container.style.height = '260px';
  slides[0].style.opacity = '1';
  setInterval(() => {
    slides[idx].style.opacity = '0';
    idx = (idx + 1) % slides.length;
    slides[idx].style.opacity = '1';
  }, 3800);
}

// Header carousel (full-width) initialization
function initHeaderCarousel() {
  const container = document.getElementById('headerCarousel');
  if (!container) return;
  const slides = Array.from(container.querySelectorAll('.header-slide'));
  const prev = document.getElementById('headerPrev');
  const next = document.getElementById('headerNext');
  const indicators = document.getElementById('headerIndicators');
  let idx = 0;

  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.addEventListener('click', () => { goTo(i); });
    indicators.appendChild(btn);
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    Array.from(indicators.children).forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  function goTo(i) { idx = (i + slides.length) % slides.length; render(); }

  function nextSlide() { goTo(idx + 1); }
  function prevSlide() { goTo(idx - 1); }

  let timer = setInterval(nextSlide, 4500);
  container.addEventListener('mouseenter', () => clearInterval(timer));
  container.addEventListener('mouseleave', () => timer = setInterval(nextSlide, 4500));

  if (next) next.addEventListener('click', nextSlide);
  if (prev) prev.addEventListener('click', prevSlide);

  // initialize
  render();
}

// Featured projects carousel
function initFeaturedProjectsCarousel() {
  const track = document.getElementById('fpTrack');
  const wrapper = track?.closest('.fp-track-wrapper');
  const prev = document.getElementById('fpPrev');
  const next = document.getElementById('fpNext');
  if (!track || !wrapper || !prev || !next) return;

  const cards = Array.from(track.children);
  let idx = 0;

  function render() {
    const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const visibleCards = Math.max(1, Math.floor((wrapper.clientWidth + gap) / (cardWidth + gap)));
    const maxIndex = Math.max(0, cards.length - visibleCards);
    idx = Math.min(idx, maxIndex);
    cards.forEach((card, cardIndex) => {
      const isVisible = cardIndex >= idx && cardIndex < idx + visibleCards;
      card.classList.toggle('is-offscreen', !isVisible);
    });
    track.style.transform = `translateX(-${idx * (cardWidth + gap)}px)`;
    prev.disabled = idx === 0;
    next.disabled = idx === maxIndex;
  }

  prev.addEventListener('click', () => { idx -= 1; render(); });
  next.addEventListener('click', () => { idx += 1; render(); });

  window.addEventListener('resize', render);
  render();
}

// Video modal functions
window.openVideoModal = function(videoId) {
  const vc = document.getElementById('videoContainer');
  if (!vc) return;
  vc.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" style="position:absolute; width:100%; height:100%; left:0; top:0; border:0;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  document.getElementById('videoModal').classList.add('active');
}

window.closeVideoModal = function() {
  const modal = document.getElementById('videoModal');
  if (!modal) return;
  modal.classList.remove('active');
  const vc = document.getElementById('videoContainer');
  if (vc) vc.innerHTML = '';
}

function openClientsGallery() {
  alert('Open clients gallery — implement server-side gallery or modal.');
}

// Audio modal (Director voice)
// audio modal removed; no-op placeholders (audio removed)
function openAudioModal() { console.warn('Audio feature removed'); }
function closeAudioModal() { /* no-op */ }

// Pause marquee on hover
document.addEventListener('DOMContentLoaded', () => {
  const scrollTopButton = document.querySelector('.scroll-top');
  const updateScrollTopVisibility = () => {
    if (!scrollTopButton) return;
    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    scrollTopButton.classList.toggle('is-visible', reachedBottom);
  };

  if (scrollTopButton) {
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });
    window.addEventListener('resize', updateScrollTopVisibility);
    updateScrollTopVisibility();
  }

  const marquee = document.querySelector('.marquee-track');
  if (marquee) {
    marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
    marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
  }
});
