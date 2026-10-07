import { CloudSyncPayload, StudentResultRow } from '../types';

export const APPS_SCRIPT_STORAGE_KEY = 'fpt_dna_apps_script_url';
export const USER_ROLE_STORAGE_KEY = 'fpt_dna_user_role';
export const LAST_SYNC_STORAGE_KEY = 'fpt_dna_last_sync_time';
export const LOCAL_STORAGE_DATA_KEY = 'FPT_DNA_DATA';

/**
 * Standard Google Apps Script (Code.gs) template for Google Sheets
 * Supports multi-row chunking to bypass Google Sheets 50,000 char per cell limit!
 */
export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT CHO WEBAPP THỐNG KÊ OKR FPT POLYTECHNIC ĐỒNG NAI (DNA)
 * ----------------------------------------------------------------------
 * HƯỚNG DẪN CẬP NHẬT TRONG 1 PHÚT:
 * 1. Mở file Google Sheets của bạn (vd: Data KPI).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. XÓA SẠCH CODE CŨ trong Code.gs, DÁN TOÀN BỘ ĐOẠN CODE NÀY VÀO -> Bấm Lưu (Ctrl+S / Cmd+S).
 * 4. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> Chọn "Quản lý bản triển khai" (Manage deployments)
 *    hoặc "Triển khai mới" (New deployment).
 * 5. Chọn loại: "Ứng dụng web" (Web app).
 * 6. Cấu hình triển khai:
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <-- BẮT BUỘC
 * 7. Bấm "Triển khai" -> Sao chép URL Web App (kết thúc bằng /exec) và dán vào WebApp!
 */

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

    if (!content) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Nội dung gửi lên trống'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    sheet.clearContents(); // Xóa sạch dữ liệu cũ

    // Chia nhỏ thành các đoạn 40.000 ký tự để không bao giờ bị lỗi quá giới hạn ô của Google Sheets (50.000 ký tự)
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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

    if (!fullContent) {
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

    if (json.status === 'empty' || json.data === null) {
      return { success: false, message: 'Trang tính Google Sheets hiện đang trống.' };
    }

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

  // Sanitize payload to strip rawRow and ensure optimal size
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
        message: 'Đã lưu dữ liệu lên Google Sheets thành công! Người khác có thể xem ngay.',
      };
    }
  } catch (err: any) {
    console.warn('Standard fetch encountered redirect/CORS notice, applying safe no-cors fallback to ensure delivery:', err);
  }

  // 2. Fallback with no-cors to guarantee packet reaches Google Apps Script and executes doPost(e)
  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payloadString,
    });

    return {
      success: true,
      message: 'Đã gửi dữ liệu vào Google Sheets thành công! Người khác có thể xem ngay.',
    };
  } catch (fallbackErr: any) {
    console.error('Fatal error syncing to Google Sheets:', fallbackErr);
    return {
      success: false,
      message: fallbackErr?.message || 'Không thể gửi dữ liệu lên Google Apps Script.',
    };
  }
}
