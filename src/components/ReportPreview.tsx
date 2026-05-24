/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, 
  Copy, 
  Download, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  Award, 
  Calendar, 
  Hash, 
  Info,
  ExternalLink,
  Cloud
} from 'lucide-react';
import { DESTINATIONS, DESTINATION_QUESTIONS } from '../data';
import { ActivityReport } from '../types';
import React, { useState } from 'react';
import { firebaseService } from '../firebase';

interface ReportPreviewProps {
  report: ActivityReport;
  onEdit: () => void;
  onRestart: () => void;
  fromTeacherPanel?: boolean;
  onBackToTeacher?: () => void;
}

export default function ReportPreview({ 
  report, 
  onEdit, 
  onRestart,
  fromTeacherPanel = false,
  onBackToTeacher
}: ReportPreviewProps) {
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const destInfo = DESTINATIONS.find(d => d.id === report.destination) || DESTINATIONS[0];
  const questions = DESTINATION_QUESTIONS[report.destination] || [];

  // Get date in Indonesian locale style e.g., "24 Mei 2026"
  const getIndonesianDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '24 Mei 2026';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    let text = `==================================================\n`;
    text += `  LAPORAN RESMI KEGIATAN FIELD SCHOOL LITERASI\n`;
    text += `==================================================\n\n`;
    text += `NOMOR LAPORAN : ${report.reportNumber}\n`;
    text += `NAMA SISWA    : ${report.studentName}\n`;
    text += `KELAS         : ${report.studentClass}\n`;
    text += `JALUR KEGIATAN: ${destInfo.title}\n`;
    text += `TANGGAL       : ${getIndonesianDate(report.createdAt)}\n\n`;
    text += `--------------------------------------------------\n`;
    text += `HASIL PENGAMATAN & JAWABAN LITERASI\n`;
    text += `--------------------------------------------------\n\n`;

    questions.forEach((q, idx) => {
      const ansObj = report.answers.find(a => a.questionId === q.id);
      const ansText = ansObj ? ansObj.answerText : '(Belum dijawab)';
      text += `${idx + 1}. ${q.label}\n`;
      text += `   Jawaban: ${ansText}\n\n`;
    });

    text += `==================================================\n`;
    text += `Diselesaikan secara mandiri melalui Aplikasi Laporan Field School.\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `laporan_field_school_${report.studentName.replace(/\s+/g, '_')}_${report.studentClass}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 pb-16">
      {/* Action panel header (no-print) */}
      <div className="no-print bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full uppercase">
              ✓ Dokumen Selesai Dirakit
            </span>
            {firebaseService.isEnabled() && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                <Cloud className="w-3 h-3 text-indigo-500" />
                Otomatis Tersimpan di Cloud Guru
              </span>
            )}
          </div>
          <h2 className="text-lg font-display font-medium text-gray-950 pt-1">Siap Cetak atau Unduh Laporan</h2>
          <p className="text-xs text-gray-400 mt-1">
            {firebaseService.isEnabled() 
              ? "Laporan Anda sudah masuk secara otomatis ke Panel Rekapitulasi Guru. Anda juga dapat mencetak lembaran dokumen ini."
              : "Klik tombol di bawah untuk mencetak lembar pembukuan tugas kegiatan lapangan untuk dikumpulkan ke guru."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95 h-10"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 border border-gray-200 h-10"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600 animate-pulse" />
                Disalin!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Salin Teks
              </>
            )}
          </button>

          <button
            onClick={handleDownloadBackup}
            title="Download JSON Backup"
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-gray-200 h-10"
          >
            <Download className="w-3.5 h-3.5" />
            File Backup
          </button>
        </div>
      </div>

      {/* Helpful print notification */}
      <div className="no-print p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-xs text-amber-800 leading-relaxed">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Petunjuk Cetak PDF yang Baik:</strong>
          Pada saat jendela printer browser muncul, centang opsi <strong className="font-semibold">&quot;Tampilkan grafis latar belakang&quot; (Background graphics)</strong> agar border, warna kertas korps, dan tata warna tercetakan dengan megah dan rapi. Matikan opsi &quot;Header dan footer default&quot; agar halaman bersih.
        </div>
      </div>

      {/* Printable Area - Formatted as traditional formal school document sheet */}
      <div 
        ref={printAreaRef}
        id="printed-report-document"
        className="bg-white border border-gray-300 shadow-sm rounded-none md:rounded-2xl p-6 sm:p-12 md:p-16 text-gray-900 relative font-sans print-card-border"
      >
        {/* Subtle Watermark Decoration for print or desktop */}
        <div className="absolute inset-x-0 bottom-36 flex items-center justify-center opacity-3 pointer-events-none select-none no-print">
          <Award className="w-96 h-96 text-gray-200" />
        </div>

        {/* Paper Header / Kop Surat Resmi */}
        <div className="border-b-4 border-double border-gray-900 pb-5 text-center space-y-1">
          <h3 className="text-xs sm:text-xs font-sans font-bold tracking-widest text-gray-500 uppercase">
            PEMERINTAH KABUPATEN BLITAR • DINAS PENDIDIKAN
          </h3>
          <h2 className="text-lg sm:text-2xl font-serif font-black tracking-wider text-gray-950 uppercase font-traditional">
            UPT SMP NEGERI 2 GANDUSARI
          </h2>
          <span className="text-[10px] font-sans text-gray-400 block tracking-tight">
            Jl. Kresna No.5, Ngaringan, Gandusari, Blitar, Jawa Timur 66187 • Terakreditasi A
          </span>
          <div className="w-full pt-1.5" />
          <h4 className="text-sm sm:text-base font-serif font-bold tracking-widest text-gray-900 uppercase pt-2 border-t border-gray-200">
            {report.destination === 'teknologi_tepat_guna' 
              ? 'DOKUMEN EVALUASI KOKURIKULER TEMA 3: TEKNOLOGI TEPAT GUNA' 
              : 'LAPORAN RESMI KEGIATAN LITERASI FIELD SCHOOL'}
          </h4>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 py-6 text-sm font-sans">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Nomor Dokumen:</span>
              <span className="font-mono font-bold text-gray-800">{report.reportNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Tanggal Dibuat:</span>
              <span className="text-gray-800 font-semibold">{getIndonesianDate(report.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-1.5 md:pl-6 md:border-l border-gray-200">
            <div>
              <span className="text-[11px] text-gray-400 block font-mono font-bold uppercase tracking-wider">NAMA SISWA PENYUSUN:</span>
              <strong className="text-base text-gray-900 tracking-tight font-display">{report.studentName}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-50 mt-1">
              <div>
                <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider font-bold">KELAS:</span>
                <span className="text-xs font-semibold text-gray-800">{report.studentClass}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider font-bold">KATEGORI LAPORAN:</span>
                <span className="text-xs font-semibold text-gray-800 capitalize">{report.destination}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected route banner inside print doc */}
        <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Rute Literasi Terpilih:</span>
            <p className="text-gray-800 font-semibold mt-0.5">{destInfo.title} — {destInfo.tagline}</p>
          </div>
          <div className="text-right font-mono font-bold text-gray-400 text-xs tracking-wider hidden sm:block uppercase">
            {report.destination}
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-8 py-4">
          <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase font-mono border-b border-dashed border-gray-200 pb-2">
            Rangkuman Tanya Jawab & Hasil Riset Kegiatan
          </h4>

          {questions.map((q, idx) => {
            const ansObj = report.answers.find(a => a.questionId === q.id);
            const ansText = ansObj ? ansObj.answerText : '(Siswa tidak mengisikan jawaban)';
            return (
              <div key={q.id} className="space-y-2.5 break-inside-avoid">
                <div className="flex gap-2">
                  <span className="font-mono font-bold text-xs bg-gray-100 text-gray-700 w-6 h-6 shrink-0 rounded-md flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h5 className="font-serif font-bold text-gray-950 text-base leading-snug">
                    {q.label}
                  </h5>
                </div>
                <div className="pl-8">
                  <p className="text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap text-justify bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                    {ansText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supporting Media / Documentation Attachments Section */}
        {((report.uploadedPhotos && report.uploadedPhotos.length > 0) || report.videoLink) && (
          <div className="space-y-6 py-6 border-t border-dashed border-gray-200 break-inside-avoid">
            <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase font-mono pb-2 border-b border-dashed border-gray-200">
              Lampiran Bukti Dokumentasi Kegiatan Lapangan
            </h4>

            {/* Photos attachments wrapper grid */}
            {report.uploadedPhotos && report.uploadedPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider">Foto Dokumentasi Kegiatan:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.uploadedPhotos.map((photo, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-video relative">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-mono text-white text-center py-0.5 font-bold">
                        LAMPIRAN DOKUMENTASI #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video link banner */}
            {report.videoLink && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1 break-inside-avoid">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-50 border border-purple-150 text-purple-700 font-mono font-bold px-2 py-0.5 rounded">
                    TAUTAN VLOG AKTIF
                  </span>
                  <p className="text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider">Video Observasi Mandiri:</p>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                  <a 
                    href={report.videoLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs sm:text-xs text-brand font-mono hover:underline truncate bg-white border border-gray-255 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {report.videoLink}
                  </a>
                  <span className="text-[10px] text-gray-400 italic font-medium no-print">
                    *Tautan aktif di atas dapat diklik langsung oleh guru penilai
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official Document Signatures Block */}
        <div className="mt-16 pt-12 border-t border-gray-300 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs break-inside-avoid">
          <div className="space-y-16">
            <p className="font-semibold text-gray-500">Mengetahui,<br />Orang Tua / Wali Siswa</p>
            <div className="border-b border-gray-900 w-32 sm:w-40 mx-auto" />
          </div>

          <div className="space-y-16 hidden sm:block">
            <p className="font-semibold text-gray-500">Disupervisi Oleh,<br />Guru Pembimbing Kegiatan</p>
            <div className="border-b border-gray-900 w-32 sm:w-40 mx-auto" />
          </div>

          <div className="space-y-16">
            <p className="font-semibold text-gray-500 font-sans">Blitar,<br />Siswa Penyusun Laporan</p>
            <div className="space-y-1">
              <p className="font-bold text-gray-950 underline uppercase">{report.studentName}</p>
              <p className="text-[10px] font-mono text-gray-400">Kelas: {report.studentClass}</p>
            </div>
          </div>
        </div>

        {/* Mini print footer info */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex justify-between items-center text-[9px] font-mono text-gray-400">
          <span>Sistem Laporan Otomatis Field School • {report.id}</span>
          <span>Halaman 1 dari 1 (Lembar Tugas Mandiri)</span>
        </div>
      </div>

      {/* Bottom controls (no-print) */}
      <div className="no-print flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
        {fromTeacherPanel && onBackToTeacher ? (
          <button
            onClick={onBackToTeacher}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer h-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali Ke Panel Guru & Rekap
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-all cursor-pointer h-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Kembali Jawaban Laporan
          </button>
        )}

        {!fromTeacherPanel && (
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 bg-gray-950 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all h-10 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Buat Laporan Baru
          </button>
        )}
      </div>
    </div>
  );
}
