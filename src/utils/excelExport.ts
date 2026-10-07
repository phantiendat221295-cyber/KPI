import * as XLSX from 'xlsx';
import { SemesterConfig, Table1RowData, Table2RowData } from '../types';

function formatPercent(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return `${val.toFixed(1)}%`;
}

function formatCount(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('vi-VN');
}

/**
 * Export Table 1 and Table 2 (Block 1 & Block 2) into a structured Excel workbook
 * compliant with FPT Polytechnic Dong Nai (DNA) standards
 */
export function exportOkrReportToExcel(
  config: SemesterConfig,
  table1Rows: Table1RowData[],
  table1Total: Table1RowData,
  table2B1Rows: Table2RowData[],
  table2B1Total: Table2RowData,
  table2B2Rows: Table2RowData[],
  table2B2Total: Table2RowData
) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: BẢNG 1 - TỔNG HỢP HỌC KỲ (FA26, BLOCK 1, BLOCK 2)
  // ==========================================
  const sheet1Data: any[][] = [
    ['FPT POLYTECHNIC ĐỒNG NAI (DNA) - BÁO CÁO THỐNG KÊ ĐÀO TẠO & OKR HỌC KỲ'],
    [`Kỳ học: ${config.semesterName} | Thời gian: ${config.startDate} đến ${config.endDate}`],
    [`Block 1: ${config.block1Start} đến ${config.block1End} | Block 2: ${config.block2Start} đến ${config.block2End}`],
    [],
    [
      'STT',
      'CS',
      'Bộ môn',
      // Nhóm FA26
      'Số lượt SV (FA26)',
      '% Lượt SV (FA26)',
      'Pass % (FA26)',
      'SL Cấm thi (FA26)',
      'Tỷ lệ cấm thi % (FA26)',
      // Nhóm Block 1
      'Số lượt SV (Block 1)',
      '% Lượt SV (Block 1)',
      'Pass % (Block 1)',
      'SL Cấm thi (Block 1)',
      'Tỷ lệ cấm thi % (Block 1)',
      // Nhóm Block 2
      'Số lượt SV (Block 2)',
      '% Lượt SV (Block 2)',
      'Pass % (Block 2)',
      'SL Cấm thi (Block 2)',
      'Tỷ lệ cấm thi % (Block 2)',
    ],
  ];

  table1Rows.forEach((row) => {
    if (!row.isSupported) {
      sheet1Data.push([
        row.stt,
        row.campus,
        row.department,
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
      ]);
    } else {
      sheet1Data.push([
        row.stt,
        row.campus,
        row.department,
        row.allCount,
        formatPercent(row.allPercentage),
        formatPercent(row.allPassRate),
        formatCount(row.allForbiddenCount),
        formatPercent(row.allForbiddenRate),
        row.b1Count,
        formatPercent(row.b1Percentage),
        formatPercent(row.b1PassRate),
        formatCount(row.b1ForbiddenCount),
        formatPercent(row.b1ForbiddenRate),
        row.b2Count,
        formatPercent(row.b2Percentage),
        formatPercent(row.b2PassRate),
        formatCount(row.b2ForbiddenCount),
        formatPercent(row.b2ForbiddenRate),
      ]);
    }
  });

  // Total row
  sheet1Data.push([
    '',
    'DNA',
    'Tổng cơ sở',
    table1Total.allCount,
    formatPercent(table1Total.allPercentage),
    formatPercent(table1Total.allPassRate),
    formatCount(table1Total.allForbiddenCount),
    formatPercent(table1Total.allForbiddenRate),
    table1Total.b1Count,
    formatPercent(table1Total.b1Percentage),
    formatPercent(table1Total.b1PassRate),
    formatCount(table1Total.b1ForbiddenCount),
    formatPercent(table1Total.b1ForbiddenRate),
    table1Total.b2Count,
    formatPercent(table1Total.b2Percentage),
    formatPercent(table1Total.b2PassRate),
    formatCount(table1Total.b2ForbiddenCount),
    formatPercent(table1Total.b2ForbiddenRate),
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 8 },
    { wch: 16 },
    // FA26
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    // Block 1
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    // Block 2
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Bang 1 - Tong Hop FA26');

  // ==========================================
  // SHEET 2: BẢNG 2 - REVIEW TIẾN ĐỘ OKR BLOCK 1
  // ==========================================
  const sheet2Data: any[][] = [
    ['FPT POLYTECHNIC ĐỒNG NAI (DNA) - REVIEW TIẾN ĐỘ OKR HÀNG TUẦN BLOCK 1'],
    [`Thời gian: ${config.block1Start} đến ${config.block1End}`],
    [],
    [
      'STT',
      'CS',
      'Bộ môn',
      'Tuần 8 - Pass (%)',
      'Tuần 1 (SL Cấm)',
      'Tuần 1 (% Cấm)',
      'Tuần 2 (SL Cấm)',
      'Tuần 2 (% Cấm)',
      'Tuần 3 (SL Cấm)',
      'Tuần 3 (% Cấm)',
      'Tuần 4 (SL Cấm)',
      'Tuần 4 (% Cấm)',
      'Tuần 5 (SL Cấm)',
      'Tuần 5 (% Cấm)',
      'Tuần 6 (SL Cấm)',
      'Tuần 6 (% Cấm)',
    ],
  ];

  table2B1Rows.forEach((row) => {
    if (!row.isSupported) {
      sheet2Data.push([row.stt, row.campus, row.department, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    } else {
      sheet2Data.push([
        row.stt,
        row.campus,
        row.department,
        formatPercent(row.week8PassRate),
        formatCount(row.week1Count),
        formatPercent(row.week1Rate),
        formatCount(row.week2Count),
        formatPercent(row.week2Rate),
        formatCount(row.week3Count),
        formatPercent(row.week3Rate),
        formatCount(row.week4Count),
        formatPercent(row.week4Rate),
        formatCount(row.week5Count),
        formatPercent(row.week5Rate),
        formatCount(row.week6Count),
        formatPercent(row.week6Rate),
      ]);
    }
  });

  sheet2Data.push([
    '',
    'DNA',
    'Tổng cơ sở',
    formatPercent(table2B1Total.week8PassRate),
    formatCount(table2B1Total.week1Count),
    formatPercent(table2B1Total.week1Rate),
    formatCount(table2B1Total.week2Count),
    formatPercent(table2B1Total.week2Rate),
    formatCount(table2B1Total.week3Count),
    formatPercent(table2B1Total.week3Rate),
    formatCount(table2B1Total.week4Count),
    formatPercent(table2B1Total.week4Rate),
    formatCount(table2B1Total.week5Count),
    formatPercent(table2B1Total.week5Rate),
    formatCount(table2B1Total.week6Count),
    formatPercent(table2B1Total.week6Rate),
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Bang 2 - OKR Block 1');

  // ==========================================
  // SHEET 3: BẢNG 2 - REVIEW TIẾN ĐỘ OKR BLOCK 2
  // ==========================================
  const sheet3Data: any[][] = [
    ['FPT POLYTECHNIC ĐỒNG NAI (DNA) - REVIEW TIẾN ĐỘ OKR HÀNG TUẦN BLOCK 2'],
    [`Thời gian: ${config.block2Start} đến ${config.block2End}`],
    [],
    [
      'STT',
      'CS',
      'Bộ môn',
      'Tuần 8 - Pass (%)',
      'Tuần 1 (SL Cấm)',
      'Tuần 1 (% Cấm)',
      'Tuần 2 (SL Cấm)',
      'Tuần 2 (% Cấm)',
      'Tuần 3 (SL Cấm)',
      'Tuần 3 (% Cấm)',
      'Tuần 4 (SL Cấm)',
      'Tuần 4 (% Cấm)',
      'Tuần 5 (SL Cấm)',
      'Tuần 5 (% Cấm)',
      'Tuần 6 (SL Cấm)',
      'Tuần 6 (% Cấm)',
    ],
  ];

  table2B2Rows.forEach((row) => {
    if (!row.isSupported) {
      sheet3Data.push([row.stt, row.campus, row.department, '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']);
    } else {
      sheet3Data.push([
        row.stt,
        row.campus,
        row.department,
        formatPercent(row.week8PassRate),
        formatCount(row.week1Count),
        formatPercent(row.week1Rate),
        formatCount(row.week2Count),
        formatPercent(row.week2Rate),
        formatCount(row.week3Count),
        formatPercent(row.week3Rate),
        formatCount(row.week4Count),
        formatPercent(row.week4Rate),
        formatCount(row.week5Count),
        formatPercent(row.week5Rate),
        formatCount(row.week6Count),
        formatPercent(row.week6Rate),
      ]);
    }
  });

  sheet3Data.push([
    '',
    'DNA',
    'Tổng cơ sở',
    formatPercent(table2B2Total.week8PassRate),
    formatCount(table2B2Total.week1Count),
    formatPercent(table2B2Total.week1Rate),
    formatCount(table2B2Total.week2Count),
    formatPercent(table2B2Total.week2Rate),
    formatCount(table2B2Total.week3Count),
    formatPercent(table2B2Total.week3Rate),
    formatCount(table2B2Total.week4Count),
    formatPercent(table2B2Total.week4Rate),
    formatCount(table2B2Total.week5Count),
    formatPercent(table2B2Total.week5Rate),
    formatCount(table2B2Total.week6Count),
    formatPercent(table2B2Total.week6Rate),
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 6 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Bang 2 - OKR Block 2');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Bao_Cao_OKR_DNA_${config.semesterName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`);
}

/**
 * Helper to download sample blank template CSV/Excel files for testing
 */
export function downloadSampleTemplate(type: 'mon_bomon' | 'danh_sach_lop' | 'export_tuan') {
  const wb = XLSX.utils.book_new();

  if (type === 'mon_bomon') {
    const data = [
      ['Mã môn', 'Tên môn', 'Bộ môn'],
      ['MUL101', 'Thiết kế đồ họa cơ bản', 'TKĐH'],
      ['GD102', 'Nhiếp ảnh số', 'TKĐH'],
      ['SOF203', 'Lập trình Java 3', 'UDPM'],
      ['WEB101', 'Thiết kế Web cơ bản', 'UDPM'],
      ['COM108', 'Cơ sở dữ liệu', 'CNTT'],
      ['NET104', 'Quản trị mạng', 'CNTT'],
      ['BUS101', 'Kinh tế vi mô', 'Biz'],
      ['MAR201', 'Marketing căn bản', 'Biz'],
      ['DOM101', 'Thương mại điện tử cơ bản', 'TMĐT'],
      ['TOU101', 'Tổng quan du lịch', 'DLNHKS'],
      ['ENT1125', 'Tiếng Anh chuyên ngành', 'NN'],
      ['VIE101', 'Chính trị', 'CB'],
      ['TRI102', 'Triết học', 'CB'],
      ['GDTC', 'Giáo dục thể chất', 'CB'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'DanhMuc');
    XLSX.writeFile(wb, 'Mau_Mon_Bo_Mon.xlsx');
  } else if (type === 'danh_sach_lop') {
    const data = [
      ['Mã SV', 'Họ tên', 'Mã môn', 'Lớp', 'Ngày bắt đầu'],
      ['PS0001', 'Nguyễn Văn A', 'MUL101', 'TK19301', '14/09/2026'],
      ['PS0002', 'Trần Thị B', 'SOF203', 'WD19301', '14/09/2026'],
      ['PS0003', 'Lê Hoàng C', 'BUS101', 'QT19301', '14/09/2026'],
      ['PS0004', 'Phạm Minh D', 'COM108', 'IT19301', '14/09/2026'],
      ['PS0005', 'Võ Thị E', 'TOU101', 'KS19301', '02/11/2026'],
      ['PS0006', 'Đặng Tuấn F', 'ENT1125', 'NN19301', '02/11/2026'],
      ['PS0007', 'Ngô Quốc G', 'VIE101', 'CB19301', '02/11/2026'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'Mau_danh_sach_lop_mon.csv');
  } else {
    const data = [
      ['Mã SV', 'Họ tên', 'Mã môn', 'Lớp', 'Trạng thái', 'Ngày đầu'],
      ['PS0001', 'Nguyễn Văn A', 'MUL101', 'TK19301', 'Passing', '14/09/2026'],
      ['PS0002', 'Trần Thị B', 'SOF203', 'WD19301', 'Attendance Failed', '14/09/2026'],
      ['PS0003', 'Lê Hoàng C', 'BUS101', 'QT19301', 'On-going Assessment Fail', '14/09/2026'],
      ['PS0004', 'Phạm Minh D', 'COM108', 'IT19301', 'Studying', '14/09/2026'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'KetQua');
    XLSX.writeFile(wb, 'Mau_export_tuan.csv');
  }
}
