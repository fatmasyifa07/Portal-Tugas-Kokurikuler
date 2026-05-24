/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Compass, BookOpen, UserIcon, ArrowRight, MapPin, Sparkles, Cpu } from 'lucide-react';
import { DESTINATIONS } from '../data';
import { DestinationType } from '../types';

interface DestinationSelectorProps {
  onSelect: (destination: DestinationType) => void;
}

export default function DestinationSelector({ onSelect }: DestinationSelectorProps) {
  const getIcon = (id: DestinationType) => {
    switch (id) {
      case 'jogjakarta':
        return <Compass className="w-6 h-6 text-emerald-600" />;
      case 'blitar':
        return <BookOpen className="w-6 h-6 text-amber-600" />;
      case 'mandiri':
        return <UserIcon className="w-6 h-6 text-indigo-600 animate-none" />;
      case 'teknologi_tepat_guna':
        return <Cpu className="w-6 h-6 text-purple-600" />;
    }
  };

  const getBadgeColor = (id: DestinationType) => {
    switch (id) {
      case 'jogjakarta':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blitar':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'mandiri':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'teknologi_tepat_guna':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
          Sistem Laporan Kegiatan Praktis & Akurat
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-display font-bold text-gray-900 tracking-tight"
        >
          Pilih Kategori <span className="text-brand">Kegiatan Literasi</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-gray-500 leading-relaxed font-sans"
        >
          Lengkapi tugas akhir dengan memilih rute studi literasi yang sesuai. Data laporan akan terkompilasi dalam format dokumen resmi.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {DESTINATIONS.map((dest, index) => {
          return (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 + 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => onSelect(dest.id)}
              className="group cursor-pointer flex flex-col justify-between bg-white border border-gray-200 hover:border-brand rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-brand-light transition-colors duration-300">
                    {getIcon(dest.id)}
                  </div>
                  <span className={`text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full border ${getBadgeColor(dest.id)}`}>
                    {dest.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-display font-bold text-gray-900 group-hover:text-brand transition-colors duration-200">
                    {dest.title}
                  </h3>
                  <p className="text-xs font-mono text-gray-400 tracking-tight leading-relaxed">
                    {dest.tagline}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed pt-1">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 block mb-2 uppercase tracking-wide">Lokasi Kunjungan:</span>
                  <div className="flex flex-wrap gap-1">
                    {dest.spots.map((spot) => (
                      <span 
                        key={spot} 
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md"
                      >
                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                        {spot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 flex items-center justify-end">
                <span className="text-xs font-bold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                  Mulai Laporan
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
