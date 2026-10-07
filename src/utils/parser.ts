import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BUILTIN_PREFIX_MAPPING, normalizeDepartmentName } from '../constants';
import {
  BlockType,
  DnaDepartmentCode,
  SemesterConfig,
  StudentEnrollmentRow,
  StudentResultRow,
  SubjectMapping,
} from '../types';
import { determineBlockFromDate, parseDateToIso } from './dateUtils';

/**
 * Fuzzy search to match key name ignoring case, whitespace, and accents
 */
export function getColumnValue(row: Record<string, any>, candidateNames: string[]): any {
  if (!row) return undefined;
  const keys = Object.keys(row);

  // Exact or trimmed match first
  for (const candidate of candidateNames) {
    const foundKey = keys.find(k => k.trim().toLowerCase() === candidate.trim().toLowerCase());
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }

  // Partial match fallback
  for (const candidate of candidateNames) {
    const cleanCand = candidate.trim().toLowerCase();
    const foundKey = keys.find(k => k.trim().toLowerCase().includes(cleanCand));
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }

  return undefined;
}

/**
 * Resolve department code for a given subject code
 */
export function resolveDepartment(
  subjectCodeRaw: string,
  customMappings: Record<string, DnaDepartmentCode> = {}
): DnaDepartmentCode {
  if (!subjectCodeRaw) return 'CB';
  const cleanCode = subjectCodeRaw.trim().toUpperCase();

  // 1. Check custom dictionary (exact match)
  if (customMappings[cleanCode]) {
    return customMappings[cleanCode];
  }

  // 2. Extract alphabetical prefix (e.g. MUL101 -> MUL, COM108 -> COM, GDTC -> GDTC)
  const prefixMatch = cleanCode.match(/^([A-Z]+)/);
  if (prefixMatch) {
    const prefix = prefixMatch[1];

    // Direct check in dictionary by prefix
    if (customMappings[prefix]) {
      return customMappings[prefix];
    }

    // Check built-in prefix rules
    for (const rule of BUILTIN_PREFIX_MAPPING) {
      if (prefix === rule.prefix || prefix.startsWith(rule.prefix)) {
        return rule.department;
      }
    }
  }

  // Fallback to general rules
  if (cleanCode.startsWith('GD') && !cleanCode.startsWith('GDTC')) return 'TKĐH';
  if (cleanCode.startsWith('MUL')) return 'TKĐH';
  if (cleanCode.startsWith('COM') || cleanCode.startsWith('WEB') || cleanCode.startsWith('MOB')) return 'UDPM';

  return 'CB';
}

/**
 * Parse 'Môn - Bộ môn.xlsx' or CSV dictionary file
 */
export async function parseSubjectDepartmentFile(
  file: File
): Promise<{ mappings: Record<string, DnaDepartmentCode>; list: SubjectMapping[] }> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const rawRows: Record<string, any>[] = [];

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    rawRows.push(...json);
  } else {
    // CSV file
    const text = await file.text();
    const parsed = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    rawRows.push(...parsed.data);
  }

  const mappings: Record<string, DnaDepartmentCode> = {};
  const list: SubjectMapping[] = [];

  for (const row of rawRows) {
    const subjectCode = String(
      getColumnValue(row, ['Mã môn', 'Mã môn học', 'Subject Code', 'Subject', 'Ma_mon', 'Code']) || ''
    ).trim().toUpperCase();

    const subjectName = String(
      getColumnValue(row, ['Tên môn', 'Tên môn học', 'Subject Name', 'Name', 'Ten_mon']) || ''
    ).trim();

    const deptRaw = String(
      getColumnValue(row, ['Bộ môn', 'Department', 'Chuyên ngành', 'Bo_mon', 'Khoa', 'BM']) || ''
    ).trim();

    if (subjectCode && deptRaw) {
      const normalizedDept = normalizeDepartmentName(deptRaw);
      mappings[subjectCode] = normalizedDept;
      list.push({
        subjectCode,
        subjectName,
        departmentCode: normalizedDept,
        isCustom: true,
      });
    }
  }

  return { mappings, list };
}

/**
 * Parse 'danh_sach_lop_mon.csv' (Enrollment distribution)
 */
export async function parseEnrollmentFile(
  file: File,
  config: SemesterConfig,
  customMappings: Record<string, DnaDepartmentCode> = {}
): Promise<{ rows: StudentEnrollmentRow[]; totalRows: number }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: StudentEnrollmentRow[] = [];
          for (const raw of results.data) {
            const studentCode = String(
              getColumnValue(raw, ['Mã SV', 'MSSV', 'Mã sinh viên', 'Roll Number', 'Student Code', 'Ma_sv']) || ''
            ).trim();

            const subjectCode = String(
              getColumnValue(raw, ['Mã môn', 'Mã môn học', 'Subject Code', 'Subject', 'Ma_mon']) || ''
            ).trim();

            const classCode = String(
              getColumnValue(raw, ['Lớp', 'Lớp môn', 'Class', 'Class Code', 'Lop_mon', 'Lop']) || ''
            ).trim();

            const studentName = String(
              getColumnValue(raw, ['Họ tên', 'Tên SV', 'Tên sinh viên', 'Student Name', 'Full Name', 'Ho_ten']) || ''
            ).trim();

            const startDateVal = getColumnValue(raw, [
              'Ngày bắt đầu',
              'Start Date',
              'Ngày học đầu',
              'Ngay_bat_dau',
              'Ngày đầu',
              'Date',
            ]);

            // Skip empty rows where neither subject code nor student code exists
            if (!subjectCode && !studentCode && !classCode) continue;

            const isoDate = parseDateToIso(startDateVal);
            const block = determineBlockFromDate(startDateVal, config, classCode);
            const department = resolveDepartment(subjectCode, customMappings);

            rows.push({
              studentCode: studentCode || `SV_${rows.length + 1}`,
              studentName,
              subjectCode: subjectCode || 'UNKNOWN',
              classCode: classCode || 'N/A',
              startDate: isoDate || undefined,
              block,
              department,
              rawRow: raw,
            });
          }

          resolve({ rows, totalRows: rows.length });
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}

/**
 * Evaluate status for attendance failed, ongoing assessment fail, or passed
 */
export function evaluateStatus(statusStr: string): {
  isAttendanceFailed: boolean;
  isOngoingAssessmentFail: boolean;
  isForbiddenExam: boolean;
  isPassed: boolean;
} {
  const norm = (statusStr || '').trim().toLowerCase();

  const isAttendanceFailed =
    norm.includes('attendance failed') ||
    norm.includes('attendance fail') ||
    norm.includes('chuyên cần') ||
    norm.includes('vắng thi') ||
    norm.includes('vắng quá');

  const isOngoingAssessmentFail =
    norm.includes('on-going assessment fail') ||
    norm.includes('ongoing assessment fail') ||
    norm.includes('on going assessment fail') ||
    norm.includes('assessment fail') ||
    norm.includes('điểm thành phần') ||
    norm.includes('điều kiện thi');

  const isForbiddenExam = isAttendanceFailed || isOngoingAssessmentFail || norm.includes('cấm thi');

  // Passing/Studying/Not started are counted as achieve/pass; Failed/Attendance Failed/Assessment Fail are not.
  const isFailed =
    isForbiddenExam ||
    norm.includes('failed') ||
    norm.includes('fail') ||
    norm.includes('trượt') ||
    norm.includes('hỏng') ||
    norm.includes('rớt');

  const isPassed = !isFailed;

  return {
    isAttendanceFailed,
    isOngoingAssessmentFail,
    isForbiddenExam,
    isPassed,
  };
}

/**
 * Parse 'export.csv' (Weekly Academic Results)
 */
export async function parseWeeklyResultFile(
  file: File,
  config: SemesterConfig,
  assignedBlock: BlockType,
  customMappings: Record<string, DnaDepartmentCode> = {}
): Promise<{ rows: StudentResultRow[]; totalRows: number }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: StudentResultRow[] = [];
          for (const raw of results.data) {
            const studentCode = String(
              getColumnValue(raw, ['Mã SV', 'MSSV', 'Mã sinh viên', 'Roll Number', 'Student Code']) || ''
            ).trim();

            const subjectCode = String(
              getColumnValue(raw, ['Mã môn', 'Mã môn học', 'Subject Code', 'Subject', 'Ma_mon']) || ''
            ).trim();

            const status = String(
              getColumnValue(raw, ['Trạng thái', 'Status', 'Kết quả', 'Result', 'Trang_thai']) || ''
            ).trim();

            const classCode = String(
              getColumnValue(raw, ['Lớp', 'Lớp môn', 'Class', 'Class Code', 'Lop']) || ''
            ).trim();

            const studentName = String(
              getColumnValue(raw, ['Họ tên', 'Tên SV', 'Student Name', 'Full Name']) || ''
            ).trim();

            const startDateVal = getColumnValue(raw, ['Ngày đầu', 'Ngày bắt đầu', 'Start Date', 'Ngay_dau']);

            if (!subjectCode && !studentCode && !status) continue;

            const department = resolveDepartment(subjectCode, customMappings);
            const { isAttendanceFailed, isOngoingAssessmentFail, isForbiddenExam, isPassed } = evaluateStatus(status);
            const isoDate = parseDateToIso(startDateVal);

            rows.push({
              studentCode: studentCode || `SV_${rows.length + 1}`,
              studentName,
              subjectCode: subjectCode || 'UNKNOWN',
              classCode,
              status,
              isAttendanceFailed,
              isOngoingAssessmentFail,
              isForbiddenExam,
              isPassed,
              department,
              block: assignedBlock,
              startDate: isoDate || undefined,
              rawRow: raw,
            });
          }

          resolve({ rows, totalRows: rows.length });
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => reject(error),
    });
  });
}
