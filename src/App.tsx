import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { School, HelpCircle, GraduationCap, Github, Landmark } from 'lucide-react';
import { DestinationType, StudentIdentity, Answer, ActivityReport } from './types';
import DestinationSelector from './components/DestinationSelector';
import StudentCredentialsForm from './components/StudentCredentialsForm';
import ReportQuestionsForm from './components/ReportQuestionsForm';
import ReportPreview from './components/ReportPreview';
import SavedReports from './components/SavedReports';
import TeacherPanel from './components/TeacherPanel';
import { firebaseService } from './firebase';

export default function App() {
  const [step, setStep] = useState<'SELECT_DESTINATION' | 'ENTER_IDENTITY' | 'FILL_QUESTIONS' | 'PREVIEW_REPORT' | 'TEACHER_PANEL'>('SELECT_DESTINATION');
  const [selectedDestination, setSelectedDestination] = useState<DestinationType | null>(null);
  const [studentIdentity, setStudentIdentity] = useState<StudentIdentity>({ name: '', class: '' });
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentReport, setCurrentReport] = useState<ActivityReport | null>(null);
  const [savedReports, setSavedReports] = useState<ActivityReport[]>([]);
  const [cameFromTeacher, setCameFromTeacher] = useState(false);

  // Load saved reports history on initial render
  useEffect(() => {
    try {
      const history = localStorage.getItem('reports_history_v1');
      if (history) {
        setSavedReports(JSON.parse(history));
      }
    } catch (err) {
      console.error('Failed to load reports history:', err);
    }
  }, []);

  // Set page title for student
  useEffect(() => {
    document.title = "Portal Laporan - UPT SMPN 2 Gandusari";
  }, []);

  const handleSelectDestination = (dest: DestinationType) => {
    setSelectedDestination(dest);
    setStep('ENTER_IDENTITY');
  };

  const handleBackToDestination = () => {
    setStep('SELECT_DESTINATION');
  };

  const handleIdentitySubmit = (identity: StudentIdentity) => {
    setStudentIdentity(identity);
    setStep('FILL_QUESTIONS');
  };

  const handleBackToIdentity = () => {
    setStep('ENTER_IDENTITY');
  };

  const handleAnswersSubmit = (submittedAnswers: Answer[], uploadedPhotos: string[], videoLink?: string) => {
    setAnswers(submittedAnswers);

    if (!selectedDestination) return;

    // Generate a beautiful, professional report catalog reference number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateObj = new Date();
    const formattedYear = dateObj.getFullYear();
    const formattedMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const reportRefNumber = `REF/FS/${formattedYear}/${formattedMonth}/${randomNum}`;

    // Create final report object
    const report: ActivityReport = {
      id: `rep_${Date.now()}_${randomNum}`,
      studentName: studentIdentity.name,
      studentClass: studentIdentity.class,
      destination: selectedDestination,
      answers: submittedAnswers,
      createdAt: dateObj.toISOString(),
      reportNumber: reportRefNumber,
      uploadedPhotos,
      videoLink,
    };

    setCurrentReport(report);

    // Synchronize to Cloud Firestore automatically (auto masuk panel guru)
    firebaseService.submitReport(report).then((synced) => {
      if (synced) {
        console.log("Sukes menyinkronkan laporan ke database cloud.");
      }
    }).catch((err) => {
      console.warn("Sinkronisasi cloud tertunda/sedang luring:", err);
    });

    // Save in history local storage
    const updatedHistory = [report, ...savedReports.filter(r => r.id !== report.id)];
    setSavedReports(updatedHistory);
    try {
      localStorage.setItem('reports_history_v1', JSON.stringify(updatedHistory));
      // Also clear temporary draft for this route since it has been successfully logged!
      localStorage.removeItem(`draft_report_${selectedDestination}`);
      localStorage.removeItem(`draft_photos_${selectedDestination}`);
      localStorage.removeItem(`draft_video_${selectedDestination}`);
    } catch (err) {
      console.warn('LocalStorage save warning:', err);
    }

    setStep('PREVIEW_REPORT');
  };

  const handleEditAgain = () => {
    setStep('FILL_QUESTIONS');
  };

  const handleRestartNewReport = () => {
    setSelectedDestination(null);
    setStudentIdentity({ name: '', class: '' });
    setAnswers([]);
    setCurrentReport(null);
    setCameFromTeacher(false);
    setStep('SELECT_DESTINATION');
  };

  const handleLoadReport = (report: ActivityReport) => {
    setSelectedDestination(report.destination);
    setStudentIdentity({ name: report.studentName, class: report.studentClass });
    
    // Set matching formatted answers 
    setAnswers(report.answers);
    
    setCurrentReport(report);
    setStep('PREVIEW_REPORT');
  };

  const handleTeacherViewReport = (report: ActivityReport) => {
    setCameFromTeacher(true);
    handleLoadReport(report);
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Apakah kamu yakin ingin menghapus arsip laporan ini dari browsermu? Tindakan ini tidak dapat dibatalkan.')) {
      const updated = savedReports.filter(r => r.id !== id);
      setSavedReports(updated);
      try {
        localStorage.setItem('reports_history_v1', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark font-sans flex flex-col justify-between antialiased">
      {/* Top Banner Navigation (no-print) */}
      <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleRestartNewReport}>
            <div className="bg-brand text-white p-2 rounded-xl shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-gray-950 flex items-center gap-1">
                Portal Tugas Siswa 
                <span className="text-[10px] font-mono text-brand bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full font-bold">
                  Sastra-A01
                </span>
              </h1>
              <p className="text-[10px] font-mono text-gray-400">Laporan Literasi Field School</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-4 h-4 text-brand" />
              <span>UPT SMPN 2 Gandusari</span>
            </div>

            {step !== 'TEACHER_PANEL' ? (
              <button
                onClick={() => setStep('TEACHER_PANEL')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-indigo-50 hover:text-white text-[10px] sm:text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-xl border border-indigo-500 shadow-xs transition-all cursor-pointer h-9 shrink-0 uppercase tracking-wider"
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                Panel Guru
              </button>
            ) : (
              <button
                onClick={handleRestartNewReport}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-xl border border-gray-250 transition-all cursor-pointer h-9 shrink-0 uppercase tracking-wider"
              >
                Dasbor Siswa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 py-10">
        <AnimatePresence mode="wait">
          {step === 'SELECT_DESTINATION' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              <DestinationSelector onSelect={handleSelectDestination} />
              
              {/* Local History logs section */}
              <SavedReports 
                reports={savedReports} 
                onLoadReport={handleLoadReport} 
                onDeleteReport={handleDeleteReport} 
              />
            </motion.div>
          )}

          {step === 'ENTER_IDENTITY' && selectedDestination && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StudentCredentialsForm
                destination={selectedDestination}
                onBack={handleBackToDestination}
                onSubmit={handleIdentitySubmit}
                initialData={studentIdentity}
              />
            </motion.div>
          )}

          {step === 'FILL_QUESTIONS' && selectedDestination && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ReportQuestionsForm
                destination={selectedDestination}
                studentIdentity={studentIdentity}
                onBack={handleBackToIdentity}
                onSubmit={handleAnswersSubmit}
                initialAnswers={answers}
                initialPhotos={currentReport?.uploadedPhotos || []}
                initialVideoLink={currentReport?.videoLink || ''}
              />
            </motion.div>
          )}

          {step === 'PREVIEW_REPORT' && currentReport && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <ReportPreview
                report={currentReport}
                onEdit={handleEditAgain}
                onRestart={handleRestartNewReport}
                fromTeacherPanel={cameFromTeacher}
                onBackToTeacher={() => setStep('TEACHER_PANEL')}
              />
            </motion.div>
          )}

          {step === 'TEACHER_PANEL' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TeacherPanel
                onBack={handleRestartNewReport}
                onViewReport={handleTeacherViewReport}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Web Footer (no-print) */}
      <footer className="no-print bg-white text-gray-500 py-8 mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-700">
                <Landmark className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Sistem Laporan Field School</h4>
                <p className="text-xs text-gray-400">Membantu siswa merakit tugas literasi sejarah secara formal.</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-400">
              Pengisian aman dan 100% luring (laporan disimpan di mesin pencarian browser pribadimu).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] uppercase tracking-wider font-semibold text-gray-400">
            <p>&copy; 2026 Portal Laporan Kegiatan Field School. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                PUEBI Compliant
              </span>
              <span className="bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                W3C Print Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
