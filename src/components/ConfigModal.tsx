import React, { useState } from 'react';
import {
  X,
  Calendar,
  Check,
  RotateCcw,
  AlertTriangle,
  Cloud,
  Copy,
  ExternalLink,
  Code2,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';
import { SemesterConfig } from '../types';
import { DEFAULT_SEMESTER_CONFIG } from '../constants';
import { SAMPLE_APPS_SCRIPT_CODE } from '../utils/cloudSync';

interface ConfigModalProps {
  isOpen: boolean;
  config: SemesterConfig;
  appsScriptUrl: string;
  onSave: (newConfig: SemesterConfig, newUrl: string) => void;
  onTestConnection: (url: string) => Promise<boolean>;
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
  const [activeTab, setActiveTab] = useState<'time' | 'cloud' | 'script'>('time');
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

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
      setTestResult('Vui lòng nhập URL trước khi kiểm tra.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const ok = await onTestConnection(url.trim());
    setIsTesting(false);
    if (ok) {
      setTestResult('✅ Kết nối thành công! Google Apps Script Web App sẵn sàng.');
    } else {
      setTestResult('⚠️ Không thể kết nối hoặc chưa có dữ liệu. Hãy kiểm tra URL và quyền Anyone.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-100 text-[#0066B3] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Cấu hình Mốc kỳ, Block &amp; Đồng bộ Cloud Google Sheets
              </h3>
              <p className="text-[11px] text-gray-500">
                FPT Polytechnic Đồng Nai (DNA)
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

        {/* Tab switch */}
        <div className="flex items-center border-b border-gray-200 px-5 bg-white text-xs font-semibold">
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
            onClick={() => setActiveTab('cloud')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Google Apps Script API</span>
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
          {activeTab === 'time' && (
            <div className="space-y-3.5">
              {/* Tên kỳ */}
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

              {/* Toàn kỳ */}
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-gray-50 rounded-md border border-gray-200">
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Bắt đầu toàn kỳ
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-600 mb-1">
                    Kết thúc toàn kỳ
                  </label>
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
                  Hệ thống tự động căn cứ cột <strong>Ngày bắt đầu</strong> trong file phân lớp để chia vào Block 1 hoặc Block 2.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50/60 rounded-md border border-blue-200 text-blue-900 leading-relaxed text-[11px]">
                <strong>Đồng bộ trực tuyến Google Sheets:</strong> Nhập URL Google Apps Script Web App của bạn để tự động đọc dữ liệu khi mở trang và đồng bộ dữ liệu chỉ với 1 click.
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Google Apps Script Web App API URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0066B3] text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors shrink-0 flex items-center gap-1"
                  >
                    {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    Kiểm tra
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  * URL được lưu an toàn vào trình duyệt của bạn (LocalStorage).
                </p>
              </div>

              {testResult && (
                <div className="p-2 rounded bg-gray-100 text-xs font-medium text-gray-700">
                  {testResult}
                </div>
              )}

              <div className="p-3 rounded-md border border-gray-200 bg-gray-50 space-y-1.5 text-[11px] text-gray-600">
                <span className="font-bold text-gray-800 block">Cơ chế hoạt động:</span>
                <p>• <strong>Khi mở trang:</strong> WebApp tự động GET dữ liệu mới nhất từ Google Sheets đổ vào bảng.</p>
                <p>• <strong>Khi cán bộ tải file:</strong> Bấm nút &quot;Đồng bộ lên Cloud&quot; để lưu toàn bộ dữ liệu lên Google Sheets.</p>
                <p>• <strong>Người khác vào xem link:</strong> Xem ngay số liệu mới nhất mà không cần tải lại file.</p>
              </div>
            </div>
          )}

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

              <div className="text-[11px] text-gray-500 space-y-1">
                <p><strong>3 bước triển khai nhanh:</strong></p>
                <p>1. Mở Google Sheet → Tiện ích mở rộng → Apps Script → Dán mã trên.</p>
                <p>2. Triển khai (Deploy) → Ứng dụng web (Web app) → Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong>.</p>
                <p>3. Sao chép URL Web App dạng <code>.../exec</code> và dán vào tab Google Apps Script API.</p>
              </div>
            </div>
          )}

          {/* Actions */}
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
