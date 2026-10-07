import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  Layers,
  BookOpen,
  Calendar,
  Download,
  CloudUpload,
  RefreshCw,
  Lock,
  Eye,
} from 'lucide-react';
import { BlockType, BlockWeeklyData, UserRole } from '../types';
import { WEEK_SLOTS } from '../constants';
import { downloadSampleTemplate } from '../utils/excelExport';

interface UploadSectionProps {
  userRole: UserRole;
  subjectFileName: string | null;
  customMappingCount: number;
  onUploadSubjectFile: (file: File) => Promise<void>;
  onClearSubjectFile: () => void;
  onOpenDepartmentModal: () => void;

  enrollmentFileName: string | null;
  enrollmentCount: number;
  onUploadEnrollmentFile: (file: File) => Promise<void>;
  onClearEnrollmentFile: () => void;

  block1Weekly: BlockWeeklyData;
  block2Weekly: BlockWeeklyData;
  onUploadWeeklyFile: (block: BlockType, weekNumber: number, file: File) => Promise<void>;
  onClearWeeklyFile: (block: BlockType, weekNumber: number) => void;

  // Cloud Sync trigger
  hasCloudApi: boolean;
  isSyncing: boolean;
  onSyncToCloud: () => void;
  onOpenConfig: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  userRole,
  subjectFileName,
  customMappingCount,
  onUploadSubjectFile,
  onClearSubjectFile,
  onOpenDepartmentModal,
  enrollmentFileName,
  enrollmentCount,
  onUploadEnrollmentFile,
  onClearEnrollmentFile,
  block1Weekly,
  block2Weekly,
  onUploadWeeklyFile,
  onClearWeeklyFile,
  hasCloudApi,
  isSyncing,
  onSyncToCloud,
  onOpenConfig,
}) => {
  const [activeBlockTab, setActiveBlockTab] = useState<BlockType>('B1');
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const enrollmentInputRef = useRef<HTMLInputElement>(null);

  const activeWeeklyData = activeBlockTab === 'B1' ? block1Weekly : block2Weekly;
  const isViewer = userRole === 'viewer';
  const hasLoadedData = enrollmentCount > 0 || Object.values(block1Weekly).some(Boolean) || Object.values(block2Weekly).some(Boolean);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3.5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-200 gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#0066B3]" />
            Khu vực Nạp &amp; Đồng bộ Dữ liệu Đào tạo
            {isViewer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                <Eye className="w-3 h-3 text-gray-500" />
                Chế độ xem
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cơ sở FPT Polytechnic Đồng Nai (DNA) • Tự động tính toán &amp; đồng bộ trực tuyến qua Google Sheets
          </p>
        </div>

        {/* Action Buttons & Templates */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cloud Sync Button if Admin and Data Loaded */}
          {!isViewer && hasLoadedData && (
            <button
              onClick={hasCloudApi ? onSyncToCloud : onOpenConfig}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              title="Đồng bộ ngay dữ liệu lên Google Sheets"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5" />
              )}
              <span>{hasCloudApi ? 'Đồng bộ lên Cloud (Google Sheets)' : 'Kết nối Cloud để lưu'}</span>
            </button>
          )}

          {/* Template Downloads */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => downloadSampleTemplate('mon_bomon')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium transition-colors"
              title="Tải file mẫu Môn - Bộ môn.xlsx"
            >
              <Download className="w-3 h-3 text-gray-500" />
              <span>Môn-Bộ môn.xlsx</span>
            </button>
            <button
              onClick={() => downloadSampleTemplate('danh_sach_lop')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium transition-colors"
              title="Tải file mẫu danh_sach_lop_mon.csv"
            >
              <Download className="w-3 h-3 text-gray-500" />
              <span>Phân lớp.csv</span>
            </button>
            <button
              onClick={() => downloadSampleTemplate('export_tuan')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium transition-colors"
              title="Tải file mẫu export.csv"
            >
              <Download className="w-3 h-3 text-gray-500" />
              <span>export.csv</span>
            </button>
          </div>
        </div>
      </div>

      {/* Viewer Info Notice */}
      {isViewer && (
        <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Bạn đang ở <strong>Chế độ Người xem (Viewer)</strong>: Dữ liệu được đồng bộ từ Google Sheets. Các chức năng upload và xóa file tạm khóa.
            </span>
          </div>
        </div>
      )}

      {/* Top 2 Primary Cards: Dictionary & Enrollment File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. File Danh mục: 'Môn - Bộ môn.xlsx' */}
        <div
          className={`relative rounded-md border transition-all p-3.5 ${
            subjectFileName
              ? 'border-emerald-300 bg-emerald-50/20'
              : !isViewer && dragOverZone === 'subject'
              ? 'border-[#0066B3] bg-blue-50/30'
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            if (isViewer) return;
            e.preventDefault();
            setDragOverZone('subject');
          }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => {
            if (isViewer) return;
            e.preventDefault();
            setDragOverZone(null);
            if (e.dataTransfer.files?.[0]) {
              onUploadSubjectFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            ref={subjectInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUploadSubjectFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  subjectFileName
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-gray-800">
                    1. File Danh mục Môn - Bộ môn
                  </h3>
                  <span className="text-[10px] text-gray-400 font-normal">
                    (.xlsx / .csv)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {subjectFileName ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Đã nạp {customMappingCount} mã môn từ file
                    </span>
                  ) : (
                    'Dùng từ điển DNA mặc định (MUL, SOF, COM, BUS...)'
                  )}
                </p>
              </div>
            </div>

            {!isViewer && subjectFileName && (
              <button
                onClick={onClearSubjectFile}
                className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors"
                title="Gỡ file danh mục tùy chỉnh"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
              {subjectFileName ? `Tệp: ${subjectFileName}` : 'Từ điển DNA có sẵn'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDepartmentModal}
                className="text-xs font-medium text-[#0066B3] hover:underline"
              >
                Xem từ điển
              </button>
              {!isViewer && (
                <button
                  onClick={() => subjectInputRef.current?.click()}
                  className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-2xs"
                >
                  {subjectFileName ? 'Đổi file' : 'Chọn file .xlsx'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. File Phân lớp: 'danh_sach_lop_mon.csv' (BẮT BUỘC) */}
        <div
          className={`relative rounded-md border transition-all p-3.5 ${
            enrollmentFileName
              ? 'border-blue-300 bg-blue-50/20'
              : !isViewer && dragOverZone === 'enrollment'
              ? 'border-[#0066B3] bg-blue-50/30'
              : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            if (isViewer) return;
            e.preventDefault();
            setDragOverZone('enrollment');
          }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => {
            if (isViewer) return;
            e.preventDefault();
            setDragOverZone(null);
            if (e.dataTransfer.files?.[0]) {
              onUploadEnrollmentFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            ref={enrollmentInputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUploadEnrollmentFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  enrollmentFileName
                    ? 'bg-blue-100 text-[#0066B3]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-gray-800">
                    2. File Phân lớp: danh_sach_lop_mon.csv
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    Bắt buộc
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {enrollmentFileName ? (
                    <span className="text-[#0066B3] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Đã ghi nhận {enrollmentCount.toLocaleString('vi-VN')} lượt SV &amp; chia Block
                    </span>
                  ) : (
                    'Kéo thả hoặc chọn file CSV để đếm số lượt SV BM phụ trách'
                  )}
                </p>
              </div>
            </div>

            {!isViewer && enrollmentFileName && (
              <button
                onClick={onClearEnrollmentFile}
                className="p-1 rounded text-gray-400 hover:text-rose-600 transition-colors"
                title="Gỡ file phân lớp"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
              {enrollmentFileName ? `Tệp: ${enrollmentFileName}` : 'Chưa có dữ liệu'}
            </span>
            {!isViewer && (
              <button
                onClick={() => enrollmentInputRef.current?.click()}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors shadow-2xs ${
                  enrollmentFileName
                    ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-[#0066B3] hover:bg-[#005291] text-white'
                }`}
              >
                {enrollmentFileName ? 'Đổi file CSV' : 'Chọn file phân lớp .csv'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. File Kết quả học tập: 'export.csv' (Theo tuần) */}
      <div className="bg-gray-50/70 rounded-md border border-gray-200 p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-100 text-[#F37021] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">
                3. File Kết quả học tập export.csv (Theo tuần)
              </h3>
              <p className="text-[11px] text-gray-500">
                Thống kê SL Cấm thi, Tỷ lệ cấm thi (%) (T1-T6) và Pass (%) (T8)
              </p>
            </div>
          </div>

          {/* Block Tabs: [Block 1] and [Block 2] */}
          <div className="flex items-center p-0.5 bg-gray-200/80 rounded-md">
            <button
              onClick={() => setActiveBlockTab('B1')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeBlockTab === 'B1'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Block 1
            </button>
            <button
              onClick={() => setActiveBlockTab('B2')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeBlockTab === 'B2'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Block 2
            </button>
          </div>
        </div>

        {/* Weekly Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {WEEK_SLOTS.map((weekNum) => {
            const record = activeWeeklyData[weekNum];
            const isWeek8 = weekNum === 8;
            const inputId = `weekly-file-input-${activeBlockTab}-${weekNum}`;

            return (
              <div
                key={weekNum}
                className={`relative rounded-md border p-2.5 flex flex-col justify-between transition-all bg-white ${
                  record
                    ? 'border-emerald-400 ring-1 ring-emerald-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {!isViewer && (
                  <input
                    id={inputId}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onUploadWeeklyFile(activeBlockTab, weekNum, e.target.files[0]);
                        e.target.value = '';
                      }
                    }}
                  />
                )}

                {/* Slot Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isWeek8
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isWeek8 ? 'Tuần 8 (Pass)' : `Tuần ${weekNum}`}
                  </span>

                  {!isViewer && record && (
                    <button
                      onClick={() => onClearWeeklyFile(activeBlockTab, weekNum)}
                      className="p-0.5 text-gray-400 hover:text-rose-600 transition-colors"
                      title={`Xóa file Tuần ${weekNum}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Slot Body */}
                <div className="my-2 min-h-[40px] flex flex-col justify-center">
                  {record ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                        <span className="truncate" title={record.fileName}>
                          {record.fileName}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium flex items-center justify-between">
                        <span>{record.rowCount.toLocaleString()} bản ghi</span>
                        <span className="text-emerald-700 font-semibold">Đã đọc</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-0.5">
                      <span className="text-[11px] text-gray-400">Chờ tải file</span>
                    </div>
                  )}
                </div>

                {/* Slot Action */}
                {!isViewer ? (
                  <button
                    onClick={() => {
                      const el = document.getElementById(inputId);
                      el?.click();
                    }}
                    className={`w-full py-1 px-1.5 rounded text-[11px] font-medium transition-all text-center ${
                      record
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-50 text-[#0066B3] hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    {record ? 'Nạp lại' : '+ Nạp CSV'}
                  </button>
                ) : (
                  <div className="text-center py-1 text-[11px] text-gray-400 font-medium">
                    {record ? 'Đã đồng bộ' : 'Chưa có file'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
