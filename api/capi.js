const crypto = require('crypto');

function sha256(val) {
  if (!val) return '';
  const trimmed = String(val).trim().toLowerCase();
  if (/^[a-f0-9]{64}$/.test(trimmed)) {
    return trimmed;
  }
  return crypto.createHash('sha256').update(trimmed).digest('hex');
}

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '213' + digits.slice(1);
  } else if (digits.startsWith('2130')) {
    digits = '213' + digits.slice(4);
  } else if (!digits.startsWith('213') && digits.length === 9) {
    digits = '213' + digits;
  }
  return digits;
}

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
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

async function handler(req, res) {
  ensureResponseHelpers(res);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // ignore
      }
    } else if (!body) {
      body = await new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({});
          }
        });
      });
    }

    const pixelId = process.env.META_PIXEL_ID || '4567517706859412';
    const accessToken =
      process.env.META_CAPI_TOKEN ||
      'EAAWzVJOPnHEBSslmuIp8EB8wtJZBiRYsvBUeP52aMuJLwABoX8CDsMnjxZATiZCZC7OnZBoBjnQm9wVmZAMD5jNBLhlrZCgwM4PC3nZAZBH41PttY6bSV8zGZCiXxxleDvdyL7Yb1lCxZBKXTZCdGfSY3x2SZCMEuhLsXZBfLYuBiU3Hgw4bE22ZBxt7NcQZCAsK9PUJx3Ui3wZDZD';
    const defaultTestCode = process.env.META_TEST_EVENT_CODE || '';

    const {
      eventName,
      eventId,
      eventTime,
      eventSourceUrl,
      userData = {},
      customData = {},
      testEventCode,
    } = body || {};

    if (!eventName) {
      return res.status(400).json({ error: 'Missing eventName parameter' });
    }

    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '';
    const clientIp = rawIp.replace(/^::ffff:/, '') || '105.101.24.12';
    const clientUserAgent = req.headers['user-agent'] || userData.client_user_agent || '';

    const cookies = parseCookies(req.headers.cookie);
    const fbp = userData.fbp || cookies['_fbp'] || undefined;
    const fbc = userData.fbc || cookies['_fbc'] || undefined;

    const formattedUserData = {
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent,
    };

    if (fbp) formattedUserData.fbp = fbp;
    if (fbc) formattedUserData.fbc = fbc;

    const phoneRaw = userData.phone || userData.ph;
    if (phoneRaw) {
      const normalized = normalizePhone(phoneRaw);
      formattedUserData.ph = [sha256(normalized)];
    }

    const emailRaw = userData.email || userData.em;
    if (emailRaw) {
      formattedUserData.em = [sha256(emailRaw)];
    }

    if (userData.firstName || userData.fn) {
      formattedUserData.fn = [sha256(userData.firstName || userData.fn)];
    }
    if (userData.lastName || userData.ln) {
      formattedUserData.ln = [sha256(userData.lastName || userData.ln)];
    }
    if (userData.fullName && !userData.firstName) {
      const nameParts = String(userData.fullName).trim().split(/\s+/);
      formattedUserData.fn = [sha256(nameParts[0])];
      if (nameParts.length > 1) {
        formattedUserData.ln = [sha256(nameParts.slice(1).join(' '))];
      }
    }

    const cityRaw = userData.city || userData.commune || userData.ct;
    if (cityRaw) {
      const cleanCity = String(cityRaw).trim().toLowerCase();
      formattedUserData.ct = [sha256(cleanCity)];
    }

    const stateRaw = userData.state || userData.wilaya || userData.st;
    if (stateRaw) {
      // Clean wilaya: e.g. "16 - Alger (Alger)" -> "alger"
      const cleanState = String(stateRaw)
        .replace(/^\d+\s*[-–]\s*/, '')
        .split(/[\(\/]/)[0]
        .trim()
        .toLowerCase();
      formattedUserData.st = [sha256(cleanState || stateRaw)];
    }

    const extId = userData.external_id || userData.externalId || cookies['_ext_id'];
    if (extId) {
      formattedUserData.external_id = [sha256(String(extId).trim())];
    }

    let zipRaw = userData.zip || userData.zp;
    if (!zipRaw && stateRaw) {
      const matchWilayaNum = String(stateRaw).match(/^(\d{1,2})/);
      if (matchWilayaNum) {
        zipRaw = matchWilayaNum[1].padStart(2, '0') + '000';
      }
    }
    if (zipRaw) {
      formattedUserData.zp = [sha256(String(zipRaw).trim().toLowerCase())];
    }

    formattedUserData.country = [sha256('dz')];

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const eventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime ? Number(eventTime) : currentTimestamp,
          event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          event_source_url: eventSourceUrl || req.headers.referer || 'https://matjari-store.vercel.app/',
          action_source: 'website',
          user_data: formattedUserData,
          custom_data: Object.keys(customData).length > 0 ? customData : undefined,
        },
      ],
    };

    const finalTestCode = testEventCode || defaultTestCode;
    if (finalTestCode) {
      eventPayload.test_event_code = finalTestCode;
    }

    const metaUrl = `https://graph.facebook.com/v25.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta CAPI error response:', result);
      return res.status(metaResponse.status).json({
        success: false,
        error: result,
      });
    }

    return res.status(200).json({
      success: true,
      metaResponse: result,
      event_id: eventPayload.data[0].event_id,
      event_name: eventName,
    });
  } catch (err) {
    console.error('CAPI handler exception:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error',
    });
  }
}

module.exports = handler;
