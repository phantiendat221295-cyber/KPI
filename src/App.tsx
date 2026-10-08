import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DEFAULT_SEMESTER_CONFIG } from './constants';
import {
  BlockType,
  BlockWeeklyData,
  CloudSyncPayload,
  DnaDepartmentCode,
  SemesterConfig,
  StudentEnrollmentRow,
  ToastMessage,
  UserRole,
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
import {
  APPS_SCRIPT_STORAGE_KEY,
  USER_ROLE_STORAGE_KEY,
  LAST_SYNC_STORAGE_KEY,
  LOCAL_STORAGE_DATA_KEY,
  getEffectiveCloudUrl,
  testCloudConnection,
  fetchStateFromGoogleSheets,
  syncStateToGoogleSheets,
  isValidCloudPayload,
  preparePayloadForCloud,
} from './utils/cloudSync';

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

// 1. Helper to synchronously read LocalStorage on initial load (0.01s instant render)
function loadInitialLocalData(): CloudSyncPayload | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidCloudPayload(parsed)) {
      return parsed as CloudSyncPayload;
    }
  } catch (e) {
    console.warn('Error reading FPT_DNA_DATA from localStorage:', e);
  }
  return null;
}

export default function App() {
  // Read local cache immediately to ensure zero delay upon F5 / reload
  const cachedData = useMemo(() => loadInitialLocalData(), []);

  // 1. Configuration & Cloud API URL (Auto-resolved for all devices without URL params)
  const [config, setConfig] = useState<SemesterConfig>(() => cachedData?.config || DEFAULT_SEMESTER_CONFIG);
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => getEffectiveCloudUrl());

  // 2. User Role & Cloud Sync Metadata
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'viewer' || roleParam === 'admin') return roleParam;
    return (localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole) || 'admin';
  });

  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return cachedData?.updatedAt || localStorage.getItem(LAST_SYNC_STORAGE_KEY) || null;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFetchingCloud, setIsFetchingCloud] = useState<boolean>(false);

  // 3. Custom Subject Mappings (Dictionary)
  const [customMappings, setCustomMappings] = useState<Record<string, DnaDepartmentCode>>(
    () => cachedData?.customMappings || {}
  );
  const [subjectFileName, setSubjectFileName] = useState<string | null>(() => cachedData?.subjectFileName ?? null);

  // 4. Raw Parsed Files & Enrollment State
  const [enrollmentFileName, setEnrollmentFileName] = useState<string | null>(
    () => cachedData?.enrollmentFileName ?? null
  );
  const [rawEnrollmentFile, setRawEnrollmentFile] = useState<File | null>(null);
  const [enrollmentRows, setEnrollmentRows] = useState<StudentEnrollmentRow[]>(
    () => cachedData?.enrollmentRows || []
  );

  // 5. Weekly Export Files State for Block 1 and Block 2
  const [block1Weekly, setBlock1Weekly] = useState<BlockWeeklyData>(() => cachedData?.block1Weekly || {});
  const [block2Weekly, setBlock2Weekly] = useState<BlockWeeklyData>(() => cachedData?.block2Weekly || {});

  // 6. UI Navigation & Search State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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
  // 2-LAYER PROTECTION: AUTO-SAVE TO LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    const hasData =
      enrollmentRows.length > 0 ||
      Object.values(block1Weekly).some(Boolean) ||
      Object.values(block2Weekly).some(Boolean) ||
      Object.keys(customMappings).length > 0;

    if (hasData) {
      const payload: CloudSyncPayload = {
        updatedAt: lastSyncedAt || new Date().toLocaleString('vi-VN'),
        updatedBy: 'Đạt Pic (Cán bộ Đào tạo DNA)',
        config,
        customMappings,
        subjectFileName,
        enrollmentFileName,
        enrollmentRows,
        block1Weekly,
        block2Weekly,
      };

      try {
        const cleanPayload = preparePayloadForCloud(payload);
        localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(cleanPayload));
      } catch (err) {
        console.warn('LocalStorage error while saving FPT_DNA_DATA:', err);
      }
    }
  }, [
    config,
    customMappings,
    subjectFileName,
    enrollmentFileName,
    enrollmentRows,
    block1Weekly,
    block2Weekly,
    lastSyncedAt,
  ]);

  // Apply Cloud Data Helper (Only when valid data is received)
  const applyCloudPayload = useCallback((data: CloudSyncPayload) => {
    if (!isValidCloudPayload(data)) return;

    if (data.config) setConfig(data.config);
    if (data.customMappings) setCustomMappings(data.customMappings);
    if (data.subjectFileName !== undefined) setSubjectFileName(data.subjectFileName);
    if (data.enrollmentFileName !== undefined) setEnrollmentFileName(data.enrollmentFileName);
    if (data.enrollmentRows) setEnrollmentRows(data.enrollmentRows);
    if (data.block1Weekly) setBlock1Weekly(data.block1Weekly);
    if (data.block2Weekly) setBlock2Weekly(data.block2Weekly);

    const timestamp = data.updatedAt || new Date().toLocaleString('vi-VN');
    setLastSyncedAt(timestamp);
    localStorage.setItem(LAST_SYNC_STORAGE_KEY, timestamp);
    localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
  }, []);

  // ==========================================
  // BACKGROUND AUTO-FETCH FROM GOOGLE SHEETS
  // ==========================================
  useEffect(() => {
    if (!appsScriptUrl || !appsScriptUrl.trim()) return;

    let isMounted = true;
    const autoFetchBackground = async () => {
      setIsFetchingCloud(true);
      const res = await fetchStateFromGoogleSheets(appsScriptUrl);
      if (!isMounted) return;
      setIsFetchingCloud(false);

      // ONLY overwrite if Google Sheets returns valid non-empty data!
      if (res.success && res.data && isValidCloudPayload(res.data)) {
        applyCloudPayload(res.data);
        addToast(
          'success',
          'Đồng bộ từ Google Sheets',
          `Đã tải bản mới nhất từ Cloud (${res.data.enrollmentRows?.length || 0} lượt SV).`
        );
      } else {
        // If sheet is empty or invalid, DO NOT OVERWRITE current local data!
        console.info('Google Sheets is empty or unchanged; preserving local data.');
      }
    };

    autoFetchBackground();
    return () => {
      isMounted = false;
    };
  }, [appsScriptUrl, applyCloudPayload, addToast]);

  // Manual Refresh from Cloud
  const handleFetchFromCloud = async () => {
    if (!appsScriptUrl) {
      setIsConfigModalOpen(true);
      addToast('info', 'Chưa có URL API', 'Vui lòng nhập Google Apps Script URL để đồng bộ.');
      return;
    }

    setIsFetchingCloud(true);
    const res = await fetchStateFromGoogleSheets(appsScriptUrl);
    setIsFetchingCloud(false);

    if (res.success && res.data && isValidCloudPayload(res.data)) {
      applyCloudPayload(res.data);
      addToast(
        'success',
        'Làm mới thành công',
        `Đã cập nhật dữ liệu mới nhất từ Google Sheets lúc ${res.data.updatedAt || 'vừa xong'}.`
      );
    } else {
      addToast('warning', 'Trang tính chưa có dữ liệu mới', 'Dữ liệu cục bộ trên máy của bạn được giữ nguyên.');
    }
  };

  // Sync To Cloud (POST)
  const handleSyncToCloud = async () => {
    if (!appsScriptUrl) {
      setIsConfigModalOpen(true);
      addToast('info', 'Chưa cấu hình Google Apps Script URL', 'Vui lòng nhập URL Web App trong modal Cấu hình.');
      return;
    }

    const nowStr = new Date().toLocaleString('vi-VN');
    const rawPayload: CloudSyncPayload = {
      updatedAt: nowStr,
      updatedBy: 'Đạt Pic (Cán bộ Đào tạo DNA)',
      config,
      customMappings,
      subjectFileName,
      enrollmentFileName,
      enrollmentRows,
      block1Weekly,
      block2Weekly,
    };

    // Sanitize payload to strip rawRow and prevent cell size overflow
    const cleanPayload = preparePayloadForCloud(rawPayload);

    // Save locally first
    try {
      localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(cleanPayload));
    } catch (e) {
      console.warn('Error saving to local storage:', e);
    }

    setIsSyncing(true);
    const res = await syncStateToGoogleSheets(appsScriptUrl, cleanPayload);
    setIsSyncing(false);

    if (res.success) {
      setLastSyncedAt(nowStr);
      localStorage.setItem(LAST_SYNC_STORAGE_KEY, nowStr);
      addToast(
        'success',
        'Đồng bộ lên Cloud thành công',
        'Đã lưu dữ liệu lên Google Sheets! Bất kỳ ai mở link https://kpi-daotao-dna.vercel.app/ cũng sẽ xem được ngay.'
      );
    } else {
      addToast('error', 'Lỗi gửi dữ liệu lên Google Sheets', res.message || 'Không thể gửi dữ liệu lên máy chủ.');
    }
  };

  // Test Connection
  const handleTestConnection = async (testUrl: string): Promise<{ success: boolean; message: string }> => {
    return await testCloudConnection(testUrl);
  };

  // Toggle Role
  const handleToggleRole = () => {
    const nextRole: UserRole = userRole === 'admin' ? 'viewer' : 'admin';
    setUserRole(nextRole);
    localStorage.setItem(USER_ROLE_STORAGE_KEY, nextRole);
    addToast(
      'info',
      `Đã chuyển sang ${nextRole === 'admin' ? 'Chế độ Quản trị' : 'Chế độ Người xem'}`,
      nextRole === 'admin' ? 'Bạn có thể upload và đồng bộ dữ liệu.' : 'Chế độ xem bảng báo cáo trực quan.'
    );
  };

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

      // Re-map existing enrollment rows
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
  const handleSaveConfig = async (newConfig: SemesterConfig, newUrl: string) => {
    setConfig(newConfig);
    const trimmed = newUrl.trim();
    setAppsScriptUrl(trimmed);
    if (trimmed) {
      localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(APPS_SCRIPT_STORAGE_KEY);
    }
    addToast('success', 'Đã lưu cấu hình', 'Mốc thời gian và kết nối Cloud Google Sheets đã được cập nhật.');

    // If local enrollment is empty and URL is valid, fetch immediately from cloud
    if (trimmed && enrollmentRows.length === 0) {
      setIsFetchingCloud(true);
      const res = await fetchStateFromGoogleSheets(trimmed);
      setIsFetchingCloud(false);
      if (res.success && res.data && isValidCloudPayload(res.data)) {
        applyCloudPayload(res.data);
        addToast(
          'success',
          'Đã tải dữ liệu từ Cloud',
          `Đã đồng bộ ${res.data.enrollmentRows?.length || 0} lượt sinh viên từ Google Sheets.`
        );
      }
    }

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
    <div className="min-h-screen flex bg-[#F9FAFB] text-gray-800 antialiased font-sans">
      {/* 1. LEFT SIDEBAR (PORTAL AP FPT POLYTECHNIC ĐỒNG NAI) */}
      <Sidebar
        activeView="statistics"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenDepartment={() => setIsDeptModalOpen(true)}
        onExportExcel={handleExportExcel}
        hasData={hasEnrollmentData || hasExportData}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          config={config}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          onExportExcel={handleExportExcel}
          hasCloudApi={Boolean(appsScriptUrl && appsScriptUrl.trim())}
          isSyncing={isSyncing}
          isFetchingCloud={isFetchingCloud}
          lastSyncedAt={lastSyncedAt}
          onSyncToCloud={handleSyncToCloud}
          onFetchFromCloud={handleFetchFromCloud}
          userRole={userRole}
          onToggleRole={handleToggleRole}
        />

        {/* Main Body */}
        <main className="flex-1 p-5 space-y-4 max-w-7xl mx-auto w-full">
          {/* Summary KPI Cards */}
          <SummaryCards
            hasEnrollmentData={hasEnrollmentData}
            hasExportData={hasExportData}
            table1Total={table1Total}
          />

          {/* Upload & Cloud Processing Zone */}
          <UploadSection
            userRole={userRole}
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
            hasCloudApi={Boolean(appsScriptUrl && appsScriptUrl.trim())}
            isSyncing={isSyncing}
            onSyncToCloud={handleSyncToCloud}
            onOpenConfig={() => setIsConfigModalOpen(true)}
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
        appsScriptUrl={appsScriptUrl}
        onSave={handleSaveConfig}
        onTestConnection={handleTestConnection}
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
