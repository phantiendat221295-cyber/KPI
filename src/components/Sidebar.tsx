import React from 'react';
import {
  BarChart3,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeView: 'statistics';
  onOpenConfig: () => void;
  onOpenDepartment: () => void;
  onExportExcel: () => void;
  hasData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onOpenConfig,
  onOpenDepartment,
  onExportExcel,
  hasData,
}) => {
  return (
    <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0 min-h-screen select-none">
      {/* Header Logo */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-100/50">
        <div className="flex items-center gap-3">
          {/* FPT Poly Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F37021] to-[#E05910] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#F37021] text-base tracking-tight leading-none">
                FPT
              </span>
              <span className="font-bold text-[#0066B3] text-sm tracking-tight leading-none">
                Polytechnic
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0066B3]/10 text-[#0066B3] border border-[#0066B3]/20">
                <Building2 className="w-3 h-3 text-[#0066B3]" />
                Cơ sở: DNA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Chức năng chính
        </div>

        {/* Menu 1: Thống kê Đào tạo & OKR (Active) */}
        <button
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all bg-white text-[#0066B3] shadow-sm shadow-slate-200 border border-slate-200/60"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066B3] flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="flex-1 text-left">Thống kê Đào tạo & OKR</span>
          <span className="w-2 h-2 rounded-full bg-[#0066B3]" />
        </button>

        {/* Menu 2: Cấu hình Mốc kỳ & Block */}
        <button
          onClick={onOpenConfig}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-all text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-200/60 text-slate-600 group-hover:text-slate-900 flex items-center justify-center transition-colors">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="flex-1">Cấu hình Mốc kỳ & Block</span>
        </button>

        {/* Menu 3: Danh mục Bộ môn */}
        <button
          onClick={onOpenDepartment}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-all text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-200/60 text-slate-600 group-hover:text-slate-900 flex items-center justify-center transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="flex-1">Danh mục Bộ môn</span>
        </button>

        {/* Notice on empty state */}
        {!hasData && (
          <div className="mt-6 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Sẵn sàng tính toán
            </div>
            Tải file <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">danh_sach_lop_mon.csv</code> và <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">export.csv</code> để hiển thị số liệu thực tế.
          </div>
        )}
      </div>

      {/* Footer Sidebar */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-100/60 space-y-2">
        <button
          onClick={onExportExcel}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0066B3] hover:bg-[#005291] text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-[0.99]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất báo cáo Excel</span>
        </button>

        <div className="pt-1 text-center">
          <p className="text-[11px] font-semibold text-slate-500">DNA Portal v2.0</p>
          <p className="text-[10px] text-slate-400">FPT Polytechnic Đồng Nai</p>
        </div>
      </div>
    </aside>
  );
};
