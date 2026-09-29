const http = require('http');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

let port = parseInt(process.env.PORT, 10) || 8080;

const KEY_FILE = path.join(__dirname, 'kadya-store-02b5cb9020d5.json');
const SPREADSHEET_ID = '1RMInpkUIrk0HBdkAgcTAoQfYSAOTeWQzdj6lM6THTrA';

// Google Sheets API Auth
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
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

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const [reqPath] = req.url.split('?');

  // API Route: GET /api/orders (Fetch all orders via Google Sheets API v4)
  if (reqPath === '/api/orders' && req.method === 'GET') {
    try {
      const sheetRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A:L'
      });

      const rows = sheetRes.data.values || [];
      if (rows.length < 2) {
        return sendJSON(res, 200, { status: 'success', orders: [], total: 0 });
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

      return sendJSON(res, 200, { status: 'success', orders: orders, total: orders.length });
    } catch (err) {
      console.error('API Error (GET /api/orders):', err);
      return sendJSON(res, 500, { status: 'error', message: err.message });
    }
  }

  // API Route: POST /api/orders (Add new order via Google Sheets API v4)
  if (reqPath === '/api/orders' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const order = data.order || data;

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

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A:L',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row]
        }
      });

      return sendJSON(res, 200, { status: 'success', id: row[0] });
    } catch (err) {
      console.error('API Error (POST /api/orders):', err);
      return sendJSON(res, 500, { status: 'error', message: err.message });
    }
  }

  // API Route: PUT /api/orders (Update order status, commune, notes via Google Sheets API v4)
  if (reqPath === '/api/orders' && req.method === 'PUT') {
    try {
      const data = await parseBody(req);
      const targetId = String(data.id || '').trim();

      if (!targetId) {
        return sendJSON(res, 400, { status: 'error', message: 'Missing order ID' });
      }

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

      if (targetRow === -1) {
        return sendJSON(res, 404, { status: 'error', message: 'Order not found' });
      }

      const updates = [];
      if (data.status !== undefined) {
        updates.push({
          range: `D${targetRow}`,
          values: [[String(data.status).trim()]]
        });
      }
      if (data.wilaya !== undefined) {
        updates.push({
          range: `F${targetRow}`,
          values: [[String(data.wilaya).trim()]]
        });
      }
      if (data.commune !== undefined) {
        updates.push({
          range: `G${targetRow}`,
          values: [[String(data.commune).trim()]]
        });
      }
      if (data.size !== undefined) {
        updates.push({
          range: `H${targetRow}`,
          values: [[String(data.size).trim()]]
        });
      }
      if (data.shipping !== undefined) {
        updates.push({
          range: `I${targetRow}`,
          values: [[String(data.shipping).trim()]]
        });
      }
      if (data.shippingFee !== undefined) {
        updates.push({
          range: `J${targetRow}`,
          values: [[String(data.shippingFee).trim()]]
        });
      }
      if (data.total !== undefined) {
        updates.push({
          range: `K${targetRow}`,
          values: [[String(data.total).trim()]]
        });
      }
      if (data.notes !== undefined) {
        updates.push({
          range: `L${targetRow}`,
          values: [[String(data.notes).trim()]]
        });
      }

      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });
      }

      return sendJSON(res, 200, { status: 'success', message: 'Updated successfully' });
    } catch (err) {
      console.error('API Error (PUT /api/orders):', err);
      return sendJSON(res, 500, { status: 'error', message: err.message });
    }
  }

  // Static File Serving
  let filePath = decodeURIComponent(reqPath);
  if (filePath === '/') filePath = '/index.html';

  const fullPath = path.join(__dirname, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(fullPath).pipe(res);
  });
});

function startServer(p) {
  server.listen(p, () => {
    console.log(`Server with Google Sheets API v4 running at http://localhost:${p}/`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    port++;
    startServer(port);
  } else {
    console.error(err);
  }
});

startServer(port);
