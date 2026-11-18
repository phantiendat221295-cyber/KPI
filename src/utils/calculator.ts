import { DNA_DEPARTMENTS } from '../constants';
import { evaluateStatus } from './parser';
import { determineBlockFromDate } from './dateUtils';
import {
  BlockType,
  BlockWeeklyData,
  SemesterConfig,
  DnaDepartmentCode,
  StudentEnrollmentRow,
  StudentResultRow,
  Table1RowData,
  Table2RowData,
} from '../types';

/**
 * Find the latest uploaded week number for a given block
 */
export function getLatestWeekUploaded(weeklyData: BlockWeeklyData): number | null {
  // Tuần 8 là dữ liệu chốt cuối block -> ưu tiên nếu đã nạp
  if (weeklyData[8] && weeklyData[8]!.results.length > 0) {
    return 8;
  }
  for (let w = 6; w >= 1; w--) {
    if (weeklyData[w] && weeklyData[w]!.results.length > 0) {
      return w;
    }
  }
  return null;
}

/**
 * Xác định block thật của từng lượt học trong file export.csv.
 * File export thường chứa toàn bộ lượt học của kỳ (cả B1 và B2), nên KHÔNG được
 * gán cả file vào block của ô đang nạp. Thứ tự ưu tiên:
 *  0. Cột "Block" có sẵn trong export.csv
 *  1. Tra trong danh_sach_lop_mon (Mã SV + Mã môn + Lớp, rồi Mã SV + Mã môn)
 *  2. Ngày bắt đầu của dòng (nếu file export có cột ngày)
 *  3. Block của ô đã nạp (giữ nguyên như cũ)
 */
export type BlockResolver = (r: StudentResultRow) => BlockType | undefined;

function norm(v: string | undefined): string {
  return (v || '').trim().toUpperCase();
}

export function buildBlockResolver(
  enrollmentRows: StudentEnrollmentRow[],
  config?: SemesterConfig
): BlockResolver {
  const byFull = new Map<string, BlockType>();
  const byStudentSubject = new Map<string, BlockType | 'MIXED'>();
  for (const e of enrollmentRows) {
    const ss = `${norm(e.studentCode)}|${norm(e.subjectCode)}`;
    byFull.set(`${ss}|${norm(e.classCode)}`, e.block);
    const prev = byStudentSubject.get(ss);
    byStudentSubject.set(ss, prev && prev !== e.block ? 'MIXED' : e.block);
  }

  return (r: StudentResultRow) => {
    if (r.blockFromFile) return r.blockFromFile;
    const ss = `${norm(r.studentCode)}|${norm(r.subjectCode)}`;
    const full = byFull.get(`${ss}|${norm(r.classCode)}`);
    if (full) return full;
    const bySS = byStudentSubject.get(ss);
    if (bySS && bySS !== 'MIXED') return bySS;
    if (r.startDate && config) return determineBlockFromDate(r.startDate, config);
    return r.block;
  };
}

/** Lấy dữ liệu 1 tuần đã gắn mốc ngày nạp file */
function recordRows(data: BlockWeeklyData, week: number | null): StudentResultRow[] {
  if (!week) return [];
  const rec = data[week];
  if (!rec) return [];
  return withRefDate(rec.results || [], rec.uploadedDate);
}

/** Lọc chỉ giữ các lượt học thuộc đúng block (và bỏ lớp thi thử) */
export function filterByBlock(
  rows: StudentResultRow[],
  block: BlockType,
  resolve?: BlockResolver
): StudentResultRow[] {
  const real = rows.filter((r) => !isTestClass(r.classCode));
  if (!resolve) return real;
  return real.filter((r) => resolve(r) === block);
}

/** Lớp thi thử / lớp test (VD: "TL_EOS test_LOG301_...") - không phải lượt học thật */
export function isTestClass(classCode?: string): boolean {
  const c = (classCode || '').toUpperCase();
  return /\bTEST\b|_TEST|TEST_|TL_EOS/.test(c);
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Luôn tính lại trạng thái từ chuỗi status gốc (kể cả dữ liệu cũ đã lưu trên cloud)
 * để đồng bộ quy tắc với Hệ thống Phổ điểm.
 *
 * Bổ sung: lượt "Studying" nhưng môn ĐÃ KẾT THÚC (Ngày cuối < ngày nạp file) và Điểm < 5
 * -> coi là THI TRƯỢT (đã có kết quả, không đạt), giống Sổ điểm/Phổ điểm.
 */
function st(r: StudentResultRow & { __refDate?: string }) {
  const base = evaluateStatus(r.status);
  if (
    base.isPending &&
    typeof r.score === 'number' &&
    r.score < 5 &&
    r.endDate &&
    r.endDate < (r.__refDate || todayIso())
  ) {
    return { ...base, isPending: false, isPassed: false };
  }
  return base;
}

/** Gắn ngày nạp file vào từng dòng để xét "môn đã kết thúc" */
function withRefDate(rows: StudentResultRow[], refDate?: string): StudentResultRow[] {
  if (!refDate) return rows;
  return rows.map((r) => ({ ...r, __refDate: refDate }) as StudentResultRow);
}

/** Cấm thi = (Trượt điểm danh + Trượt quá trình) / tổng lượt SV */
function forbiddenOf(rows: StudentResultRow[]): { count: number | null; rate: number | null } {
  if (rows.length === 0) return { count: null, rate: null };
  const count = rows.filter((r) => st(r).isForbiddenExam).length;
  return { count, rate: (count / rows.length) * 100 };
}

/** Cấm thi do trượt điểm danh = Trượt điểm danh / tổng lượt SV */
function attendanceOf(rows: StudentResultRow[]): { count: number | null; rate: number | null } {
  if (rows.length === 0) return { count: null, rate: null };
  const count = rows.filter((r) => st(r).isAttendanceFailed).length;
  return { count, rate: (count / rows.length) * 100 };
}

/** Pass = Đạt / (tổng lượt SV - SV chưa có kết quả) */
function passOf(rows: StudentResultRow[]): { count: number | null; rate: number | null } {
  if (rows.length === 0) return { count: null, rate: null };
  const evaluated = rows.filter((r) => !st(r).isPending);
  if (evaluated.length === 0) return { count: 0, rate: null };
  const count = evaluated.filter((r) => st(r).isPassed).length;
  return { count, rate: (count / evaluated.length) * 100 };
}

/** Ghi chú chất lượng dữ liệu cho người xem kiểm tra lại */
export function computeDataNotes(
  block1Weekly: BlockWeeklyData,
  block2Weekly: BlockWeeklyData
): { testRows: number; overdueFailRows: number; otherBlockRows: number } {
  let testRows = 0;
  let overdueFailRows = 0;
  let otherBlockRows = 0;
  const seen = new Set<StudentResultRow[]>();
  for (const [data, block] of [[block1Weekly, 'B1'], [block2Weekly, 'B2']] as const) {
    for (const w of [getLatestWeekUploaded(data), 8]) {
      if (!w || !data[w] || seen.has(data[w]!.results)) continue;
      seen.add(data[w]!.results);
      for (const r of recordRows(data, w)) {
        if (isTestClass(r.classCode)) {
          testRows++;
          continue;
        }
        if (r.blockFromFile && r.blockFromFile !== block) otherBlockRows++;
        if (evaluateStatus(r.status).isPending && !st(r).isPending) overdueFailRows++;
      }
    }
  }
  return { testRows, overdueFailRows, otherBlockRows };
}

/**
 * Calculate Forbidden Count & Rate for a specific department
 */
export function calculateForbiddenStats(
  results: StudentResultRow[],
  deptCode: DnaDepartmentCode
): { count: number | null; rate: number | null } {
  return forbiddenOf(results.filter((r) => r.department === deptCode));
}

/**
 * Calculate Pass Count & Rate for a specific department
 */
export function calculatePassStats(
  results: StudentResultRow[],
  deptCode: DnaDepartmentCode
): { count: number | null; rate: number | null } {
  return passOf(results.filter((r) => r.department === deptCode));
}

/**
 * Calculate Overall Forbidden Count & Rate across all departments in results
 */
export function calculateTotalForbiddenStats(
  results: StudentResultRow[]
): { count: number | null; rate: number | null } {
  return forbiddenOf(results);
}

/**
 * Calculate Overall Pass Count & Rate across all departments in results
 */
export function calculateTotalPassStats(
  results: StudentResultRow[]
): { count: number | null; rate: number | null } {
  return passOf(results);
}

/**
 * Generate Table 1 Data: Thống kê tổng quan học kỳ FA26, Block 1 & Block 2
 */
export function computeTable1Data(
  enrollmentRows: StudentEnrollmentRow[],
  block1Weekly: BlockWeeklyData,
  block2Weekly: BlockWeeklyData,
  config?: SemesterConfig
): { rows: Table1RowData[]; totalRow: Table1RowData } {
  const resolve = buildBlockResolver(enrollmentRows, config);
  const isEnrollmentEmpty = enrollmentRows.length === 0;

  // Total enrollments
  const totalAll = enrollmentRows.length;
  const totalB1 = enrollmentRows.filter((r) => r.block === 'B1').length;
  const totalB2 = enrollmentRows.filter((r) => r.block === 'B2').length;

  // Latest weekly results for B1 and B2
  const latestB1Week = getLatestWeekUploaded(block1Weekly);
  const latestB2Week = getLatestWeekUploaded(block2Weekly);

  // Chỉ giữ lượt học đúng block (file export có thể chứa cả B1 và B2)
  const b1LatestResults = filterByBlock(recordRows(block1Weekly, latestB1Week), 'B1', resolve);
  const b2LatestResults = filterByBlock(recordRows(block2Weekly, latestB2Week), 'B2', resolve);
  const b1Week8Results = filterByBlock(recordRows(block1Weekly, 8), 'B1', resolve);
  const b2Week8Results = filterByBlock(recordRows(block2Weekly, 8), 'B2', resolve);

  // Combined results for FA26
  const combinedLatestResults = [...b1LatestResults, ...b2LatestResults];
  const combinedWeek8Results = [...b1Week8Results, ...b2Week8Results];

  const rows: Table1RowData[] = DNA_DEPARTMENTS.map((dept, index) => {
    if (!dept.isSupportedAtDna) {
      return {
        stt: index + 1,
        campus: 'DNA',
        department: dept.code,
        isSupported: false,
        allCount: 0,
        allPercentage: 0,
        allForbiddenCount: null,
        allForbiddenRate: null,
        allAttendanceCount: null,
        allAttendanceRate: null,
        allPassRate: null,
        allPassCount: null,
        b1Count: 0,
        b1Percentage: 0,
        b1ForbiddenCount: null,
        b1ForbiddenRate: null,
        b1AttendanceCount: null,
        b1AttendanceRate: null,
        b1PassRate: null,
        b1PassCount: null,
        b2Count: 0,
        b2Percentage: 0,
        b2ForbiddenCount: null,
        b2ForbiddenRate: null,
        b2AttendanceCount: null,
        b2AttendanceRate: null,
        b2PassRate: null,
        b2PassCount: null,
      };
    }

    const deptAllCount = isEnrollmentEmpty ? 0 : enrollmentRows.filter((r) => r.department === dept.code).length;
    const deptB1Count = isEnrollmentEmpty
      ? 0
      : enrollmentRows.filter((r) => r.department === dept.code && r.block === 'B1').length;
    const deptB2Count = isEnrollmentEmpty
      ? 0
      : enrollmentRows.filter((r) => r.department === dept.code && r.block === 'B2').length;

    const allPercentage = totalAll > 0 ? (deptAllCount / totalAll) * 100 : 0;
    const b1Percentage = totalB1 > 0 ? (deptB1Count / totalB1) * 100 : 0;
    const b2Percentage = totalB2 > 0 ? (deptB2Count / totalB2) * 100 : 0;

    // Rates & Counts
    const b1Forbidden = calculateForbiddenStats(b1LatestResults, dept.code);
    const b1Pass = calculatePassStats(b1Week8Results, dept.code);

    const b2Forbidden = calculateForbiddenStats(b2LatestResults, dept.code);
    const b2Pass = calculatePassStats(b2Week8Results, dept.code);

    const allForbidden = calculateForbiddenStats(combinedLatestResults, dept.code);
    const allPass = calculatePassStats(combinedWeek8Results, dept.code);

    const b1Att = attendanceOf(b1LatestResults.filter((r) => r.department === dept.code));
    const b2Att = attendanceOf(b2LatestResults.filter((r) => r.department === dept.code));
    const allAtt = attendanceOf(combinedLatestResults.filter((r) => r.department === dept.code));

    return {
      stt: index + 1,
      campus: 'DNA',
      department: dept.code,
      isSupported: true,
      allCount: deptAllCount,
      allPercentage,
      allForbiddenCount: allForbidden.count,
      allForbiddenRate: allForbidden.rate,
      allAttendanceCount: allAtt.count,
      allAttendanceRate: allAtt.rate,
      allPassRate: allPass.rate,
      allPassCount: allPass.count,
      b1Count: deptB1Count,
      b1Percentage,
      b1ForbiddenCount: b1Forbidden.count,
      b1ForbiddenRate: b1Forbidden.rate,
      b1AttendanceCount: b1Att.count,
      b1AttendanceRate: b1Att.rate,
      b1PassRate: b1Pass.rate,
      b1PassCount: b1Pass.count,
      b2Count: deptB2Count,
      b2Percentage,
      b2ForbiddenCount: b2Forbidden.count,
      b2ForbiddenRate: b2Forbidden.rate,
      b2AttendanceCount: b2Att.count,
      b2AttendanceRate: b2Att.rate,
      b2PassRate: b2Pass.rate,
      b2PassCount: b2Pass.count,
    };
  });

  const totalAllForbidden = calculateTotalForbiddenStats(combinedLatestResults);
  const totalAllPass = calculateTotalPassStats(combinedWeek8Results);
  const totalB1Forbidden = calculateTotalForbiddenStats(b1LatestResults);
  const totalB1Pass = calculateTotalPassStats(b1Week8Results);
  const totalB2Forbidden = calculateTotalForbiddenStats(b2LatestResults);
  const totalB2Pass = calculateTotalPassStats(b2Week8Results);
  const totalAllAtt = attendanceOf(combinedLatestResults);
  const totalB1Att = attendanceOf(b1LatestResults);
  const totalB2Att = attendanceOf(b2LatestResults);

  const totalRow: Table1RowData = {
    stt: 0,
    campus: 'DNA',
    department: 'CB' as DnaDepartmentCode,
    isSupported: true,
    allCount: totalAll,
    allPercentage: totalAll > 0 ? 100 : 0,
    allForbiddenCount: totalAllForbidden.count,
    allForbiddenRate: totalAllForbidden.rate,
    allAttendanceCount: totalAllAtt.count,
    allAttendanceRate: totalAllAtt.rate,
    allPassRate: totalAllPass.rate,
    allPassCount: totalAllPass.count,
    b1Count: totalB1,
    b1Percentage: totalB1 > 0 ? 100 : 0,
    b1ForbiddenCount: totalB1Forbidden.count,
    b1ForbiddenRate: totalB1Forbidden.rate,
    b1AttendanceCount: totalB1Att.count,
    b1AttendanceRate: totalB1Att.rate,
    b1PassRate: totalB1Pass.rate,
    b1PassCount: totalB1Pass.count,
    b2Count: totalB2,
    b2Percentage: totalB2 > 0 ? 100 : 0,
    b2ForbiddenCount: totalB2Forbidden.count,
    b2ForbiddenRate: totalB2Forbidden.rate,
    b2AttendanceCount: totalB2Att.count,
    b2AttendanceRate: totalB2Att.rate,
    b2PassRate: totalB2Pass.rate,
    b2PassCount: totalB2Pass.count,
  };

  return { rows, totalRow };
}

/**
 * Generate Table 2 Data for a specific block (Weekly OKR Review)
 * Columns: CS | BM | Tuần 8 - Pass (%) | Tuần 1 [SL Cấm | % Cấm thi] | ... | Tuần 6 [SL Cấm | % Cấm thi]
 */
export function computeTable2Data(
  rawWeeklyData: BlockWeeklyData,
  block?: BlockType,
  enrollmentRows: StudentEnrollmentRow[] = [],
  config?: SemesterConfig
): { rows: Table2RowData[]; totalRow: Table2RowData } {
  const resolve = block ? buildBlockResolver(enrollmentRows, config) : undefined;
  const weeklyData: Record<number, { results: StudentResultRow[] } | undefined> = {};
  for (const w of [1, 2, 3, 4, 5, 6, 8]) {
    const rec = rawWeeklyData[w];
    if (!rec) continue;
    const rows = recordRows(rawWeeklyData, w);
    weeklyData[w] = { results: block ? filterByBlock(rows, block, resolve) : rows.filter((r) => !isTestClass(r.classCode)) };
  }
  const rows: Table2RowData[] = DNA_DEPARTMENTS.map((dept, index) => {
    if (!dept.isSupportedAtDna) {
      return {
        stt: index + 1,
        campus: 'DNA',
        department: dept.code,
        isSupported: false,
        week8PassCount: null,
        week8PassRate: null,
        week1Count: null,
        week1Rate: null,
        week2Count: null,
        week2Rate: null,
        week3Count: null,
        week3Rate: null,
        week4Count: null,
        week4Rate: null,
        week5Count: null,
        week5Rate: null,
        week6Count: null,
        week6Rate: null,
      };
    }

    const w1Stats = calculateForbiddenStats(weeklyData[1]?.results || [], dept.code);
    const w2Stats = calculateForbiddenStats(weeklyData[2]?.results || [], dept.code);
    const w3Stats = calculateForbiddenStats(weeklyData[3]?.results || [], dept.code);
    const w4Stats = calculateForbiddenStats(weeklyData[4]?.results || [], dept.code);
    const w5Stats = calculateForbiddenStats(weeklyData[5]?.results || [], dept.code);
    const w6Stats = calculateForbiddenStats(weeklyData[6]?.results || [], dept.code);
    const w8Stats = calculatePassStats(weeklyData[8]?.results || [], dept.code);

    return {
      stt: index + 1,
      campus: 'DNA',
      department: dept.code,
      isSupported: true,
      week8PassCount: w8Stats.count,
      week8PassRate: w8Stats.rate,
      week1Count: w1Stats.count,
      week1Rate: w1Stats.rate,
      week2Count: w2Stats.count,
      week2Rate: w2Stats.rate,
      week3Count: w3Stats.count,
      week3Rate: w3Stats.rate,
      week4Count: w4Stats.count,
      week4Rate: w4Stats.rate,
      week5Count: w5Stats.count,
      week5Rate: w5Stats.rate,
      week6Count: w6Stats.count,
      week6Rate: w6Stats.rate,
    };
  });

  const totalW1 = calculateTotalForbiddenStats(weeklyData[1]?.results || []);
  const totalW2 = calculateTotalForbiddenStats(weeklyData[2]?.results || []);
  const totalW3 = calculateTotalForbiddenStats(weeklyData[3]?.results || []);
  const totalW4 = calculateTotalForbiddenStats(weeklyData[4]?.results || []);
  const totalW5 = calculateTotalForbiddenStats(weeklyData[5]?.results || []);
  const totalW6 = calculateTotalForbiddenStats(weeklyData[6]?.results || []);
  const totalW8 = calculateTotalPassStats(weeklyData[8]?.results || []);

  const totalRow: Table2RowData = {
    stt: 0,
    campus: 'DNA',
    department: 'CB' as DnaDepartmentCode,
    isSupported: true,
    week8PassCount: totalW8.count,
    week8PassRate: totalW8.rate,
    week1Count: totalW1.count,
    week1Rate: totalW1.rate,
    week2Count: totalW2.count,
    week2Rate: totalW2.rate,
    week3Count: totalW3.count,
    week3Rate: totalW3.rate,
    week4Count: totalW4.count,
    week4Rate: totalW4.rate,
    week5Count: totalW5.count,
    week5Rate: totalW5.rate,
    week6Count: totalW6.count,
    week6Rate: totalW6.rate,
  };

  return { rows, totalRow };
}
