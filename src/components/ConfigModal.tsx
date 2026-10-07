import React, { useState } from 'react';
import { X, Calendar, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { SemesterConfig } from '../types';
import { DEFAULT_SEMESTER_CONFIG } from '../constants';

interface ConfigModalProps {
  isOpen: boolean;
  config: SemesterConfig;
  onSave: (newConfig: SemesterConfig) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<SemesterConfig>({ ...config });

  if (!isOpen) return null;

  const handleReset = () => {
    setForm({ ...DEFAULT_SEMESTER_CONFIG });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0066B3] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cấu hình Mốc kỳ & Phân chia Block
              </h3>
              <p className="text-[11px] text-slate-500">
                Thiết lập thời gian để tự động phân lớp vào Block 1 và Block 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Tên kỳ */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên kỳ học</label>
            <input
              type="text"
              value={form.semesterName}
              onChange={(e) => setForm({ ...form, semesterName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3] font-semibold text-slate-800"
              required
            />
          </div>

          {/* Toàn kỳ */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Bắt đầu toàn kỳ
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Kết thúc toàn kỳ
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Block 1 */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
            <span className="font-bold text-[#F37021] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F37021]" />
              Block 1
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={form.block1Start}
                  onChange={(e) => setForm({ ...form, block1Start: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={form.block1End}
                  onChange={(e) => setForm({ ...form, block1End: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Block 2 */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/60 space-y-2">
            <span className="font-bold text-indigo-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Block 2
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={form.block2Start}
                  onChange={(e) => setForm({ ...form, block2Start: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={form.block2End}
                  onChange={(e) => setForm({ ...form, block2End: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 text-[11px] text-blue-800">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Quy tắc gán: Ngày bắt đầu từ <strong>{form.block1Start}</strong> đến <strong>{form.block1End}</strong> sẽ thuộc Block 1. Từ <strong>{form.block2Start}</strong> đến <strong>{form.block2End}</strong> sẽ thuộc Block 2.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục mặc định
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#0066B3] hover:bg-[#005291] text-white font-bold shadow-sm transition-all"
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
