import React, { useState } from 'react';
import {
  Search,
  Download,
  Moon,
  Sun,
  User,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SemesterConfig } from '../types';

interface HeaderProps {
  config: SemesterConfig;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenConfig: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  searchTerm,
  onSearchChange,
  onOpenConfig,
  onExportExcel,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left: AP Style Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-normal">
        <span className="text-gray-500 hover:text-gray-800 transition-colors">
          Quản lý lớp học
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#0066B3]">
            Thống kê OKR &amp; Tỷ lệ cấm thi | DNA
          </span>
          <button
            onClick={onOpenConfig}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-[#0066B3] hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Nhấn để tùy chỉnh mốc kỳ & block"
          >
            {config.semesterName}
          </button>
        </div>
      </div>

      {/* Right: AP Header Utility Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bộ môn..."
            className="w-48 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Quick Download Excel Button */}
        <button
          onClick={onExportExcel}
          className="p-2 rounded-md text-gray-500 hover:text-[#0066B3] hover:bg-gray-100 transition-colors"
          title="Tải báo cáo Excel (.xlsx)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle icon */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title={isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Badge: Xin chào, Đạt Pic */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#0066B3] flex items-center justify-center text-white font-semibold text-xs shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-800 leading-tight">
              Xin chào, Đạt Pic
            </span>
            <span className="text-[11px] text-gray-500 leading-tight">
              Cán bộ Đào tạo - FPT Polytechnic Đồng Nai
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
