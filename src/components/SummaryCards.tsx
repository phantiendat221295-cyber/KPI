import React from 'react';
import { Users, CheckCircle2, Ban, Layers, AlertCircle } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Card 1: Tổng lượt SV Toàn kỳ */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Tổng lượt sinh viên
          </span>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0066B3] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900">
            {hasEnrollmentData ? table1Total.allCount.toLocaleString('vi-VN') : '0'}
          </span>
          <span className="text-xs font-medium text-gray-500">lượt</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>
            B1: <strong className="text-gray-900">{hasEnrollmentData ? table1Total.b1Count.toLocaleString('vi-VN') : '0'}</strong>
          </span>
          <span>
            B2: <strong className="text-gray-900">{hasEnrollmentData ? table1Total.b2Count.toLocaleString('vi-VN') : '0'}</strong>
          </span>
        </div>
      </div>

      {/* Card 2: Cấm thi Toàn kỳ */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cấm thi Toàn kỳ
          </span>
          <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          {hasExportData && table1Total.allForbiddenRate !== null ? (
            <>
              <span className="text-2xl font-bold text-rose-600">
                {table1Total.allForbiddenRate.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400 font-medium">
                ({table1Total.allForbiddenCount?.toLocaleString('vi-VN')} SV)
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5 py-1">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
              Chờ tải file
            </span>
          )}
        </div>
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>
            B1:{' '}
            <strong className="text-gray-900">
              {table1Total.b1ForbiddenRate !== null ? `${table1Total.b1ForbiddenRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
          <span>
            B2:{' '}
            <strong className="text-gray-900">
              {table1Total.b2ForbiddenRate !== null ? `${table1Total.b2ForbiddenRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
        </div>
      </div>

      {/* Card 3: Pass Toàn kỳ */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Pass Toàn kỳ
          </span>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          {hasExportData && table1Total.allPassRate !== null ? (
            <>
              <span className="text-2xl font-bold text-emerald-600">
                {table1Total.allPassRate.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400 font-medium">chốt</span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5 py-1">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
              Chờ tải file
            </span>
          )}
        </div>
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>
            B1 (T8):{' '}
            <strong className="text-gray-900">
              {table1Total.b1PassRate !== null ? `${table1Total.b1PassRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
          <span>
            B2 (T8):{' '}
            <strong className="text-gray-900">
              {table1Total.b2PassRate !== null ? `${table1Total.b2PassRate.toFixed(1)}%` : '-'}
            </strong>
          </span>
        </div>
      </div>

      {/* Card 4: Cơ sở đào tạo */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cơ sở đào tạo
          </span>
          <div className="w-7 h-7 rounded-md bg-orange-50 text-[#F37021] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-gray-900">
            FPT Poly Đồng Nai
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <span>
            Mã CS: <strong className="text-[#0066B3]">DNA (HCM)</strong>
          </span>
          <span className="text-gray-500 font-medium">8 Bộ môn</span>
        </div>
      </div>
    </div>
  );
};
