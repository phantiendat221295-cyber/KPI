import React, { useState } from 'react';
import {
  X,
  Calendar,
  Check,
  RotateCcw,
  AlertTriangle,
  Cloud,
  Copy,
  Code2,
  CheckCheck,
  RefreshCw,
  Globe,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SemesterConfig } from '../types';
import { DEFAULT_SEMESTER_CONFIG } from '../constants';
import { SAMPLE_APPS_SCRIPT_CODE } from '../utils/cloudSync';

interface ConfigModalProps {
  isOpen: boolean;
  config: SemesterConfig;
  appsScriptUrl: string;
  onSave: (newConfig: SemesterConfig, newUrl: string) => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  appsScriptUrl,
  onSave,
  onTestConnection,
  onClose,
}) => {
  const [form, setForm] = useState<SemesterConfig>({ ...config });
  const [url, setUrl] = useState<string>(appsScriptUrl || '');
  const [activeTab, setActiveTab] = useState<'time' | 'cloud' | 'script'>('cloud');
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setForm({ ...DEFAULT_SEMESTER_CONFIG });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập Google Apps Script Web App URL trước khi kiểm tra.',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await onTestConnection(url.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-100 text-[#0066B3] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Cấu hình Mốc kỳ, Block &amp; Kết nối Cloud Google Sheets
              </h3>
              <p className="text-[11px] text-gray-500">
                FPT Polytechnic Đồng Nai (DNA) • Dùng duy nhất link https://kpi-daotao-dna.vercel.app/
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-200 px-5 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Đồng bộ Cloud Google Sheets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('time')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'time'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mốc kỳ &amp; Block</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã nguồn Code.gs mẫu</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: CLOUD GOOGLE SHEETS */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-md border border-blue-200 text-blue-900 leading-relaxed text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Globe className="w-3.5 h-3.5 text-[#0066B3]" />
                  Cơ chế hoạt động dùng duy nhất 1 link: https://kpi-daotao-dna.vercel.app/
                </div>
                <p>
                  Khi Cán bộ Đào tạo tải file và bấm <strong>&quot;Đồng bộ lên Cloud&quot;</strong>, dữ liệu được ghi vào Google Sheets. Khi bất kỳ ai ở bất kỳ máy tính hay điện thoại nào truy cập vào <code>https://kpi-daotao-dna.vercel.app/</code>, trang web sẽ tự động kết nối và hiển thị số liệu mới nhất!
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Google Apps Script Web App API URL (kết thúc bằng <code>/exec</code>):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0066B3] text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-3.5 py-2 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {isTesting ? <RefreshCw className="w-3 h-3 animate-spin text-[#0066B3]" /> : null}
                    Kiểm tra kết nối
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-md text-xs leading-relaxed border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                >
                  <span className="font-semibold block mb-0.5">
                    {testResult.success ? '✅ Trạng thái kết nối:' : '⚠️ Thông báo:'}
                  </span>
                  {testResult.message}
                </div>
              )}

              {/* Hướng dẫn đồng bộ cho tất cả mọi người */}
              <div className="p-3.5 rounded-md border border-gray-200 bg-gray-50 space-y-2 text-[11px] text-gray-700">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-[#0066B3]" />
                  Cách để MỌI NGƯỜI truy cập link kpi-daotao-dna.vercel.app đều thấy dữ liệu:
                </span>
                <p>
                  Khi bạn lưu URL ở ô trên, URL được lưu vào trình duyệt hiện tại của bạn. Để <strong>mọi thiết bị khác của đồng nghiệp và Ban đào tạo</strong> tự động kết nối mà không cần cài đặt lại:
                </p>
                <div className="bg-white p-2.5 rounded border border-gray-200 space-y-1.5">
                  <div className="font-semibold text-[#0066B3]">
                    Cách 1 (Khuyên dùng - Cài đặt 1 lần trên Vercel):
                  </div>
                  <ol className="list-decimal list-inside pl-1 space-y-0.5 text-gray-600">
                    <li>Vào trang quản trị Vercel của dự án: <code>vercel.com</code></li>
                    <li>Vào mục <strong>Settings</strong> → <strong>Environment Variables</strong></li>
                    <li>Thêm biến tên: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-900 font-bold">VITE_APPS_SCRIPT_URL</code></li>
                    <li>Giá trị: Dán link Web App của bạn (dạng <code>https://script.google.com/macros/s/.../exec</code>)</li>
                    <li>Bấm Save và Redeploy. Từ lúc đó, mọi máy tính mở <code>https://kpi-daotao-dna.vercel.app/</code> đều tự động có dữ liệu!</li>
                  </ol>
                </div>

                <div className="bg-white p-2.5 rounded border border-gray-200 space-y-1.5">
                  <div className="font-semibold text-[#0066B3]">
                    Cách 2 (Cập nhật thẳng vào file constants.ts):
                  </div>
                  <p className="text-gray-600">
                    Mở file <code>src/constants.ts</code>, dán URL vào biến <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-gray-900 font-bold">DEFAULT_APPS_SCRIPT_URL</code> rồi push code lên GitHub.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MỐC KỲ & BLOCK */}
          {activeTab === 'time' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên kỳ học</label>
                <input
                  type="text"
                  value={form.semesterName}
                  onChange={(e) => setForm({ ...form, semesterName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066B3] font-medium text-gray-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-2.5 bg-gray-50 rounded-md border border-gray-200">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Bắt đầu toàn kỳ</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">Kết thúc toàn kỳ</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Block 1 */}
              <div className="p-2.5 bg-emerald-50/40 rounded-md border border-emerald-200 space-y-1.5">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Block 1
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={form.block1Start}
                      onChange={(e) => setForm({ ...form, block1Start: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={form.block1End}
                      onChange={(e) => setForm({ ...form, block1End: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Block 2 */}
              <div className="p-2.5 bg-blue-50/40 rounded-md border border-blue-200 space-y-1.5">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Block 2
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={form.block2Start}
                      onChange={(e) => setForm({ ...form, block2Start: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={form.block2End}
                      onChange={(e) => setForm({ ...form, block2End: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 text-[11px] text-gray-600">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Hệ thống tự động căn cứ cột <strong>Ngày bắt đầu</strong> trong file phân lớp để phân vào Block 1 hoặc Block 2.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: CODE.GS MẪU */}
          {activeTab === 'script' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 text-xs">
                  Mã nguồn Google Apps Script (dán vào Code.gs):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0066B3] hover:bg-[#005291] text-white text-xs font-medium transition-colors"
                >
                  {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Đã sao chép!' : 'Sao chép mã'}
                </button>
              </div>

              <pre className="p-3 rounded bg-gray-900 text-gray-200 font-mono text-[11px] max-h-60 overflow-y-auto leading-relaxed select-all">
                {SAMPLE_APPS_SCRIPT_CODE}
              </pre>

              <div className="text-[11px] text-gray-600 space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
                <p className="font-bold text-gray-800">4 bước triển khai chuẩn xác:</p>
                <p>1. Mở file Google Sheets mới trên Google Drive.</p>
                <p>2. Chọn <strong>Tiện ích mở rộng (Extensions)</strong> → <strong>Apps Script</strong> → Xóa hết code cũ, dán đoạn mã trên → Nhấn Lưu (Ctrl+S).</p>
                <p>3. Nhấn nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải → Chọn <strong>Triển khai mới (New deployment)</strong> → Loại: <strong>Ứng dụng web (Web app)</strong>.</p>
                <p>4. Cấu hình: Thực thi dưới dạng <strong>&quot;Tôi&quot; (Me)</strong>, Ai có quyền truy cập: <strong className="text-red-600 font-bold">&quot;Bất kỳ ai&quot; (Anyone)</strong> → Bấm Triển khai và sao chép URL kết thúc bằng <code>/exec</code>.</p>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại ngày
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-[#0066B3] hover:bg-[#005291] text-white font-medium shadow-2xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Lưu cấu hình
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
