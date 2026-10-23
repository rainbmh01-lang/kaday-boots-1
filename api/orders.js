const dzship = require('dzship');

const ZR_API_KEY = process.env.ZR_API_KEY || '7geIggWo53Dwrm2pdvwUBTFJlFSaun3ygFklLb6FoBwlLe1xQzNwQbFgEKzBEnUi';
const ZR_TENANT_ID = process.env.ZR_TENANT_ID || 'e7c58aa8-b939-4382-9495-030c2f931d0b';

// Chef-lieu (centre de wilaya) officiel pour les 58 wilayas
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

// Default StopDesks in ZR Express
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

// Anti-Spam Rate Limiting (IP Burst & Phone duplicate protection)
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

async function handler(req, res) {
  ensureResponseHelpers(res);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET /api/orders (Health check / status)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'success',
      courier: 'zrexpress',
      platform: 'zrexpressnew',
      orders: [],
      total: 0
    });
  }

  // POST /api/orders (Send directly to ZR Express)
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
          } catch (e) {
            console.warn('Could not fetch desk for wilaya', wilayaCode, e.message);
          }
        }
        // If wilaya has no stopdesk at all, fallback to home delivery
        if (!stopDeskId) {
          deliveryType = 'home';
        }
      }

      // 3. Resolve Product details & COD amount
      const sizeStr = order.size ? ` (مقاس ${order.size})` : '';
      const productList = `${order.product || 'BOOTS DE SECURITE BEETRO'}${sizeStr}`;
      const codAmount = parseCodAmount(order.total, order.subtotal, order.shippingFee);
      const reference = order.id || ('CMD-' + Math.floor(100000 + Math.random() * 900000));

      // 4. Create Order directly on ZR Express
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

      console.log('Sending direct parcel to ZR Express:', JSON.stringify(zrPayload));
      const zrResult = await zrClient.createOrder(zrPayload);
      console.log('ZR Express creation success:', zrResult);

      return res.status(200).json({
        status: 'success',
        id: zrResult.reference || reference,
        trackingNumber: zrResult.trackingNumber,
        courier: 'zrexpress',
        message: 'تم تسجيل الطلب وإرساله مباشرة إلى شركة التوصيل ZR Express'
      });

    } catch (err) {
      console.error('ZR Express Order API Error:', err.message, err.fields || '');
      return res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'حدث خطأ أثناء إرسال الطلب إلى شركة التوصيل ZR Express',
        fields: err.fields
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
