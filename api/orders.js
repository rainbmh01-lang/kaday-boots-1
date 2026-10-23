const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const dzship = require('dzship');

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8691389018:AAE6GfcYSetBtQziix8Gkpe1qEbHh-Uqvfg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7281542331';

// Google Sheets Configuration
const KEY_FILE = path.join(__dirname, '..', 'kadya-store-02b5cb9020d5.json');
const SPREADSHEET_ID = '1RMInpkUIrk0HBdkAgcTAoQfYSAOTeWQzdj6lM6THTrA';
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyg8afLE6kc3-xVOgsDtLRtmCXbCK16Cc2BpY_HFJTvKGgj993M0uSX0qMqxeDwlwZuCg/exec';

let auth = null;
let sheets = null;

if (fs.existsSync(KEY_FILE)) {
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
  } catch (err) {
    console.warn('Google Auth file warning:', err.message);
  }
} else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  try {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
  } catch (err) {
    console.warn('Google Auth env warning:', err.message);
  }
}

// ZR Express Configuration
const ZR_API_KEY = process.env.ZR_API_KEY || '7geIggWo53Dwrm2pdvwUBTFJlFSaun3ygFklLb6FoBwlLe1xQzNwQbFgEKzBEnUi';
const ZR_TENANT_ID = process.env.ZR_TENANT_ID || 'e7c58aa8-b939-4382-9495-030c2f931d0b';

const CHEF_LIEUX = {
  1: 'Adrar',
  2: 'Chlef',
  3: 'Laghouat',
  4: 'Oum El Bouaghi',
  5: 'Batna',
  6: 'Bejaia',
  7: 'Biskra',
  8: 'Bechar',
  9: 'Blida',
  10: 'Bouira',
  11: 'Tamanrasset',
  12: 'Tebessa',
  13: 'Tlemcen',
  14: 'Tiaret',
  15: 'Tizi-Ouzou',
  16: 'Alger Centre',
  17: 'Djelfa',
  18: 'Jijel',
  19: 'Setif',
  20: 'Saida',
  21: 'Skikda',
  22: 'Sidi Bel-Abbes',
  23: 'Annaba',
  24: 'Guelma',
  25: 'Constantine',
  26: 'Medea',
  27: 'Mostaganem',
  28: "M'Sila",
  29: 'Mascara',
  30: 'Ouargla',
  31: 'Oran',
  32: 'El Bayadh',
  33: 'Illizi',
  34: 'B. B. Arreridj',
  35: 'Boumerdes',
  36: 'El Tarf',
  37: 'Tindouf',
  38: 'Tissemsilt',
  39: 'El-Oued',
  40: 'Khenchela',
  41: 'Souk Ahras',
  42: 'Tipaza',
  43: 'Mila',
  44: 'Ain-Defla',
  45: 'Naama',
  46: 'Ain Temouchent',
  47: 'Ghardaia',
  48: 'Relizane',
  49: 'Timimoun',
  50: 'Bordj Badji Mokhtar',
  51: 'Ouled Djellal',
  52: 'Béni Abbès',
  53: 'Ain Salah',
  54: 'Ain Guezzam',
  55: 'Touggourt',
  56: 'Djanet',
  57: "El-M'ghaier",
  58: 'El Meniaa'
};

const DEFAULT_DESKS = {
  1: "ee77ffe4-19bf-4e34-9435-01a4b7670b7a",
  2: "46a61165-5378-484d-a0c9-f5c1df785df9",
  3: "b7d3850a-b400-4554-8e21-68731bb750e2",
  4: "da659108-041c-409e-abb9-ef145cca86a1",
  5: "c88f88ed-a846-47ac-b0a1-52857081a846",
  6: "fff06f30-bcb1-43f5-86a4-7138b90574e0",
  7: "658c43cb-5246-4c47-92c1-f37d88eece72",
  8: "ad2ca91e-cf67-44d3-a240-cebc19bc7c69",
  9: "e975de4b-55a9-4f46-8a0b-3f44f9cc606a",
  10: "bed0e06d-d4af-4fa4-809e-0bc8d0ff9213",
  11: "bb45139d-1544-4316-bef9-46ea8a3ecf84",
  13: "939ef30d-fd39-4f07-a0ba-822842df6ff0",
  14: "7a6de770-a039-43ff-9180-e1668a0ab61e",
  15: "95f33f6b-d322-4d2f-a144-bec29c3ed4f7",
  16: "c329abc9-9492-48d0-916f-80cc111eea56",
  17: "65adf95c-e1a3-4c1e-a85d-f9f4c6dc6cf3",
  18: "b7b663f5-2098-488a-80c4-de62a3241cd3",
  19: "1c4565c6-d090-4cc9-bbc7-6d775562e3ee",
  20: "dfdd69b1-9209-4c22-a451-0fcfa12afade",
  22: "ffffad6e-4a31-4e05-84da-b16ad26c64b5",
  23: "41a035e6-182c-425d-b18d-3b292cdb4f19",
  24: "2f6c55b5-c104-43cf-a334-230a5f798ab1",
  25: "c97cda8a-2502-4cf8-95de-eae2db668f47",
  26: "0da58310-7e5b-4825-ab4a-ae3b290894a5",
  27: "e98af19c-ba0f-4bbe-9b89-71ae829ec898",
  28: "0c20b799-8b81-41bb-b9a3-b42e786998c7",
  29: "b32f0bbd-8f42-42a8-ba91-4d328017cebe",
  30: "bae46801-7d74-407c-af40-25f47bbbfd1b",
  31: "7b43d667-242f-4e37-aa53-ed12fe8bdc8f",
  32: "f1b3479a-156c-4d36-bd4a-c29dda99e26b",
  34: "114593cd-a1d9-4855-a73a-c0dbe400d1c7",
  35: "e3ed5c0e-2979-4974-adce-c5d9b4680704",
  36: "039daf35-c258-4ca3-9685-b769b6eb32d7",
  40: "cb2c04b1-c283-4c38-ae86-7d4f708d0f8f",
  44: "3dba88d9-0916-436f-ba0f-e22b4826bb1c",
  45: "05458248-a2b8-473b-8938-6259c68b8c2e",
  46: "4c9e6fe9-8894-4bf6-8470-a2f572294bd4",
  51: "7d6e7a8c-c5b0-4495-8271-fcf24efd3d7d",
  53: "9e9f8b08-b795-447d-90e8-274932a8249f",
  55: "f1d6e8c1-b444-4ef7-ad10-3332d57d6be8",
  58: "9c3871c5-8f07-4a07-976d-44ebe70717ab"
};

const zrClient = dzship({
  courier: 'zrexpressnew',
  credentials: {
    apiKey: ZR_API_KEY,
    tenantId: ZR_TENANT_ID
  }
});

// Anti-Spam Rate Limiting
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const IP_BURST_WINDOW_MS = 10 * 60 * 1000;
const IP_MAX_BURST_ORDERS = 10;
const phoneOrdersMap = new Map();
const ipOrdersMap = new Map();

function normalizeAlgerianPhone(phone) {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('213')) p = '0' + p.slice(3);
  if (p.length === 9 && !p.startsWith('0')) p = '0' + p;
  return p;
}

function getClientIP(req) {
  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  ip = String(ip || '').trim();
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ip;
}

function ensureResponseHelpers(res) {
  if (!res.status) {
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function (data) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(data));
      return this;
    };
  }
}

function parseBody(req) {
  if (req.body) {
    return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  }
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function parseWilayaCode(val) {
  if (!val) return 16;
  if (typeof val === 'number') return val;
  const match = String(val).match(/\d+/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (parsed >= 1 && parsed <= 58) return parsed;
  }
  return 16;
}

function parseCodAmount(total, subtotal, shippingFee) {
  if (typeof total === 'number' && !isNaN(total) && total > 0) return Math.round(total);
  if (typeof total === 'string') {
    const clean = total.replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) return Math.round(num);
  }
  const s = parseFloat(String(subtotal || '').replace(/[^\d.]/g, '')) || 0;
  const f = parseFloat(String(shippingFee || '').replace(/[^\d.]/g, '')) || 0;
  if (s + f > 0) return Math.round(s + f);
  return 4900;
}

async function sendTelegramAlert(order, zrTracking = '') {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const rawPhone = String(order.phone || '').trim();
  const cleanPhone = normalizeAlgerianPhone(rawPhone);
  const waPhone = cleanPhone.startsWith('0') ? ('213' + cleanPhone.slice(1)) : cleanPhone;
  const waUrl = `https://wa.me/${waPhone}`;

  let trackingLine = '';
  if (zrTracking) {
    trackingLine = `📦 <b>رقم التتبع (ZR Express):</b> <code>${zrTracking}</code>\n`;
  }

  const text = `📦 <b>طلب جديد في المتجر!</b> ⚡\n\n` +
    `🆔 <b>رقم الطلب:</b> <code>${order.id || ''}</code>\n` +
    trackingLine +
    `👤 <b>الاسم:</b> ${order.customer || 'غير محدد'}\n` +
    `📞 <b>الهاتف:</b> <code>${order.phone || ''}</code> (انقر للنسخ/الاتصال)\n` +
    `📍 <b>الولاية:</b> ${order.wilaya || ''}\n` +
    `🏙️ <b>البلدية:</b> ${order.commune || ''}\n` +
    `🚚 <b>التوصيل:</b> ${order.shipping || ''} (${order.shippingFee || ''})\n` +
    `👟 <b>المقاس:</b> ${order.size || ''}\n` +
    `💰 <b>الإجمالي:</b> <b>${order.total || ''}</b>\n` +
    `🕒 <b>التوقيت:</b> ${order.date || new Date().toLocaleString('fr-DZ')}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💬 مراسلة واتساب فورية', url: waUrl }
      ]
    ]
  };

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500); // 3.5s strict timeout

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });
    clearTimeout(timer);
  } catch (err) {
    console.warn('Telegram send warning:', err.message);
  }
}

async function sendTelegramTrackingFollowup(reference, trackingNumber) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !trackingNumber) return;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🚚 <b>بوليصة الشحن (ZR Express):</b> <code>${trackingNumber}</code> لطلب <code>${reference}</code>`,
        parse_mode: 'HTML'
      })
    });
    clearTimeout(timer);
  } catch (e) {}
}

async function syncToGoogleSheets(row, order) {
  let sheetSyncSuccess = false;

  if (sheets) {
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A:L',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] }
      });
      sheetSyncSuccess = true;
    } catch (e) {
      console.warn('Sheets API append error, falling back to Webhook:', e.message);
    }
  }

  if (!sheetSyncSuccess && GOOGLE_SHEET_URL) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ action: 'add_order', order: order })
      });
      clearTimeout(timer);
      sheetSyncSuccess = true;
    } catch (err) {
      console.warn('Google Sheet webhook sync error:', err.message);
    }
  }

  return sheetSyncSuccess;
}

async function updateGoogleSheetsNotes(reference, notes) {
  if (!notes) return;
  if (GOOGLE_SHEET_URL) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3500);
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ action: 'update_order', id: reference, notes: notes })
      });
      clearTimeout(timer);
    } catch (e) {}
  }
}

async function handler(req, res) {
  ensureResponseHelpers(res);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET /api/orders (Fetches orders for Dashboard from Google Sheets)
  if (req.method === 'GET') {
    if (sheets) {
      try {
        const sheetRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'A:L'
        });

        const rows = sheetRes.data.values || [];
        if (rows.length < 2) {
          return res.status(200).json({ status: 'success', orders: [], total: 0 });
        }

        const orders = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r[0]) continue;
          orders.push({
            rowIndex: i + 1,
            id: String(r[0] || '').trim(),
            date: String(r[1] || '').trim(),
            customer: String(r[2] || '').trim(),
            status: String(r[3] || 'جديد').trim(),
            phone: String(r[4] || '').replace(/^'/, '').trim(),
            wilaya: String(r[5] || '').trim(),
            commune: String(r[6] || '').trim(),
            size: String(r[7] || '').trim(),
            shipping: String(r[8] || '').trim(),
            shippingFee: String(r[9] || '').trim(),
            total: String(r[10] || '').trim(),
            notes: String(r[11] || '').trim()
          });
        }
        return res.status(200).json({ status: 'success', orders, total: orders.length });
      } catch (err) {
        console.warn('Sheets API GET error, falling back to Apps Script:', err.message);
      }
    }

    try {
      const gRes = await fetch(GOOGLE_SHEET_URL);
      const data = await gRes.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(502).json({ status: 'error', message: err.message });
    }
  }

  // PUT /api/orders (Updates order status / details from Dashboard)
  if (req.method === 'PUT') {
    try {
      const data = await parseBody(req);
      const targetId = String(data.id || '').trim();

      if (!targetId) {
        return res.status(400).json({ status: 'error', message: 'Missing order ID' });
      }

      if (sheets) {
        const sheetRes = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'A:L'
        });

        const rows = sheetRes.data.values || [];
        let targetRow = -1;
        for (let i = 1; i < rows.length; i++) {
          if (String(rows[i][0] || '').trim() === targetId) {
            targetRow = i + 1;
            break;
          }
        }

        if (targetRow !== -1) {
          const updates = [];
          if (data.status !== undefined) updates.push({ range: `D${targetRow}`, values: [[String(data.status).trim()]] });
          if (data.wilaya !== undefined) updates.push({ range: `F${targetRow}`, values: [[String(data.wilaya).trim()]] });
          if (data.commune !== undefined) updates.push({ range: `G${targetRow}`, values: [[String(data.commune).trim()]] });
          if (data.size !== undefined) updates.push({ range: `H${targetRow}`, values: [[String(data.size).trim()]] });
          if (data.shipping !== undefined) updates.push({ range: `I${targetRow}`, values: [[String(data.shipping).trim()]] });
          if (data.shippingFee !== undefined) updates.push({ range: `J${targetRow}`, values: [[String(data.shippingFee).trim()]] });
          if (data.total !== undefined) updates.push({ range: `K${targetRow}`, values: [[String(data.total).trim()]] });
          if (data.notes !== undefined) updates.push({ range: `L${targetRow}`, values: [[String(data.notes).trim()]] });

          if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId: SPREADSHEET_ID,
              requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
            });
          }
          return res.status(200).json({ status: 'success', message: 'Updated successfully' });
        }
      }

      // Fallback via webhook
      const gRes = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_order', ...data })
      });
      const gData = await gRes.json();
      return res.status(200).json(gData);

    } catch (err) {
      console.error('API Error (PUT /api/orders):', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // POST /api/orders (100% Full Parallel Execution: ZR Express + Sheets + Telegram)
  if (req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const order = data.order || data;
      const isManual = data.isManualOrder === true || order.isManualOrder === true;

      const clientIp = getClientIP(req);
      const rawPhone = order.phone || '';
      const cleanPhone = normalizeAlgerianPhone(rawPhone);
      const now = Date.now();

      // Anti-Spam Check
      if (!isManual) {
        if (ipOrdersMap.has(clientIp)) {
          const timestamps = (ipOrdersMap.get(clientIp) || []).filter(t => now - t < IP_BURST_WINDOW_MS);
          ipOrdersMap.set(clientIp, timestamps);
          if (timestamps.length >= IP_MAX_BURST_ORDERS) {
            return res.status(429).json({
              status: 'rate_limited',
              reason: 'ip_burst_limit',
              message: 'يرجى الانتظار بضع دقائق قبل إرسال طلب جديد.'
            });
          }
        }

        if (cleanPhone && phoneOrdersMap.has(cleanPhone)) {
          const lastPhoneTime = phoneOrdersMap.get(cleanPhone);
          if (now - lastPhoneTime < RATE_LIMIT_WINDOW_MS) {
            return res.status(429).json({
              status: 'rate_limited',
              reason: 'phone_duplicate',
              message: 'عذراً، تم تسجيل طلب بهذا الرقم اليوم مسبقاً.'
            });
          }
        }
      }

      // Record successful order attempt for rate limiting
      if (!isManual) {
        const currentIpOrders = (ipOrdersMap.get(clientIp) || []).filter(t => now - t < IP_BURST_WINDOW_MS);
        currentIpOrders.push(now);
        ipOrdersMap.set(clientIp, currentIpOrders);
        if (cleanPhone) phoneOrdersMap.set(cleanPhone, now);
      }

      // 1. Resolve Wilaya and default Chef-lieu commune
      const wilayaCode = parseWilayaCode(order.wilaya || order.province);
      const communeName = (order.commune && String(order.commune).trim()) || CHEF_LIEUX[wilayaCode] || 'Alger Centre';
      order.commune = communeName;

      // 2. Resolve Delivery Type ('home' or 'stopdesk')
      let deliveryType = (order.shipping && (order.shipping.includes('منزل') || order.shipping === 'home'))
        ? 'home'
        : 'stopdesk';

      let stopDeskId = undefined;
      if (deliveryType === 'stopdesk') {
        stopDeskId = DEFAULT_DESKS[wilayaCode];
        if (!stopDeskId) {
          try {
            const desks = await zrClient.desks(wilayaCode);
            if (desks && desks.length > 0) {
              stopDeskId = desks[0].id;
            }
          } catch (e) {}
        }
        if (!stopDeskId) {
          deliveryType = 'home';
        }
      }

      // 3. Resolve Product details & COD amount
      const sizeStr = order.size ? ` (مقاس ${order.size})` : '';
      const productList = `${order.product || 'BOOTS DE SECURITE BEETRO'}${sizeStr}`;
      const codAmount = parseCodAmount(order.total, order.subtotal, order.shippingFee);
      const reference = order.id || ('CMD-' + Math.floor(100000 + Math.random() * 900000));
      order.id = reference;

      const shippingClean = deliveryType === 'home' ? 'منزل' : 'مكتب';
      const row = [
        reference,
        order.date || new Date().toLocaleString('fr-DZ'),
        order.customer || '',
        order.status || 'جديد',
        "'" + (order.phone || ''),
        order.wilaya || '',
        communeName,
        order.size || '',
        shippingClean,
        order.shippingFee ? (order.shippingFee.toString().replace(' DA', '') + ' DA') : '500 DA',
        order.total || (codAmount + ' DA'),
        order.notes || ''
      ];

      // ==========================================================
      // 🚀 100% TRUE PARALLEL DISPATCH (All 3 Fire Simultaneously)
      // ==========================================================

      // Task A: ZR Express
      const zrTask = (async () => {
        try {
          const zrPayload = {
            reference: reference,
            recipient: {
              fullName: String(order.customer || order.firstName || order.first_name || 'عميل').trim(),
              phone: cleanPhone || String(rawPhone).trim(),
              wilayaCode: wilayaCode,
              communeName: communeName,
              address: String(order.address || communeName).trim()
            },
            deliveryType: deliveryType,
            ...(stopDeskId ? { stopDeskId } : {}),
            productList: productList,
            codAmount: codAmount
          };
          return await zrClient.createOrder(zrPayload);
        } catch (err) {
          console.warn('ZR Express parcel creation warning:', err.message);
          return { error: err.message };
        }
      })();

      // Task B: Google Sheets
      const sheetTask = (async () => {
        try {
          return await syncToGoogleSheets(row, order);
        } catch (err) {
          console.warn('Google Sheets sync warning:', err.message);
          return false;
        }
      })();

      // Task C: Telegram Bot Alert
      const telegramTask = (async () => {
        try {
          return await sendTelegramAlert(order);
        } catch (err) {
          console.warn('Telegram alert warning:', err.message);
          return false;
        }
      })();

      // Wait for all three simultaneously!
      const [zrOutcome] = await Promise.allSettled([
        zrTask,
        sheetTask,
        telegramTask
      ]);

      let zrTrackingNumber = null;
      if (zrOutcome.status === 'fulfilled' && zrOutcome.value && zrOutcome.value.trackingNumber) {
        zrTrackingNumber = zrOutcome.value.trackingNumber;
        // Asynchronously update Google Sheets note & follow-up Telegram in background
        updateGoogleSheetsNotes(reference, `ZR: ${zrTrackingNumber}`).catch(() => {});
        sendTelegramTrackingFollowup(reference, zrTrackingNumber).catch(() => {});
      }

      return res.status(200).json({
        status: 'success',
        id: reference,
        trackingNumber: zrTrackingNumber,
        courier: 'zrexpress',
        message: 'تم تسجيل الطلب وإرساله بنجاح'
      });

    } catch (err) {
      console.error('API Error (POST /api/orders):', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
