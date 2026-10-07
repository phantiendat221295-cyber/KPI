import React from 'react';
import { Users, CheckCircle2, Ban, Layers, TrendingUp, AlertCircle } from 'lucide-react';
import { Table1RowData } from '../types';

interface SummaryCardsProps {
  hasEnrollmentData: boolean;
  hasExportData: boolean;
  table1Total: Table1RowData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  hasEnrollmentData,
  hasExportData,
  table1Total,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Tổng lượt SV Toàn kỳ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tổng lượt sinh viên
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasEnrollmentData ? table1Total.allCount.toLocaleString('vi-VN') : '0'}
          </span>
          <span className="text-xs font-semibold text-slate-500">lượt</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            B1: <strong className="text-slate-800">{hasEnrollmentData ? table1Total.b1Count.toLocaleString('vi-VN') : '0'}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            B2: <strong className="text-slate-800">{hasEnrollmentData ? table1Total.b2Count.toLocaleString('vi-VN') : '0'}</strong>
          </span>
        </div>
      </div>

      {/* Card 2: Tỷ lệ Cấm thi Toàn kỳ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Cấm thi Toàn kỳ
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Ban className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {hasExportData && table1Total.allForbiddenRate !== null ? (
            <>
              <span className="text-2xl font-extrabold text-rose-600 tracking-tight">
                {table1Total.allForbiddenRate.toFixed(1)}%
              </span>
              <span className="text-xs font-medium text-slate-400">tổng hợp</span>
            </>
          ) : (
            <span className="text-base font-semibold text-slate-400 flex items-center gap-1.5 py-1">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              Chờ tải file
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            B1:{' '}
            <strong className="text-slate-800">
              {table1Total.b1ForbiddenRate !== null ? `${table1Total.b1ForbiddenRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
          <span>
            B2:{' '}
            <strong className="text-slate-800">
              {table1Total.b2ForbiddenRate !== null ? `${table1Total.b2ForbiddenRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
        </div>
      </div>

      {/* Card 3: Pass Toàn kỳ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pass Toàn kỳ
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          {hasExportData && table1Total.allPassRate !== null ? (
            <>
              <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                {table1Total.allPassRate.toFixed(1)}%
              </span>
              <span className="text-xs font-medium text-slate-400">chốt kỳ</span>
            </>
          ) : (
            <span className="text-base font-semibold text-slate-400 flex items-center gap-1.5 py-1">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              Chờ tải file
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            B1 (T8):{' '}
            <strong className="text-slate-800">
              {table1Total.b1PassRate !== null ? `${table1Total.b1PassRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
          <span>
            B2 (T8):{' '}
            <strong className="text-slate-800">
              {table1Total.b2PassRate !== null ? `${table1Total.b2PassRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
        </div>
      </div>

      {/* Card 4: Cơ sở đào tạo & Trạng thái phân lớp */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Trạng thái phân bổ
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F37021] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            {hasEnrollmentData ? 'Đã đồng bộ' : 'Chờ tải danh sách'}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            Cơ sở: <strong className="text-[#0066B3]">DNA (Đà Nẵng)</strong>
          </span>
          <span className="text-slate-400">8 Bộ môn</span>
        </div>
      </div>
    </div>
  );
};
