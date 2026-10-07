import { DepartmentInfo, DnaDepartmentCode, SemesterConfig } from './types';

export const DEFAULT_SEMESTER_CONFIG: SemesterConfig = {
  semesterName: 'Fall 2026 (FA26)',
  startDate: '2026-09-14',
  endDate: '2027-01-03',
  block1Start: '2026-09-14',
  block1End: '2026-11-01',
  block2Start: '2026-11-02',
  block2End: '2027-01-03',
};

export const DNA_DEPARTMENTS: DepartmentInfo[] = [
  { code: 'Biz', name: 'Kinh doanh & Quản trị', isSupportedAtDna: true, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { code: 'TMĐT', name: 'Thương mại điện tử & Marketing số', isSupportedAtDna: true, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { code: 'CNTT', name: 'Công nghệ thông tin & Mạng máy tính', isSupportedAtDna: true, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { code: 'UDPM', name: 'Ứng dụng phần mềm & Lập trình Web/Mobile', isSupportedAtDna: true, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { code: 'TKĐH', name: 'Thiết kế đồ họa & Mỹ thuật số', isSupportedAtDna: true, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { code: 'DLNHKS', name: 'Du lịch - Nhà hàng - Khách sạn', isSupportedAtDna: true, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { code: 'NN', name: 'Ngôn ngữ (Tiếng Anh, Trung, Hàn)', isSupportedAtDna: true, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { code: 'CB', name: 'Bộ môn Cơ bản & Chính trị - Kỹ năng', isSupportedAtDna: true, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { code: 'Cơ điện', name: 'Cơ điện tử (Không đào tạo tại DNA)', isSupportedAtDna: false, color: 'text-slate-400 bg-slate-50 border-slate-200' },
  { code: 'PKB', name: 'Phổ thông Cao đẳng PKB (Không đào tạo tại DNA)', isSupportedAtDna: false, color: 'text-slate-400 bg-slate-50 border-slate-200' },
];

/**
 * Prefix mapping rules for FPT Polytechnic DNA
 */
export const BUILTIN_PREFIX_MAPPING: { prefix: string; department: DnaDepartmentCode }[] = [
  // Thiết kế đồ họa
  { prefix: 'MUL', department: 'TKĐH' },
  { prefix: 'GD', department: 'TKĐH' },
  { prefix: 'GRA', department: 'TKĐH' },
  { prefix: 'DES', department: 'TKĐH' },
  { prefix: 'PHO', department: 'TKĐH' },
  { prefix: 'ILL', department: 'TKĐH' },
  { prefix: 'VID', department: 'TKĐH' },
  { prefix: 'ANI', department: 'TKĐH' },

  // CNTT / UDPM
  { prefix: 'SOF', department: 'UDPM' },
  { prefix: 'PRO', department: 'UDPM' },
  { prefix: 'MOB', department: 'UDPM' },
  { prefix: 'WEB', department: 'UDPM' },
  { prefix: 'JAV', department: 'UDPM' },
  { prefix: 'CSH', department: 'UDPM' },
  { prefix: 'DOT', department: 'UDPM' },
  { prefix: 'COM', department: 'CNTT' },
  { prefix: 'CRO', department: 'CNTT' },
  { prefix: 'GAM', department: 'CNTT' },
  { prefix: 'NET', department: 'CNTT' },
  { prefix: 'SYB', department: 'CNTT' },
  { prefix: 'IOT', department: 'CNTT' },
  { prefix: 'SEC', department: 'CNTT' },

  // Kinh tế / TMĐT
  { prefix: 'DOM', department: 'TMĐT' },
  { prefix: 'MKT', department: 'TMĐT' },
  { prefix: 'MAR', department: 'TMĐT' },
  { prefix: 'SEO', department: 'TMĐT' },
  { prefix: 'BUS', department: 'Biz' },
  { prefix: 'LOG', department: 'Biz' },
  { prefix: 'FIN', department: 'Biz' },
  { prefix: 'ACC', department: 'Biz' },
  { prefix: 'SAL', department: 'Biz' },
  { prefix: 'ECO', department: 'Biz' },
  { prefix: 'QTK', department: 'Biz' },

  // Du lịch - Nhà hàng - Khách sạn
  { prefix: 'TOU', department: 'DLNHKS' },
  { prefix: 'HOT', department: 'DLNHKS' },
  { prefix: 'RES', department: 'DLNHKS' },
  { prefix: 'CUL', department: 'DLNHKS' },
  { prefix: 'BAR', department: 'DLNHKS' },
  { prefix: 'GUI', department: 'DLNHKS' },

  // Ngôn ngữ
  { prefix: 'ENT', department: 'NN' },
  { prefix: 'ENG', department: 'NN' },
  { prefix: 'CHN', department: 'NN' },
  { prefix: 'KOR', department: 'NN' },
  { prefix: 'JPN', department: 'NN' },

  // Cơ bản
  { prefix: 'VIE', department: 'CB' },
  { prefix: 'TRI', department: 'CB' },
  { prefix: 'PHAP', department: 'CB' },
  { prefix: 'KYN', department: 'CB' },
  { prefix: 'GDTC', department: 'CB' },
  { prefix: 'VOV', department: 'CB' },
  { prefix: 'POL', department: 'CB' },
  { prefix: 'LAW', department: 'CB' },
  { prefix: 'SKI', department: 'CB' },
  { prefix: 'LEA', department: 'CB' },
  { prefix: 'MAT', department: 'CB' },
];

/**
 * Standard department name normalizer
 */
export function normalizeDepartmentName(deptRaw: string): DnaDepartmentCode {
  if (!deptRaw) return 'CB';
  const clean = deptRaw.trim().toUpperCase();

  if (clean.includes('KINH TẾ') || clean.includes('BIZ') || clean.includes('BUSINESS') || clean.includes('QUẢN TRỊ')) {
    return 'Biz';
  }
  if (clean.includes('THƯƠNG MẠI') || clean.includes('TMĐT') || clean.includes('E-COMMERCE') || clean.includes('MARKETING')) {
    return 'TMĐT';
  }
  if (clean.includes('ỨNG DỤNG PHẦN MỀM') || clean.includes('UDPM') || clean.includes('PHẦN MỀM')) {
    return 'UDPM';
  }
  if (clean.includes('CÔNG NGHỆ THÔNG TIN') || clean.includes('CNTT') || clean.includes('IT')) {
    return 'CNTT';
  }
  if (clean.includes('ĐỒ HỌA') || clean.includes('TKĐH') || clean.includes('MỸ THUẬT')) {
    return 'TKĐH';
  }
  if (clean.includes('DU LỊCH') || clean.includes('KHÁCH SẠN') || clean.includes('DLNHKS') || clean.includes('NHÀ HÀNG')) {
    return 'DLNHKS';
  }
  if (clean.includes('NGÔN NGỮ') || clean.includes('TIẾNG') || clean.includes('NN') || clean.includes('ENGLISH')) {
    return 'NN';
  }
  if (clean.includes('CƠ BẢN') || clean.includes('CB') || clean.includes('CHÍNH TRỊ') || clean.includes('KỸ NĂNG')) {
    return 'CB';
  }
  if (clean.includes('CƠ ĐIỆN') || clean.includes('CƠ KHÍ')) {
    return 'Cơ điện';
  }
  if (clean.includes('PKB') || clean.includes('PHỔ THÔNG')) {
    return 'PKB';
  }

  return 'CB';
}

export const WEEK_SLOTS = [1, 2, 3, 4, 5, 6, 8] as const;
