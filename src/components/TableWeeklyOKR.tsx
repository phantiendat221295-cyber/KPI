import React, { useState } from 'react';
import { Table2RowData, BlockType, BlockWeeklyData } from '../types';
import { WEEK_SLOTS } from '../constants';
import { AlertCircle, CalendarCheck, FileSpreadsheet } from 'lucide-react';

interface TableWeeklyOKRProps {
  b1Rows: Table2RowData[];
  b1Total: Table2RowData;
  b2Rows: Table2RowData[];
  b2Total: Table2RowData;
  block1Weekly: BlockWeeklyData;
  block2Weekly: BlockWeeklyData;
  searchTerm: string;
  onExportExcel: () => void;
}

function formatPercent(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return `${val.toFixed(1)}%`;
}

export const TableWeeklyOKR: React.FC<TableWeeklyOKRProps> = ({
  b1Rows,
  b1Total,
  b2Rows,
  b2Total,
  block1Weekly,
  block2Weekly,
  searchTerm,
  onExportExcel,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('B1');

  const rows = selectedBlock === 'B1' ? b1Rows : b2Rows;
  const totalRow = selectedBlock === 'B1' ? b1Total : b2Total;
  const weeklyData = selectedBlock === 'B1' ? block1Weekly : block2Weekly;

  const hasAnyWeeklyData = Object.values(weeklyData).some(
    (record) => record && record.results.length > 0
  );

  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    return r.department.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header & Tab switch */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#F37021] rounded-full inline-block" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Bảng 2: Theo dõi OKR Hàng Tuần - {selectedBlock === 'B1' ? 'Block 1' : 'Block 2'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-4.5">
            Tuần 1 - Tuần 6: Tỷ lệ cấm thi (%) | Tuần 8: Tỷ lệ sinh viên Đạt / Pass (%)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Switch Block 1 / Block 2 */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedBlock('B1')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBlock === 'B1'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Block 1
            </button>
            <button
              onClick={() => setSelectedBlock('B2')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedBlock === 'B2'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Block 2
            </button>
          </div>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Bảng 2 ra Excel</span>
          </button>
        </div>
      </div>

      {/* Notice if no weekly file uploaded for this block */}
      {!hasAnyWeeklyData && (
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-3 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Chưa có tệp tuần nào được tải lên cho <strong>{selectedBlock === 'B1' ? 'Block 1' : 'Block 2'}</strong>. Các ô tỷ lệ đang hiển thị dấu gạch ngang &quot;-&quot;.
          </span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
              <th className="px-3 py-3 border-r border-slate-200 w-12">STT</th>
              <th className="px-3 py-3 border-r border-slate-200 w-14">CS</th>
              <th className="px-4 py-3 border-r border-slate-200 text-left min-w-[130px]">
                Bộ môn
              </th>

              {/* Tuần 1 - 6 (Cấm thi) */}
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 1
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 2
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 3
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 4
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 5
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>
              <th className="px-3 py-3 border-r border-slate-200 min-w-[95px] bg-rose-50/50 text-rose-800">
                Tuần 6
                <span className="block text-[10px] font-normal text-rose-600">Cấm thi %</span>
              </th>

              {/* Tuần 8 (Pass) */}
              <th className="px-3 py-3 min-w-[105px] bg-emerald-50/60 text-emerald-800 font-extrabold">
                Tuần 8
                <span className="block text-[10px] font-semibold text-emerald-600">Pass % (Chốt)</span>
              </th>
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
                  <td className="px-3 py-3 text-center font-medium text-slate-500 border-r border-slate-100">
                    {row.stt}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-slate-600 border-r border-slate-100">
                    {row.campus}
                  </td>
                  <td className="px-4 py-3 font-bold border-r border-slate-100 whitespace-nowrap">
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

                  {/* Tuần 1 -> 6 */}
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week1) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week2) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week3) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week4) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week5) : '-'}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-rose-600 border-r border-slate-100">
                    {row.isSupported ? formatPercent(row.week6) : '-'}
                  </td>

                  {/* Tuần 8 Pass */}
                  <td className="px-3 py-3 text-right font-bold text-emerald-600 bg-emerald-50/20">
                    {row.isSupported ? formatPercent(row.week8) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Tổng cơ sở */}
          <tfoot>
            <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <td className="px-3 py-3 text-center border-r border-slate-200"></td>
              <td className="px-3 py-3 text-center text-[#0066B3] border-r border-slate-200">
                DNA
              </td>
              <td className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-900">
                Tổng cơ sở
              </td>

              {/* Tuần 1 -> 6 Totals */}
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week1)}
              </td>
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week2)}
              </td>
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week3)}
              </td>
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week4)}
              </td>
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week5)}
              </td>
              <td className="px-3 py-3 text-right border-r border-slate-200 text-rose-700">
                {formatPercent(totalRow.week6)}
              </td>

              {/* Tuần 8 Totals */}
              <td className="px-3 py-3 text-right text-emerald-700 bg-emerald-100/40">
                {formatPercent(totalRow.week8)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
