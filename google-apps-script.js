/**
 * Kadya - Advanced Order Management & Two-Way Sync API
 * 
 * Supports:
 * - Real-time full & incremental read (doGet)
 * - Auto-header repair (adds "ملاحظات" automatically if missing)
 * - Two-way live updates: status, commune, notes (doPost: update_order)
 * - Batch updates & store checkout orders (doPost: add_order, batch_update)
 */

var HEADERS = [
  "رقم طلبية",
  "الوقت",
  "إسم",
  "حالة الطلب",
  "هاتف",
  "الولاية",
  "البلدية",
  "المقاس",
  "التوصيل",
  "سعر التوصيل",
  "الإجمالي",
  "ملاحظات"
];

function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      return jsonResponse({
        status: "success",
        total: 0,
        orders: [],
        timestamp: new Date().toISOString()
      });
    }

    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0]) continue; // Skip completely empty rows

      orders.push({
        rowIndex: i + 1,
        id: String(r[0] || "").trim(),
        date: String(r[1] || "").trim(),
        customer: String(r[2] || "").trim(),
        status: String(r[3] || "جديد").trim(),
        phone: String(r[4] || "").replace(/^'/, "").trim(),
        wilaya: String(r[5] || "").trim(),
        commune: String(r[6] || "").trim(),
        size: String(r[7] || "").trim(),
        shipping: String(r[8] || "").trim(),
        shippingFee: String(r[9] || "").trim(),
        total: String(r[10] || "").trim(),
        notes: String(r[11] || "").trim()
      });
    }

    return jsonResponse({
      status: "success",
      total: orders.length,
      orders: orders,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);

    var data = JSON.parse(e.postData.contents);
    var action = data.action || "add_order";

    // 1. تحديث طلب فردي من لوحة التحكم (حالة، بلدية، ملاحظات)
    if (action === "update_order") {
      var targetId = String(data.id || "").trim();
      if (!targetId) return jsonResponse({ status: "error", message: "Missing order ID" });

      var values = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim() === targetId) {
          targetRow = i + 1;
          break;
        }
      }

      if (targetRow === -1) {
        return jsonResponse({ status: "error", message: "Order not found: " + targetId });
      }

      if (data.status !== undefined) sheet.getRange(targetRow, 4).setValue(String(data.status).trim());
      if (data.commune !== undefined) sheet.getRange(targetRow, 7).setValue(String(data.commune).trim());
      if (data.notes !== undefined) sheet.getRange(targetRow, 12).setValue(String(data.notes).trim());

      return jsonResponse({
        status: "success",
        id: targetId,
        message: "Order updated successfully"
      });
    }

    // 2. تحديث جماعي لعدة طلبات دفعة واحدة (Bulk status update)
    if (action === "batch_update") {
      var updates = data.orders || [];
      var values = sheet.getDataRange().getValues();
      var idToRow = {};

      for (var i = 1; i < values.length; i++) {
        var id = String(values[i][0]).trim();
        if (id) idToRow[id] = i + 1;
      }

      var updatedCount = 0;
      updates.forEach(function(item) {
        var r = idToRow[String(item.id).trim()];
        if (r) {
          if (item.status !== undefined) sheet.getRange(r, 4).setValue(String(item.status).trim());
          if (item.commune !== undefined) sheet.getRange(r, 7).setValue(String(item.commune).trim());
          if (item.notes !== undefined) sheet.getRange(r, 12).setValue(String(item.notes).trim());
          updatedCount++;
        }
      });

      return jsonResponse({ status: "success", updated: updatedCount });
    }

    // 3. إضافة طلب جديد من المتجر مع فحص الحماية من التكرار
    var order = data.order || data;
    var isManual = data.isManualOrder === true || order.isManualOrder === true;

    var cleanPhone = String(order.phone || "").replace(/\D/g, "");
    if (cleanPhone.indexOf("213") === 0) cleanPhone = "0" + cleanPhone.substring(3);
    if (cleanPhone.length === 9 && cleanPhone.indexOf("0") !== 0) cleanPhone = "0" + cleanPhone;

    // فحص عدم تكرار نفس رقم الهاتف في نفس اليوم (Anti-spam / Anti-fraud)
    if (!isManual && cleanPhone) {
      var allRows = sheet.getDataRange().getValues();
      var todayStr = Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy");

      for (var k = 1; k < allRows.length; k++) {
        var rowDate = String(allRows[k][1] || "");
        var rowPhone = String(allRows[k][4] || "").replace(/\D/g, "");
        if (rowPhone.indexOf("213") === 0) rowPhone = "0" + rowPhone.substring(3);
        if (rowPhone.length === 9 && rowPhone.indexOf("0") !== 0) rowPhone = "0" + rowPhone;

        if (rowPhone === cleanPhone && rowDate.indexOf(todayStr) !== -1) {
          return jsonResponse({
            status: "rate_limited",
            message: "تم تسجيل طلب بهذا الرقم اليوم مسبقاً، سنتصل بك لتأكيده."
          });
        }
      }
    }

    var shippingClean = "مكتب";
    if (order.shipping && (order.shipping.indexOf("منزل") !== -1 || order.shipping === "home")) {
      shippingClean = "منزل";
    }

    var row = [
      order.id || ("CMD-" + Math.floor(100000 + Math.random() * 900000)),
      order.date || new Date().toLocaleString("fr-DZ"),
      order.customer || "",
      order.status || "جديد",
      "'" + (order.phone || ""),
      order.wilaya || "",
      order.commune || "",
      order.size || "",
      shippingClean,
      order.shippingFee ? (order.shippingFee.toString().replace(" DA", "") + " DA") : "500 DA",
      order.total || "",
      order.notes || ""
    ];

    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, row.length).setHorizontalAlignment("center");

    return jsonResponse({ status: "success", id: row[0] });

  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getActiveSheet();
}

// فحص وإصلاح العناوين تلقائياً وإضافة "ملاحظات" إن كانت مفقودة
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    styleHeaderRow(sheet, HEADERS.length);
    return;
  }

  // فحص السطر الأول
  var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
  for (var i = 0; i < HEADERS.length; i++) {
    if (!currentHeaders[i] || currentHeaders[i].toString().trim() === "") {
      sheet.getRange(1, i + 1).setValue(HEADERS[i]);
    }
  }
  styleHeaderRow(sheet, HEADERS.length);
}

function styleHeaderRow(sheet, cols) {
  var range = sheet.getRange(1, 1, 1, cols);
  range.setBackground("#1c5493");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 35);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
