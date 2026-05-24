/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  Table, 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  GraduationCap, 
  X, 
  FileText, 
  HelpCircle,
  ExternalLink,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { ActivityReport, DestinationType } from '../types';
import { DESTINATIONS } from '../data';
import { firebaseService } from '../firebase';

interface TeacherPanelProps {
  onBack: () => void;
  onViewReport: (report: ActivityReport) => void;
}

export default function TeacherPanel({ onBack, onViewReport }: TeacherPanelProps) {
  const [reports, setReports] = useState<ActivityReport[]>(() => {
    try {
      const saved = localStorage.getItem('imported_teacher_reports_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedDest, setSelectedDest] = useState('ALL');
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with Cloud Firestore if it is securely configured
  const syncReportsFromCloud = async () => {
    if (!firebaseService.isEnabled()) return;
    setIsSyncing(true);
    try {
      const cloudReports = await firebaseService.getAllReports();
      setReports(cloudReports);
    } catch (err) {
      console.warn('Could not sync cloud reports:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync initially on load
  useEffect(() => {
    syncReportsFromCloud();
  }, []);

  // Sync to local storage for teacher
  useEffect(() => {
    try {
      localStorage.setItem('imported_teacher_reports_v1', JSON.stringify(reports));
    } catch (err) {
      console.warn('LocalStorage limit exceeded or not allowed', err);
    }
  }, [reports]);

  // Extract all unique classes present in imported data
  const classList = ['ALL', ...Array.from(new Set(reports.map(r => r.studentClass))).sort()];

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || r.studentClass === selectedClass;
    const matchesDest = selectedDest === 'ALL' || r.destination === selectedDest;
    return matchesSearch && matchesClass && matchesDest;
  });

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportStatus(null);
    let loadedCount = 0;
    let failedCount = 0;
    const incomingReports: ActivityReport[] = [];

    const fileList = Array.from(files) as File[];
    let processed = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          // Simple validation of ActivityReport structure
          if (parsed && parsed.studentName && parsed.studentClass && parsed.destination && Array.isArray(parsed.answers)) {
            incomingReports.push(parsed);
            loadedCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }

        processed++;
        if (processed === fileList.length) {
          // Combine and filter duplicates by report id
          setReports(prev => {
            const combined = [...prev, ...incomingReports];
            // Remove duplicates
            const unique = combined.reduce((acc: ActivityReport[], curr) => {
              if (!acc.some(item => item.id === curr.id)) {
                acc.push(curr);
              }
              return acc;
            }, []);
            return unique;
          });
          setImportStatus({ success: loadedCount, failed: failedCount });
          setIsImporting(false);
          // clear input
          e.target.value = '';
        }
      };

      reader.onerror = () => {
        failedCount++;
        processed++;
        if (processed === fileList.length) {
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    });
  };

  const getDestinationLabel = (dest: string) => {
    const d = DESTINATIONS.find(item => item.id === dest);
    return d ? d.title : dest;
  };

  const handleDeleteReport = (idToDel: string) => {
    if (confirm('Hapus laporan siswa ini dari panel penilaian guru? (Data asli di perangkat siswa tidak hilang)')) {
      setReports(prev => prev.filter(r => r.id !== idToDel));
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data rekap siswa di panel ini?')) {
      setReports([]);
      setImportStatus(null);
    }
  };

  const exportToCSV = () => {
    if (reports.length === 0) return;

    // Define CSV Headers
    // Header for max answers (we have up to 5 questions)
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
      "No Laporan", 
      "Nama Siswa", 
      "Kelas", 
      "Jalur Kegiatan", 
      "Tanggal Submit", 
      "Jumlah Foto", 
      "Link Vlog Video",
      "Jawaban Pertanyaan 1",
      "Jawaban Pertanyaan 2",
      "Jawaban Pertanyaan 3",
      "Jawaban Pertanyaan 4",
      "Jawaban Pertanyaan 5"
    ];

    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    reports.forEach(r => {
      const row = [
        r.reportNumber,
        r.studentName,
        r.studentClass,
        getDestinationLabel(r.destination),
        new Date(r.createdAt).toLocaleDateString('id-ID'),
        (r.uploadedPhotos?.length || 0).toString(),
        r.videoLink || "-",
        r.answers[0]?.answerText || "",
        r.answers[1]?.answerText || "",
        r.answers[2]?.answerText || "",
        r.answers[3]?.answerText || "",
        r.answers[4]?.answerText || ""
      ];

      csvContent += row.map(val => `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_laporan_spega2_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Get statistics
  const stats = {
    total: reports.length,
    jogja: reports.filter(r => r.destination === 'jogjakarta').length,
    blitar: reports.filter(r => r.destination === 'blitar').length,
    mandiri: reports.filter(r => r.destination === 'mandiri').length,
    ttg: reports.filter(r => r.destination === 'teknologi_tepat_guna').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-gray-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded border border-indigo-500/30">
              HALAMAN KHUSUS PENDIDIK
            </span>
            <span className="text-xs text-indigo-200">
              UPT SMPN 2 Gandusari Blitar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Panel Khusus Guru & Rekap Nilai Siswa
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
            Gunakan panel luring mandiri ini untuk mengumpulkan, mengoreksi, merekap, dan mencetak laporan resmi dari puluhan hingga ratusan file backup <code className="bg-white/10 px-1 py-0.5 rounded font-mono font-bold text-yellow-300">.json</code> yang dikirimkan oleh siswa.
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer border border-white/10 transition-colors h-10 shrink-0 uppercase tracking-wider"
        >
          <X className="w-4 h-4" />
          Keluar Panel
        </button>
      </div>

      {/* Grid Dashboard Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">TOTAL MASUK</span>
          <p className="text-2xl font-display font-medium text-gray-950 mt-1">{stats.total} Berkas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">YOGYAKARTA</span>
          <p className="text-xl font-display font-semibold text-emerald-600 mt-1">{stats.jogja} Berkas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">KAMPUNG COKLAT</span>
          <p className="text-xl font-display font-semibold text-amber-600 mt-1">{stats.blitar} Berkas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">RUTE MANDIRI / UMKM</span>
          <p className="text-xl font-display font-semibold text-indigo-600 mt-1">{stats.mandiri} Berkas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">TEKNOLOGI TEPAT GUNA</span>
          <p className="text-xl font-display font-semibold text-purple-600 mt-1">{stats.ttg} Berkas</p>
        </div>
      </div>

      {/* Upload Box (Drop Area) */}
      <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs relative overflow-hidden bg-indigo-50/5/5">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tarik / Impor Berkas Laporan Siswa</h3>
            <p className="text-xs text-gray-400 mt-1">
              Klik pemilih dokumen di bawah, pilih banyak berkas berformat <code className="font-mono bg-gray-100 text-gray-600 px-1 rounded font-semibold">.json</code> kiriman murid Anda sekaligus untuk direkap otomatis.
            </p>
          </div>

          <label className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all h-10">
            <FolderOpen className="w-4 h-4" />
            Pilih Berkas (.json) Siswa
            <input
              type="file"
              multiple
              accept=".json"
              onChange={handleJsonImport}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <div className="max-w-md mx-auto p-3.5 bg-green-50/70 border border-green-250 rounded-xl flex items-center justify-between text-xs text-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                Berhasil merakit <strong>{importStatus.success}</strong> berkas baru! 
                {importStatus.failed > 0 && ` (Gagal: ${importStatus.failed})`}
              </span>
            </div>
            <button 
              onClick={() => setImportStatus(null)}
              className="text-green-700 hover:text-green-950 font-bold"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Main Datatable Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Actions header and filters */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Table className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Daftar Rekapitulasi Laporan</h3>
                {firebaseService.isEnabled() ? (
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-150 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    CLOUD AKTIF
                  </span>
                ) : (
                  <span className="text-[9px] bg-amber-50 text-amber-700 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-150 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    LURING (LOKAL)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Mencari, memfilter kelas, mengekspor data ke Excel/CSV, atau mencetak satu per satu.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {firebaseService.isEnabled() && (
              <button
                onClick={syncReportsFromCloud}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors h-9 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Menyinkronkan...' : 'Segarkan Cloud'}
              </button>
            )}

            {reports.length > 0 && (
              <>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors h-9"
                  title="Unduh format Excel CSV luring"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Ekspor ke Excel (CSV)
                </button>

                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors h-9"
                >
                  <Trash2 className="w-4 h-4" />
                  Kosongkan Tabel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters and search input panel */}
        <div className="p-5 border-b border-gray-150 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama siswa atau no. laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand pl-9 pr-4 py-2 rounded-xl bg-gray-50/50 transition-all placeholder:text-gray-400 h-9"
            />
          </div>

          {/* Filter Destination */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full text-xs font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand pl-9 pr-4 py-2 rounded-xl bg-gray-50/50 transition-all text-gray-600 h-9 cursor-pointer"
            >
              <option value="ALL">Semua Jalur Kegiatan</option>
              <option value="jogjakarta">Yogyakarta (Sains PIAT UGM)</option>
              <option value="blitar">Kampung Coklat Blitar</option>
              <option value="mandiri">Rute Mandiri (Vlog UMKM)</option>
              <option value="teknologi_tepat_guna">Tema 3: Teknologi Tepat Guna (TTG)</option>
            </select>
          </div>

          {/* Filter Class */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand pl-9 pr-4 py-2 rounded-xl bg-gray-50/50 transition-all text-gray-600 h-9 cursor-pointer"
            >
              <option value="ALL">Semua Kelas ({classList.length - 1} Terdaftar)</option>
              {classList.filter(c => c !== 'ALL').map(cl => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          {filteredReports.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="text-gray-300 flex justify-center">
                <FileText className="w-12 h-12" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400">Tidak ada berkas laporan yang ditemukan</p>
                <p className="text-xs text-gray-408 mt-1">Silakan unggah berkas .json atau gunakan kotak filter di atas.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-250 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                  <th className="py-3.5 px-5 select-none">No</th>
                  <th className="py-3.5 px-5">No. Laporan</th>
                  <th className="py-3.5 px-5">Nama Siswa</th>
                  <th className="py-3.5 px-5 text-center">Kelas</th>
                  <th className="py-3.5 px-5">Jalur Kegiatan</th>
                  <th className="py-3.5 px-5 text-center">Foto</th>
                  <th className="py-3.5 px-5 text-center">Vlog</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-xs">
                {filteredReports.map((report, index) => {
                  const mediaCount = report.uploadedPhotos?.length || 0;
                  const hasVlog = !!report.videoLink;
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-gray-400 font-mono text-center font-bold">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-gray-400 font-bold">
                        {report.reportNumber}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900">
                        {report.studentName}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-center text-gray-700 bg-gray-50/50">
                        {report.studentClass}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-gray-700">
                          {getDestinationLabel(report.destination)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-flex items-center justify-center font-mono font-bold rounded-md px-2 py-0.5 text-[10px] ${
                          mediaCount > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {mediaCount} Foto
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {hasVlog ? (
                          <a 
                            href={report.videoLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline"
                            title={report.videoLink}
                          >
                            Ada <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onViewReport(report)}
                          className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Koreksi & Cetak
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="inline-flex items-center justify-center text-gray-400 hover:text-red-600 p-2.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus laporan dari rekap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
