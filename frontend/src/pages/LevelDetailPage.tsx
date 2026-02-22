import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { levelsService } from '../services/levels.service';
import { lessonsService } from '../services/lessons.service';
import { useAuthStore } from '../store/authStore';
import PodcastPlayer from '../components/PodcastPlayer';
import type { Level, Lesson, LessonCompletion } from '../types';
import jsPDF from 'jspdf';

interface LessonStats {
  accuracy: number;
  correctFirstTry?: number;
  correctAfterRetry?: number;
  stillWrong?: number;
}

type TabType = 'lessons' | 'reports' | 'podcast';

export default function LevelDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [level, setLevel] = useState<Level | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('lessons');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!code) return;

        const { data: levelData } = await levelsService.getLevelByCode(code);
        setLevel(levelData);

        const { data: lessonsData } = await lessonsService.getLessonsByLevel(
          levelData.id
        );
        setLessons(lessonsData);

        if (user) {
          try {
            const { data: completionsData } =
              await lessonsService.getUserCompletions(levelData.id);
            setCompletions(completionsData);
          } catch {
            console.log('No completions yet');
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, user]);

  // PDF İndirme Fonksiyonu
  const handleDownloadPDF = async (
    lessonTitle: string,
    completionDate: string,
    stats?: LessonStats
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const userName = user?.name || 'Student';

    const img = new Image();
    img.src = '/lingoria_text_logo.png';

    img.onload = () => {
      doc.addImage(img, 'PNG', pageWidth / 2 - 25, 15, 50, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Dear ${userName},`, 20, 45);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      const congratsMessage =
        'We congratulate you on your interest in and success in education. We wish you continued success in your language learning journey with Lingoria.';

      const splitTitle = doc.splitTextToSize(congratsMessage, pageWidth - 40);
      doc.text(splitTitle, 20, 53);

      // Ayırıcı Çizgi
      doc.setDrawColor(230, 230, 230);
      doc.line(20, 72, pageWidth - 20, 72);

      // Ders Bilgileri
      doc.setFontSize(12);
      doc.text(`Level: ${level?.code} - ${level?.name}`, 20, 82);
      doc.text(`Lesson: ${lessonTitle}`, 20, 90);
      doc.text(
        `Completion Date: ${new Date(completionDate).toLocaleDateString()}`,
        20,
        98
      );

      // Performans Bilgileri (Eğer stats varsa)
      if (stats) {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, 110, pageWidth - 40, 40, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(63, 66, 243);
        doc.text('Performance Summary', 30, 120);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(`• Accuracy Rate: %${stats.accuracy}`, 35, 130);
        doc.text(
          `• Status: ${stats.accuracy >= 70 ? 'Excellent Success' : 'Lesson Completed'}`,
          35,
          138
        );
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(160);
      doc.text(
        `This document is officially issued by Lingoria.`,
        pageWidth / 2,
        285,
        { align: 'center' }
      );

      doc.save(`Lingoria_Success_Report_${userName.replace(/\s+/g, '_')}.pdf`);
    };
  };

  const isLessonCompleted = (lessonId: string) => {
    return completions.some((c) => c.lessonId === lessonId);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return '📖';
      case 'vocabulary':
        return '📚';
      case 'practice':
        return '✍️';
      default:
        return '📝';
    }
  };

  const allLessonsCompleted =
    lessons.length > 0 && completions.length >= lessons.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!level) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <img
              src="/lingoria_text_logo.png"
              alt="Lingoria"
              className="h-8 w-auto hidden sm:block"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {level.code} - {level.name}
              </h1>
              <p className="text-xs text-gray-500">{level.description}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Your Progress
            </p>
            <p className="text-lg font-bold text-blue-600">
              {completions.length} / {lessons.length}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700">Level Completion</span>
            <span className="text-blue-600 font-bold">
              {lessons.length > 0
                ? Math.round((completions.length / lessons.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${lessons.length > 0 ? (completions.length / lessons.length) * 100 : 0}%`,
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mb-8 bg-gray-200/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 Lessons
          </button>
          <button
            onClick={() => setActiveTab('podcast')}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'podcast'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎙️ Podcast
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 My Reports
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* LESSONS TAB */}
          {activeTab === 'lessons' && (
            <motion.div
              key="lessons-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {allLessonsCompleted && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold">
                      🎓 Ready for the Exam?
                    </h3>
                    <p className="opacity-90">
                      Score 80% to unlock the next level!
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/exam/${level.id}`)}
                    className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                  >
                    Start Exam
                  </button>
                </div>
              )}

              {lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id);
                return (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    key={lesson.id}
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                    className={`bg-white rounded-2xl p-5 cursor-pointer border-2 transition-all flex items-center justify-between ${
                      completed
                        ? 'border-green-100 bg-green-50/30'
                        : 'border-transparent hover:border-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Lesson {index + 1}
                          </span>
                          {completed && (
                            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {lesson.title}
                        </h3>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            ⏱ {lesson.estimatedMinutes}m
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            ⭐ +{lesson.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`px-5 py-2 rounded-lg font-bold text-sm ${completed ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}
                    >
                      {completed ? 'Review' : 'Start'}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* PODCAST TAB */}
          {activeTab === 'podcast' && (
            <motion.div
              key="podcast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PodcastPlayer levelId={level.id} />
            </motion.div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {completions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">
                    No reports available. Complete a lesson to see it here!
                  </p>
                </div>
              ) : (
                completions.map((comp) => {
                  const lesson = lessons.find((l) => l.id === comp.lessonId);
                  if (!lesson) return null;
                  return (
                    <div
                      key={comp.lessonId}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-2xl font-bold">
                          PDF
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Completed on:{' '}
                            {new Date(comp.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(lesson.title, comp.completedAt, {
                            accuracy: comp.score ?? 0,
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                      >
                        Download Report 📥
                      </button>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
