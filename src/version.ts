/** Phiên bản ứng dụng (lấy từ package.json lúc build) */
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;

export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
export const BUILD_TIME: string = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString();

export function formatBuildTime(iso: string = BUILD_TIME): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Nhật ký thay đổi hiển thị trong mục "Có gì mới" */
export const CHANGELOG: { version: string; date: string; items: string[] }[] = [
  {
    version: '2.0.0',
    date: '18/11/2026',
    items: [
      'Tự động lưu lên Google Sheets ngay khi nạp / xóa file, không cần bấm đồng bộ tay.',
      'Tách đúng lượt học Block 1 / Block 2 theo cột "Block" của export.csv (trước đây cả file bị tính vào một block).',
      'Loại lớp thi thử (TL_EOS test…) khỏi thống kê.',
      'Lượt "Studying" đã hết môn mà điểm < 5 được tính là thi trượt, khớp với Hệ thống Phổ điểm.',
      'Thêm cột SL Đạt, SL / Tỷ lệ cấm thi do trượt điểm danh.',
      'Thêm favicon, thông tin phiên bản ở chân trang.',
    ],
  },
  {
    version: '1.0.0',
    date: '09/2026',
    items: ['Phiên bản đầu: Bảng 1 tổng quan học kỳ, Bảng 2 theo tuần, xuất Excel.'],
  },
];
