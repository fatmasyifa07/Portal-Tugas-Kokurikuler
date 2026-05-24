/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, GraduationCap, ChevronLeft, ArrowRight, CornerDownRight, Landmark } from 'lucide-react';
import { CLASS_OPTIONS, DESTINATIONS } from '../data';
import { DestinationType, StudentIdentity } from '../types';

interface StudentCredentialsFormProps {
  destination: DestinationType;
  onBack: () => void;
  onSubmit: (identity: StudentIdentity) => void;
  initialData?: StudentIdentity;
}

export default function StudentCredentialsForm({ 
  destination, 
  onBack, 
  onSubmit,
  initialData 
}: StudentCredentialsFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [selectedClass, setSelectedClass] = useState(() => {
    if (!initialData?.class) return CLASS_OPTIONS[0];
    return CLASS_OPTIONS.includes(initialData.class) ? initialData.class : 'CUSTOM';
  });
  const [customClass, setCustomClass] = useState(() => {
    if (!initialData?.class) return '';
    return CLASS_OPTIONS.includes(initialData.class) ? '' : initialData.class;
  });
  const [errorMessage, setErrorMessage] = useState('');

  const destInfo = DESTINATIONS.find(d => d.id === destination) || DESTINATIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Silakan bersedia mengisi Nama Lengkap kamu terlebih dahulu.');
      return;
    }
    
    const finalClass = selectedClass === 'CUSTOM' ? customClass.trim() : selectedClass;
    if (!finalClass) {
      setErrorMessage('Silakan masukkan kelas kamu.');
      return;
    }

    setErrorMessage('');
    onSubmit({
      name: name.trim(),
      class: finalClass
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali Pilih Jalur
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden"
      >
        {/* Banner with chosen destination */}
        <div className="bg-gray-50 border-b border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-gray-200 opacity-20 pointer-events-none">
            <Landmark className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded shadow-xs">
              Jalur Rekomendasi Laporan
            </span>
            <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-${destInfo.themeColor}-400 inline-block`} />
              {destInfo.title}
            </h2>
            <p className="text-xs text-gray-500 font-sans italic max-w-sm">
              "{destInfo.tagline}"
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Identitas Penulis Laporan</h3>
            <p className="text-xs text-gray-400 mt-1">Tuliskan identitas dirimu dengan lengkap untuk dicetak di lembar cover laporan.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold shadow-xs">
              {errorMessage}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="student-name" className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              required
              placeholder="Contoh: Muhammad Reza Pratama"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand px-4 py-3 rounded-xl bg-gray-50/50 transition-all placeholder:text-gray-400 h-12"
            />
          </div>

          {/* Class Selector */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="student-class-select" className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                Pilih Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="student-class-select"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand px-4 py-3 rounded-xl bg-gray-50/50 transition-all h-12"
              >
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    Kelas {opt}
                  </option>
                ))}
                <option value="CUSTOM">-- Ketik Kelas Kustom --</option>
              </select>
            </div>

            {/* Custom Class Input if 'CUSTOM' is selected */}
            {selectedClass === 'CUSTOM' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pl-4 border-l-2 border-brand"
              >
                <label htmlFor="student-custom-class" className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                  Ketik Nama Kelas Kustom <span className="text-red-500">*</span>
                </label>
                <input
                  id="student-custom-class"
                  type="text"
                  required
                  placeholder="Contoh: VII F atau XI IPS 4"
                  value={customClass}
                  onChange={(e) => {
                    setCustomClass(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand px-4 py-2.5 rounded-xl bg-white transition-all placeholder:text-gray-400"
                />
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 font-mono">Langkah 2 dari 4</p>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover cursor-pointer text-white font-semibold text-xs px-5 py-3 h-12 rounded-xl transition-all active:scale-[0.98]"
            >
              Lanjut Isi Form Pertanyaan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
