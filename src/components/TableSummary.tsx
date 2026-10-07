import React from 'react';
import { Table1RowData } from '../types';
import { AlertCircle, HelpCircle, FileSpreadsheet } from 'lucide-react';

interface TableSummaryProps {
  rows: Table1RowData[];
  totalRow: Table1RowData;
  searchTerm: string;
  hasEnrollmentData: boolean;
  hasExportData: boolean;
  onExportExcel: () => void;
}

function formatPercent(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return `${val.toFixed(1)}%`;
}

function formatCount(val: number, hasData: boolean, isSupported: boolean): string {
  if (!isSupported) return '-';
  if (!hasData) return '0';
  return val.toLocaleString('vi-VN');
}

export const TableSummary: React.FC<TableSummaryProps> = ({
  rows,
  totalRow,
  searchTerm,
  hasEnrollmentData,
  hasExportData,
  onExportExcel,
}) => {
  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    return r.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#0066B3] rounded-full inline-block" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Bảng 1: Thống kê Đào tạo Toàn kỳ (FA26), Block 1 & Block 2
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-4.5">
            Phân bổ số lượt sinh viên phụ trách, tỷ lệ cấm thi và tỷ lệ đạt (Pass) theo từng bộ môn cơ sở DNA
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Xuất Bảng 1 ra Excel</span>
        </button>
      </div>

      {/* Reminder Banner if files are missing */}
      {(!hasEnrollmentData || !hasExportData) && (
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-5 py-3 flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Trạng thái dữ liệu: </span>
            {!hasEnrollmentData && (
              <span className="mr-2">
                Chưa có file <code className="font-mono bg-amber-100/90 px-1 py-0.5 rounded text-[11px]">danh_sach_lop_mon.csv</code> (Số lượt SV hiển thị 0).
              </span>
            )}
            {!hasExportData && (
              <span>
                Chưa nạp đủ file <code className="font-mono bg-amber-100/90 px-1 py-0.5 rounded text-[11px]">export.csv</code> các tuần (Tỷ lệ cấm thi/Pass hiển thị &quot;-&quot;).
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            {/* Top Header Group */}
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-200 w-12">
                STT
              </th>
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-200 w-14">
                CS
              </th>
              <th rowSpan={2} className="px-4 py-2.5 border-r border-slate-200 text-left min-w-[120px]">
                Bộ môn
              </th>

              {/* Group 1: Toàn kỳ */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-200 bg-blue-50/60 text-[#0066B3]">
                Toàn kỳ (FA26)
              </th>

              {/* Group 2: Block 1 */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-200 bg-amber-50/60 text-[#F37021]">
                Block 1
              </th>

              {/* Group 3: Block 2 */}
              <th colSpan={4} className="px-3 py-2 bg-indigo-50/60 text-indigo-700">
                Block 2
              </th>
            </tr>

            {/* Sub-header columns */}
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-center text-[11px]">
              {/* Toàn kỳ cols */}
              <th className="px-2.5 py-2 border-r border-slate-200">Số lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">% Lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">Cấm thi %</th>
              <th className="px-2.5 py-2 border-r border-slate-200">Pass %</th>

              {/* Block 1 cols */}
              <th className="px-2.5 py-2 border-r border-slate-200">Số lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">% Lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">Cấm thi %</th>
              <th className="px-2.5 py-2 border-r border-slate-200">Pass %</th>

              {/* Block 2 cols */}
              <th className="px-2.5 py-2 border-r border-slate-200">Số lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">% Lượt SV</th>
              <th className="px-2.5 py-2 border-r border-slate-200">Cấm thi %</th>
              <th className="px-2.5 py-2">Pass %</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row) => {
              return (
                <tr
                  key={row.department}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    !row.isSupported ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                  }`}
                >
                  <td className="px-3 py-2.5 text-center font-medium text-slate-500 border-r border-slate-100">
                    {row.stt}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-slate-600 border-r border-slate-100">
                    {row.campus}
                  </td>
                  <td className="px-4 py-2.5 font-bold border-r border-slate-100 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                        row.isSupported
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-slate-100 text-slate-400 italic'
                      }`}
                    >
                      {row.department}
                      {!row.isSupported && <span className="ml-1 text-[10px]">(N/A)</span>}
                    </span>
                  </td>

                  {/* Toàn kỳ */}
                  <td className="px-2.5 py-2.5 text-right font-medium border-r border-slate-100">
                    {formatCount(row.allCount, hasEnrollmentData, row.isSupported)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.allPercentage) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.allForbiddenRate) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-emerald-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.allPassRate) : '-'}
                  </td>

                  {/* Block 1 */}
                  <td className="px-2.5 py-2.5 text-right font-medium border-r border-slate-100">
                    {formatCount(row.b1Count, hasEnrollmentData, row.isSupported)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.b1Percentage) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.b1ForbiddenRate) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-emerald-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.b1PassRate) : '-'}
                  </td>

                  {/* Block 2 */}
                  <td className="px-2.5 py-2.5 text-right font-medium border-r border-slate-100">
                    {formatCount(row.b2Count, hasEnrollmentData, row.isSupported)}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.b2Percentage) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.b2ForbiddenRate) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-semibold text-emerald-600">
                    {row.isSupported ? formatPercent(row.b2PassRate) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Summary Footer (Tổng cơ sở) */}
          <tfoot>
            <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <td className="px-3 py-3 text-center border-r border-slate-200"></td>
              <td className="px-3 py-3 text-center text-[#0066B3] border-r border-slate-200">
                DNA
              </td>
              <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-900">
                Tổng cơ sở
              </td>

              {/* Toàn kỳ totals */}
              <td className="px-2.5 py-3 text-right border-r border-slate-200 font-extrabold text-[#0066B3]">
                {hasEnrollmentData ? totalRow.allCount.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200 text-rose-600">
                {formatPercent(totalRow.allForbiddenRate)}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200 text-emerald-600">
                {formatPercent(totalRow.allPassRate)}
              </td>

              {/* Block 1 totals */}
              <td className="px-2.5 py-3 text-right border-r border-slate-200 font-extrabold text-[#F37021]">
                {hasEnrollmentData ? totalRow.b1Count.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200 text-rose-600">
                {formatPercent(totalRow.b1ForbiddenRate)}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200 text-emerald-600">
                {formatPercent(totalRow.b1PassRate)}
              </td>

              {/* Block 2 totals */}
              <td className="px-2.5 py-3 text-right border-r border-slate-200 font-extrabold text-indigo-700">
                {hasEnrollmentData ? totalRow.b2Count.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2.5 py-3 text-right border-r border-slate-200 text-rose-600">
                {formatPercent(totalRow.b2ForbiddenRate)}
              </td>
              <td className="px-2.5 py-3 text-right text-emerald-600">
                {formatPercent(totalRow.b2PassRate)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
