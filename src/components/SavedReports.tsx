/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { FileText, Trash2, Printer, ChevronRight, History, Sparkles } from 'lucide-react';
import { ActivityReport } from '../types';
import { DESTINATIONS } from '../data';

interface SavedReportsProps {
  reports: ActivityReport[];
  onLoadReport: (report: ActivityReport) => void;
  onDeleteReport: (id: string) => void;
}

export default function SavedReports({ reports, onLoadReport, onDeleteReport }: SavedReportsProps) {
  if (reports.length === 0) {
    return null;
  }

  const getIndonesianDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getDestTitle = (destId: string) => {
    const d = DESTINATIONS.find(item => item.id === destId);
    return d ? d.title : destId;
  };

  const getThemeColorClass = (destId: string) => {
    switch (destId) {
      case 'jogjakarta':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'blitar':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      default:
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
          <div className="p-2 bg-gray-100 text-gray-700 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-1.5">
              Arsip Laporan Kamu ({reports.length})
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 border border-gray-200 text-gray-500 px-2.5 py-0.5 rounded-full font-sans font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-brand" /> Tersimpan di Browser
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">Daftar seluruh laporan kegiatan field school yang pernah kamu buat di perangkat ini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:border-brand transition-all shadow-xs duration-200 group animate-none"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                onClick={() => onLoadReport(report)}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${getThemeColorClass(report.destination)}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono capitalize flex items-center gap-1 mb-0.5">
                    {getDestTitle(report.destination)}
                  </h4>
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-brand transition-colors">
                    {report.studentName}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Kelas: {report.studentClass} • {getIndonesianDate(report.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onLoadReport(report)}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-brand rounded-lg transition-colors cursor-pointer"
                  title="Buka Laporan"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Laporan Dari Browser"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
