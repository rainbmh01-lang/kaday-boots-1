/**
 * Matjari Store - Product Page & Fast COD Checkout
 */
// رابط سكريبت غوغل شيت
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyg8afLE6kc3-xVOgsDtLRtmCXbCK16Cc2BpY_HFJTvKGgj993M0uSX0qMqxeDwlwZuCg/exec';

document.addEventListener('DOMContentLoaded', () => {
  // State
  const state = {
    subtotal: 4400,
    shippingFee: 500,
    shippingType: 'مكتب',
    shippingMethod: 'المكتب (500 DA)',
    selectedSize: '42'
  };

  // DOM Elements
  const sizePills = document.querySelectorAll('.size-pill');
  const shippingRadios = document.querySelectorAll('input[name="shipping_choice"]');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryShipping = document.getElementById('summary-shipping');
  const summaryTotal = document.getElementById('summary-total');
  const orderForm = document.getElementById('leadform-submit-form');
  const submitBtn = document.getElementById('submit-order-btn');
  const btnTitleRow = submitBtn.querySelector('.btn-title-row');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const firstNameInput = document.getElementById('first_name');
  const phoneInput = document.getElementById('phone');
  const provinceSelect = document.getElementById('province');

  const firstNameError = document.getElementById('first-name-error');
  const phoneError = document.getElementById('phone-error');
  const provinceError = document.getElementById('province-error');

  const successModal = document.getElementById('success-modal');
  const modalSummary = document.getElementById('modal-order-summary');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Format currency helper
  function formatDZD(amount) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' DA';
  }

  // Update order summary values
  function updateSummary() {
    const total = state.subtotal + state.shippingFee;
    summarySubtotal.textContent = formatDZD(state.subtotal);
    summaryShipping.textContent = formatDZD(state.shippingFee);
    summaryTotal.textContent = formatDZD(total);
  }

  // 1. Variant (Size) Selection
  sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sizePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.selectedSize = pill.getAttribute('data-size');
    });
  });

  // 2. Shipping Choice Selection
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const price = parseInt(e.target.getAttribute('data-price'), 10) || 500;
      state.shippingFee = price;
      state.shippingType = e.target.value === 'desk' ? 'مكتب' : 'منزل';
      state.shippingMethod = e.target.value === 'desk' ? 'المكتب (500 DA)' : 'المنزل (700 DA)';
      updateSummary();
    });
  });

  // 3. Custom Searchable Wilaya Selector
  const customWilayaSelector = document.getElementById('custom-wilaya-selector');
  const customWilayaTrigger = document.getElementById('custom-wilaya-trigger');
  const customWilayaDisplay = document.getElementById('custom-wilaya-display');
  const wilayaDropdown = document.getElementById('custom-wilaya-dropdown');
  const wilayaSearchInput = document.getElementById('wilaya-search-input');
  const clearWilayaSearch = document.getElementById('clear-wilaya-search');
  const wilayaOptionsList = document.getElementById('wilaya-options-list');

  const wilayaList = [];
  const rawOptions = Array.from(provinceSelect.querySelectorAll('option')).filter(o => o.value);

  rawOptions.forEach(opt => {
    const code = opt.value;
    const words = opt.textContent.split(' ').slice(1);
    const frWords = words.filter(w => /^[A-Za-zÀ-ÿ'\-]/.test(w));
    const arWords = words.filter(w => /^[\u0600-\u06FF]/.test(w));
    wilayaList.push({
      code: code,
      fr: frWords.join(' '),
      ar: arWords.join(' '),
      full: opt.textContent
    });
  });

  function renderWilayaOptions(filterText = '') {
    const query = filterText.trim().toLowerCase();
    wilayaOptionsList.innerHTML = '';

    const filtered = wilayaList.filter(item => {
      if (!query) return true;
      return item.code.includes(query) ||
             item.fr.toLowerCase().includes(query) ||
             item.ar.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      wilayaOptionsList.innerHTML = '<div class="wilaya-empty-msg">لا توجد ولاية مطابقة للبحث</div>';
      return;
    }

    filtered.forEach(item => {
      const isSelected = provinceSelect.value === item.code;
      const row = document.createElement('div');
      row.className = `wilaya-option-row ${isSelected ? 'selected' : ''}`;
      row.setAttribute('data-value', item.code);
      row.innerHTML = `
        <div class="wilaya-row-left">
          <span class="wilaya-code-badge">${item.code}</span>
          <span class="wilaya-fr-name">${item.fr}</span>
        </div>
        <div class="wilaya-row-right">
          <span class="wilaya-ar-name">${item.ar}</span>
          ${isSelected ? `
            <span class="wilaya-check-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          ` : ''}
        </div>
      `;

      row.addEventListener('click', (e) => {
        e.stopPropagation();
        selectWilaya(item);
      });

      wilayaOptionsList.appendChild(row);
    });
  }

  function selectWilaya(item) {
    provinceSelect.value = item.code;
    provinceSelect.dispatchEvent(new Event('change'));

    customWilayaDisplay.className = 'trigger-label selected';
    customWilayaDisplay.innerHTML = `
      <span class="selected-wilaya-badge">${item.code}</span>
      <span>${item.fr}</span>
      <span style="color: #94a3b8;">-</span>
      <span class="selected-wilaya-ar">${item.ar}</span>
    `;

    closeWilayaDropdown();
    clearFieldError(provinceSelect, provinceError);
  }

  function resetWilaya() {
    provinceSelect.value = '';
    customWilayaDisplay.className = 'trigger-label';
    customWilayaDisplay.textContent = 'اختر الولاية';
  }

  function openWilayaDropdown() {
    customWilayaSelector.classList.add('open');
    customWilayaTrigger.setAttribute('aria-expanded', 'true');
    wilayaSearchInput.value = '';
    clearWilayaSearch.style.display = 'none';
    renderWilayaOptions('');
    setTimeout(() => wilayaSearchInput.focus(), 60);
  }

  function closeWilayaDropdown() {
    customWilayaSelector.classList.remove('open');
    customWilayaTrigger.setAttribute('aria-expanded', 'false');
  }

  if (customWilayaTrigger) {
    customWilayaTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (customWilayaSelector.classList.contains('open')) {
        closeWilayaDropdown();
      } else {
        openWilayaDropdown();
      }
    });

    customWilayaTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWilayaDropdown();
      }
    });
  }

  if (wilayaSearchInput) {
    wilayaSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearWilayaSearch.style.display = val ? 'block' : 'none';
      renderWilayaOptions(val);
    });

    clearWilayaSearch.addEventListener('click', () => {
      wilayaSearchInput.value = '';
      clearWilayaSearch.style.display = 'none';
      renderWilayaOptions('');
      wilayaSearchInput.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (customWilayaSelector && !customWilayaSelector.contains(e.target)) {
      closeWilayaDropdown();
    }
  });

  renderWilayaOptions('');

  // 4. Validation Helpers
  function validatePhone(phone) {
    const clean = phone.replace(/[\s\-]/g, '');
    return /^(0|\+213)[5-7|2][0-9]{8}$/.test(clean) || /^[0-9]{9,10}$/.test(clean);
  }

  function setFieldError(input, errorElement, message) {
    const container = input.closest('.input-container');
    if (container) container.classList.add('error');
    if (input.id === 'province' && customWilayaSelector) {
      customWilayaSelector.classList.add('error');
    }
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  function clearFieldError(input, errorElement) {
    const container = input.closest('.input-container');
    if (container) container.classList.remove('error');
    if (input.id === 'province' && customWilayaSelector) {
      customWilayaSelector.classList.remove('error');
    }
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  // Clear errors on input
  firstNameInput.addEventListener('input', () => clearFieldError(firstNameInput, firstNameError));
  phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    clearFieldError(phoneInput, phoneError);
  });
  provinceSelect.addEventListener('change', () => clearFieldError(provinceSelect, provinceError));

  // 4. Form Submission
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Validate Name
    const firstName = firstNameInput.value.trim();
    if (!firstName) {
      setFieldError(firstNameInput, firstNameError, 'يرجى إدخال الاسم');
      hasError = true;
    } else {
      clearFieldError(firstNameInput, firstNameError);
    }

    // Validate Phone
    const phone = phoneInput.value.trim();
    if (!phone) {
      setFieldError(phoneInput, phoneError, 'يرجى إدخال رقم الهاتف');
      hasError = true;
    } else if (!validatePhone(phone)) {
      setFieldError(phoneInput, phoneError, 'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0555123456)');
      hasError = true;
    } else {
      clearFieldError(phoneInput, phoneError);
    }

    // Validate Wilaya
    const province = provinceSelect.value;
    const provinceName = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
    if (!province) {
      setFieldError(provinceSelect, provinceError, 'يرجى اختيار الولاية');
      hasError = true;
    } else {
      clearFieldError(provinceSelect, provinceError);
    }

    if (hasError) {
      // Focus first error field
      const firstInvalid = document.querySelector('.input-container.error input, .input-container.error select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // ================= Anti-Fraud & Anti-Spam (24 Hours per Phone & Device) =================
    const cleanPhone = phone.replace(/\D/g, '');
    const nowMs = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Device Limit: Max 1 order per phone/browser per 24 hours
    const lastDeviceOrder = JSON.parse(localStorage.getItem('kadya_device_last_order') || '{}');
    if (lastDeviceOrder.time && (nowMs - lastDeviceOrder.time < DAY_MS)) {
      const hoursLeft = Math.ceil((DAY_MS - (nowMs - lastDeviceOrder.time)) / (60 * 60 * 1000));
      setFieldError(phoneInput, phoneError, `عذراً، تم تسجيل طلب من هذا الهاتف/الجهاز اليوم بالفعل. سنتصل بك لتأكيده، أو يمكنك إرسال طلب جديد بعد ${hoursLeft} ساعة.`);
      return;
    }

    // 2. Phone Limit: Max 1 order per phone number per 24 hours
    const phoneHistory = JSON.parse(localStorage.getItem('kadya_phone_history') || '{}');
    if (phoneHistory[cleanPhone] && (nowMs - phoneHistory[cleanPhone] < DAY_MS)) {
      setFieldError(phoneInput, phoneError, 'تم تسجيل طلب بهذا الرقم اليوم مسبقاً، سنتصل بك لتأكيد طلبك قريباً.');
      return;
    }

    // Enter Loading State
    btnTitleRow.style.display = 'none';
    btnSpinner.style.display = 'flex';
    submitBtn.disabled = true;

    // Create Order Data
    const totalAmount = state.subtotal + state.shippingFee;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formattedDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const order = {
      id: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
      date: formattedDate,
      customer: firstName,
      status: 'جديد',
      phone: phone,
      wilaya: provinceName,
      commune: '',
      size: state.selectedSize,
      shipping: state.shippingType || (state.shippingFee === 500 ? 'مكتب' : 'منزل'),
      shippingFee: state.shippingFee + ' DA',
      total: formatDZD(totalAmount),
      product: 'BOOTS DE SECURITE BEETRO',
      subtotal: state.subtotal
    };

    // Send order to Google Sheets API v4 or fallback
    (async () => {
      let isRateLimited = false;
      let limitMessage = '';

      try {
        const apiRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: order })
        });

        if (apiRes.status === 429) {
          isRateLimited = true;
          const errData = await apiRes.json().catch(() => ({}));
          limitMessage = errData.message || 'عذراً، تم تسجيل طلب مسبق من هذا الاتصال أو الرقم اليوم.';
        }
      } catch (e) {}

      if (isRateLimited) {
        btnTitleRow.style.display = 'flex';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
        setFieldError(phoneInput, phoneError, limitMessage);
        return;
      }

      // If local server unavailable, sync to Google Sheet URL directly
      const targetSheetUrl = GOOGLE_SHEET_URL || localStorage.getItem('google_sheet_url') || '';
      if (targetSheetUrl) {
        fetch(targetSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_order', order: order })
        }).catch(err => console.warn('Google Sheets sync notice:', err));
      }

      // Record successful order in localStorage to block spam
      localStorage.setItem('kadya_device_last_order', JSON.stringify({ time: Date.now(), phone: cleanPhone }));
      phoneHistory[cleanPhone] = Date.now();
      localStorage.setItem('kadya_phone_history', JSON.stringify(phoneHistory));

      // Save to local orders list
      try {
        const saved = JSON.parse(localStorage.getItem('matjari_orders') || '[]');
        saved.unshift(order);
        localStorage.setItem('matjari_orders', JSON.stringify(saved));
      } catch (err) {
        console.error('Storage error:', err);
      }

      // Populate Success Modal
      modalSummary.innerHTML = `
        <div><strong>رقم الطلب:</strong> ${order.id}</div>
        <div><strong>المنتج:</strong> ${order.product} (المقاس: ${order.size})</div>
        <div><strong>الاسم:</strong> ${order.customer}</div>
        <div><strong>الهاتف:</strong> ${order.phone}</div>
        <div><strong>الولاية:</strong> ${order.wilaya}</div>
        <div><strong>طريقة التوصيل:</strong> ${order.shipping}</div>
        <div style="font-size: 15px; font-weight: bold; color: #1c5493; margin-top: 6px;">
          <strong>المجموع الإجمالي:</strong> ${order.total}
        </div>
      `;

      // Reset Button State
      btnTitleRow.style.display = 'flex';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;

      // Show Modal
      successModal.style.display = 'flex';
    })().catch(err => {
      console.warn('Sync notice:', err);
      btnTitleRow.style.display = 'flex';
      btnSpinner.style.display = 'none';
      submitBtn.disabled = false;
    });
  });

  // Modal Close
  modalCloseBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
    orderForm.reset();
    resetWilaya();
    state.shippingFee = 500;
    state.shippingType = 'مكتب';
    state.shippingMethod = 'المكتب (500 DA)';
    updateSummary();
  });

  // Mobile Gallery Carousel Dots
  const galleryTrack = document.querySelector('.gallery-track');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  if (galleryTrack && dots.length > 0) {
    galleryTrack.addEventListener('scroll', () => {
      const scrollPos = galleryTrack.scrollLeft;
      const width = galleryTrack.offsetWidth;
      const activeIdx = Math.round(scrollPos / width);
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const width = galleryTrack.offsetWidth;
        galleryTrack.scrollTo({ left: width * idx, behavior: 'smooth' });
      });
    });
  }


  // Initial Summary calculation
  updateSummary();
});
