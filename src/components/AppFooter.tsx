import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { APP_VERSION, CHANGELOG, formatBuildTime } from '../version';

interface AppFooterProps {
  lastSyncedAt: string | null;
  semesterName: string;
}

export const AppFooter: React.FC<AppFooterProps> = ({ lastSyncedAt, semesterName }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <footer className="mt-2 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto w-full px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span>© {new Date().getFullYear()} FPT Polytechnic Đồng Nai · Phòng Đào tạo</span>
          <span className="text-gray-300">|</span>
          <span>Kỳ {semesterName}</span>
          {lastSyncedAt && (
            <>
              <span className="text-gray-300">|</span>
              <span>Dữ liệu cập nhật: {lastSyncedAt}</span>
            </>
          )}
        </div>

        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 font-mono transition-colors"
            title={`Bản build ${formatBuildTime()}`}
          >
            <Sparkles className="w-3 h-3 text-[#F37021]" />
            <span>v{APP_VERSION}</span>
            <span className="text-gray-400 hidden sm:inline">· {formatBuildTime()}</span>
          </button>

          {open && (
            <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg p-4 z-40 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800">Có gì mới</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700" aria-label="Đóng">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {CHANGELOG.map((c) => (
                  <div key={c.version}>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono font-semibold text-[#0066B3]">v{c.version}</span>
                      <span className="text-gray-400">{c.date}</span>
                    </div>
                    <ul className="mt-1 space-y-1 list-disc pl-4 text-[11px] text-gray-600 leading-snug">
                      {c.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
