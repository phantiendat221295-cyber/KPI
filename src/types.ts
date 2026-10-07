/**
 * FPT Polytechnic DNA - Training & OKR Management Types
 */

export type BlockType = 'B1' | 'B2';

export interface SemesterConfig {
  semesterName: string; // e.g. Fall 2026 (FA26)
  startDate: string;    // YYYY-MM-DD e.g. 2026-09-14
  endDate: string;      // YYYY-MM-DD e.g. 2027-01-03
  block1Start: string;  // 2026-09-14
  block1End: string;    // 2026-11-01
  block2Start: string;  // 2026-11-02
  block2End: string;    // 2027-01-03
}

export type DnaDepartmentCode =
  | 'Biz'
  | 'TMĐT'
  | 'CNTT'
  | 'UDPM'
  | 'TKĐH'
  | 'DLNHKS'
  | 'NN'
  | 'CB'
  | 'Cơ điện'
  | 'PKB';

export interface DepartmentInfo {
  code: DnaDepartmentCode;
  name: string;
  isSupportedAtDna: boolean; // true for Biz, TMĐT, CNTT, UDPM, TKĐH, DLNHKS, NN, CB; false for Cơ điện, PKB
  color: string;
}

export interface SubjectMapping {
  subjectCode: string;
  subjectName?: string;
  departmentCode: DnaDepartmentCode;
  isCustom?: boolean;
}

export interface StudentEnrollmentRow {
  studentCode: string;
  studentName?: string;
  subjectCode: string;
  classCode: string;
  startDate?: string;
  block: BlockType;
  department: DnaDepartmentCode;
  rawRow?: Record<string, any>;
}

export interface StudentResultRow {
  studentCode: string;
  studentName?: string;
  subjectCode: string;
  classCode?: string;
  status: string;
  isAttendanceFailed: boolean;
  isOngoingAssessmentFail: boolean;
  isForbiddenExam: boolean; // Attendance Failed OR On-going Assessment Fail
  isPassed: boolean;       // Not Failed / Passing
  department: DnaDepartmentCode;
  block?: BlockType;
  startDate?: string;
  rawRow?: Record<string, any>;
}

export interface WeeklyUploadRecord {
  weekNumber: number; // 1, 2, 3, 4, 5, 6, 8
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  rowCount: number;
  results: StudentResultRow[];
}

export interface BlockWeeklyData {
  [weekNumber: number]: WeeklyUploadRecord | undefined;
}

export interface Table1RowData {
  stt: number;
  campus: string; // 'DNA'
  department: DnaDepartmentCode;
  isSupported: boolean;
  // Toàn kỳ FA26
  allCount: number;
  allPercentage: number;
  allForbiddenRate: number | null;
  allPassRate: number | null;
  // Block 1
  b1Count: number;
  b1Percentage: number;
  b1ForbiddenRate: number | null;
  b1PassRate: number | null;
  // Block 2
  b2Count: number;
  b2Percentage: number;
  b2ForbiddenRate: number | null;
  b2PassRate: number | null;
}

export interface Table2RowData {
  stt: number;
  campus: string; // 'DNA'
  department: DnaDepartmentCode;
  isSupported: boolean;
  // Tuần 1 -> 6 (Tỷ lệ cấm thi %)
  week1: number | null;
  week2: number | null;
  week3: number | null;
  week4: number | null;
  week5: number | null;
  week6: number | null;
  // Tuần 8 (Tỷ lệ Pass %)
  week8: number | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
