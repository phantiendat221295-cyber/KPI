import { CloudSyncPayload } from '../types';

export const APPS_SCRIPT_STORAGE_KEY = 'fpt_dna_apps_script_url';
export const USER_ROLE_STORAGE_KEY = 'fpt_dna_user_role';
export const LAST_SYNC_STORAGE_KEY = 'fpt_dna_last_sync_time';

/**
 * Standard Google Apps Script (Code.gs) template for Google Sheets
 */
export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT CHO WEBAPP THỐNG KÊ OKR FPT POLYTECHNIC ĐỒNG NAI (DNA)
 * ----------------------------------------------------------------------
 * HƯỚNG DẪN CÀI ĐẶT NHANH TRONG 1 PHÚT:
 * 1. Mở file Google Sheets của bạn (hoặc tạo 1 trang tính mới).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa code cũ, dán toàn bộ đoạn code này vào tệp Code.gs -> Bấm Lưu (Ctrl+S / Cmd+S).
 * 4. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Triển khai mới" (New deployment).
 * 5. Chọn loại: "Ứng dụng web" (Web app).
 * 6. Cấu hình triển khai:
 *    - Mô tả: FPT DNA OKR Sync API
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 7. Bấm "Triển khai" -> Cấp quyền cho Google Tài khoản của bạn.
 * 8. Sao chép "URL ứng dụng web" (kết thúc bằng /exec) và dán vào ô Cấu hình trên WebApp!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('_SYNC_DATA');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Chưa có dữ liệu đồng bộ trên trang tính',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var raw = sheet.getRange(1, 1).getValue();
    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Dữ liệu trống',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(String(raw))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('_SYNC_DATA');
    if (!sheet) {
      sheet = ss.insertSheet('_SYNC_DATA');
    }

    var content = e.postData.contents;
    // Lưu payload JSON vào ô A1 của Sheet _SYNC_DATA
    sheet.getRange(1, 1).setValue(content);
    sheet.getRange(1, 2).setValue(new Date());

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đã lưu dữ liệu lên Google Sheets thành công',
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Fetch latest state from Google Apps Script Web App
 */
export async function fetchStateFromGoogleSheets(
  apiUrl: string
): Promise<{ success: boolean; data?: CloudSyncPayload; message?: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình Google Apps Script URL hợp lệ.' };
  }

  try {
    const res = await fetch(apiUrl.trim(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false, message: `Lỗi kết nối máy chủ Google (${res.status})` };
    }

    const json = await res.json();

    if (json.status === 'empty' || !json.data) {
      // Check if the response is directly the payload itself
      if (json.enrollmentRows || json.config || json.block1Weekly) {
        return { success: true, data: json as CloudSyncPayload };
      }
      return { success: false, message: 'Chưa có bản ghi nào được đồng bộ trên Google Sheets.' };
    }

    // If wrapped in data property
    if (json.data) {
      return { success: true, data: json.data as CloudSyncPayload };
    }

    return { success: true, data: json as CloudSyncPayload };
  } catch (err: any) {
    console.warn('Error fetching from Google Sheets:', err);
    return {
      success: false,
      message: err?.message || 'Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra quyền truy cập Web App.',
    };
  }
}

/**
 * Sync / Save state to Google Apps Script Web App
 */
export async function syncStateToGoogleSheets(
  apiUrl: string,
  payload: CloudSyncPayload
): Promise<{ success: boolean; message?: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình Google Apps Script API URL.' };
  }

  try {
    // Send as text/plain to avoid CORS preflight blocking in Google Apps Script
    const res = await fetch(apiUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, message: `Lỗi gửi dữ liệu lên Google Sheets (${res.status})` };
    }

    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed.status === 'error') {
        return { success: false, message: parsed.message || 'Lỗi từ Google Apps Script' };
      }
    } catch {
      // Not json response, but HTTP 200 is acceptable
    }

    return { success: true, message: 'Đã lưu dữ liệu lên Google Sheets thành công! Người khác có thể xem ngay.' };
  } catch (err: any) {
    console.error('Error syncing to Google Sheets:', err);
    return {
      success: false,
      message:
        err?.message ||
        'Không thể gửi dữ liệu lên Google Apps Script. Hãy đảm bảo bạn đã chọn quyền "Ai có quyền truy cập: Bất kỳ ai (Anyone)".',
    };
  }
}
