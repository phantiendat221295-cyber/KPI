import React from 'react';
import {
  BarChart3,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'statistics';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenConfig: () => void;
  onOpenDepartment: () => void;
  onExportExcel: () => void;
  hasData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  isCollapsed,
  onToggleCollapse,
  onOpenConfig,
  onOpenDepartment,
  onExportExcel,
  hasData,
}) => {
  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col shrink-0 min-h-screen select-none transition-all duration-300 relative z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header Sidebar: Logo & Collapse Button */}
      <div className="p-3.5 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
        {!isCollapsed ? (
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#F37021] text-base tracking-tight leading-none">
                FPT
              </span>
              <span className="font-bold text-[#0066B3] text-xs uppercase tracking-tight leading-none">
                POLYTECHNIC
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 font-medium truncate">
              <Building2 className="w-3 h-3 text-[#0066B3] shrink-0" />
              <span className="truncate">Cơ sở: FPT Polytechnic Đồng Nai (DNA)</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="font-extrabold text-[#F37021] text-sm">FPT</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1 shrink-0"
          title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu items */}
      <div className="flex-1 py-3 overflow-y-auto space-y-1">
        {/* Menu 1: TC & QL đào tạo (Thống kê OKR) - ACTIVE */}
        <button
          className={`w-full flex items-center px-3.5 py-2.5 text-sm transition-all text-left relative group ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } bg-gray-50/80 text-[#0066B3] font-medium border-l-[3px] border-[#F37021]`}
          title="TC & QL đào tạo - Thống kê OKR"
        >
          <div className="flex items-center gap-3 min-w-0">
            <BarChart3 className="w-4 h-4 text-[#0066B3] shrink-0" />
            {!isCollapsed && (
              <span className="truncate font-medium text-gray-800 group-hover:text-[#0066B3]">
                TC &amp; QL đào tạo
              </span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
        </button>

        {/* Menu 2: Cấu hình Mốc kỳ & Block */}
        <button
          onClick={onOpenConfig}
          className={`w-full flex items-center px-3.5 py-2.5 text-sm transition-all text-left text-gray-700 hover:bg-gray-50 hover:text-[#0066B3] border-l-[3px] border-transparent ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Cấu hình Mốc kỳ & Block"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-gray-700">Cấu hình Mốc kỳ &amp; Block</span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
        </button>

        {/* Menu 3: Danh mục Bộ môn (DNA) */}
        <button
          onClick={onOpenDepartment}
          className={`w-full flex items-center px-3.5 py-2.5 text-sm transition-all text-left text-gray-700 hover:bg-gray-50 hover:text-[#0066B3] border-l-[3px] border-transparent ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title="Danh mục Bộ môn (DNA)"
        >
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-4 h-4 text-gray-500 shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-gray-700">Danh mục Bộ môn (DNA)</span>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
        </button>
      </div>

      {/* Footer Sidebar */}
      <div className="p-3 border-t border-gray-200 bg-white space-y-2">
        <button
          onClick={onExportExcel}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-md bg-[#0066B3] hover:bg-[#005291] text-white text-xs font-medium transition-colors shadow-2xs ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          title="Xuất file Excel báo cáo"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Xuất Excel Báo Cáo</span>}
        </button>

        {!isCollapsed && (
          <div className="text-center pt-1">
            <span className="text-[10px] text-gray-400 block font-normal">
              AP Portal • Cơ sở DNA
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
