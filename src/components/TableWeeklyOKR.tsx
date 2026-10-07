import React, { useState } from 'react';
import { Table2RowData, BlockType, BlockWeeklyData } from '../types';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';

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

function formatCount(val: number | null, isSupported: boolean): string {
  if (!isSupported) return '-';
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('vi-VN');
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#F37021] rounded-xs inline-block" />
            Bảng 2: Review Tiến độ OKR Hàng Tuần - {selectedBlock === 'B1' ? 'Block 1' : 'Block 2'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Cơ sở: FPT Polytechnic Đồng Nai (DNA) • Đối chiếu chi tiết [Số lượng cấm thi] và [Tỷ lệ cấm thi %] qua từng tuần
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Switch Tab Block 1 / Block 2 */}
          <div className="flex items-center p-0.5 bg-gray-100 rounded-md border border-gray-200">
            <button
              onClick={() => setSelectedBlock('B1')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedBlock === 'B1'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Block 1
            </button>
            <button
              onClick={() => setSelectedBlock('B2')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                selectedBlock === 'B2'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Block 2
            </button>
          </div>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Bảng 2 (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Reminder if empty */}
      {!hasAnyWeeklyData && (
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 text-xs text-gray-600">
          <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            Chưa có file kết quả học tập tuần nào được tải lên cho <strong>{selectedBlock === 'B1' ? 'Block 1' : 'Block 2'}</strong>. Các ô đang hiển thị dấu gạch ngang &quot;-&quot;.
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

              {/* Tuần 8 - Pass (%) (Đặt đầu theo yêu cầu portal review) */}
              <th rowSpan={2} className="px-3 py-2 border-r border-gray-300 min-w-[100px] bg-emerald-50/80 text-emerald-900 font-bold">
                Tuần 8 - Pass (%)
                <span className="block text-[10px] font-normal text-emerald-700">(Chốt kỳ)</span>
              </th>

              {/* Tuần 1 -> Tuần 6 Headers */}
              <th colSpan={2} className="px-2 py-1.5 border-r border-gray-300 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 1
              </th>
              <th colSpan={2} className="px-2 py-1.5 border-r border-gray-300 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 2
              </th>
              <th colSpan={2} className="px-2 py-1.5 border-r border-gray-300 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 3
              </th>
              <th colSpan={2} className="px-2 py-1.5 border-r border-gray-300 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 4
              </th>
              <th colSpan={2} className="px-2 py-1.5 border-r border-gray-300 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 5
              </th>
              <th colSpan={2} className="px-2 py-1.5 bg-rose-50/50 text-rose-900 font-bold">
                Tuần 6
              </th>
            </tr>

            {/* Header Tier 2: SL Cấm | % Cấm thi */}
            <tr className="bg-[#E5E7EB] text-[#374151] font-medium text-center text-[11px] border-b border-gray-300">
              {/* Tuần 1 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Cấm thi</th>
              {/* Tuần 2 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Cấm thi</th>
              {/* Tuần 3 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Cấm thi</th>
              {/* Tuần 4 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Cấm thi</th>
              {/* Tuần 5 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5 border-r border-gray-300">% Cấm thi</th>
              {/* Tuần 6 */}
              <th className="px-2 py-1.5 border-r border-gray-300">SL Cấm</th>
              <th className="px-2 py-1.5">% Cấm thi</th>
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

                  {/* Tuần 8 - Pass (%) */}
                  <td className="px-3 py-2 text-right font-bold text-emerald-700 bg-emerald-50/30 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week8PassRate) : '-'}
                  </td>

                  {/* Tuần 1 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week1Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week1Rate) : '-'}
                  </td>

                  {/* Tuần 2 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week2Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week2Rate) : '-'}
                  </td>

                  {/* Tuần 3 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week3Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week3Rate) : '-'}
                  </td>

                  {/* Tuần 4 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week4Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week4Rate) : '-'}
                  </td>

                  {/* Tuần 5 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week5Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {row.isSupported ? formatPercent(row.week5Rate) : '-'}
                  </td>

                  {/* Tuần 6 */}
                  <td className="px-2 py-2 text-right font-medium text-rose-700 border-r border-gray-200">
                    {formatCount(row.week6Count, row.isSupported)}
                  </td>
                  <td className="px-2 py-2 text-right font-medium text-rose-700">
                    {row.isSupported ? formatPercent(row.week6Rate) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Tổng cơ sở */}
          <tfoot>
            <tr className="bg-[#F3F4F6] font-bold text-gray-900 border-t-2 border-gray-300">
              <td className="px-2.5 py-2.5 text-center border-r border-gray-300"></td>
              <td className="px-3 py-2.5 text-center text-[#0066B3] border-r border-gray-300">
                DNA
              </td>
              <td className="px-3 py-2.5 text-left border-r border-gray-300 font-bold">
                Tổng cơ sở
              </td>

              {/* Tuần 8 Pass Total */}
              <td className="px-3 py-2.5 text-right text-emerald-800 bg-emerald-100/50 border-r border-gray-300 font-bold">
                {formatPercent(totalRow.week8PassRate)}
              </td>

              {/* Tuần 1 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week1Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.week1Rate)}
              </td>

              {/* Tuần 2 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week2Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.week2Rate)}
              </td>

              {/* Tuần 3 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week3Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.week3Rate)}
              </td>

              {/* Tuần 4 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week4Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.week4Rate)}
              </td>

              {/* Tuần 5 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week5Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatPercent(totalRow.week5Rate)}
              </td>

              {/* Tuần 6 Totals */}
              <td className="px-2 py-2.5 text-right border-r border-gray-300 text-rose-700 font-bold">
                {formatCount(totalRow.week6Count, true)}
              </td>
              <td className="px-2 py-2.5 text-right text-rose-700 font-bold">
                {formatPercent(totalRow.week6Rate)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
