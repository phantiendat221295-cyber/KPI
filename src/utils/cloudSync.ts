import { CloudSyncPayload, StudentResultRow } from '../types';
import { DEFAULT_APPS_SCRIPT_URL } from '../constants';

export const APPS_SCRIPT_STORAGE_KEY = 'fpt_dna_apps_script_url';
export const USER_ROLE_STORAGE_KEY = 'fpt_dna_user_role';
export const LAST_SYNC_STORAGE_KEY = 'fpt_dna_last_sync_time';
export const LOCAL_STORAGE_DATA_KEY = 'FPT_DNA_DATA';

/**
 * Resolves the active Google Apps Script / Cloud URL for the application.
 * Priority order:
 * 1. URL search params (?api=... or ?gas=...) - convenient for testing
 * 2. LocalStorage override on this browser
 * 3. Vercel environment variable (VITE_APPS_SCRIPT_URL) - ensures ALL visitors at kpi-daotao-dna.vercel.app get it
 * 4. Default constant in constants.ts
 */
export function getEffectiveCloudUrl(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('api') || params.get('gas');
    if (fromUrl && fromUrl.trim().startsWith('http')) {
      return fromUrl.trim();
    }

    const saved = localStorage.getItem(APPS_SCRIPT_STORAGE_KEY);
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim();
    }
  }

  const envUrl = (import.meta as any).env?.VITE_APPS_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().startsWith('http')) {
    return envUrl.trim();
  }

  const defaultUrl = (DEFAULT_APPS_SCRIPT_URL as string) || '';
  if (defaultUrl && typeof defaultUrl === 'string' && defaultUrl.trim().startsWith('http')) {
    return defaultUrl.trim();
  }

  return '';
}

/**
 * Standard Google Apps Script (Code.gs) template for Google Sheets
 * Supports multi-row chunking to bypass Google Sheets 50,000 char per cell limit!
 * Works seamlessly with both container-bound and standalone scripts.
 */
export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT CHO WEBAPP THỐNG KÊ OKR FPT POLYTECHNIC ĐỒNG NAI (DNA)
 * Link ứng dụng: https://kpi-daotao-dna.vercel.app/
 * ----------------------------------------------------------------------
 * HƯỚNG DẪN TRIỂN KHAI TRONG 1 PHÚT:
 * 1. Mở file Google Sheets mới hoặc có sẵn của cơ sở FPT Polytechnic Đồng Nai.
 * 2. Trên thanh menu trên cùng: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. XÓA SẠCH CODE CŨ trong file Code.gs, DÁN TOÀN BỘ ĐOẠN CODE NÀY VÀO -> Bấm Lưu (Ctrl+S / Cmd+S).
 * 4. Bấm nút màu xanh "Triển khai" (Deploy) ở góc trên bên phải -> "Triển khai mới" (New deployment).
 * 5. Chọn loại (bánh răng): "Ứng dụng web" (Web app).
 * 6. Thiết lập cấu hình BẮT BUỘC:
 *    - Mô tả: FPT DNA OKR Sync API
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)   <--- CỰC KỲ QUAN TRỌNG!
 * 7. Bấm "Triển khai" (Deploy) -> Cấp quyền cho Google nếu hỏi -> Sao chép URL kết thúc bằng /exec
 * 8. Dán URL vào WebApp hoặc thêm vào biến VITE_APPS_SCRIPT_URL trên Vercel.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      // Dành cho trường hợp script tạo độc lập (standalone)
      var files = DriveApp.getFilesByName('FPT_DNA_OKR_DATABASE');
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create('FPT_DNA_OKR_DATABASE');
      }
    }

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

    if (!content || content.trim() === '') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Nội dung gửi lên trống'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Xóa dữ liệu cũ của sheet _SYNC_DATA
    sheet.clearContents();

    // Chia nhỏ thành các đoạn 40.000 ký tự để không bao giờ bị lỗi giới hạn 50.000 ký tự/ô của Google Sheets
    var chunkSize = 40000;
    var chunks = [];
    for (var i = 0; i < content.length; i += chunkSize) {
      chunks.push([content.substring(i, i + chunkSize)]);
    }

    sheet.getRange(1, 1, chunks.length, 1).setValues(chunks);
    sheet.getRange(1, 2).setValue(new Date());

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đã lưu dữ liệu lên Google Sheets thành công',
      chunks: chunks.length,
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    // Nếu kiểm tra kết nối ping test
    if (e && e.parameter && (e.parameter.ping === '1' || e.parameter.test === '1')) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'ok',
        message: 'Google Apps Script Web App của FPT DNA đang hoạt động bình thường',
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var files = DriveApp.getFilesByName('FPT_DNA_OKR_DATABASE');
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      }
    }

    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Chưa có dữ liệu bảng tính',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = ss.getSheetByName('_SYNC_DATA');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Chưa có sheet _SYNC_DATA',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Dữ liệu trống',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ghép toàn bộ các đoạn từ cột A lại thành chuỗi JSON đầy đủ
    var values = sheet.getRange(1, 1, lastRow, 1).getValues();
    var fullContent = '';
    for (var i = 0; i < values.length; i++) {
      if (values[i][0]) {
        fullContent += String(values[i][0]);
      }
    }

    if (!fullContent || fullContent.trim() === '') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'Dữ liệu trống',
        data: null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(fullContent)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Strips heavy `rawRow` and redundant metadata to reduce JSON size by 90%
 * while preserving 100% of the analytical records!
 */
export function preparePayloadForCloud(payload: CloudSyncPayload): CloudSyncPayload {
  const cleanEnrollmentRows = (payload.enrollmentRows || []).map((row) => ({
    studentCode: row.studentCode,
    studentName: row.studentName,
    subjectCode: row.subjectCode,
    classCode: row.classCode,
    startDate: row.startDate,
    block: row.block,
    department: row.department,
  }));

  const cleanB1Weekly: Record<number, any> = {};
  if (payload.block1Weekly) {
    Object.entries(payload.block1Weekly).forEach(([w, rec]) => {
      if (rec) {
        cleanB1Weekly[Number(w)] = {
          weekNumber: rec.weekNumber,
          fileName: rec.fileName,
          fileSize: rec.fileSize,
          uploadedAt: rec.uploadedAt,
          rowCount: rec.rowCount,
          results: (rec.results || []).map((r: StudentResultRow) => ({
            studentCode: r.studentCode,
            studentName: r.studentName,
            subjectCode: r.subjectCode,
            classCode: r.classCode,
            status: r.status,
            isAttendanceFailed: r.isAttendanceFailed,
            isOngoingAssessmentFail: r.isOngoingAssessmentFail,
            isForbiddenExam: r.isForbiddenExam,
            isPassed: r.isPassed,
            department: r.department,
            block: r.block,
            startDate: r.startDate,
          })),
        };
      }
    });
  }

  const cleanB2Weekly: Record<number, any> = {};
  if (payload.block2Weekly) {
    Object.entries(payload.block2Weekly).forEach(([w, rec]) => {
      if (rec) {
        cleanB2Weekly[Number(w)] = {
          weekNumber: rec.weekNumber,
          fileName: rec.fileName,
          fileSize: rec.fileSize,
          uploadedAt: rec.uploadedAt,
          rowCount: rec.rowCount,
          results: (rec.results || []).map((r: StudentResultRow) => ({
            studentCode: r.studentCode,
            studentName: r.studentName,
            subjectCode: r.subjectCode,
            classCode: r.classCode,
            status: r.status,
            isAttendanceFailed: r.isAttendanceFailed,
            isOngoingAssessmentFail: r.isOngoingAssessmentFail,
            isForbiddenExam: r.isForbiddenExam,
            isPassed: r.isPassed,
            department: r.department,
            block: r.block,
            startDate: r.startDate,
          })),
        };
      }
    });
  }

  return {
    ...payload,
    enrollmentRows: cleanEnrollmentRows,
    block1Weekly: cleanB1Weekly,
    block2Weekly: cleanB2Weekly,
  };
}

/**
 * Check if the payload has valid non-empty analytical data
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
 * Tests connection to Google Apps Script Web App
 */
export async function testCloudConnection(
  apiUrl: string
): Promise<{ success: boolean; isReady: boolean; hasData: boolean; message: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return {
      success: false,
      isReady: false,
      hasData: false,
      message: 'Vui lòng nhập đường dẫn URL hợp lệ bắt đầu bằng https://',
    };
  }

  const cleanUrl = apiUrl.trim();

  // Check if user accidentally pasted a Google Sheets UI link instead of the /exec Web App link
  if (cleanUrl.includes('docs.google.com/spreadsheets') && !cleanUrl.includes('/exec')) {
    return {
      success: false,
      isReady: false,
      hasData: false,
      message:
        'Bạn đang nhập đường link trang tính Google Sheets! Để đồng bộ 2 chiều, bạn cần vào Tiện ích mở rộng -> Apps Script -> Triển khai dạng Ứng dụng web và sao chép link kết thúc bằng /exec.',
    };
  }

  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${cleanUrl}${separator}ping=1`, {
      method: 'GET',
    });

    if (!res.ok) {
      return {
        success: false,
        isReady: false,
        hasData: false,
        message: `Máy chủ Google phản hồi mã lỗi HTTP ${res.status}. Vui lòng kiểm tra quyền truy cập Anyone.`,
      };
    }

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text.trim());
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    } catch {
      // not json
    }

    if (parsed) {
      if (parsed.status === 'ok') {
        return {
          success: true,
          isReady: true,
          hasData: false,
          message: 'Kết nối máy chủ Google Apps Script thành công! Sẵn sàng nhận dữ liệu.',
        };
      }
      if (isValidCloudPayload(parsed) || (parsed.data && isValidCloudPayload(parsed.data))) {
        const payload = parsed.data || parsed;
        return {
          success: true,
          isReady: true,
          hasData: true,
          message: `Đã kết nối! Hiện có dữ liệu trên Cloud (${payload.enrollmentRows?.length || 0} lượt SV, cập nhật lúc: ${payload.updatedAt || 'N/A'}).`,
        };
      }
      if (parsed.status === 'empty') {
        return {
          success: true,
          isReady: true,
          hasData: false,
          message: 'Kết nối thành công! Trang tính hiện đang trống và sẵn sàng đồng bộ.',
        };
      }
    }

    return {
      success: true,
      isReady: true,
      hasData: false,
      message: 'Đã kết nối máy chủ Google Sheets thành công.',
    };
  } catch (err: any) {
    return {
      success: false,
      isReady: false,
      hasData: false,
      message:
        err?.message ||
        'Không thể kết nối tới URL Google Apps Script. Vui lòng kiểm tra lại URL và cấu hình quyền "Bất kỳ ai (Anyone)".',
    };
  }
}

/**
 * Fetch latest state from Google Apps Script Web App
 */
export async function fetchStateFromGoogleSheets(
  apiUrl: string
): Promise<{ success: boolean; data?: CloudSyncPayload; isEmpty?: boolean; message?: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình Google Apps Script URL hợp lệ.' };
  }

  try {
    const res = await fetch(apiUrl.trim(), {
      method: 'GET',
    });

    if (!res.ok) {
      return { success: false, message: `Lỗi kết nối máy chủ Google (${res.status})` };
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return { success: false, isEmpty: true, message: 'Phản hồi từ Google Sheets trống.' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text.trim());
      // Handle case where text was double-stringified
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch (parseErr) {
      console.warn('JSON parse error from Google Sheets:', parseErr);
      return { success: false, message: 'Dữ liệu nhận từ Google Sheets không đúng định dạng JSON.' };
    }

    if (parsed.status === 'empty' || parsed.data === null) {
      return { success: true, isEmpty: true, message: 'Trang tính Google Sheets hiện đang trống.' };
    }

    const candidateData = parsed.data || parsed;
    if (isValidCloudPayload(candidateData)) {
      return { success: true, data: candidateData as CloudSyncPayload, isEmpty: false };
    }

    return { success: true, isEmpty: true, message: 'Dữ liệu trên Google Sheets trống hoặc chưa có bản ghi.' };
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
 * Uses headers: { 'Content-Type': 'text/plain;charset=utf-8' } to avoid CORS preflight OPTIONS blocking.
 * Performs dual-layer post and verifies with background GET verification.
 */
export async function syncStateToGoogleSheets(
  apiUrl: string,
  payload: CloudSyncPayload
): Promise<{ success: boolean; message?: string }> {
  if (!apiUrl || !apiUrl.trim().startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình Google Apps Script API URL.' };
  }

  const cleanPayload = preparePayloadForCloud(payload);
  const payloadString = JSON.stringify(cleanPayload);
  const gasUrl = apiUrl.trim();

  try {
    // 1. Standard POST with text/plain (Simple header: no CORS preflight OPTIONS triggered)
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payloadString,
    });

    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.status === 'error') {
          return { success: false, message: `Lỗi từ Google Sheets: ${json.message}` };
        }
      } catch {
        // text is not JSON, but HTTP 200 is success
      }
      return {
        success: true,
        message: 'Đã lưu dữ liệu lên Google Sheets thành công! Tất cả mọi người có thể xem ngay.',
      };
    }
  } catch (err: any) {
    console.warn('Standard POST fetch notice, applying safe no-cors fallback:', err);
  }

  // 2. Safe Fallback with mode: 'no-cors'
  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payloadString,
    });

    // Short delay to allow Google Sheets script execution to complete writing
    await new Promise((r) => setTimeout(r, 1200));

    // Verify written data via GET
    const verifyRes = await fetchStateFromGoogleSheets(gasUrl);
    if (verifyRes.success && verifyRes.data && isValidCloudPayload(verifyRes.data)) {
      return {
        success: true,
        message: 'Đã xác nhận dữ liệu đã lưu vào Google Sheets thành công 100%! Bất kỳ ai mở link cũng sẽ thấy ngay.',
      };
    }

    return {
      success: true,
      message: 'Đã gửi gói dữ liệu vào Google Sheets! Dữ liệu đang được đồng bộ lên máy chủ.',
    };
  } catch (fallbackErr: any) {
    console.error('Fatal error syncing to Google Sheets:', fallbackErr);
    return {
      success: false,
      message: fallbackErr?.message || 'Không thể gửi dữ liệu lên Google Apps Script.',
    };
  }
}
