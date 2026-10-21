const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8691389018:AAE6GfcYSetBtQziix8Gkpe1qEbHh-Uqvfg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7281542331';

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
    console.warn('Google Auth warning:', err.message);
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

// Rate Limiting (Burst limit per IP, Daily limit per phone)
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

async function sendTelegramAlert(order) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const rawPhone = String(order.phone || '').trim();
  const cleanPhone = normalizeAlgerianPhone(rawPhone);
  const callUrl = `tel:${cleanPhone || rawPhone}`;
  const waPhone = cleanPhone.startsWith('0') ? ('213' + cleanPhone.slice(1)) : cleanPhone;
  const waUrl = `https://wa.me/${waPhone}`;

  const text = `📦 <b>طلب جديد في المتجر!</b> ⚡\n\n` +
    `🆔 <b>رقم الطلب:</b> <code>${order.id || ''}</code>\n` +
    `👤 <b>الاسم:</b> ${order.customer || 'غير محدد'}\n` +
    `📞 <b>الهاتف:</b> <code>${order.phone || ''}</code>\n` +
    `📍 <b>الولاية:</b> ${order.wilaya || ''}\n` +
    `🚚 <b>التوصيل:</b> ${order.shipping || ''} (${order.shippingFee || ''})\n` +
    `👟 <b>المقاس:</b> ${order.size || ''}\n` +
    `💰 <b>الإجمالي:</b> <b>${order.total || ''}</b>\n` +
    `🕒 <b>التوقيت:</b> ${order.date || new Date().toLocaleString('fr-DZ')}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📞 اتصال هاتفي مباشر', url: callUrl },
        { text: '💬 مراسلة واتساب', url: waUrl }
      ]
    ]
  };

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });
  } catch (err) {
    console.warn('Telegram send error:', err.message);
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

  // GET /api/orders
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

  // POST /api/orders
  if (req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const order = data.order || data;
      const isManual = data.isManualOrder === true || order.isManualOrder === true;

      const clientIp = getClientIP(req);
      const rawPhone = order.phone || '';
      const cleanPhone = normalizeAlgerianPhone(rawPhone);
      const now = Date.now();

      if (!isManual) {
        // IP Burst Rate Limit (10 per 10m, CGNAT-safe)
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

        // Phone Daily Limit
        if (cleanPhone && phoneOrdersMap.has(cleanPhone)) {
          const lastPhoneTime = phoneOrdersMap.get(cleanPhone);
          if (now - lastPhoneTime < RATE_LIMIT_WINDOW_MS) {
            return res.status(429).json({
              status: 'rate_limited',
              reason: 'phone_duplicate',
              message: 'عذراً، تم تسجيل طلب بهذا الرقم اليوم مسبقاً. سيتم الاتصال بك لتأكيد طلبك الحالي.'
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

      const shippingClean = (order.shipping && (order.shipping.includes('منزل') || order.shipping === 'home'))
        ? 'منزل'
        : 'مكتب';

      const row = [
        order.id || ('CMD-' + Math.floor(100000 + Math.random() * 900000)),
        order.date || new Date().toLocaleString('fr-DZ'),
        order.customer || '',
        order.status || 'جديد',
        "'" + (order.phone || ''),
        order.wilaya || '',
        order.commune || '',
        order.size || '',
        shippingClean,
        order.shippingFee ? (order.shippingFee.toString().replace(' DA', '') + ' DA') : '500 DA',
        order.total || '',
        order.notes || ''
      ];

      order.id = row[0];

      // ⚡ Instant Telegram Alert (parallel execution)
      const telegramPromise = sendTelegramAlert(order);

      // Google Sheets sync
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

      if (!sheetSyncSuccess) {
        try {
          await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_order', order: order })
          });
          sheetSyncSuccess = true;
        } catch (err) {
          console.warn('Google Sheet webhook sync error:', err.message);
        }
      }

      await telegramPromise;
      return res.status(200).json({ status: 'success', id: row[0] });

    } catch (err) {
      console.error('API Error (POST /api/orders):', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUT /api/orders
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

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
