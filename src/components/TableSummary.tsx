import React from 'react';
import { Table1RowData } from '../types';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';

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

function formatCount(val: number | null, isSupported: boolean): string {
  if (!isSupported) return '-';
  if (val === null || val === undefined) return '-';
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#0066B3] rounded-xs inline-block" />
            Bảng 1: Thống kê Tổng quan Học kỳ (FA26, Block 1, Block 2)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Cơ sở: FPT Polytechnic Đồng Nai (DNA) • Cập nhật số lượt SV, Pass (%), SL Cấm thi và Tỷ lệ cấm thi (%)
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xuất Bảng 1 (.xlsx)</span>
        </button>
      </div>

      {/* Reminder if empty */}
      {(!hasEnrollmentData || !hasExportData) && (
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Vui lòng tải file <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800 font-mono text-[11px]">danh_sach_lop_mon.csv</code> và <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800 font-mono text-[11px]">export.csv</code> để hiển thị kết quả.
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-gray-200">
          <thead>
            {/* Header Tier 1 */}
            <tr className="bg-[#F3F4F6] text-[#374151] font-semibold text-center border-b border-gray-300">
              <th rowSpan={2} className="px-2.5 py-2 border-r border-gray-300 w-10">
                STT
              </th>
              <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 w-12 text-center">
                CS
              </th>
              <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 text-left min-w-[90px]">
                BM
              </th>

              {/* Group FA26 (Vàng nhạt) */}
              <th
                colSpan={5}
                className="px-2 py-1.5 border-r border-gray-300 bg-amber-50/70 text-amber-900 font-bold"
              >
                Học kỳ FA26
              </th>

              {/* Group Block 1 (Xanh lá nhạt) */}
              <th
                colSpan={5}
                className="px-2 py-1.5 border-r border-gray-300 bg-emerald-50/70 text-emerald-900 font-bold"
              >
                Block 1
              </th>

              {/* Group Block 2 (Xanh dương nhạt) */}
              <th
                colSpan={5}
                className="px-2 py-1.5 bg-blue-50/70 text-blue-900 font-bold"
              >
                Block 2
              </th>
            </tr>

            {/* Header Tier 2 */}
            <tr className="bg-[#E5E7EB] text-[#374151] font-medium text-center text-[11px] border-b border-gray-300">
              {/* FA26 cols */}
              <th className="px-2 py-1.5 border-r border-gray-300">Số lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">Pass (%)</th>
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm thi</th>
              <th className="px-2 py-1.5 border-r border-gray-300">Tỷ lệ cấm (%)</th>

              {/* Block 1 cols */}
              <th className="px-2 py-1.5 border-r border-gray-300">Số lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">Pass (%)</th>
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm thi</th>
              <th className="px-2 py-1.5 border-r border-gray-300">Tỷ lệ cấm (%)</th>

              {/* Block 2 cols */}
              <th className="px-2 py-1.5 border-r border-gray-300">Số lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Lượt SV</th>
              <th className="px-2 py-1.5 border-r border-gray-300">Pass (%)</th>
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm thi</th>
              <th className="px-2 py-1.5">Tỷ lệ cấm (%)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredRows.map((row) => {
              const rowBg = !row.isSupported
                ? 'bg-gray-50/60 text-gray-400'
                : 'hover:bg-gray-50 text-gray-700';

              return (
                <tr key={row.department} className={`transition-colors ${rowBg}`}>
                  <td className="px-2.5 py-2 text-center text-gray-500 border-r border-gray-200">
                    {row.stt}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold text-gray-700 border-r border-gray-200">
                    DNA
                  </td>
                  <td className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-200 whitespace-nowrap">
                    {row.department}
                    {!row.isSupported && <span className="text-[10px] text-gray-400 ml-1 font-normal">(N/A)</span>}
                  </td>

                  {/* FA26 Data */}
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported ? (hasEnrollmentData ? row.allCount.toLocaleString('vi-VN') : '0') : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.allPercentage) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-emerald-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.allPassRate) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.allForbiddenCount, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.allForbiddenRate) : '-'}
                  </td>

                  {/* Block 1 Data */}
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported ? (hasEnrollmentData ? row.b1Count.toLocaleString('vi-VN') : '0') : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.b1Percentage) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-emerald-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.b1PassRate) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.b1ForbiddenCount, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.b1ForbiddenRate) : '-'}
                  </td>

                  {/* Block 2 Data */}
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported ? (hasEnrollmentData ? row.b2Count.toLocaleString('vi-VN') : '0') : '-'}
                  </td>
                  <td className="px-2 py-2 text-right border-r border-gray-200">
                    {row.isSupported && hasEnrollmentData ? formatPercent(row.b2Percentage) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-emerald-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.b2PassRate) : '-'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.b2ForbiddenCount, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700">
                    {row.isSupported ? formatPercent(row.b2ForbiddenRate) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Total Row */}
          <tfoot>
            <tr className="bg-[#F3F4F6] font-bold text-gray-900 border-t-2 border-gray-300">
              <td className="px-2.5 py-2.5 text-center border-r border-gray-300"></td>
              <td className="px-3 py-2.5 text-center text-[#0066B3] border-r border-gray-300">
                DNA
              </td>
              <td className="px-3 py-2.5 text-left border-r border-gray-300 font-bold">
                Tổng cơ sở
              </td>

              {/* FA26 totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 font-bold text-[#0066B3]">
                {hasEnrollmentData ? totalRow.allCount.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-emerald-700 font-bold">
                {formatPercent(totalRow.allPassRate)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.allForbiddenCount, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.allForbiddenRate)}
              </td>

              {/* Block 1 totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 font-bold text-emerald-800">
                {hasEnrollmentData ? totalRow.b1Count.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-emerald-700 font-bold">
                {formatPercent(totalRow.b1PassRate)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.b1ForbiddenCount, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.b1ForbiddenRate)}
              </td>

              {/* Block 2 totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 font-bold text-blue-800">
                {hasEnrollmentData ? totalRow.b2Count.toLocaleString('vi-VN') : '0'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300">
                {hasEnrollmentData ? '100.0%' : '-'}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-emerald-700 font-bold">
                {formatPercent(totalRow.b2PassRate)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.b2ForbiddenCount, true)}
              </td>
              <td className="px-2 py-2.5 text-right text-rose-700 font-bold">
                {formatPercent(totalRow.b2ForbiddenRate)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
