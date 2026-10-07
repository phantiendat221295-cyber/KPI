import { DNA_DEPARTMENTS, WEEK_SLOTS } from '../constants';
import {
  BlockType,
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
 * Calculate Forbidden Rate for a specific list of student results and department
 */
export function calculateForbiddenRate(results: StudentResultRow[], deptCode: DnaDepartmentCode): number | null {
  const deptResults = results.filter((r) => r.department === deptCode);
  if (deptResults.length === 0) return null;
  const forbiddenCount = deptResults.filter((r) => r.isForbiddenExam).length;
  return (forbiddenCount / deptResults.length) * 100;
}

/**
 * Calculate Pass Rate for a specific list of student results and department
 */
export function calculatePassRate(results: StudentResultRow[], deptCode: DnaDepartmentCode): number | null {
  const deptResults = results.filter((r) => r.department === deptCode);
  if (deptResults.length === 0) return null;
  const passedCount = deptResults.filter((r) => r.isPassed).length;
  return (passedCount / deptResults.length) * 100;
}

/**
 * Calculate Overall Forbidden Rate across all departments in results
 */
export function calculateTotalForbiddenRate(results: StudentResultRow[]): number | null {
  if (results.length === 0) return null;
  const forbiddenCount = results.filter((r) => r.isForbiddenExam).length;
  return (forbiddenCount / results.length) * 100;
}

/**
 * Calculate Overall Pass Rate across all departments in results
 */
export function calculateTotalPassRate(results: StudentResultRow[]): number | null {
  if (results.length === 0) return null;
  const passedCount = results.filter((r) => r.isPassed).length;
  return (passedCount / results.length) * 100;
}

/**
 * Generate Table 1 Data
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
        allForbiddenRate: null,
        allPassRate: null,
        b1Count: 0,
        b1Percentage: 0,
        b1ForbiddenRate: null,
        b1PassRate: null,
        b2Count: 0,
        b2Percentage: 0,
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

    // Rates
    const b1ForbiddenRate = calculateForbiddenRate(b1LatestResults, dept.code);
    const b1PassRate = calculatePassRate(b1Week8Results, dept.code);

    const b2ForbiddenRate = calculateForbiddenRate(b2LatestResults, dept.code);
    const b2PassRate = calculatePassRate(b2Week8Results, dept.code);

    const allForbiddenRate = calculateForbiddenRate(combinedLatestResults, dept.code);
    const allPassRate = calculatePassRate(combinedWeek8Results, dept.code);

    return {
      stt: index + 1,
      campus: 'DNA',
      department: dept.code,
      isSupported: true,
      allCount: deptAllCount,
      allPercentage,
      allForbiddenRate,
      allPassRate,
      b1Count: deptB1Count,
      b1Percentage,
      b1ForbiddenRate,
      b1PassRate,
      b2Count: deptB2Count,
      b2Percentage,
      b2ForbiddenRate,
      b2PassRate,
    };
  });

  const totalRow: Table1RowData = {
    stt: 0,
    campus: 'DNA',
    department: 'CB' as DnaDepartmentCode, // Placeholder label in UI will say "Tổng cơ sở"
    isSupported: true,
    allCount: totalAll,
    allPercentage: totalAll > 0 ? 100 : 0,
    allForbiddenRate: calculateTotalForbiddenRate(combinedLatestResults),
    allPassRate: calculateTotalPassRate(combinedWeek8Results),
    b1Count: totalB1,
    b1Percentage: totalB1 > 0 ? 100 : 0,
    b1ForbiddenRate: calculateTotalForbiddenRate(b1LatestResults),
    b1PassRate: calculateTotalPassRate(b1Week8Results),
    b2Count: totalB2,
    b2Percentage: totalB2 > 0 ? 100 : 0,
    b2ForbiddenRate: calculateTotalForbiddenRate(b2LatestResults),
    b2PassRate: calculateTotalPassRate(b2Week8Results),
  };

  return { rows, totalRow };
}

/**
 * Generate Table 2 Data for a specific block (Weekly OKR matrix)
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
        week1: null,
        week2: null,
        week3: null,
        week4: null,
        week5: null,
        week6: null,
        week8: null,
      };
    }

    const w1Results = weeklyData[1]?.results || [];
    const w2Results = weeklyData[2]?.results || [];
    const w3Results = weeklyData[3]?.results || [];
    const w4Results = weeklyData[4]?.results || [];
    const w5Results = weeklyData[5]?.results || [];
    const w6Results = weeklyData[6]?.results || [];
    const w8Results = weeklyData[8]?.results || [];

    return {
      stt: index + 1,
      campus: 'DNA',
      department: dept.code,
      isSupported: true,
      week1: calculateForbiddenRate(w1Results, dept.code),
      week2: calculateForbiddenRate(w2Results, dept.code),
      week3: calculateForbiddenRate(w3Results, dept.code),
      week4: calculateForbiddenRate(w4Results, dept.code),
      week5: calculateForbiddenRate(w5Results, dept.code),
      week6: calculateForbiddenRate(w6Results, dept.code),
      week8: calculatePassRate(w8Results, dept.code),
    };
  });

  const totalRow: Table2RowData = {
    stt: 0,
    campus: 'DNA',
    department: 'CB' as DnaDepartmentCode,
    isSupported: true,
    week1: calculateTotalForbiddenRate(weeklyData[1]?.results || []),
    week2: calculateTotalForbiddenRate(weeklyData[2]?.results || []),
    week3: calculateTotalForbiddenRate(weeklyData[3]?.results || []),
    week4: calculateTotalForbiddenRate(weeklyData[4]?.results || []),
    week5: calculateTotalForbiddenRate(weeklyData[5]?.results || []),
    week6: calculateTotalForbiddenRate(weeklyData[6]?.results || []),
    week8: calculateTotalPassRate(weeklyData[8]?.results || []),
  };

  return { rows, totalRow };
}
