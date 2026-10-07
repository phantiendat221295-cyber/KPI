import React, { useState } from 'react';
import { X, BookOpen, Plus, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { DNA_DEPARTMENTS, BUILTIN_PREFIX_MAPPING } from '../constants';
import { DnaDepartmentCode } from '../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-100 text-[#0066B3] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Danh mục Bộ môn &amp; Từ điển Ánh xạ Mã môn - DNA
              </h3>
              <p className="text-[11px] text-gray-500">
                Cơ sở: FPT Polytechnic Đồng Nai (DNA - HCM)
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

        {/* Search & Add mapping */}
        <div className="p-3.5 border-b border-gray-200 space-y-2.5 bg-white">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tra cứu mã môn hoặc bộ môn (MUL, COM, TKĐH, Biz...)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3]"
              />
            </div>
          </div>

          {/* Quick add custom rule */}
          <form onSubmit={handleAdd} className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Nhập mã môn (VD: PRO201...)"
              className="w-44 px-2.5 py-1.5 border border-gray-200 rounded-md uppercase font-mono font-medium text-gray-800"
            />
            <select
              value={newDept}
              onChange={(e) => setNewDept(e.target.value as DnaDepartmentCode)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-md font-medium text-gray-700 bg-white"
            >
              {DNA_DEPARTMENTS.filter((d) => d.isSupportedAtDna).map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0066B3] hover:bg-[#005291] text-white font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm
            </button>
          </form>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Custom Mappings */}
          {customKeys.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Ánh xạ nạp từ file hoặc người dùng thêm ({filteredCustom.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCustom.map((code) => (
                  <div
                    key={code}
                    className="p-2 rounded border border-emerald-200 bg-emerald-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-gray-800">{code}</span>
                      <span className="mx-1 text-gray-400">→</span>
                      <span className="font-semibold text-emerald-800">{customMappings[code]}</span>
                    </div>
                    <button
                      onClick={() => onRemoveMapping(code)}
                      className="p-0.5 text-gray-400 hover:text-rose-600 transition-colors"
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
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Quy tắc tiền tố mặc định DNA ({filteredBuiltin.length})
              </span>
              <span className="text-[11px] text-gray-400">Nhận diện tự động</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {filteredBuiltin.map((item, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded border border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <span className="font-mono font-medium text-gray-700">{item.prefix}*</span>
                  <span className="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-blue-50 text-[#0066B3] border border-blue-200">
                    {item.department}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8 Bộ môn DNA Summary */}
          <div className="pt-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
              8 Bộ môn đào tạo tại FPT Polytechnic Đồng Nai (DNA)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {DNA_DEPARTMENTS.filter((d) => d.isSupportedAtDna).map((dept) => (
                <div
                  key={dept.code}
                  className="p-2 rounded border border-gray-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                      {dept.code}
                    </span>
                    <span className="text-gray-600 text-[11px]">{dept.name}</span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
