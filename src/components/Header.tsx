import React, { useState } from 'react';
import {
  Search,
  Download,
  Moon,
  Sun,
  User,
  ChevronRight,
  Cloud,
  CloudUpload,
  RefreshCw,
  Eye,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SemesterConfig, UserRole } from '../types';

interface HeaderProps {
  config: SemesterConfig;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenConfig: () => void;
  onExportExcel: () => void;
  // Cloud Sync Props
  hasCloudApi: boolean;
  isSyncing: boolean;
  isFetchingCloud: boolean;
  lastSyncedAt: string | null;
  onSyncToCloud: () => void;
  onFetchFromCloud: () => void;
  // Role
  userRole: UserRole;
  onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  searchTerm,
  onSearchChange,
  onOpenConfig,
  onExportExcel,
  hasCloudApi,
  isSyncing,
  isFetchingCloud,
  lastSyncedAt,
  onSyncToCloud,
  onFetchFromCloud,
  userRole,
  onToggleRole,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-5 flex items-center justify-between">
      {/* Left: AP Style Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-normal">
        <span className="text-gray-500 hover:text-gray-800 transition-colors">
          Quản lý lớp học
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[#0066B3]">
            Thống kê OKR &amp; Tỷ lệ cấm thi | DNA
          </span>
          <button
            onClick={onOpenConfig}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-[#0066B3] hover:bg-blue-100 border border-blue-200 transition-colors"
            title="Nhấn để cấu hình mốc kỳ & kết nối Google Sheets"
          >
            {config.semesterName}
          </button>

          {/* Sync Timestamp Badge */}
          {lastSyncedAt && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
              title={`Dữ liệu Google Sheets cập nhật mới nhất lúc: ${lastSyncedAt}`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Đồng bộ: {lastSyncedAt}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Cloud Sync Actions & User */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bộ môn..."
            className="w-40 lg:w-48 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066B3] focus:border-[#0066B3] text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Cloud Sync Buttons */}
        {hasCloudApi ? (
          <div className="flex items-center gap-1.5">
            {/* Refresh / Fetch from Cloud */}
            <button
              onClick={onFetchFromCloud}
              disabled={isFetchingCloud}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors"
              title="Đọc lại dữ liệu mới nhất từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isFetchingCloud ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới Cloud</span>
            </button>

            {/* Sync to Cloud (Only for Admin) */}
            {userRole === 'admin' && (
              <button
                onClick={onSyncToCloud}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#0066B3] hover:bg-[#005291] text-white text-xs font-medium shadow-2xs transition-colors"
                title="Lưu toàn bộ dữ liệu phân tích lên Google Sheets"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Đồng bộ lên Cloud</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenConfig}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/60 text-[#0066B3] text-xs font-medium transition-colors"
            title="Kết nối với Google Sheets qua Google Apps Script"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nối Google Sheets</span>
          </button>
        )}

        {/* Quick Download Excel Button */}
        <button
          onClick={onExportExcel}
          className="p-1.5 rounded-md text-gray-500 hover:text-[#0066B3] hover:bg-gray-100 transition-colors"
          title="Tải báo cáo Excel (.xlsx)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle icon */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title={isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Role Switcher */}
        <button
          onClick={onToggleRole}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
            userRole === 'admin'
              ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="Bấm để chuyển đổi giữa Chế độ Quản trị và Chế độ Người xem"
        >
          {userRole === 'admin' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Quản trị</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Người xem</span>
            </>
          )}
        </button>

        {/* User Badge: Xin chào, Đạt Pic */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-[#0066B3] flex items-center justify-center text-white font-semibold text-xs shadow-2xs shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-xs font-semibold text-gray-800 leading-tight">
              Xin chào, Đạt Pic
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">
              {userRole === 'admin' ? 'Cán bộ Đào tạo (DNA)' : 'Chế độ xem báo cáo'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
