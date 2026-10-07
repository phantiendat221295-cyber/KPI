import { DNA_DEPARTMENTS } from '../constants';
import {
  BlockWeeklyData,
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
  // Check from week 6 down to 1
  for (let w = 6; w >= 1; w--) {
    if (weeklyData[w] && weeklyData[w]!.results.length > 0) {
      return w;
    }
  }
  // If only week 8 uploaded
  if (weeklyData[8] && weeklyData[8]!.results.length > 0) {
    return 8;
  }
  return null;
}

/**
 * Calculate Forbidden Count & Rate for a specific department
 */
export function calculateForbiddenStats(
  results: StudentResultRow[],
  deptCode: DnaDepartmentCode
): { count: number | null; rate: number | null } {
  const deptResults = results.filter((r) => r.department === deptCode);
  if (deptResults.length === 0) return { count: null, rate: null };
  const forbiddenCount = deptResults.filter((r) => r.isForbiddenExam).length;
  const rate = (forbiddenCount / deptResults.length) * 100;
  return { count: forbiddenCount, rate };
}

/**
 * Calculate Pass Count & Rate for a specific department
 */
export function calculatePassStats(
  results: StudentResultRow[],
  deptCode: DnaDepartmentCode
): { count: number | null; rate: number | null } {
  const deptResults = results.filter((r) => r.department === deptCode);
  if (deptResults.length === 0) return { count: null, rate: null };
  const passedCount = deptResults.filter((r) => r.isPassed).length;
  const rate = (passedCount / deptResults.length) * 100;
  return { count: passedCount, rate };
}

/**
 * Calculate Overall Forbidden Count & Rate across all departments in results
 */
export function calculateTotalForbiddenStats(
  results: StudentResultRow[]
): { count: number | null; rate: number | null } {
  if (results.length === 0) return { count: null, rate: null };
  const forbiddenCount = results.filter((r) => r.isForbiddenExam).length;
  const rate = (forbiddenCount / results.length) * 100;
  return { count: forbiddenCount, rate };
}

/**
 * Calculate Overall Pass Count & Rate across all departments in results
 */
export function calculateTotalPassStats(
  results: StudentResultRow[]
): { count: number | null; rate: number | null } {
  if (results.length === 0) return { count: null, rate: null };
  const passedCount = results.filter((r) => r.isPassed).length;
  const rate = (passedCount / results.length) * 100;
  return { count: passedCount, rate };
}

/**
 * Generate Table 1 Data: Thống kê tổng quan học kỳ FA26, Block 1 & Block 2
 */
export function computeTable1Data(
  enrollmentRows: StudentEnrollmentRow[],
  block1Weekly: BlockWeeklyData,
  block2Weekly: BlockWeeklyData
): { rows: Table1RowData[]; totalRow: Table1RowData } {
  const isEnrollmentEmpty = enrollmentRows.length === 0;

  // Total enrollments
  const totalAll = enrollmentRows.length;
  const totalB1 = enrollmentRows.filter((r) => r.block === 'B1').length;
  const totalB2 = enrollmentRows.filter((r) => r.block === 'B2').length;

  // Latest weekly results for B1 and B2
  const latestB1Week = getLatestWeekUploaded(block1Weekly);
  const latestB2Week = getLatestWeekUploaded(block2Weekly);

  const b1LatestResults = latestB1Week ? block1Weekly[latestB1Week]?.results || [] : [];
  const b2LatestResults = latestB2Week ? block2Weekly[latestB2Week]?.results || [] : [];
  const b1Week8Results = block1Weekly[8]?.results || [];
  const b2Week8Results = block2Weekly[8]?.results || [];

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
        allPassRate: null,
        b1Count: 0,
        b1Percentage: 0,
        b1ForbiddenCount: null,
        b1ForbiddenRate: null,
        b1PassRate: null,
        b2Count: 0,
        b2Percentage: 0,
        b2ForbiddenCount: null,
        b2ForbiddenRate: null,
        b2PassRate: null,
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

    return {
      stt: index + 1,
      campus: 'DNA',
      department: dept.code,
      isSupported: true,
      allCount: deptAllCount,
      allPercentage,
      allForbiddenCount: allForbidden.count,
      allForbiddenRate: allForbidden.rate,
      allPassRate: allPass.rate,
      b1Count: deptB1Count,
      b1Percentage,
      b1ForbiddenCount: b1Forbidden.count,
      b1ForbiddenRate: b1Forbidden.rate,
      b1PassRate: b1Pass.rate,
      b2Count: deptB2Count,
      b2Percentage,
      b2ForbiddenCount: b2Forbidden.count,
      b2ForbiddenRate: b2Forbidden.rate,
      b2PassRate: b2Pass.rate,
    };
  });

  const totalAllForbidden = calculateTotalForbiddenStats(combinedLatestResults);
  const totalAllPass = calculateTotalPassStats(combinedWeek8Results);
  const totalB1Forbidden = calculateTotalForbiddenStats(b1LatestResults);
  const totalB1Pass = calculateTotalPassStats(b1Week8Results);
  const totalB2Forbidden = calculateTotalForbiddenStats(b2LatestResults);
  const totalB2Pass = calculateTotalPassStats(b2Week8Results);

  const totalRow: Table1RowData = {
    stt: 0,
    campus: 'DNA',
    department: 'CB' as DnaDepartmentCode,
    isSupported: true,
    allCount: totalAll,
    allPercentage: totalAll > 0 ? 100 : 0,
    allForbiddenCount: totalAllForbidden.count,
    allForbiddenRate: totalAllForbidden.rate,
    allPassRate: totalAllPass.rate,
    b1Count: totalB1,
    b1Percentage: totalB1 > 0 ? 100 : 0,
    b1ForbiddenCount: totalB1Forbidden.count,
    b1ForbiddenRate: totalB1Forbidden.rate,
    b1PassRate: totalB1Pass.rate,
    b2Count: totalB2,
    b2Percentage: totalB2 > 0 ? 100 : 0,
    b2ForbiddenCount: totalB2Forbidden.count,
    b2ForbiddenRate: totalB2Forbidden.rate,
    b2PassRate: totalB2Pass.rate,
  };

  return { rows, totalRow };
}

/**
 * Generate Table 2 Data for a specific block (Weekly OKR Review)
 * Columns: CS | BM | Tuần 8 - Pass (%) | Tuần 1 [SL Cấm | % Cấm thi] | ... | Tuần 6 [SL Cấm | % Cấm thi]
 */
export function computeTable2Data(
  weeklyData: BlockWeeklyData
): { rows: Table2RowData[]; totalRow: Table2RowData } {
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
