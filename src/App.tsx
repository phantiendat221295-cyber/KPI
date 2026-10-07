import React, { useState, useMemo, useCallback } from 'react';
import { DEFAULT_SEMESTER_CONFIG } from './constants';
import {
  BlockType,
  BlockWeeklyData,
  DnaDepartmentCode,
  SemesterConfig,
  StudentEnrollmentRow,
  ToastMessage,
} from './types';
import {
  parseSubjectDepartmentFile,
  parseEnrollmentFile,
  parseWeeklyResultFile,
  resolveDepartment,
} from './utils/parser';
import { determineBlockFromDate } from './utils/dateUtils';
import { computeTable1Data, computeTable2Data } from './utils/calculator';
import { exportOkrReportToExcel } from './utils/excelExport';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SummaryCards } from './components/SummaryCards';
import { UploadSection } from './components/UploadSection';
import { TableSummary } from './components/TableSummary';
import { TableWeeklyOKR } from './components/TableWeeklyOKR';
import { ConfigModal } from './components/ConfigModal';
import { DepartmentModal } from './components/DepartmentModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  // 1. Configuration State
  const [config, setConfig] = useState<SemesterConfig>(DEFAULT_SEMESTER_CONFIG);

  // 2. Custom Subject Mappings (Dictionary)
  const [customMappings, setCustomMappings] = useState<Record<string, DnaDepartmentCode>>({});
  const [subjectFileName, setSubjectFileName] = useState<string | null>(null);

  // 3. Raw Parsed Files & Enrollment State (ZERO MOCK DATA: starts completely empty)
  const [enrollmentFileName, setEnrollmentFileName] = useState<string | null>(null);
  const [rawEnrollmentFile, setRawEnrollmentFile] = useState<File | null>(null);
  const [enrollmentRows, setEnrollmentRows] = useState<StudentEnrollmentRow[]>([]);

  // 4. Weekly Export Files State for Block 1 and Block 2
  const [block1Weekly, setBlock1Weekly] = useState<BlockWeeklyData>({});
  const [block2Weekly, setBlock2Weekly] = useState<BlockWeeklyData>({});

  // 5. UI State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ==========================================
  // FILE HANDLERS
  // ==========================================

  // Handler 1: 'Môn - Bộ môn.xlsx'
  const handleUploadSubjectFile = async (file: File) => {
    try {
      const { mappings } = await parseSubjectDepartmentFile(file);
      const count = Object.keys(mappings).length;
      if (count === 0) {
        addToast(
          'warning',
          'Tệp danh mục không có dữ liệu',
          'Không tìm thấy cột Mã môn và Bộ môn hợp lệ trong file.'
        );
        return;
      }
      setCustomMappings(mappings);
      setSubjectFileName(file.name);
      addToast(
        'success',
        'Cập nhật từ điển môn học thành công',
        `Đã nạp ${count} mã môn và ánh xạ vào các bộ môn DNA từ "${file.name}".`
      );

      // Re-map existing enrollment rows if already loaded
      if (enrollmentRows.length > 0) {
        setEnrollmentRows((prev) =>
          prev.map((r) => ({
            ...r,
            department: resolveDepartment(r.subjectCode, mappings),
          }))
        );
      }
    } catch (err: any) {
      console.error('Error parsing subject dictionary:', err);
      addToast(
        'error',
        'Lỗi đọc file danh mục',
        err?.message || 'Không thể đọc tệp danh mục. Vui lòng kiểm tra định dạng Excel/CSV.'
      );
    }
  };

  const handleClearSubjectFile = () => {
    setCustomMappings({});
    setSubjectFileName(null);
    addToast('info', 'Đã xóa file danh mục', 'Hệ thống đã quay về từ điển tiền tố mặc định của DNA.');
    // Re-map existing enrollment rows
    if (enrollmentRows.length > 0) {
      setEnrollmentRows((prev) =>
        prev.map((r) => ({
          ...r,
          department: resolveDepartment(r.subjectCode, {}),
        }))
      );
    }
  };

  // Handler 2: 'danh_sach_lop_mon.csv' (BẮT BUỘC)
  const handleUploadEnrollmentFile = async (file: File) => {
    try {
      const { rows, totalRows } = await parseEnrollmentFile(file, config, customMappings);
      if (totalRows === 0) {
        addToast(
          'warning',
          'File phân lớp trống',
          'Không tìm thấy dữ liệu phân lớp trong tệp CSV.'
        );
        return;
      }
      setEnrollmentRows(rows);
      setEnrollmentFileName(file.name);
      setRawEnrollmentFile(file);

      const b1Count = rows.filter((r) => r.block === 'B1').length;
      const b2Count = rows.filter((r) => r.block === 'B2').length;

      addToast(
        'success',
        'Nạp file phân lớp thành công',
        `Đã đọc ${totalRows.toLocaleString()} lượt SV (Block 1: ${b1Count.toLocaleString()} | Block 2: ${b2Count.toLocaleString()}).`
      );
    } catch (err: any) {
      console.error('Error parsing enrollment file:', err);
      addToast(
        'error',
        'Lỗi đọc file phân lớp',
        err?.message || 'Không thể đọc file danh_sach_lop_mon.csv. Vui lòng kiểm tra cấu trúc CSV.'
      );
    }
  };

  const handleClearEnrollmentFile = () => {
    setEnrollmentRows([]);
    setEnrollmentFileName(null);
    setRawEnrollmentFile(null);
    addToast('info', 'Đã xóa file phân lớp', 'Đã đặt lại số lượt sinh viên về 0.');
  };

  // Handler 3: 'export.csv' (Theo tuần cho Block 1 và Block 2)
  const handleUploadWeeklyFile = async (block: BlockType, weekNumber: number, file: File) => {
    try {
      const { rows, totalRows } = await parseWeeklyResultFile(file, config, block, customMappings);
      if (totalRows === 0) {
        addToast(
          'warning',
          `File Tuần ${weekNumber} trống`,
          'Không tìm thấy bản ghi kết quả sinh viên hợp lệ trong tệp.'
        );
        return;
      }

      const newRecord = {
        weekNumber,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toLocaleTimeString('vi-VN'),
        rowCount: totalRows,
        results: rows,
      };

      if (block === 'B1') {
        setBlock1Weekly((prev) => ({ ...prev, [weekNumber]: newRecord }));
      } else {
        setBlock2Weekly((prev) => ({ ...prev, [weekNumber]: newRecord }));
      }

      addToast(
        'success',
        `Đã nạp file Tuần ${weekNumber} (${block === 'B1' ? 'Block 1' : 'Block 2'})`,
        `Đã cập nhật ${totalRows.toLocaleString()} bản ghi kết quả cho ${block}.`
      );
    } catch (err: any) {
      console.error(`Error parsing weekly file for ${block} W${weekNumber}:`, err);
      addToast(
        'error',
        `Lỗi đọc file Tuần ${weekNumber}`,
        err?.message || 'Không thể xử lý tệp CSV kết quả tuần.'
      );
    }
  };

  const handleClearWeeklyFile = (block: BlockType, weekNumber: number) => {
    if (block === 'B1') {
      setBlock1Weekly((prev) => {
        const copy = { ...prev };
        delete copy[weekNumber];
        return copy;
      });
    } else {
      setBlock2Weekly((prev) => {
        const copy = { ...prev };
        delete copy[weekNumber];
        return copy;
      });
    }
    addToast('info', `Đã gỡ file Tuần ${weekNumber}`, `Đã xóa dữ liệu tuần này của ${block}.`);
  };

  // Handler 4: Config Update
  const handleSaveConfig = (newConfig: SemesterConfig) => {
    setConfig(newConfig);
    addToast('success', 'Đã cập nhật mốc kỳ', `Mốc thời gian kỳ ${newConfig.semesterName} đã được áp dụng.`);

    // If enrollment data already exists, recalculate blocks
    if (enrollmentRows.length > 0) {
      setEnrollmentRows((prev) =>
        prev.map((row) => ({
          ...row,
          block: determineBlockFromDate(
            row.startDate || row.rawRow?.['Ngày bắt đầu'],
            newConfig,
            row.classCode
          ),
        }))
      );
    }
  };

  // Custom mapping additions
  const handleAddOrUpdateMapping = (subjectCode: string, department: DnaDepartmentCode) => {
    setCustomMappings((prev) => ({ ...prev, [subjectCode]: department }));
    addToast('success', 'Đã lưu ánh xạ', `Mã môn ${subjectCode} → Bộ môn ${department}`);
    if (enrollmentRows.length > 0) {
      setEnrollmentRows((prev) =>
        prev.map((r) =>
          r.subjectCode === subjectCode ? { ...r, department } : r
        )
      );
    }
  };

  const handleRemoveMapping = (subjectCode: string) => {
    setCustomMappings((prev) => {
      const copy = { ...prev };
      delete copy[subjectCode];
      return copy;
    });
    addToast('info', 'Đã xóa ánh xạ', `Đã xóa quy tắc cho mã môn ${subjectCode}`);
  };

  // ==========================================
  // COMPUTED TABLES (CALCULATIONS)
  // ==========================================
  const { rows: table1Rows, totalRow: table1Total } = useMemo(() => {
    return computeTable1Data(enrollmentRows, block1Weekly, block2Weekly);
  }, [enrollmentRows, block1Weekly, block2Weekly]);

  const { rows: table2B1Rows, totalRow: table2B1Total } = useMemo(() => {
    return computeTable2Data(block1Weekly);
  }, [block1Weekly]);

  const { rows: table2B2Rows, totalRow: table2B2Total } = useMemo(() => {
    return computeTable2Data(block2Weekly);
  }, [block2Weekly]);

  const hasEnrollmentData = enrollmentRows.length > 0;
  const hasExportData =
    Object.values(block1Weekly).some((v) => v && v.results.length > 0) ||
    Object.values(block2Weekly).some((v) => v && v.results.length > 0);

  // Quick Excel Export
  const handleExportExcel = () => {
    try {
      exportOkrReportToExcel(
        config,
        table1Rows,
        table1Total,
        table2B1Rows,
        table2B1Total,
        table2B2Rows,
        table2B2Total
      );
      addToast(
        'success',
        'Xuất file Excel thành công',
        'Tệp báo cáo OKR DNA (.xlsx) đã được tải xuống máy tính của bạn.'
      );
    } catch (err: any) {
      console.error('Error exporting excel:', err);
      addToast('error', 'Lỗi xuất file Excel', err?.message || 'Không thể tạo file Excel.');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. LEFT SIDEBAR (CLEAN LIGHT THEME) */}
      <Sidebar
        activeView="statistics"
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenDepartment={() => setIsDeptModalOpen(true)}
        onExportExcel={handleExportExcel}
        hasData={hasEnrollmentData || hasExportData}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          config={config}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />

        {/* Main Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Summary KPI Cards (Strict Zero Mock Data) */}
          <SummaryCards
            hasEnrollmentData={hasEnrollmentData}
            hasExportData={hasExportData}
            table1Total={table1Total}
          />

          {/* Upload & File Processing Zone */}
          <UploadSection
            subjectFileName={subjectFileName}
            customMappingCount={Object.keys(customMappings).length}
            onUploadSubjectFile={handleUploadSubjectFile}
            onClearSubjectFile={handleClearSubjectFile}
            onOpenDepartmentModal={() => setIsDeptModalOpen(true)}
            enrollmentFileName={enrollmentFileName}
            enrollmentCount={enrollmentRows.length}
            onUploadEnrollmentFile={handleUploadEnrollmentFile}
            onClearEnrollmentFile={handleClearEnrollmentFile}
            block1Weekly={block1Weekly}
            block2Weekly={block2Weekly}
            onUploadWeeklyFile={handleUploadWeeklyFile}
            onClearWeeklyFile={handleClearWeeklyFile}
          />

          {/* Table 1: Thống kê FA26, Block 1, Block 2 */}
          <TableSummary
            rows={table1Rows}
            totalRow={table1Total}
            searchTerm={searchTerm}
            hasEnrollmentData={hasEnrollmentData}
            hasExportData={hasExportData}
            onExportExcel={handleExportExcel}
          />

          {/* Table 2: Theo dõi OKR hàng tuần Block 1 & Block 2 */}
          <TableWeeklyOKR
            b1Rows={table2B1Rows}
            b1Total={table2B1Total}
            b2Rows={table2B2Rows}
            b2Total={table2B2Total}
            block1Weekly={block1Weekly}
            block2Weekly={block2Weekly}
            searchTerm={searchTerm}
            onExportExcel={handleExportExcel}
          />
        </main>
      </div>

      {/* Modals & Dialogs */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        config={config}
        onSave={handleSaveConfig}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <DepartmentModal
        isOpen={isDeptModalOpen}
        customMappings={customMappings}
        onAddOrUpdateMapping={handleAddOrUpdateMapping}
        onRemoveMapping={handleRemoveMapping}
        onClose={() => setIsDeptModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
