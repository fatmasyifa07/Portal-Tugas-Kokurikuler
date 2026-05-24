/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CornerDownRight, 
  HelpCircle, 
  Save, 
  FileText, 
  Grid,
  CheckCircle,
  Lightbulb,
  FileCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  Video,
  AlertCircle,
  Film
} from 'lucide-react';
import { DESTINATION_QUESTIONS, DESTINATIONS } from '../data';
import { DestinationType, StudentIdentity, Answer } from '../types';

// Fast client-side image compressor to prevent LocalStorage QuotaExceededError and keep PDF sizes light!
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPG is extremely light (~100-200kb) but crisp
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface ReportQuestionsFormProps {
  destination: DestinationType;
  studentIdentity: StudentIdentity;
  onBack: () => void;
  onSubmit: (answers: Answer[], uploadedPhotos: string[], videoLink?: string) => void;
  initialAnswers?: Answer[];
  initialPhotos?: string[];
  initialVideoLink?: string;
}

export default function ReportQuestionsForm({
  destination,
  studentIdentity,
  onBack,
  onSubmit,
  initialAnswers = [],
  initialPhotos = [],
  initialVideoLink = ''
}: ReportQuestionsFormProps) {
  const questions = DESTINATION_QUESTIONS[destination] || [];
  
  // Try to load in-progress answers from local storage, or use initialAnswers
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      const savedDraft = localStorage.getItem(`draft_report_${destination}`);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (err) {
      console.warn("Failed to read draft:", err);
    }

    // Build default answers
    const defaultAnswers: Record<string, string> = {};
    questions.forEach(q => {
      const existing = initialAnswers.find(item => item.questionId === q.id);
      defaultAnswers[q.id] = existing ? existing.answerText : '';
    });
    return defaultAnswers;
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`draft_photos_${destination}`);
      return saved ? JSON.parse(saved) : initialPhotos;
    } catch {
      return initialPhotos;
    }
  });

  const [videoLink, setVideoLink] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`draft_video_${destination}`);
      return saved || initialVideoLink;
    } catch {
      return initialVideoLink;
    }
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewAllMode, setViewAllMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Auto-save draft whenever answers, photos, or video link changes
  useEffect(() => {
    localStorage.setItem(`draft_report_${destination}`, JSON.stringify(answers));
    localStorage.setItem(`draft_photos_${destination}`, JSON.stringify(uploadedPhotos));
    localStorage.setItem(`draft_video_${destination}`, videoLink);
    
    // Quick flash of small save text
    setSaveSuccess(true);
    const timer = setTimeout(() => setSaveSuccess(false), 900);
    return () => clearTimeout(timer);
  }, [answers, uploadedPhotos, videoLink, destination]);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getMediaRequirements = () => {
    if (destination === 'jogjakarta') {
      return { minPhotos: 2, requireVideo: false, desc: 'Wajib mengunggah minimal 2 foto kegiatan (misal: saat mengunjungi candi, keraton, atau PIAT UGM).' };
    }
    if (destination === 'blitar') {
      return { minPhotos: 2, requireVideo: false, desc: 'Wajib mengunggah minimal 2 foto kegiatan (misal: area budidaya, cooking class, atau pos edukasi Kampung Coklat).' };
    }
    if (destination === 'mandiri') {
      return { minPhotos: 3, requireVideo: true, desc: 'Wajib mengunggah minimal 3 foto kegiatan UMKM/pabrik DAN menyalin 1 link tautan video vlog observasi mandirimu (durasi 2-3 menit, tanpa musik).' };
    }
    // teknologi_tepat_guna
    return { minPhotos: 1, requireVideo: false, desc: 'Wajib mengunggah minimal 1 foto produk/alat Teknologi Tepat Guna (TTG) rancanganmu.' };
  };

  const isFormValid = () => {
    const textValid = questions.every(q => {
      if (!q.required) return true;
      return (answers[q.id] || '').trim().length > 10; // At least 10 chars
    });

    const req = getMediaRequirements();
    const photosValid = uploadedPhotos.length >= req.minPhotos;
    const videoValid = !req.requireVideo || videoLink.trim().length > 10;

    return textValid && photosValid && videoValid;
  };

  const handleComplete = () => {
    if (!isFormValid()) return;
    const formattedAnswers: Answer[] = questions.map(q => ({
      questionId: q.id,
      answerText: (answers[q.id] || '').trim()
    }));
    onSubmit(formattedAnswers, uploadedPhotos, videoLink);
  };

  const activeQuestion = questions[activeIndex];
  const destInfo = DESTINATIONS.find(d => d.id === destination) || DESTINATIONS[0];

  // Helper text/inspirations specifically tailored to each destination question
  const getWritingInspiration = (qId: string) => {
    const inspirations: Record<string, string[]> = {
      // Jogjakarta
      'jogja_q1': [
        'Sebutkan tempat yang kamu kunjungi (misal: Keraton, Candi Prambanan, dan pusat riset sains pertanian PIAT UGM).',
        'Tuliskan kapan kamu mengunjunginya dan dengan siapa saja.',
        'Sebutkan kesan pertama melihat lokasi riset sains pertanian tersebut.'
      ],
      'jogja_q2': [
        'Ceritakan tentang sejarah pendirian candi atau peran penting Keraton Jogja.',
        'Apa saja pengelolaan agroteknologi penting atau metode pengolahan sampah/kompos yang kamu pelajari di PIAT UGM?',
        'Apa pelajaran moral atau pengetahuan baru yang kamu peroleh dari kunjungan sains budaya tersebut?'
      ],
      'jogja_q3': [
        'Gambarkan teknologi pembibitan tanaman atau kultur jaringan yang kamu amati di PIAT UGM.',
        'Jelaskan keunikan adat atau kuliner khas Yogyakarta yang kamu cicipi (misal gudeg manis gurih atau bakpia).',
        'Tuliskan tentang kesungguhan para peneliti atau abdi dalem yang kamu temui.'
      ],
      'jogja_q4': [
        'Ceritakan momen ilmiah atau riset pertanian yang membuatmu takjub (misal melihat pemilahan sampah modern atau mesin agroteknologi).',
        'Jelaskan mengapa momen tersebut begitu membekas di pikiranmu.',
        'Sebutkan apa hikmah utama yang merubah caramu memandang sains dan kelestarian hayati.'
      ],
      'jogja_q5': [
        'Tuliskan kesimpulan bahwa studi literasi di Yogyakarta sangat memperkaya wawasan budaya dan ilmu sains hayati.',
        'Sarankan agar durasi kunjungan di situs sains (seperti laboratorium PIAT UGM) diperpanjang.',
        'Berikan usulan mengenai rute perjalanan luring yang lebih efektif.'
      ],
      // Blitar
      'blitar_q1': [
        'Sebutkan kapan kamu mengunjungi Kampung Coklat Blitar (misalnya bersama sekolah/kelompok).',
        'Sebutkan wahana utama yang kamu masuki seperti kebun pembibitan kakao, pabrik pengolahan, atau museum coklat.',
        'Gambarkan kesan pertama mencium aroma kakao yang nikmat di Kampung Coklat.'
      ],
      'blitar_q2': [
        'Uraikan langkah-langkah memilah buah kakao, memisahkan biji, menjemur, melakukan fermentasi alami, hingga proses memanggang (roasting).',
        'Ceritakan bagaimana biji coklat yang pahit diolah dengan resep higienis hingga menjadi coklat batangan yang manis lezat.',
        'Sebutkan keterlibatan mesin pengolahan modern yang mempermudah proses ini.'
      ],
      'blitar_q3': [
        'Jelaskan bagaimana pengolahan pangan modern meningkatkan masa simpan dan nilai jual produk kakao lokal Blitar.',
        'Sebutkan bahwa agribisnis Kampung Coklat mengajari petani lokal cara mendapat untung maksimal melalui inovasi produk pangan terolah.',
        'Gambarkan kontribusi positif Kampung Coklat dalam pemberdayaan tenaga kerja di wilayah Blitar.'
      ],
      'blitar_q4': [
        'Ceritakan keseruan saat menghias coklat kustom buatanmu sendiri dalam kelas memasak (cooking class).',
        'Atau pengalaman mencangkul tanah, memberi pupuk, serta mempelajari bibit unggul kakao secara langsung.',
        'Gambarkan bagaimana instruksi pemandu membantu pemahamanmu tentang ilmu pangan.'
      ],
      'blitar_q5': [
        'Sebutkan kesimpulan bahwa Kampung Coklat Blitar adalah sentra teladan agribisnis dan teknologi pengolahan pangan nasional.',
        'Tuliskan saran perbaikan (misalnya menambah poster infografis sains pembibitan tanaman di sepanjang rute kebun).',
        'Nyatakan kebanggaanmu terhadap kapasitas industri makanan lokal berkelas dunia.'
      ],
      // Mandiri
      'mandiri_q1': [
        'Tuliskan nama lengkap Pabrik, Toko Industri, atau UMKM yang kamu datangi.',
        'Sebutkan alamat lengkapnya (desa, kecamatan, kabupaten).',
        'Sebutkan jenis produk spesifik yang dipasarkan oleh UMKM tersebut.'
      ],
      'mandiri_q2': [
        'Jelaskan bahan baku utama yang mereka datangkan dan cara penyediaannya.',
        'Ceritakan langkah demi langkah dari pemrosesan material dasar menjadi produk bernilai jual.',
        'Tuliskan peralatan apa saja yang mereka gunakan (baik manual tradisional maupun mesin otomatis).'
      ],
      'mandiri_q3': [
        'Sebutkan tahun berdiri usaha tersebut dan siapa pelopor pertamanya.',
        'Ceritakan berapa warga lokal atau tetangga yang berhasil dipekerjakan di sana.',
        'Gambarkan tantangan usaha yang dialami (seperti ketersediaan bahan, pemasaran digital, atau cuaca).'
      ],
      'mandiri_q4': [
        'Tempelkan tautan URL Video Vlog observasimu (maksimal 3 menit, wajib tanpa suara latar musik/backsound musik).',
        'Sebutkan durasi video asli buatanmu dan platform unggahannya (Google Drive, YouTube, dll).',
        'Rangkum secara singkat visual apa saja yang kamu sampaikan dalam video tersebut kepada guru pembimbing.'
      ],
      'mandiri_q5': [
        'Sebutkan nilai kemandirian ekonomi, tekad baja, dan keberanian berwirausaha yang kamu contoh dari pemilik usaha.',
        'Ceritakan bagaimana hal ini memotivasimu untuk produktif berkarya di usia muda.',
        'Berikan masukan/saran bagi kemajuan UMKM yang kamu kunjungi (misal pemasaran gawai/online).'
      ],
      // Teknologi Tepat Guna
      'ttg_q1': [
        'Sebutkan judul atau nama pengerjaan alat teknologi tepat guna (TTG) yang kamu rancang.',
        'Apakah itu filter air bersih, komposer pupuk, pengolah limbah kelapa, lampu darurat baterai garam, atau penyemprot tanaman otomatis?',
        'Uraikan konsep dasar dari alat tersebut.'
      ],
      'ttg_q2': [
        'Temukan masalah nyata di sekeliling wilayah Gandusari (misal tumpukan sampah dedaunan, saluran air kotor saat hujan, atau tanaman layu saat kemarau).',
        'Sebutkan mengapa masalah ini mengganggu aktivitas sehari-hari warga setempat.',
        'Jelaskan alasan mengapa teknologi sederhana, murah, dan tepat guna adalah solusi terbaik.'
      ],
      'ttg_q3': [
        'Rinci semua bahan-bahan bekas atau peralatan murah meriah yang kamu kumpulkan.',
        'Tuliskan cara merangkainya dari awal sampai alat tersebut tegak berdiri.',
        'Jelaskan proses penyusunan lapisan demi lapisan (apabila membuat saringan atau reaktor kompos).'
      ],
      'ttg_q4': [
        'Ceritakan keberhasilan kinerjanya saat diuji pertama kali (apakah kotoran tersaring sempurna, atau pupuk terfermentasi baik).',
        'Sebutkan masalah teknis yang muncul (misalnya kebocoran dinding plastik, atau aliran tersumbat).',
        'Gambarkan solusi perbaikan taktis yang langsung kamu lakukan hingga alat bekerja lancar.'
      ],
      'ttg_q5': [
        'Berikan kesimpulan bahwa inovasi teknologi tepat guna besutanmu layak dipasang secara mandiri oleh warga Gandusari.',
        'Sebutkan perkiraan rincian pengeluaran biaya alat yang terjangkau oleh kantong warga.',
        'Tuliskan saran peningkatan (misalnya menyempurnakan penutup kompartemen alat atau material penunjang yang lebih tahan cuaca).'
      ]
    };

    return inspirations[qId] || ['Tuliskan dengan paragraf yang rapi dan detail.', 'Pastikan ejaan kata baku sesuai bahasa Indonesia (PUEBI/KBBI).'];
  };

  const getMediaStepInspiration = () => {
    return [
      'Gunakan kamera HP yang stabil untuk memotret aktivitas nyata.',
      'Saran: Minta tolong teman atau pemandu wisata untuk memotret kamu saat aktif belajar.',
      'Bagi rute mandiri: Unggah vlog presentasimu ke Google Drive (pilih status pembagian "Siapa saja yang memiliki link dapat melihat") atau YouTube agar bisa di-review guru.',
      'Format gambar yang didukung adalah JPEG, PNG, dan WEBP.'
    ];
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);
    const newPhotos = [...uploadedPhotos];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i]);
        if (newPhotos.length < 6) {
          newPhotos.push(compressed);
        }
      } catch (err) {
        console.error("Error compressing image:", err);
      }
    }

    setUploadedPhotos(newPhotos);
    setCompressing(false);
  };

  const removePhoto = (indexToRemove: number) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const renderUploadSection = () => {
    const req = getMediaRequirements();
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-purple-50 border border-purple-150 text-purple-700 font-mono font-bold px-2.5 py-0.5 rounded-md">
              DOKUMENTASI & MEDIA PENDUKUNG
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Wajib Dilampirkan
            </span>
          </div>
          <h3 className="text-lg font-display font-medium text-gray-950 leading-snug">
            Unggah Foto Bukti Fisik Lapangan & Vlog Penunjang
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {req.desc}
          </p>
        </div>

        {/* Info card regarding client-side performance under 300+ students */}
        <div className="p-4 bg-blue-50/70 border border-blue-150 rounded-xl text-xs text-blue-900 flex gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Keamanan & Kecepatan Pengisian:</p>
            <p>Sistem ini berjalan 100% lokal di HP/perangkat siswa. Foto yang Anda unggah otomatis **dioptimasi & dikompres** agar sangat ringan (~150KB) namun tetap tajam. Sistem ini **100% KUAT** dan tidak lelet meskipun diakses oleh 300++ siswa secara bersamaan!</p>
          </div>
        </div>

        {/* Photo Box */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
            Foto Kegiatan Lapangan (Unggah Minimal {req.minPhotos} Foto):
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedPhotos.map((photo, idx) => (
              <div key={idx} className="relative group aspect-square border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-sm transition-all cursor-pointer z-10"
                  title="Hapus foto ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-mono text-white text-center py-1 font-bold">
                  FOTO REKOR #{idx + 1}
                </div>
              </div>
            ))}

            {uploadedPhotos.length < 6 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-brand rounded-xl bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer p-4 transition-all aspect-square text-center group">
                {compressing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-gray-500 mt-2">Mengompres...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand" />
                    <span className="text-xs font-semibold text-gray-700 mt-2">Pilih Foto</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WEBP</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={compressing}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono mt-1 px-1">
            <span className="text-gray-400">Tercatat: <strong className="text-gray-700">{uploadedPhotos.length} / 6</strong> Foto</span>
            {uploadedPhotos.length >= req.minPhotos ? (
              <span className="text-green-600 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3 h-3" /> Foto Mencukupi
              </span>
            ) : (
              <span className="text-amber-500 font-bold">Kurang {req.minPhotos - uploadedPhotos.length} foto lagi!</span>
            )}
          </div>
        </div>

        {/* Video Link */}
        {req.requireVideo && (
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Link Tautan Video Vlog Observasi Lapangan (Wajib):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Film className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/drive/folders/... atau tautan YouTube"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand pl-9 pr-4 py-2.5 rounded-xl bg-gray-50/50 transition-all placeholder:text-gray-400"
              />
            </div>
            <p className="text-[10px] text-gray-405 leading-normal">
              *Tautan wajib menuju Google Drive atau Youtube yang memuat video vlog kreatif orisinil berdurasi 2-3 menit tanpa musik latar (backsound) agar terdengar jelas oleh bapak/ibu guru.
            </p>
            {videoLink.trim().length > 10 ? (
              <span className="text-green-600 text-[11px] font-mono flex items-center gap-1 font-bold pt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Tautan Terisi & Siap Dicetak
              </span>
            ) : (
              <span className="text-amber-500 text-[11px] font-mono font-bold pt-1">Tautan vlog 2-3 menit wajib diisi!</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Header identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white text-gray-900 px-6 py-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-250">
            <FileText className={`w-5 h-5 text-brand`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{studentIdentity.name}</h4>
            <p className="text-xs text-gray-500 font-mono">Kelas: {studentIdentity.class} • {destInfo.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Draft indicator */}
          <span className="flex items-center gap-1 text-[11px] bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-500">
            <Save className={`w-3 h-3 ${saveSuccess ? 'text-green-500 animate-bounce' : 'text-gray-400'}`} />
            {saveSuccess ? 'Draft tersimpan otomatis!' : 'Draft tersimpan'}
          </span>

          {/* Toggle View mode */}
          <button
            onClick={() => setViewAllMode(!viewAllMode)}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer"
          >
            {viewAllMode ? (
              <>
                <FileText className="w-3.5 h-3.5" />
                Mode Wizard
              </>
            ) : (
              <>
                <Grid className="w-3.5 h-3.5" />
                Lihat Semua ({questions.length + 1})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Wizard: Step-by-step form */}
      {!viewAllMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigasi Bullets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pertanyaan Ke:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      activeIndex === idx
                        ? 'bg-brand text-white shadow-xs'
                        : (answers[q.id] || '').trim().length > 10
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-250'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                
                {/* Special Media Upload Bullet */}
                <button
                  onClick={() => setActiveIndex(questions.length)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIndex === questions.length
                      ? 'bg-purple-600 text-white shadow-xs'
                      : (uploadedPhotos.length >= getMediaRequirements().minPhotos && (!getMediaRequirements().requireVideo || videoLink.trim().length > 10))
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                  title="Unggah Media"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pertanyaan Aktif Card */}
            <AnimatePresence mode="wait">
              {activeIndex < questions.length ? (
                <motion.div
                  key={activeQuestion.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8 space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-blue-50 border border-blue-100 text-brand font-mono font-bold px-2.5 py-0.5 rounded-md">
                        PERTANYAAN #0{activeIndex + 1}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {activeQuestion.required ? 'Wajib Diisi (Min. 10 Karakter)' : 'Opsional'}
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-medium text-gray-950 leading-snug">
                      {activeQuestion.label}
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      rows={8}
                      required={activeQuestion.required}
                      placeholder={activeQuestion.placeholder}
                      value={answers[activeQuestion.id] || ''}
                      onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                      className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand px-4 py-3 rounded-xl bg-gray-50/50 transition-all placeholder:text-gray-400 leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1 pt-1">
                      <span>
                        Panjang karakter: <strong className="text-gray-700">{answers[activeQuestion.id]?.length || 0}</strong>
                      </span>
                      <span>
                        {(answers[activeQuestion.id] || '').trim().length >= 10 ? (
                          <span className="text-green-600 flex items-center gap-1 font-bold">
                            <CheckCircle className="w-3 h-3" /> Memenuhi Syarat
                          </span>
                        ) : (
                          <span className="text-amber-500">Min. 10 karakter</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Next & Preview Buttons */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    {activeIndex > 0 ? (
                      <button
                        onClick={() => setActiveIndex(activeIndex - 1)}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all h-10 cursor-pointer text-gray-650"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Sebelumnya
                      </button>
                    ) : (
                      <button
                        onClick={onBack}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all h-10 cursor-pointer text-gray-650"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Kembali Ke Identitas
                      </button>
                    )}

                    <button
                      onClick={() => setActiveIndex(activeIndex + 1)}
                      className="flex items-center gap-1 bg-brand hover:bg-brand-hover cursor-pointer text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:shadow transition-all h-10 ml-auto"
                    >
                      Unggah Lampiran Media
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="media-wizard-step"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="bg-white border border-gray-250 shadow-sm rounded-xl p-6 sm:p-8"
                >
                  {renderUploadSection()}

                  {/* Wizard media controls */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-6">
                    <button
                      onClick={() => setActiveIndex(questions.length - 1)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all h-10 cursor-pointer text-gray-650"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Sebelumnya
                    </button>

                    <button
                      onClick={handleComplete}
                      disabled={!isFormValid()}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer h-10"
                    >
                      <FileCheck className="w-4 h-4" />
                      Selesai & Cetak Laporan
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors pt-2 px-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Kembali Ke Edit Identitas
            </button>
          </div>

          {/* Tips Panel (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <h4 className="text-sm font-bold tracking-wider font-display uppercase text-gray-400">
                  {activeIndex === questions.length ? 'Petunjuk Berkas' : 'Inspirasi Menulis'}
                </h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {activeIndex === questions.length 
                  ? 'Gunakan petunjuk pengunggahan berkas penunjang di bawah ini:' 
                  : 'Kebingungan bagaimana mulai menulis jawaban? Gunakan ide-ide bantuan di bawah ini untuk merangkai paragrafmu yang indah:'}
              </p>
              
              <ul className="space-y-3 pt-2">
                {(activeIndex === questions.length 
                  ? getMediaStepInspiration() 
                  : getWritingInspiration(activeQuestion.id)
                ).map((it, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                    <CornerDownRight className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-gray-150 text-[10px] text-gray-400 italic font-medium">
                Tips: Tulislah laporan dengan kata-kata sendiri yang jujur dan tulus agar mendapatkan nilai maksimal dari guru!
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode View All: All forms are rendered as a vertically stacked page */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-8"
        >
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-display font-medium text-gray-900">Daftar Lengkap Pertanyaan & Berkas Laporan</h3>
            <p className="text-xs text-gray-400 mt-1">Tuliskan seluruh jawaban Anda sekaligus dan lampirkan foto dokumentasi kegiatan Anda.</p>
          </div>

          <div className="space-y-8">
            {questions.map((q, idx) => {
              const textVal = answers[q.id] || '';
              const meetReq = textVal.trim().length >= 10;
              return (
                <div key={q.id} className="space-y-3 p-5 bg-gray-50/50 rounded-xl border border-gray-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-gray-400">PERTANYAAN #0{idx + 1}</span>
                    <span className={`text-[11px] font-mono font-semibold ${meetReq ? 'text-green-600' : 'text-amber-500'}`}>
                      {meetReq ? '✓ Terisi' : 'Belum Terisi (Minimal 10 Karakter)'}
                    </span>
                  </div>
                  <label htmlFor={`view-all-${q.id}`} className="block text-sm font-semibold text-gray-800 leading-snug">
                    {q.label}
                  </label>
                  <textarea
                    id={`view-all-${q.id}`}
                    rows={4}
                    placeholder={q.placeholder}
                    value={textVal}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    className="w-full text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand/20 border border-gray-200 focus:border-brand px-4 py-3 rounded-xl bg-white transition-all placeholder:text-gray-400 leading-relaxed"
                  />
                </div>
              );
            })}

            {/* Direct Upload Section inside View All */}
            <div className="border-t border-gray-200 pt-8 mt-6">
              {renderUploadSection()}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setViewAllMode(false)}
              className="text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              ← Kembali ke Model Tampilan Wizard (Satu Per Satu)
            </button>
            <button
              onClick={handleComplete}
              disabled={!isFormValid()}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-6 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer h-12"
            >
              <FileCheck className="w-4 h-4" />
              Selesai & Cetak Laporan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
