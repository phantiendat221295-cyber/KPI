import { CloudSyncPayload } from '../types';

export const APPS_SCRIPT_STORAGE_KEY = 'fpt_dna_apps_script_url';
export const USER_ROLE_STORAGE_KEY = 'fpt_dna_user_role';
export const LAST_SYNC_STORAGE_KEY = 'fpt_dna_last_sync_time';
export const LOCAL_STORAGE_DATA_KEY = 'FPT_DNA_DATA';

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

    var content = '';
    if (e && e.postData && e.postData.contents) {
      content = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      content = e.parameter.data;
    }

    // Ghi payload vào ô A1 và thời gian vào ô B1
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
 * Check if the payload has valid non-empty data
 */
export function isValidCloudPayload(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  const hasEnrollment = Array.isArray(data.enrollmentRows) && data.enrollmentRows.length > 0;
  const hasB1 = data.block1Weekly && Object.values(data.block1Weekly).some((v: any) => v && v.results?.length > 0);
  const hasB2 = data.block2Weekly && Object.values(data.block2Weekly).some((v: any) => v && v.results?.length > 0);
  const hasCustomMappings = data.customMappings && Object.keys(data.customMappings).length > 0;

  return hasEnrollment || hasB1 || hasB2 || hasCustomMappings;
}

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

    // Check if empty response
    if (json.status === 'empty' || json.data === null) {
      return { success: false, message: 'Trang tính Google Sheets hiện đang trống.' };
    }

    // Direct payload check
    const candidateData = json.data || json;
    if (isValidCloudPayload(candidateData)) {
      return { success: true, data: candidateData as CloudSyncPayload };
    }

    return { success: false, message: 'Dữ liệu trên Google Sheets trống hoặc chưa hợp lệ.' };
  } catch (err: any) {
    console.warn('Error fetching from Google Sheets:', err);
    return {
      success: false,
      message: err?.message || 'Không thể kết nối đến Google Apps Script.',
    };
  }
}

/**
 * Sync / Save state to Google Apps Script Web App
 * Uses headers: { 'Content-Type': 'text/plain;charset=utf-8' } and NOT application/json
 * to avoid browser CORS preflight OPTIONS blocking.
 */
export async function syncStateToGoogleSheets(
  apiUrl: string,
  payload: CloudSyncPayload
): Promise<{ success: boolean; message?: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình Google Apps Script API URL.' };
  }

  const payloadString = JSON.stringify(payload);
  const gasUrl = apiUrl.trim();

  try {
    // 1. Standard POST with text/plain (Simple header: no CORS preflight OPTIONS triggered)
    await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payloadString,
    });

    return {
      success: true,
      message: 'Đã lưu dữ liệu lên Google Sheets thành công! Người khác có thể xem ngay.',
    };
  } catch (err: any) {
    console.warn('Standard fetch encountered redirect/CORS notice, applying safe no-cors fallback to ensure delivery:', err);
    try {
      // In case browser rejects the 302 redirect response from Google Apps Script,
      // mode: 'no-cors' ensures the POST body reaches doPost(e) and writes into Sheet A1
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payloadString,
      });

      return {
        success: true,
        message: 'Đã ghi dữ liệu vào Google Sheets thành công! Người khác có thể xem ngay.',
      };
    } catch (fallbackErr: any) {
      console.error('Fatal error syncing to Google Sheets:', fallbackErr);
      return {
        success: false,
        message: fallbackErr?.message || 'Không thể gửi dữ liệu lên Google Apps Script.',
      };
    }
  }
}
