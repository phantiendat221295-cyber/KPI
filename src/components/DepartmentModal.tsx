import React, { useState } from 'react';
import { X, BookOpen, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { DNA_DEPARTMENTS, BUILTIN_PREFIX_MAPPING } from '../constants';
import { DnaDepartmentCode, SubjectMapping } from '../types';

interface DepartmentModalProps {
  isOpen: boolean;
  customMappings: Record<string, DnaDepartmentCode>;
  onAddOrUpdateMapping: (subjectCode: string, department: DnaDepartmentCode) => void;
  onRemoveMapping: (subjectCode: string) => void;
  onClose: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  customMappings,
  onAddOrUpdateMapping,
  onRemoveMapping,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDept, setNewDept] = useState<DnaDepartmentCode>('CNTT');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    onAddOrUpdateMapping(newCode.trim().toUpperCase(), newDept);
    setNewCode('');
  };

  const customKeys = Object.keys(customMappings);
  const filteredBuiltin = BUILTIN_PREFIX_MAPPING.filter(
    (rule) =>
      rule.prefix.toLowerCase().includes(search.toLowerCase()) ||
      rule.department.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCustom = customKeys.filter(
    (key) =>
      key.toLowerCase().includes(search.toLowerCase()) ||
      customMappings[key].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Danh mục Bộ môn & Từ điển Ánh xạ Mã môn (DNA)
              </h3>
              <p className="text-[11px] text-slate-500">
                Quy tắc nhận diện Bộ môn chuẩn hóa theo cơ sở FPT Polytechnic Đồng Nai
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

        {/* Search & Add mapping */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tra cứu tiền tố hoặc bộ môn (MUL, COM, TKĐH, Biz...)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3]"
              />
            </div>
          </div>

          {/* Quick add custom rule */}
          <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Thêm mã môn (VD: PRO201, JAV102...)"
              className="w-48 px-2.5 py-1.5 border border-slate-200 rounded-lg uppercase font-mono font-semibold text-slate-800"
            />
            <select
              value={newDept}
              onChange={(e) => setNewDept(e.target.value as DnaDepartmentCode)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-700 bg-white"
            >
              {DNA_DEPARTMENTS.filter((d) => d.isSupportedAtDna).map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0066B3] hover:bg-[#005291] text-white font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </form>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Custom Mappings (if any) */}
          {customKeys.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Ánh xạ tùy chỉnh từ file / người dùng ({filteredCustom.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCustom.map((code) => (
                  <div
                    key={code}
                    className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{code}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-emerald-800">{customMappings[code]}</span>
                    </div>
                    <button
                      onClick={() => onRemoveMapping(code)}
                      className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa quy tắc này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Quy tắc tiền tố mặc định DNA ({filteredBuiltin.length})
              </span>
              <span className="text-[11px] text-slate-400">Tự động nhận diện</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {filteredBuiltin.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-mono font-bold text-slate-800">{item.prefix}*</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#0066B3] border border-blue-200/60">
                    {item.department}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8 Bộ môn DNA Summary */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">
              Danh sách 8 Bộ môn chính thức tại DNA
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DNA_DEPARTMENTS.filter((d) => d.isSupportedAtDna).map((dept) => (
                <div
                  key={dept.code}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className="text-slate-600 text-[11px]">{dept.name}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
