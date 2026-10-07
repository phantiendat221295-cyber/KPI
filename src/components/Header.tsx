import React from 'react';
import { Search, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { SemesterConfig } from '../types';

interface HeaderProps {
  config: SemesterConfig;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  searchTerm,
  onSearchChange,
  onOpenConfig,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-600 hover:text-slate-900 transition-colors">
          Quản lý lớp học
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
          Thống kê OKR & Tỷ lệ cấm thi
          <button
            onClick={onOpenConfig}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
            title="Bấm để cấu hình mốc ngày"
          >
            <span>[{config.semesterName}]</span>
          </button>
        </span>
      </div>

      {/* Right controls: Search & User */}
      <div className="flex items-center gap-4">
        {/* Quick search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm nhanh bộ môn (CNTT, Biz, TKĐH...)..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3] text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0066B3] to-[#F37021] flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Xin chào, Đạt</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" /> DNA
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">QLĐT Cơ sở DNA</span>
          </div>
        </div>
      </div>
    </header>
  );
};
