import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Layers,
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  Info,
} from 'lucide-react';
import { BlockType, BlockWeeklyData, WeeklyUploadRecord } from '../types';
import { WEEK_SLOTS } from '../constants';
import { downloadSampleTemplate } from '../utils/excelExport';

interface UploadSectionProps {
  // Dictionary file state
  subjectFileName: string | null;
  customMappingCount: number;
  onUploadSubjectFile: (file: File) => Promise<void>;
  onClearSubjectFile: () => void;
  onOpenDepartmentModal: () => void;

  // Enrollment file state
  enrollmentFileName: string | null;
  enrollmentCount: number;
  onUploadEnrollmentFile: (file: File) => Promise<void>;
  onClearEnrollmentFile: () => void;

  // Weekly export files
  block1Weekly: BlockWeeklyData;
  block2Weekly: BlockWeeklyData;
  onUploadWeeklyFile: (block: BlockType, weekNumber: number, file: File) => Promise<void>;
  onClearWeeklyFile: (block: BlockType, weekNumber: number) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
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
}) => {
  const [activeBlockTab, setActiveBlockTab] = useState<BlockType>('B1');
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Hidden inputs
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const enrollmentInputRef = useRef<HTMLInputElement>(null);

  const activeWeeklyData = activeBlockTab === 'B1' ? block1Weekly : block2Weekly;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#0066B3]" />
            Khu vực nạp dữ liệu đào tạo (Upload Files)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải các file dữ liệu theo chuẩn FPT Polytechnic DNA để hệ thống tự động phân tích và tính toán OKR
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden md:inline">Tải mẫu chuẩn:</span>
          <button
            onClick={() => downloadSampleTemplate('mon_bomon')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
            title="Tải file mẫu Môn - Bộ môn.xlsx"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Môn-Bộ môn.xlsx</span>
          </button>
          <button
            onClick={() => downloadSampleTemplate('danh_sach_lop')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
            title="Tải file mẫu danh_sach_lop_mon.csv"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Phân lớp.csv</span>
          </button>
          <button
            onClick={() => downloadSampleTemplate('export_tuan')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
            title="Tải file mẫu export.csv"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Kết quả tuần.csv</span>
          </button>
        </div>
      </div>

      {/* Top 2 Primary Cards: Dictionary & Enrollment File */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. File Danh mục: 'Môn - Bộ môn.xlsx' */}
        <div
          className={`relative rounded-xl border-2 transition-all p-4 ${
            subjectFileName
              ? 'border-emerald-200 bg-emerald-50/20'
              : dragOverZone === 'subject'
              ? 'border-[#0066B3] bg-blue-50/40'
              : 'border-dashed border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverZone('subject');
          }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => {
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
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  subjectFileName
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100/60 text-[#0066B3]'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. File Danh mục Môn - Bộ môn
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">
                    (.xlsx / .csv)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {subjectFileName ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã nạp {customMappingCount} mã môn tùy chỉnh
                    </span>
                  ) : (
                    'Hệ thống đang dùng từ điển DNA mặc định (MUL, COM, BUS, VIE, ENT...)'
                  )}
                </p>
              </div>
            </div>

            {subjectFileName ? (
              <button
                onClick={onClearSubjectFile}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Xóa file danh mục tùy chỉnh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {subjectFileName ? `Tệp: ${subjectFileName}` : 'Từ điển DNA có sẵn'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDepartmentModal}
                className="text-xs font-semibold text-[#0066B3] hover:underline"
              >
                Xem từ điển
              </button>
              <button
                onClick={() => subjectInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
              >
                {subjectFileName ? 'Đổi tệp' : 'Tải file .xlsx'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. File Phân lớp: 'danh_sach_lop_mon.csv' (BẮT BUỘC) */}
        <div
          className={`relative rounded-xl border-2 transition-all p-4 ${
            enrollmentFileName
              ? 'border-blue-200 bg-blue-50/20'
              : dragOverZone === 'enrollment'
              ? 'border-[#0066B3] bg-blue-50/40'
              : 'border-dashed border-amber-300/80 bg-amber-50/20 hover:border-amber-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverZone('enrollment');
          }}
          onDragLeave={() => setDragOverZone(null)}
          onDrop={(e) => {
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
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  enrollmentFileName
                    ? 'bg-blue-100 text-[#0066B3]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. File Phân lớp danh_sach_lop_mon.csv
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Bắt buộc
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {enrollmentFileName ? (
                    <span className="text-[#0066B3] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã đếm {enrollmentCount.toLocaleString('vi-VN')} lượt SV & tự chia Block
                    </span>
                  ) : (
                    'Kéo thả file để đếm tổng lượt SV và chia Block 1, Block 2 theo ngày bắt đầu'
                  )}
                </p>
              </div>
            </div>

            {enrollmentFileName ? (
              <button
                onClick={onClearEnrollmentFile}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Xóa file phân lớp"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {enrollmentFileName ? `Tệp: ${enrollmentFileName}` : 'Chưa có file phân lớp'}
            </span>
            <button
              onClick={() => enrollmentInputRef.current?.click()}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
                enrollmentFileName
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-[#0066B3] hover:bg-[#005291] text-white'
              }`}
            >
              {enrollmentFileName ? 'Đổi tệp CSV' : 'Chọn file phân lớp .csv'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. File Kết quả học tập: 'export.csv' (Theo tuần) */}
      <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F37021] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                3. File Kết quả học tập export.csv theo tuần
              </h3>
              <p className="text-[11px] text-slate-500">
                Tải file export từng tuần để theo dõi tỷ lệ cấm thi (T1-T6) và chốt Pass (T8)
              </p>
            </div>
          </div>

          {/* Block Tabs: [Block 1] and [Block 2] */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl border border-slate-300/40">
            <button
              onClick={() => setActiveBlockTab('B1')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBlockTab === 'B1'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Block 1
            </button>
            <button
              onClick={() => setActiveBlockTab('B2')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBlockTab === 'B2'
                  ? 'bg-white text-[#0066B3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Block 2
            </button>
          </div>
        </div>

        {/* Weekly Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {WEEK_SLOTS.map((weekNum) => {
            const record = activeWeeklyData[weekNum];
            const isWeek8 = weekNum === 8;
            const inputId = `weekly-file-input-${activeBlockTab}-${weekNum}`;

            return (
              <div
                key={weekNum}
                className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  record
                    ? 'bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-200'
                    : 'bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
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

                {/* Slot Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isWeek8
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isWeek8 ? 'Tuần 8 (Pass)' : `Tuần ${weekNum}`}
                  </span>

                  {record ? (
                    <button
                      onClick={() => onClearWeeklyFile(activeBlockTab, weekNum)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title={`Xóa file Tuần ${weekNum}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* Slot Body */}
                <div className="my-2.5 min-h-[48px] flex flex-col justify-center">
                  {record ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate text-[11px]" title={record.fileName}>
                          {record.fileName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
                        <span>{record.rowCount.toLocaleString()} bản ghi</span>
                        <span className="text-emerald-600 font-semibold">Đã tính OKR</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-1">
                      <span className="text-[11px] text-slate-400 font-medium">Chưa có file</span>
                    </div>
                  )}
                </div>

                {/* Slot Action */}
                <button
                  onClick={() => {
                    const el = document.getElementById(inputId);
                    el?.click();
                  }}
                  className={`w-full py-1 px-2 rounded-lg text-[11px] font-semibold transition-all text-center ${
                    record
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-50 text-[#0066B3] hover:bg-blue-100 border border-blue-200/60'
                  }`}
                >
                  {record ? 'Nạp lại' : '+ Nạp CSV'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
