/**
 * Kadya Orders Dashboard
 * Exactly matches the 12 columns in Google Sheets
 * Integrated with 58 Wilayas and 1,541 Communes of Algeria
 */

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyg8afLE6kc3-xVOgsDtLRtmCXbCK16Cc2BpY_HFJTvKGgj993M0uSX0qMqxeDwlwZuCg/exec';

// 58 Wilayas of Algeria
const WILAYAS_LIST = [
  { code: '01', fr: 'Adrar', ar: 'أدرار' },
  { code: '02', fr: 'Chlef', ar: 'الشلف' },
  { code: '03', fr: 'Laghouat', ar: 'الأغواط' },
  { code: '04', fr: 'Oum El Bouaghi', ar: 'أم البواقي' },
  { code: '05', fr: 'Batna', ar: 'باتنة' },
  { code: '06', fr: 'Béjaïa', ar: 'بجاية' },
  { code: '07', fr: 'Biskra', ar: 'بسكرة' },
  { code: '08', fr: 'Béchar', ar: 'بشار' },
  { code: '09', fr: 'Blida', ar: 'البليدة' },
  { code: '10', fr: 'Bouira', ar: 'البويرة' },
  { code: '11', fr: 'Tamanrasset', ar: 'تمنراست' },
  { code: '12', fr: 'Tébessa', ar: 'تبسة' },
  { code: '13', fr: 'Tlemcen', ar: 'تلمسان' },
  { code: '14', fr: 'Tiaret', ar: 'تيارت' },
  { code: '15', fr: 'Tizi Ouzou', ar: 'تيزي وزو' },
  { code: '16', fr: 'Alger', ar: 'الجزائر' },
  { code: '17', fr: 'Djelfa', ar: 'الجلفة' },
  { code: '18', fr: 'Jijel', ar: 'جيجل' },
  { code: '19', fr: 'Sétif', ar: 'سطيف' },
  { code: '20', fr: 'Saïda', ar: 'سعيدة' },
  { code: '21', fr: 'Skikda', ar: 'سكيكدة' },
  { code: '22', fr: 'Sidi Bel Abbès', ar: 'سيدي بلعباس' },
  { code: '23', fr: 'Annaba', ar: 'عنابة' },
  { code: '24', fr: 'Guelma', ar: 'قالمة' },
  { code: '25', fr: 'Constantine', ar: 'قسنطينة' },
  { code: '26', fr: 'Médéa', ar: 'المدية' },
  { code: '27', fr: 'Mostaganem', ar: 'مستغانم' },
  { code: '28', fr: "M'Sila", ar: 'المسيلة' },
  { code: '29', fr: 'Mascara', ar: 'معسكر' },
  { code: '30', fr: 'Ouargla', ar: 'ورقلة' },
  { code: '31', fr: 'Oran', ar: 'وهران' },
  { code: '32', fr: 'El Bayadh', ar: 'البيض' },
  { code: '33', fr: 'Illizi', ar: 'إليزي' },
  { code: '34', fr: 'Bordj Bou Arreridj', ar: 'برج بوعريريج' },
  { code: '35', fr: 'Boumerdès', ar: 'بومرداس' },
  { code: '36', fr: 'El Tarf', ar: 'الطارف' },
  { code: '37', fr: 'Tindouf', ar: 'تندوف' },
  { code: '38', fr: 'Tissemsilt', ar: 'تيسمسيلت' },
  { code: '39', fr: 'El Oued', ar: 'الوادي' },
  { code: '40', fr: 'Khenchela', ar: 'خنشلة' },
  { code: '41', fr: 'Souk Ahras', ar: 'سوق أهراس' },
  { code: '42', fr: 'Tipaza', ar: 'تيبازة' },
  { code: '43', fr: 'Mila', ar: 'ميلة' },
  { code: '44', fr: 'Aïn Defla', ar: 'عين الدفلى' },
  { code: '45', fr: 'Naâma', ar: 'النعامة' },
  { code: '46', fr: 'Aïn Témouchent', ar: 'عين تموشنت' },
  { code: '47', fr: 'Ghardaïa', ar: 'غرداية' },
  { code: '48', fr: 'Relizane', ar: 'غليزان' },
  { code: '49', fr: 'Timimoun', ar: 'تيميمون' },
  { code: '50', fr: 'Bordj Badji Mokhtar', ar: 'برج باجي مختار' },
  { code: '51', fr: 'Ouled Djellal', ar: 'أولاد جلال' },
  { code: '52', fr: 'Béni Abbès', ar: 'بني عباس' },
  { code: '53', fr: 'In Salah', ar: 'عين صالح' },
  { code: '54', fr: 'In Guezzam', ar: 'عين قزام' },
  { code: '55', fr: 'Touggourt', ar: 'تقرت' },
  { code: '56', fr: 'Djanet', ar: 'جانت' },
  { code: '57', fr: "El M'ghair", ar: 'المغير' },
  { code: '58', fr: 'El Meniaa', ar: 'المنيعة' }
];

const STATUS_LIST = ['جديد', 'فاشلة 1', 'مؤكدة', 'ملغاة', 'مؤجلة', 'فاشلة 2', 'فاشلة 3'];
const SIZES_LIST = ['39', '40', '41', '42', '43', '44', '45', '46'];

// State
const state = {
  orders: [],
  filteredOrders: [],
  currentStatusFilter: 'all',
  currentWilayaFilter: '',
  searchQuery: '',
  communesDatabase: {},
  selectedOrder: null
};

// DOM Elements
const syncStatusText = document.getElementById('sync-status-text');
const syncStatusDot = document.querySelector('.status-dot');
const refreshBtn = document.getElementById('refresh-btn');
const newOrderBtn = document.getElementById('new-order-btn');

const kpiTotal = document.getElementById('kpi-total');
const kpiNew = document.getElementById('kpi-new');
const kpiConfirmed = document.getElementById('kpi-confirmed');
const kpiPostponed = document.getElementById('kpi-postponed');
const kpiRevenue = document.getElementById('kpi-revenue');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const wilayaFilterSelect = document.getElementById('wilaya-filter');
const statusTabs = document.getElementById('status-tabs');

const ordersTable = document.getElementById('orders-table');
const ordersTbody = document.getElementById('orders-tbody');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');

// Modal Elements
const orderModal = document.getElementById('order-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalEditForm = document.getElementById('modal-edit-form');
const modalOrderId = document.getElementById('modal-order-id');
const modalCustomerName = document.getElementById('modal-customer-name');
const modalPhone = document.getElementById('modal-phone');
const modalSize = document.getElementById('modal-size');
const modalShipping = document.getElementById('modal-shipping');
const modalTotal = document.getElementById('modal-total');
const modalWhatsappBtn = document.getElementById('modal-whatsapp-btn');
const modalCallBtn = document.getElementById('modal-call-btn');

const modalInputStatus = document.getElementById('modal-input-status');
const modalInputShipping = document.getElementById('modal-input-shipping');
const modalInputWilaya = document.getElementById('modal-input-wilaya');
const modalSelectCommune = document.getElementById('modal-select-commune');
const modalInputCommune = document.getElementById('modal-input-commune');
const modalInputNotes = document.getElementById('modal-input-notes');
const modalSaveBtn = document.getElementById('modal-save-btn');

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✔' : '✖'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setSyncStatus(type, label) {
  syncStatusDot.className = `status-dot ${type}`;
  syncStatusText.textContent = label;
}

// 1. Load Algerian Communes Database
async function loadCommunesDatabase() {
  try {
    const res = await fetch('/algeria_communes.json');
    if (res.ok) {
      state.communesDatabase = await res.json();
    }
  } catch (err) {
    console.warn('Could not load communes database:', err);
  }
}

// 1.1 Helper: Get Delivery Offices for Wilaya
function getOfficesForWilaya(wilayaCode) {
  if (typeof OFFICES_DATA === 'undefined' || !Array.isArray(OFFICES_DATA)) return [];
  const code = String(wilayaCode).padStart(2, '0');
  return OFFICES_DATA.filter(o => String(o.code).padStart(2, '0') === code);
}

// 1.2 Helper: Get Full Communes for Wilaya
function getCommunesForWilaya(wilayaCode) {
  if (!state.communesDatabase) return [];
  const code = String(parseInt(wilayaCode, 10));
  return state.communesDatabase[code] || state.communesDatabase[String(wilayaCode).padStart(2, '0')] || [];
}

// 2. Fetch Orders from Google Sheets API v4
async function fetchOrders(showSpinner = true) {
  if (showSpinner) {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    ordersTbody.innerHTML = '';
  }

  setSyncStatus('syncing', 'جاري المزامنة...');

  try {
    let data = null;
    try {
      const apiRes = await fetch('/api/orders');
      if (apiRes.ok) data = await apiRes.json();
    } catch (e) {}

    if (!data || data.status !== 'success') {
      const sheetRes = await fetch(GOOGLE_SHEET_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const text = await sheetRes.text();
      try { data = JSON.parse(text); } catch (e) { data = null; }
    }

    if (data && data.status === 'success' && Array.isArray(data.orders)) {
      state.orders = data.orders.reverse();
      localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
      setSyncStatus('online', 'متصل ومحدث (Google Sheet API)');
    } else {
      const cached = localStorage.getItem('cached_dashboard_orders');
      if (cached) {
        state.orders = JSON.parse(cached);
        setSyncStatus('online', 'بيانات محفوظة محلياً');
      }
    }
  } catch (err) {
    console.error('Fetch error:', err);
    const cached = localStorage.getItem('cached_dashboard_orders');
    if (cached) state.orders = JSON.parse(cached);
    setSyncStatus('offline', 'تعذر الاتصال المباشر');
  } finally {
    loadingState.style.display = 'none';
    populateWilayaFilter();
    applyFilters();
    updateKPIs();
  }
}

// 3. Update KPIs
function updateKPIs() {
  const total = state.orders.length;
  let newCount = 0;
  let failed1Count = 0;
  let confirmedCount = 0;
  let cancelledCount = 0;
  let postponedCount = 0;
  let failed2Count = 0;
  let failed3Count = 0;
  let totalRevenue = 0;

  state.orders.forEach(order => {
    const s = (order.status || 'جديد').trim();
    if (s === 'جديد') newCount++;
    else if (s === 'فاشلة 1') failed1Count++;
    else if (s === 'مؤكدة' || s === 'مؤكد') confirmedCount++;
    else if (s === 'ملغاة' || s === 'ملغى') cancelledCount++;
    else if (s === 'مؤجلة') postponedCount++;
    else if (s === 'فاشلة 2') failed2Count++;
    else if (s === 'فاشلة 3') failed3Count++;

    if (!s.includes('ملغ') && !s.includes('فاشل')) {
      const num = parseFloat((order.total || '').toString().replace(/[^0-9.]/g, '')) || 0;
      totalRevenue += num;
    }
  });

  kpiTotal.textContent = total;
  kpiNew.textContent = newCount;
  kpiConfirmed.textContent = confirmedCount;
  if (kpiPostponed) kpiPostponed.textContent = postponedCount;
  kpiRevenue.textContent = totalRevenue.toLocaleString('en-US') + ' DA';

  const setTab = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  };
  setTab('count-all', total);
  setTab('count-new', newCount);
  setTab('count-failed1', failed1Count);
  setTab('count-confirmed', confirmedCount);
  setTab('count-postponed', postponedCount);
  setTab('count-cancelled', cancelledCount);
  setTab('count-failed2', failed2Count);
  setTab('count-failed3', failed3Count);
}

// 4. Populate Wilaya Filter
function populateWilayaFilter() {
  const uniqueWilayas = [...new Set(state.orders.map(o => o.wilaya).filter(Boolean))];
  const current = wilayaFilterSelect.value;
  
  wilayaFilterSelect.innerHTML = '<option value="">جميع الولايات</option>';
  uniqueWilayas.sort().forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    if (w === current) opt.selected = true;
    wilayaFilterSelect.appendChild(opt);
  });
}

// 5. Apply Filters
function applyFilters() {
  const query = state.searchQuery.toLowerCase().trim();

  state.filteredOrders = state.orders.filter(order => {
    if (state.currentStatusFilter !== 'all' && (order.status || 'جديد').trim() !== state.currentStatusFilter) {
      return false;
    }

    if (state.currentWilayaFilter && (order.wilaya || '').trim() !== state.currentWilayaFilter) {
      return false;
    }

    if (query) {
      const matchId = (order.id || '').toLowerCase().includes(query);
      const matchCustomer = (order.customer || '').toLowerCase().includes(query);
      const matchPhone = (order.phone || '').includes(query);
      const matchWilaya = (order.wilaya || '').toLowerCase().includes(query);
      const matchCommune = (order.commune || '').toLowerCase().includes(query);
      if (!matchId && !matchCustomer && !matchPhone && !matchWilaya && !matchCommune) {
        return false;
      }
    }

    return true;
  });

  renderTable();
}

// 6. Render Table: Exactly 12 columns
function renderTable() {
  ordersTbody.innerHTML = '';

  if (state.filteredOrders.length === 0) {
    emptyState.style.display = 'block';
    ordersTable.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  ordersTable.style.display = 'table';

  state.filteredOrders.forEach(order => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', order.id);

    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (intlPhone.startsWith('0')) intlPhone = '213' + intlPhone.slice(1);
    else if (!intlPhone.startsWith('213') && intlPhone.length === 9) intlPhone = '213' + intlPhone;

    const waMsg = encodeURIComponent(
      `مرحباً بك ${order.customer || ''}، معك متجر Kadya لتأكيد طلبيتك رقم ${order.id}.`
    );
    const waUrl = `https://wa.me/${intlPhone}?text=${waMsg}`;
    const callUrl = `tel:${order.phone || ''}`;

    const isDesk = (order.shipping || '').includes('مكتب');

    tr.innerHTML = `
      <td><span class="order-id-badge">${order.id || '-'}</span></td>
      <td><span class="order-date">${order.date || '-'}</span></td>
      <td><span class="customer-name">${order.customer || '-'}</span></td>
      <td>
        <div class="status-dropdown-wrapper">
          <button type="button" class="status-badge-btn status-${(order.status || 'جديد').replace(/\s+/g, '-')}" data-order-id="${order.id}">
            <span class="status-dot-indicator"></span>
            <span class="status-text">${order.status || 'جديد'}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="status-menu">
            ${STATUS_LIST.map(st => `
              <button type="button" class="status-menu-item ${st === (order.status || 'جديد') ? 'active' : ''}" data-status="${st}">
                <div class="status-menu-item-left">
                  <span class="status-dot-indicator status-dot-${st.replace(/\s+/g, '-')}"></span>
                  <span>${st}</span>
                </div>
                <span class="check-icon">✓</span>
              </button>
            `).join('')}
          </div>
        </div>
      </td>
      <td>
        <div class="customer-phone-box">
          <span class="customer-phone">${order.phone || '-'}</span>
          ${order.phone ? `
            <a href="${waUrl}" target="_blank" class="quick-icon-btn whatsapp" title="واتساب">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.072-1.895-.447-1.428-.588-2.346-2.04-2.417-2.135-.072-.095-.575-.765-.575-1.46 0-.695.362-1.036.491-1.18.129-.144.281-.18.375-.18.093 0 .188.001.27.005.086.004.202-.033.316.241.12.288.412 1.01.448 1.084.036.074.06.162.012.257-.048.096-.072.155-.144.24-.072.084-.153.188-.218.252-.072.072-.148.15-.064.294.084.144.373.616.8 1.002.551.498 1.015.653 1.159.725.144.072.228.06.312-.036.085-.096.362-.42.459-.564.096-.144.193-.12.325-.072.133.048.841.396.985.468.145.072.24.108.277.168.036.06.036.353-.108.758z"/>
              </svg>
            </a>
            <a href="${callUrl}" class="quick-icon-btn phone" title="اتصال">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
          ` : ''}
        </div>
      </td>
      <td>
        <div class="wilaya-dropdown-wrapper">
          <button type="button" class="wilaya-badge-btn" data-order-id="${order.id}">
            <span class="wilaya-text">${order.wilaya || '-'}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="wilaya-menu">
            <input type="text" class="wilaya-menu-search" placeholder="ابحث عن ولاية أو رقمها...">
            <div class="wilaya-menu-list">
              ${WILAYAS_LIST.map(w => {
                const fullText = `${w.code} ${w.fr} ${w.ar}`;
                const isActive = (order.wilaya || '').includes(w.code) || (order.wilaya || '').includes(w.ar);
                return `
                  <button type="button" class="wilaya-menu-item ${isActive ? 'active' : ''}" data-wilaya="${fullText}" data-search="${w.code} ${w.ar} ${w.fr}">
                    <span class="code-badge">${w.code}</span>
                    <span>${w.ar} (${w.fr})</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div class="commune-dropdown-wrapper">
          <button type="button" class="commune-badge-btn ${order.commune ? 'has-commune' : ''} ${isDesk ? 'is-office' : ''}" data-order-id="${order.id}">
            <span class="commune-text">${order.commune || (isDesk ? '+ اختر مكتب' : '+ اختر بلدية')}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="commune-menu">
            <div class="commune-menu-header">
              <span class="commune-menu-title">${isDesk ? 'مكاتب التوصيل المتوفرة' : 'جميع بلديات الولاية'}</span>
              <span class="commune-menu-type-badge ${isDesk ? 'office' : 'home'}">${isDesk ? 'مكتب' : 'منزل'}</span>
            </div>
            <input type="text" class="commune-menu-search" placeholder="${isDesk ? 'ابحث عن اسم المكتب...' : 'ابحث عن بلدية...'}">
            <div class="commune-menu-list">
              <!-- Rendered dynamically depending on wilaya and shipping type -->
            </div>
          </div>
        </div>
      </td>
      <td>
        <div class="size-dropdown-wrapper">
          <button type="button" class="size-badge-btn" data-order-id="${order.id}">
            <span class="size-text">${order.size || '-'}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="size-menu">
            ${SIZES_LIST.map(sz => `
              <button type="button" class="size-menu-item ${sz === (order.size || '') ? 'active' : ''}" data-size="${sz}">
                <span>${sz}</span>
                <span class="check-icon" style="opacity: ${sz === (order.size || '') ? 1 : 0}">✓</span>
              </button>
            `).join('')}
          </div>
        </div>
      </td>
      <td>
        <div class="shipping-dropdown-wrapper">
          <button type="button" class="shipping-badge-btn ${isDesk ? 'desk' : 'home'}" data-order-id="${order.id}">
            <span class="shipping-text">${order.shipping || (isDesk ? 'مكتب' : 'منزل')}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="shipping-menu">
            <button type="button" class="shipping-menu-item ${isDesk ? 'active' : ''}" data-shipping="مكتب">
              <span>مكتب (500 DA)</span>
              <span class="check-icon" style="opacity: ${isDesk ? 1 : 0}">✓</span>
            </button>
            <button type="button" class="shipping-menu-item ${!isDesk ? 'active' : ''}" data-shipping="منزل">
              <span>منزل (700 DA)</span>
              <span class="check-icon" style="opacity: ${!isDesk ? 1 : 0}">✓</span>
            </button>
          </div>
        </div>
      </td>
      <td><span class="fee-text">${order.shippingFee || (isDesk ? '500 DA' : '700 DA')}</span></td>
      <td><span class="total-amount">${order.total || '-'}</span></td>
      <td>
        <div class="notes-preview ${!order.notes ? 'empty' : ''}" title="${order.notes || 'اضغط للإضافة'}">
          ${order.notes ? order.notes : '+ إضافة ملاحظة'}
        </div>
      </td>
      <td>
        <button class="action-view-btn" data-order-id="${order.id}">تعديل</button>
      </td>
    `;

    // Status Dropdown toggle & selection
    const badgeBtn = tr.querySelector('.status-badge-btn');
    const statusMenu = tr.querySelector('.status-menu');

    badgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(statusMenu);
      const isOpen = statusMenu.classList.toggle('show');
      badgeBtn.classList.toggle('open', isOpen);
    });

    statusMenu.querySelectorAll('.status-menu-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newStatus = item.getAttribute('data-status');
        statusMenu.classList.remove('show');
        badgeBtn.classList.remove('open');
        await updateOrderStatus(order.id, newStatus, badgeBtn, statusMenu);
      });
    });

    // Wilaya Dropdown toggle & selection
    const wilayaBadgeBtn = tr.querySelector('.wilaya-badge-btn');
    const wilayaMenu = tr.querySelector('.wilaya-menu');
    const wilayaSearchInput = wilayaMenu.querySelector('.wilaya-menu-search');
    const wilayaItems = wilayaMenu.querySelectorAll('.wilaya-menu-item');

    wilayaBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(wilayaMenu);
      const isOpen = wilayaMenu.classList.toggle('show');
      wilayaBadgeBtn.classList.toggle('open', isOpen);
      if (isOpen) {
        wilayaSearchInput.value = '';
        wilayaItems.forEach(it => it.style.display = 'flex');
        setTimeout(() => wilayaSearchInput.focus(), 50);
      }
    });

    wilayaSearchInput.addEventListener('click', (e) => e.stopPropagation());
    wilayaSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      wilayaItems.forEach(it => {
        const searchText = (it.getAttribute('data-search') || '').toLowerCase();
        it.style.display = searchText.includes(q) ? 'flex' : 'none';
      });
    });

    wilayaItems.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newWilaya = item.getAttribute('data-wilaya');
        wilayaMenu.classList.remove('show');
        wilayaBadgeBtn.classList.remove('open');
        await updateOrderWilaya(order.id, newWilaya, wilayaBadgeBtn, wilayaMenu);
      });
    });

    // Size Dropdown toggle & selection
    const sizeBadgeBtn = tr.querySelector('.size-badge-btn');
    const sizeMenu = tr.querySelector('.size-menu');

    sizeBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(sizeMenu);
      const isOpen = sizeMenu.classList.toggle('show');
      sizeBadgeBtn.classList.toggle('open', isOpen);
    });

    sizeMenu.querySelectorAll('.size-menu-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newSize = item.getAttribute('data-size');
        sizeMenu.classList.remove('show');
        sizeBadgeBtn.classList.remove('open');
        await updateOrderSize(order.id, newSize, sizeBadgeBtn, sizeMenu);
      });
    });

    // Shipping Dropdown toggle & selection (مكتب / منزل)
    const shippingBadgeBtn = tr.querySelector('.shipping-badge-btn');
    const shippingMenu = tr.querySelector('.shipping-menu');

    shippingBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(shippingMenu);
      const isOpen = shippingMenu.classList.toggle('show');
      shippingBadgeBtn.classList.toggle('open', isOpen);
    });

    shippingMenu.querySelectorAll('.shipping-menu-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newShipping = item.getAttribute('data-shipping');
        shippingMenu.classList.remove('show');
        shippingBadgeBtn.classList.remove('open');
        await updateOrderShipping(order.id, newShipping, shippingBadgeBtn, shippingMenu);
      });
    });

    // Commune / Office Dropdown toggle & dynamic population
    const communeBadgeBtn = tr.querySelector('.commune-badge-btn');
    const communeMenu = tr.querySelector('.commune-menu');
    const communeSearchInput = communeMenu.querySelector('.commune-menu-search');
    const communeMenuList = communeMenu.querySelector('.commune-menu-list');

    communeBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns(communeMenu);
      const isOpen = communeMenu.classList.toggle('show');
      communeBadgeBtn.classList.toggle('open', isOpen);

      if (isOpen) {
        communeSearchInput.value = '';
        populateCommuneMenuList(order, communeMenuList, communeBadgeBtn, communeMenu);
        setTimeout(() => communeSearchInput.focus(), 50);
      }
    });

    communeSearchInput.addEventListener('click', (e) => e.stopPropagation());
    communeSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      communeMenuList.querySelectorAll('.commune-menu-item').forEach(it => {
        const text = (it.getAttribute('data-search') || '').toLowerCase();
        it.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    const notesPreview = tr.querySelector('.notes-preview');
    notesPreview.addEventListener('click', () => openEditModal(order));

    const viewBtn = tr.querySelector('.action-view-btn');
    viewBtn.addEventListener('click', () => openEditModal(order));

    ordersTbody.appendChild(tr);
  });
}

// Helper: Dynamically populate commune menu items based on shipping choice and wilaya
function populateCommuneMenuList(order, listContainer, badgeBtn, menuContainer) {
  listContainer.innerHTML = '';
  const code = extractWilayaCode(order.wilaya);
  const isDesk = (order.shipping || '').includes('مكتب');

  if (isDesk) {
    // 1. DELIVERY OFFICES (Stop Desk)
    const offices = getOfficesForWilaya(code);

    if (offices.length === 0) {
      listContainer.innerHTML = `
        <div class="commune-menu-empty">
          لا يوجد مكتب استلام مسجل لهذه الولاية.<br>
          <span style="color:#38bdf8;cursor:pointer;" onclick="this.closest('tr').querySelector('.shipping-badge-btn').click();">اضغط للتحويل إلى توصيل منزلي</span>
        </div>
      `;
      return;
    }

    offices.forEach(off => {
      const branchName = off.branch_ar || off.branch_fr || '';
      const fullLabel = `${branchName} (${off.wilaya_ar})`;
      const isActive = (order.commune || '').includes(branchName);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `commune-menu-item is-office-item ${isActive ? 'active' : ''}`;
      btn.setAttribute('data-commune', branchName);
      btn.setAttribute('data-search', `${branchName} ${off.branch_fr || ''} ${off.address_ar || ''}`);
      btn.title = off.address_ar || '';

      btn.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: right; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
            <span style="font-weight: 700; color: #f8fafc;">${branchName}</span>
          </div>
          ${off.address_ar ? `<span style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${off.address_ar}</span>` : ''}
        </div>
        <span class="check-icon" style="opacity: ${isActive ? 1 : 0}; color: #34d399;">✓</span>
      `;

      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        menuContainer.classList.remove('show');
        badgeBtn.classList.remove('open');
        await updateOrderCommune(order.id, branchName, badgeBtn, menuContainer);
      });

      listContainer.appendChild(btn);
    });
  } else {
    // 2. FULL WILAYA COMMUNES (Home Delivery)
    const communes = getCommunesForWilaya(code);

    if (communes.length === 0) {
      listContainer.innerHTML = '<div class="commune-menu-empty">لم يتم العثور على بلديات لهذه الولاية</div>';
      return;
    }

    communes.forEach(c => {
      const communeName = c.commune_name || '';
      const communeAscii = c.commune_name_ascii || '';
      const displayName = `${communeName} (${communeAscii})`;
      const isActive = (order.commune || '') === communeName || (order.commune || '') === displayName;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `commune-menu-item ${isActive ? 'active' : ''}`;
      btn.setAttribute('data-commune', communeName);
      btn.setAttribute('data-search', `${communeName} ${communeAscii}`);

      btn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #cbd5e1;">${communeName}</span>
          <span style="font-size: 10px; color: #64748b;">${communeAscii}</span>
        </div>
        <span class="check-icon" style="opacity: ${isActive ? 1 : 0}; color: #38bdf8;">✓</span>
      `;

      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        menuContainer.classList.remove('show');
        badgeBtn.classList.remove('open');
        await updateOrderCommune(order.id, communeName, badgeBtn, menuContainer);
      });

      listContainer.appendChild(btn);
    });
  }
}

function closeAllDropdowns(exceptElement = null) {
  document.querySelectorAll('.status-menu.show').forEach(m => {
    if (m !== exceptElement) {
      m.classList.remove('show');
      m.parentElement.querySelector('.status-badge-btn')?.classList.remove('open');
    }
  });
  document.querySelectorAll('.wilaya-menu.show').forEach(m => {
    if (m !== exceptElement) {
      m.classList.remove('show');
      m.parentElement.querySelector('.wilaya-badge-btn')?.classList.remove('open');
    }
  });
  document.querySelectorAll('.size-menu.show').forEach(m => {
    if (m !== exceptElement) {
      m.classList.remove('show');
      m.parentElement.querySelector('.size-badge-btn')?.classList.remove('open');
    }
  });
  document.querySelectorAll('.shipping-menu.show').forEach(m => {
    if (m !== exceptElement) {
      m.classList.remove('show');
      m.parentElement.querySelector('.shipping-badge-btn')?.classList.remove('open');
    }
  });
  document.querySelectorAll('.commune-menu.show').forEach(m => {
    if (m !== exceptElement) {
      m.classList.remove('show');
      m.parentElement.querySelector('.commune-badge-btn')?.classList.remove('open');
    }
  });
}

// Global click to close dropdowns
document.addEventListener('click', () => {
  closeAllDropdowns();
});

// 7. Instant Status Update
async function updateOrderStatus(orderId, newStatus, badgeBtn, statusMenu) {
  const oldStatus = badgeBtn.querySelector('.status-text').textContent;
  if (oldStatus === newStatus) return;

  // Optimistic UI
  badgeBtn.className = `status-badge-btn status-${newStatus.replace(/\s+/g, '-')}`;
  badgeBtn.querySelector('.status-text').textContent = newStatus;
  badgeBtn.style.opacity = '0.6';
  badgeBtn.style.pointerEvents = 'none';

  if (statusMenu) {
    statusMenu.querySelectorAll('.status-menu-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-status') === newStatus);
    });
  }

  const target = state.orders.find(o => o.id === orderId);
  if (target) target.status = newStatus;
  updateKPIs();

  try {
    setSyncStatus('syncing', 'جاري حفظ التعديل...');
    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order', id: orderId, status: newStatus })
      });
    }

    showToast(`تم تعديل حالة الطلب ${orderId} إلى "${newStatus}"`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
  } catch (err) {
    if (target) target.status = oldStatus;
    badgeBtn.className = `status-badge-btn status-${oldStatus.replace(/\s+/g, '-')}`;
    badgeBtn.querySelector('.status-text').textContent = oldStatus;
    if (statusMenu) {
      statusMenu.querySelectorAll('.status-menu-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-status') === oldStatus);
      });
    }
    showToast('تعذر حفظ التعديل في Sheet', 'error');
  } finally {
    badgeBtn.style.opacity = '1';
    badgeBtn.style.pointerEvents = 'auto';
  }
}

// 7.2 Instant Wilaya Update
async function updateOrderWilaya(orderId, newWilaya, badgeBtn, wilayaMenu) {
  const oldWilaya = badgeBtn.querySelector('.wilaya-text').textContent;
  if (oldWilaya === newWilaya) return;

  // Optimistic UI
  badgeBtn.querySelector('.wilaya-text').textContent = newWilaya;
  badgeBtn.style.opacity = '0.6';
  badgeBtn.style.pointerEvents = 'none';

  if (wilayaMenu) {
    wilayaMenu.querySelectorAll('.wilaya-menu-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-wilaya') === newWilaya);
    });
  }

  const target = state.orders.find(o => o.id === orderId);
  if (target) target.wilaya = newWilaya;

  try {
    setSyncStatus('syncing', 'جاري حفظ الولاية...');
    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, wilaya: newWilaya })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order', id: orderId, wilaya: newWilaya })
      });
    }

    showToast(`تم تحديث ولاية الطلب ${orderId} بنجاح`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
  } catch (err) {
    if (target) target.wilaya = oldWilaya;
    badgeBtn.querySelector('.wilaya-text').textContent = oldWilaya;
    if (wilayaMenu) {
      wilayaMenu.querySelectorAll('.wilaya-menu-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-wilaya') === oldWilaya);
      });
    }
    showToast('تعذر حفظ تعديل الولاية في Sheet', 'error');
  } finally {
    badgeBtn.style.opacity = '1';
    badgeBtn.style.pointerEvents = 'auto';
  }
}

// 7.3 Instant Size Update
async function updateOrderSize(orderId, newSize, badgeBtn, sizeMenu) {
  const oldSize = badgeBtn.querySelector('.size-text').textContent;
  if (oldSize === newSize) return;

  // Optimistic UI
  badgeBtn.querySelector('.size-text').textContent = newSize;
  badgeBtn.style.opacity = '0.6';
  badgeBtn.style.pointerEvents = 'none';

  if (sizeMenu) {
    sizeMenu.querySelectorAll('.size-menu-item').forEach(item => {
      const isActive = item.getAttribute('data-size') === newSize;
      item.classList.toggle('active', isActive);
      const check = item.querySelector('.check-icon');
      if (check) check.style.opacity = isActive ? '1' : '0';
    });
  }

  const target = state.orders.find(o => o.id === orderId);
  if (target) target.size = newSize;

  try {
    setSyncStatus('syncing', 'جاري حفظ المقاس...');
    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, size: newSize })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order', id: orderId, size: newSize })
      });
    }

    showToast(`تم تعديل مقاس الطلب ${orderId} إلى ${newSize}`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
  } catch (err) {
    if (target) target.size = oldSize;
    badgeBtn.querySelector('.size-text').textContent = oldSize;
    if (sizeMenu) {
      sizeMenu.querySelectorAll('.size-menu-item').forEach(item => {
        const isOld = item.getAttribute('data-size') === oldSize;
        item.classList.toggle('active', isOld);
        const check = item.querySelector('.check-icon');
        if (check) check.style.opacity = isOld ? '1' : '0';
      });
    }
    showToast('تعذر حفظ المقاس في Sheet', 'error');
  } finally {
    badgeBtn.style.opacity = '1';
    badgeBtn.style.pointerEvents = 'auto';
  }
}

// 7.4 Instant Shipping Update (مكتب / منزل)
async function updateOrderShipping(orderId, newShipping, badgeBtn, shippingMenu) {
  const oldShipping = badgeBtn.querySelector('.shipping-text').textContent.trim();
  if (oldShipping === newShipping) return;

  const isDesk = newShipping.includes('مكتب');
  const newFee = isDesk ? '500 DA' : '700 DA';
  const subtotal = 4400;
  const newTotal = (subtotal + (isDesk ? 500 : 700)).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' DA';

  // Optimistic UI
  badgeBtn.className = `shipping-badge-btn ${isDesk ? 'desk' : 'home'}`;
  badgeBtn.querySelector('.shipping-text').textContent = newShipping;
  badgeBtn.style.opacity = '0.6';
  badgeBtn.style.pointerEvents = 'none';

  const tr = badgeBtn.closest('tr');
  if (tr) {
    const feeEl = tr.querySelector('.fee-text');
    if (feeEl) feeEl.textContent = newFee;
    const totalEl = tr.querySelector('.total-amount');
    if (totalEl) totalEl.textContent = newTotal;
  }

  if (shippingMenu) {
    shippingMenu.querySelectorAll('.shipping-menu-item').forEach(item => {
      const isActive = item.getAttribute('data-shipping') === newShipping;
      item.classList.toggle('active', isActive);
      const check = item.querySelector('.check-icon');
      if (check) check.style.opacity = isActive ? '1' : '0';
    });
  }

  const target = state.orders.find(o => o.id === orderId);
  if (target) {
    target.shipping = newShipping;
    target.shippingFee = newFee;
    target.total = newTotal;
  }
  updateKPIs();

  try {
    setSyncStatus('syncing', 'جاري حفظ نوع التوصيل...');
    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          shipping: newShipping,
          shippingFee: newFee,
          total: newTotal
        })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order',
          id: orderId,
          shipping: newShipping,
          shippingFee: newFee,
          total: newTotal
        })
      });
    }

    showToast(`تم تحويل التوصيل للطلب ${orderId} إلى "${newShipping}"`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));

    // Refresh row to re-render commune dropdown according to new shipping type
    renderTable();
  } catch (err) {
    if (target) target.shipping = oldShipping;
    renderTable();
    showToast('تعذر حفظ نوع التوصيل في Sheet', 'error');
  } finally {
    badgeBtn.style.opacity = '1';
    badgeBtn.style.pointerEvents = 'auto';
  }
}

// 7.5 Instant Commune Update
async function updateOrderCommune(orderId, newCommune, badgeBtn, communeMenu) {
  const oldCommune = badgeBtn.querySelector('.commune-text').textContent.trim();
  if (oldCommune === newCommune) return;

  const target = state.orders.find(o => o.id === orderId);
  const isDesk = target ? (target.shipping || '').includes('مكتب') : false;

  // Optimistic UI
  badgeBtn.className = `commune-badge-btn has-commune ${isDesk ? 'is-office' : ''}`;
  badgeBtn.querySelector('.commune-text').textContent = newCommune;
  badgeBtn.style.opacity = '0.6';
  badgeBtn.style.pointerEvents = 'none';

  if (communeMenu) {
    communeMenu.querySelectorAll('.commune-menu-item').forEach(item => {
      const isActive = item.getAttribute('data-commune') === newCommune;
      item.classList.toggle('active', isActive);
      const check = item.querySelector('.check-icon');
      if (check) check.style.opacity = isActive ? '1' : '0';
    });
  }

  if (target) target.commune = newCommune;

  try {
    setSyncStatus('syncing', 'جاري حفظ البلدية/الفرع...');
    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, commune: newCommune })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order', id: orderId, commune: newCommune })
      });
    }

    showToast(`تم تحديد ${isDesk ? 'مكتب' : 'بلدية'} الطلب ${orderId}: "${newCommune}"`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
  } catch (err) {
    if (target) target.commune = oldCommune;
    badgeBtn.querySelector('.commune-text').textContent = oldCommune || '+ تحديد';
    showToast('تعذر حفظ البلدية في Sheet', 'error');
  } finally {
    badgeBtn.style.opacity = '1';
    badgeBtn.style.pointerEvents = 'auto';
  }
}

// Helper: Extract Wilaya Code from string
function extractWilayaCode(wilayaStr) {
  if (!wilayaStr) return '16';
  const match = wilayaStr.match(/\b([0-5][0-9])\b/);
  return match ? match[1] : '16';
}

// 8. Populate Modal Communes based on Wilaya & Shipping Type
function updateModalCommunesDropdown(wilayaCode, isDesk, currentCommune = '') {
  modalSelectCommune.innerHTML = isDesk
    ? '<option value="">-- اختر مكتب الاستلام من القائمة --</option>'
    : '<option value="">-- اختر البلدية من قاعدة البيانات --</option>';

  if (isDesk) {
    const offices = getOfficesForWilaya(wilayaCode);
    if (offices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'لا توجد مكاتب مسجلة في هذه الولاية';
      opt.disabled = true;
      modalSelectCommune.appendChild(opt);
      return;
    }
    offices.forEach(off => {
      const branch = off.branch_ar || off.branch_fr || '';
      const opt = document.createElement('option');
      opt.value = branch;
      opt.textContent = `مكتب: ${branch} - ${off.address_ar || ''}`;
      if (currentCommune && currentCommune.includes(branch)) opt.selected = true;
      modalSelectCommune.appendChild(opt);
    });
  } else {
    const communes = getCommunesForWilaya(wilayaCode);
    communes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.commune_name;
      opt.textContent = `${c.commune_name} - ${c.commune_name_ascii}`;
      if (currentCommune && (currentCommune === c.commune_name || currentCommune.includes(c.commune_name))) {
        opt.selected = true;
      }
      modalSelectCommune.appendChild(opt);
    });
  }
}

// 9. Open Edit Modal
function openEditModal(order) {
  state.selectedOrder = order;

  modalOrderId.textContent = order.id || '-';
  modalCustomerName.textContent = order.customer || 'عميل';
  modalPhone.textContent = order.phone || '-';
  modalSize.textContent = order.size || '-';
  const isDesk = (order.shipping || '').includes('مكتب');
  modalShipping.textContent = `${order.shipping || (isDesk ? 'مكتب' : 'منزل')} (${order.shippingFee || (isDesk ? '500 DA' : '700 DA')})`;
  modalTotal.textContent = order.total || '-';

  const cleanPhone = (order.phone || '').replace(/\D/g, '');
  let intlPhone = cleanPhone;
  if (intlPhone.startsWith('0')) intlPhone = '213' + intlPhone.slice(1);
  modalWhatsappBtn.href = `https://wa.me/${intlPhone}?text=${encodeURIComponent(`مرحباً ${order.customer || ''}، معك متجر Kadya بخصوص طلبيتك ${order.id}.`)}`;
  modalCallBtn.href = `tel:${order.phone || ''}`;

  modalInputStatus.value = order.status || 'جديد';
  modalInputShipping.value = isDesk ? 'مكتب' : 'منزل';

  // Populate Wilayas in Modal
  modalInputWilaya.innerHTML = '';
  const currentCode = extractWilayaCode(order.wilaya);

  WILAYAS_LIST.forEach(w => {
    const opt = document.createElement('option');
    opt.value = `${w.code} ${w.fr} ${w.ar}`;
    opt.textContent = `${w.code} - ${w.ar} (${w.fr})`;
    if (w.code === currentCode || (order.wilaya && order.wilaya.includes(w.ar))) {
      opt.selected = true;
    }
    modalInputWilaya.appendChild(opt);
  });

  // Update Communes/Offices for current Wilaya & Shipping
  updateModalCommunesDropdown(currentCode, isDesk, order.commune || '');
  modalInputCommune.value = order.commune || '';
  modalInputNotes.value = order.notes || '';

  orderModal.style.display = 'flex';
}

// Sync commune select to input
modalSelectCommune.addEventListener('change', (e) => {
  if (e.target.value) {
    modalInputCommune.value = e.target.value;
  }
});

// Shipping select change in modal
modalInputShipping.addEventListener('change', (e) => {
  const code = extractWilayaCode(modalInputWilaya.value);
  const isDesk = e.target.value === 'مكتب';
  updateModalCommunesDropdown(code, isDesk, modalInputCommune.value);
});

// Wilaya select change in modal
modalInputWilaya.addEventListener('change', (e) => {
  const code = extractWilayaCode(e.target.value);
  const isDesk = modalInputShipping.value === 'مكتب';
  updateModalCommunesDropdown(code, isDesk);
});

function closeEditModal() {
  orderModal.style.display = 'none';
  state.selectedOrder = null;
}

modalCloseBtn.addEventListener('click', closeEditModal);
modalCancelBtn.addEventListener('click', closeEditModal);
orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeEditModal(); });

// Modal Form Submit
modalEditForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.selectedOrder) return;

  const orderId = state.selectedOrder.id;
  const newStatus = modalInputStatus.value;
  const newShipping = modalInputShipping.value;
  const isDesk = newShipping === 'مكتب';
  const newShippingFee = isDesk ? '500 DA' : '700 DA';
  const newTotal = (4400 + (isDesk ? 500 : 700)).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' DA';
  const newWilaya = modalInputWilaya.value;
  const newCommune = modalInputCommune.value.trim();
  const newNotes = modalInputNotes.value.trim();

  const saveText = modalSaveBtn.querySelector('.save-text');
  const saveSpinner = modalSaveBtn.querySelector('.save-spinner');
  saveText.style.display = 'none';
  saveSpinner.style.display = 'inline';
  modalSaveBtn.disabled = true;

  try {
    setSyncStatus('syncing', 'جاري الحفظ في Sheet...');

    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          shipping: newShipping,
          shippingFee: newShippingFee,
          total: newTotal,
          wilaya: newWilaya,
          commune: newCommune,
          notes: newNotes
        })
      });
      if (apiRes.ok) ok = true;
    } catch (e) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order',
          id: orderId,
          status: newStatus,
          shipping: newShipping,
          shippingFee: newShippingFee,
          total: newTotal,
          wilaya: newWilaya,
          commune: newCommune,
          notes: newNotes
        })
      });
    }

    state.selectedOrder.status = newStatus;
    state.selectedOrder.shipping = newShipping;
    state.selectedOrder.shippingFee = newShippingFee;
    state.selectedOrder.total = newTotal;
    state.selectedOrder.wilaya = newWilaya;
    state.selectedOrder.commune = newCommune;
    state.selectedOrder.notes = newNotes;

    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
    applyFilters();
    updateKPIs();

    showToast(`تم حفظ تعديل الطلب ${orderId} بنجاح في Google Sheet`);
    setSyncStatus('online', 'متصل ومحدث');
    closeEditModal();
  } catch (err) {
    showToast('حدث خطأ أثناء الحفظ', 'error');
  } finally {
    saveText.style.display = 'inline';
    saveSpinner.style.display = 'none';
    modalSaveBtn.disabled = false;
  }
});

// Search & Filter Listeners
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
  applyFilters();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearSearchBtn.style.display = 'none';
  applyFilters();
  searchInput.focus();
});

wilayaFilterSelect.addEventListener('change', (e) => {
  state.currentWilayaFilter = e.target.value;
  applyFilters();
});

statusTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  statusTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.currentStatusFilter = tab.getAttribute('data-status');
  applyFilters();
});

document.querySelectorAll('.kpi-card[data-filter]').forEach(card => {
  card.addEventListener('click', () => {
    const filter = card.getAttribute('data-filter');
    const targetTab = statusTabs.querySelector(`.tab[data-status="${filter}"]`);
    if (targetTab) targetTab.click();
  });
});

refreshBtn.addEventListener('click', () => {
  fetchOrders(true);
});

// ==================== Create New Order Modal Logic ====================
const createOrderModal = document.getElementById('create-order-modal');
const createModalCloseBtn = document.getElementById('create-modal-close-btn');
const createModalCancelBtn = document.getElementById('create-modal-cancel-btn');
const createOrderForm = document.getElementById('create-order-form');

const createInputName = document.getElementById('create-input-name');
const createInputPhone = document.getElementById('create-input-phone');
const createInputStatus = document.getElementById('create-input-status');
const createInputShipping = document.getElementById('create-input-shipping');
const createInputSize = document.getElementById('create-input-size');
const createInputWilaya = document.getElementById('create-input-wilaya');
const createSelectCommune = document.getElementById('create-select-commune');
const createInputFee = document.getElementById('create-input-fee');
const createInputTotal = document.getElementById('create-input-total');
const createInputNotes = document.getElementById('create-input-notes');
const createModalSubmitBtn = document.getElementById('create-modal-submit-btn');

function updateCreateModalCommunes() {
  const wilayaVal = createInputWilaya.value;
  const wilayaCode = extractWilayaCode(wilayaVal);
  const isDesk = createInputShipping.value === 'مكتب';

  createSelectCommune.innerHTML = isDesk
    ? '<option value="">-- اختر مكتب الاستلام --</option>'
    : '<option value="">-- اختر البلدية --</option>';

  if (isDesk) {
    const offices = getOfficesForWilaya(wilayaCode);
    if (offices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'لا توجد مكاتب مسجلة في هذه الولاية';
      opt.disabled = true;
      createSelectCommune.appendChild(opt);
      return;
    }
    offices.forEach(off => {
      const branch = off.branch_ar || off.branch_fr || '';
      const opt = document.createElement('option');
      opt.value = branch;
      opt.textContent = `مكتب: ${branch} - ${off.address_ar || ''}`;
      createSelectCommune.appendChild(opt);
    });
  } else {
    const communes = getCommunesForWilaya(wilayaCode);
    communes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.commune_name;
      opt.textContent = `${c.commune_name} - ${c.commune_name_ascii}`;
      createSelectCommune.appendChild(opt);
    });
  }
}

function updateCreateModalPricing() {
  const isDesk = createInputShipping.value === 'مكتب';
  const fee = isDesk ? 500 : 700;
  const total = 4400 + fee;
  createInputFee.value = fee + ' DA';
  createInputTotal.value = total.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' DA';
}

function openCreateOrderModal() {
  createOrderForm.reset();
  createInputStatus.value = 'جديد';
  createInputShipping.value = 'مكتب';
  createInputSize.value = '42';

  // Populate Wilayas in Create Modal
  createInputWilaya.innerHTML = '';
  WILAYAS_LIST.forEach(w => {
    const opt = document.createElement('option');
    opt.value = `${w.code} ${w.fr} ${w.ar}`;
    opt.textContent = `${w.code} - ${w.ar} (${w.fr})`;
    createInputWilaya.appendChild(opt);
  });

  updateCreateModalPricing();
  updateCreateModalCommunes();
  createOrderModal.style.display = 'flex';
  setTimeout(() => createInputName.focus(), 50);
}

function closeCreateOrderModal() {
  createOrderModal.style.display = 'none';
}

newOrderBtn.addEventListener('click', openCreateOrderModal);
createModalCloseBtn.addEventListener('click', closeCreateOrderModal);
createModalCancelBtn.addEventListener('click', closeCreateOrderModal);
createOrderModal.addEventListener('click', (e) => { if (e.target === createOrderModal) closeCreateOrderModal(); });

createInputWilaya.addEventListener('change', updateCreateModalCommunes);
createInputShipping.addEventListener('change', () => {
  updateCreateModalPricing();
  updateCreateModalCommunes();
});

// Create Form Submit
createOrderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = createInputName.value.trim();
  const phone = createInputPhone.value.trim();
  if (!name || !phone) {
    showToast('يرجى ملء اسم العميل ورقم الهاتف', 'error');
    return;
  }

  const isDesk = createInputShipping.value === 'مكتب';
  const fee = isDesk ? '500 DA' : '700 DA';
  const total = (4400 + (isDesk ? 500 : 700)).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' DA';

  const newOrder = {
    id: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString('fr-DZ') + ' ' + new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
    customer: name,
    status: createInputStatus.value,
    phone: phone,
    wilaya: createInputWilaya.value,
    commune: createSelectCommune.value || '',
    size: createInputSize.value,
    shipping: createInputShipping.value,
    shippingFee: fee,
    total: total,
    notes: createInputNotes.value.trim() || 'طلب مسجل يدوياً'
  };

  const saveText = createModalSubmitBtn.querySelector('.save-text');
  const saveSpinner = createModalSubmitBtn.querySelector('.save-spinner');
  saveText.style.display = 'none';
  saveSpinner.style.display = 'inline';
  createModalSubmitBtn.disabled = true;

  try {
    setSyncStatus('syncing', 'جاري تسجيل الطلب في Google Sheet...');

    let ok = false;
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      });
      if (apiRes.ok) ok = true;
    } catch (err) {}

    if (!ok) {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_order', order: newOrder })
      });
    }

    state.orders.unshift(newOrder);
    localStorage.setItem('cached_dashboard_orders', JSON.stringify(state.orders));
    applyFilters();
    updateKPIs();

    showToast(`تمت إضافة الطلب ${newOrder.id} بنجاح إلى Google Sheet`);
    setSyncStatus('online', 'متصل ومحدث (Google Sheet)');
    closeCreateOrderModal();
  } catch (err) {
    showToast('حدث خطأ أثناء حفظ الطلب في Google Sheet', 'error');
  } finally {
    saveText.style.display = 'inline';
    saveSpinner.style.display = 'none';
    createModalSubmitBtn.disabled = false;
  }
});

// Auto-refresh interval (every 30 seconds)
setInterval(() => {
  if (isDashboardAuthenticated()) {
    fetchOrders(false);
  }
}, 30000);

// ==================== Security & Rate Limiting Auth System ====================
const AUTH_PASSWORD_RAW = 'Beetro#Safe$2026/5554/124';
const AUTH_PASSWORD_HASH = 'e92892459425fc78da518b426413fcc5b32a8ac68b3eaae2c3055fa49e18573f';
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 60 * 60 * 1000; // 1 hour lockout
const AUTH_STORAGE_KEY = 'kadya_auth_session_token';
const ATTEMPTS_STORAGE_KEY = 'kadya_auth_attempts_meta';

// Robust SHA-256 helper with fallback
async function sha256(message) {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Subtle crypto error:', e);
  }
  return '';
}

function getSecurityMeta() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const meta = JSON.parse(raw);
    if (meta.lockedUntil && Date.now() > meta.lockedUntil) {
      const reset = { attempts: 0, lockedUntil: 0 };
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    return meta;
  } catch (e) {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function isDashboardAuthenticated() {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
  return token === 'authenticated_' + AUTH_PASSWORD_HASH.slice(0, 16);
}

function renderSecurityState() {
  const lockScreen = document.getElementById('auth-lock-screen');
  const errorMsg = document.getElementById('auth-error-msg');
  const attemptsText = document.getElementById('auth-attempts-text');
  const attemptsBox = document.getElementById('auth-attempts-box');
  const submitBtn = document.getElementById('auth-submit-btn');
  const pwdInput = document.getElementById('auth-password-input');

  if (isDashboardAuthenticated()) {
    if (lockScreen) lockScreen.style.display = 'none';
    return;
  }

  if (lockScreen) lockScreen.style.display = 'flex';
  const meta = getSecurityMeta();
  const now = Date.now();

  if (meta.lockedUntil && now < meta.lockedUntil) {
    const minutesLeft = Math.ceil((meta.lockedUntil - now) / 60000);
    pwdInput.disabled = false; // allow typing correct master password to unlock
    submitBtn.disabled = false;
    attemptsBox.className = 'auth-attempts-indicator warning';
    attemptsText.textContent = `🚫 الحساب مقفل! حاول بعد ${minutesLeft} دقيقة`;
    errorMsg.style.display = 'block';
    errorMsg.textContent = `تم استنفاد المحاولات الثلاث. أدخل كلمة المرور الصحيحة لفك القفل، أو انتظر ${minutesLeft} دقيقة.`;
  } else {
    pwdInput.disabled = false;
    submitBtn.disabled = false;
    const remaining = Math.max(0, MAX_ATTEMPTS - (meta.attempts || 0));
    attemptsBox.className = remaining <= 1 ? 'auth-attempts-indicator warning' : 'auth-attempts-indicator';
    attemptsText.textContent = `المحاولات المتبقية: ${remaining} من أصل 3`;
  }
}

// Wire Auth Form
const authForm = document.getElementById('auth-login-form');
const authPwdInput = document.getElementById('auth-password-input');
const authTogglePwd = document.getElementById('auth-toggle-pwd');
const eyeShow = document.getElementById('eye-show');
const eyeHide = document.getElementById('eye-hide');
const authErrorMsg = document.getElementById('auth-error-msg');
const logoutBtn = document.getElementById('logout-btn');

if (authTogglePwd) {
  authTogglePwd.addEventListener('click', () => {
    const isPwd = authPwdInput.type === 'password';
    authPwdInput.type = isPwd ? 'text' : 'password';
    eyeShow.style.display = isPwd ? 'none' : 'block';
    eyeHide.style.display = isPwd ? 'block' : 'none';
    authPwdInput.focus();
  });
}

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const entered = (authPwdInput.value || '').trim();
    if (!entered) return;

    let hash = '';
    try {
      hash = await sha256(entered);
    } catch (err) {}

    // Verify against hash or direct string
    const isMatch = (hash && hash === AUTH_PASSWORD_HASH) || (entered === AUTH_PASSWORD_RAW);

    if (isMatch) {
      // Success: Reset attempts, clear lockout and set session token
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify({ attempts: 0, lockedUntil: 0 }));
      const token = 'authenticated_' + AUTH_PASSWORD_HASH.slice(0, 16);
      sessionStorage.setItem(AUTH_STORAGE_KEY, token);
      localStorage.setItem(AUTH_STORAGE_KEY, token);

      showToast('تم التحقق بنجاح! مرحباً بك في لوحة التحكم.');
      renderSecurityState();
      await loadCommunesDatabase();
      fetchOrders(true);
    } else {
      // Failed Attempt
      const meta = getSecurityMeta();
      meta.attempts = (meta.attempts || 0) + 1;
      if (meta.attempts >= MAX_ATTEMPTS) {
        meta.lockedUntil = Date.now() + LOCKOUT_MS;
      }
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(meta));

      authPwdInput.value = '';
      authErrorMsg.style.display = 'block';

      if (meta.lockedUntil && Date.now() < meta.lockedUntil) {
        authErrorMsg.textContent = '⛔ كلمة المرور خاطئة! تم قفل لوحة التحكم لمدة ساعة كاملة بعد استنفاد 3 محاولات.';
      } else {
        const left = Math.max(0, MAX_ATTEMPTS - meta.attempts);
        authErrorMsg.textContent = `❌ كلمة المرور غير صحيحة! تبقت لك ${left} محاولة فقط قبل القفل لساعة.`;
      }
      renderSecurityState();
    }
  });
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    showToast('تم تسجيل الخروج وقفل اللوحة بنجاح');
    renderSecurityState();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  renderSecurityState();
  if (isDashboardAuthenticated()) {
    await loadCommunesDatabase();
    fetchOrders(true);
  }
});
