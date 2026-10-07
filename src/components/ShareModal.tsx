import React, { useState } from 'react';
import { X, Share2, Copy, CheckCheck, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  appsScriptUrl: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  appsScriptUrl,
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Generate complete public URL with embedded API & viewer role
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const shareableUrl = `${origin}${pathname}?api=${encodeURIComponent(appsScriptUrl)}&role=viewer`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Chia sẻ Liên kết Xem Báo cáo Trực tuyến
              </h3>
              <p className="text-[11px] text-gray-500">
                Dành cho Giảng viên &amp; Cán bộ quản lý cơ sở Đồng Nai (DNA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {appsScriptUrl ? (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-[11px] leading-relaxed">
                <strong>Liên kết chia sẻ tự động:</strong> Đường link này đã được nhúng sẵn thông số kết nối Google Sheets và chế độ xem (Viewer). Bất kỳ ai mở link cũng sẽ <strong>thấy ngay dữ liệu mới nhất</strong> từ trang tính mà không cần cấu hình gì thêm!
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Đường dẫn công khai (Public Link):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded font-mono text-[11px] text-gray-800 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded bg-[#0066B3] hover:bg-[#005291] text-white font-medium transition-colors shrink-0 flex items-center gap-1"
                  >
                    {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Đã chép!' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-600 space-y-1.5 text-[11px]">
                <span className="font-bold text-gray-800 block">Ưu điểm:</span>
                <p>• Người nhận link mở trên máy tính hoặc điện thoại đều xem được đầy đủ Bảng 1 &amp; Bảng 2.</p>
                <p>• Tự động cập nhật mỗi khi Cán bộ Đào tạo bấm &quot;Đồng bộ lên Cloud&quot;.</p>
                <p>• Người nhận có thể tra cứu nhanh bộ môn và xuất file Excel đối chiếu.</p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <a
                  href={shareableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#0066B3] hover:underline font-medium text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở thử nghiệm trong tab mới
                </a>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </>
          ) : (
            <div className="py-4 text-center space-y-3">
              <Globe className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-gray-700 font-medium">
                Bạn chưa cấu hình Google Apps Script Web App API URL.
              </p>
              <p className="text-gray-500 text-[11px]">
                Vui lòng nhập API URL trong phần <strong>Cấu hình Mốc kỳ &amp; Cloud</strong> trước khi tạo link chia sẻ.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-[#0066B3] text-white font-medium"
              >
                Đã hiểu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
