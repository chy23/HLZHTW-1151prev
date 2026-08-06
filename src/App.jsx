import { useState, useEffect } from 'react'
import { FileText, FileDown, BookOpen, GraduationCap, Settings2, X, Moon, Sun } from 'lucide-react'
import LessonViewer from './components/LessonViewer'
import { database as initialDatabase } from './data/lessonsData'
import { exportToWord, exportToPDF } from './utils/exportUtils'

function App() {
  const [db, setDb] = useState(() => JSON.parse(JSON.stringify(initialDatabase)));
  const [currentSemester, setCurrentSemester] = useState('翰林-六上');
  const lessonsData = db[currentSemester];
  const [currentLesson, setCurrentLesson] = useState(lessonsData[0]);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [selections, setSelections] = useState({
    vocab: new Set(),
    fillIn: new Set(),
    questions: new Set()
  });
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [marginSetting, setMarginSetting] = useState('normal');
  
  // New Export Settings
  const [exportSelectedLessons, setExportSelectedLessons] = useState(new Set());
  const [customTitle, setCustomTitle] = useState('');
  const [customWatermark, setCustomWatermark] = useState('');


  const margins = {
    narrow: { top: '1.27cm', bottom: '1.27cm', left: '1.27cm', right: '1.27cm' },
    normal: { top: '2.54cm', bottom: '2.54cm', left: '3.18cm', right: '3.18cm' },
    wide: { top: '2.54cm', bottom: '2.54cm', left: '5.08cm', right: '5.08cm' }
  };

  // Initialize selections when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setSelections({
        vocab: new Set(currentLesson.vocab.map((_, i) => i)),
        fillIn: new Set(currentLesson.fillIn.map((_, i) => i)),
        questions: new Set(
          currentLesson.questions
            .map((q, i) => (q.type === '提取訊息' || q.type === '推論訊息' ? i : -1))
            .filter(i => i !== -1)
        )
      });
    }
  }, [currentLesson]);

  const toggleSelection = (type, index) => {
    setSelections(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const handleOpenExportModal = () => {
    setExportSelectedLessons(new Set([currentLesson.id]));
    setShowExportModal(true);
  };

  const handleConfirmExport = (format) => {
    // Collect all selected lessons data
    const lessonsDataList = lessonsData
      .filter(l => exportSelectedLessons.has(l.id))
      .map(lesson => {
        // We use current selections for the active lesson, and default everything for others
        if (lesson.id === currentLesson.id) {
          return { lesson, selections };
        }
        return {
          lesson,
          selections: {
            vocab: new Set(lesson.vocab.map((_, i) => i)),
            fillIn: new Set(lesson.fillIn.map((_, i) => i)),
            questions: new Set(
              lesson.questions
                .map((q, i) => (q.type === '提取訊息' || q.type === '推論訊息' ? i : -1))
                .filter(i => i !== -1)
            )
          }
        };
      });

    if (lessonsDataList.length === 0) return;

    const margin = margins[marginSetting];
    
    // Sort lessonsDataList by lesson id to maintain order
    lessonsDataList.sort((a, b) => a.lesson.id - b.lesson.id);

    const filename = `${currentSemester}_${lessonsDataList.length}課彙整_${format === 'pdf' ? '預習講義.pdf' : '預習講義.doc'}`;

    if (format === 'word') {
      exportToWord(lessonsDataList, filename, paperSize, margin, customTitle, customWatermark);
    } else {
      exportToPDF(lessonsDataList, filename, customTitle, customWatermark);
    }
    
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans relative transition-colors duration-300">
      {/* Watermarks */}
      <div className="fixed top-24 right-8 text-[18pt] text-gray-500/25 font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>
      <div className="fixed bottom-8 right-8 text-[18pt] text-gray-500/25 font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>

      {/* Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <img src="./icon.jpg" alt="Icon" className="w-8 h-8 rounded-lg shadow-2xs border border-blue-200 object-cover" />
            <span>國語預習單生成系統</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="切換深淺色模式"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <select
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-slate-100 transition-colors duration-300"
              value={currentSemester}
              onChange={(e) => {
                const newSem = e.target.value;
                setCurrentSemester(newSem);
                setCurrentLesson(db[newSem][0]);
              }}
            >
              {Object.keys(db).map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            
            <select 
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer dark:text-slate-100 transition-colors duration-300"
              value={currentLesson.id}
              onChange={(e) => setCurrentLesson(lessonsData.find(l => l.id === Number(e.target.value)))}
            >
              {lessonsData.map(l => (
                <option key={l.id} value={l.id}>第 {l.id} 課 {l.title}</option>
              ))}
            </select>
            
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <button 
                onClick={() => setIsTeacherMode(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-300 ${!isTeacherMode ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <GraduationCap className="w-4 h-4" />
                學用版預覽
              </button>
              <button 
                onClick={() => setIsTeacherMode(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-300 ${isTeacherMode ? 'bg-white dark:bg-slate-700 shadow text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Settings2 className="w-4 h-4" />
                教用版預覽
              </button>
            </div>

            <button 
              onClick={handleOpenExportModal}
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              進階匯出 (Word/PDF)
            </button>
            <div className="hidden lg:block text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 text-right leading-tight ml-3 font-medium tracking-wide shadow-sm">
              學習單資料取自「翰林出版社」<br/>
              網站內容僅限用於孩子學習使用<br/>
              <span className="text-red-700 font-black text-[12px] bg-red-100/90 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-red-200 shadow-2xs">
                ⚠️ 切勿用於商業行為
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10 w-full overflow-x-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 md:p-12 min-w-[800px] transition-colors duration-300">
          <LessonViewer 
            lesson={currentLesson} 
            selections={selections} 
            toggleSelection={toggleSelection} 
            isTeacherMode={isTeacherMode}
            onUpdate={() => setSelections({...selections})}
          />
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold flex items-center gap-2 dark:text-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                匯出講義設定 (Batch Export)
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">選擇匯出課別 (可複選)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {lessonsData.map(l => (
                    <label key={l.id} className="flex items-center gap-2 p-2 border rounded-lg border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                      <input 
                        type="checkbox" 
                        checked={exportSelectedLessons.has(l.id)}
                        onChange={(e) => {
                          const newSet = new Set(exportSelectedLessons);
                          if (e.target.checked) newSet.add(l.id);
                          else newSet.delete(l.id);
                          setExportSelectedLessons(newSet);
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium dark:text-slate-300">第 {l.id} 課</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">自訂標題前綴 (選填)</label>
                  <input 
                    type="text" 
                    placeholder="例如：ＯＯ國小六上"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">自訂浮水印文字 (選填)</label>
                  <input 
                    type="text" 
                    placeholder="例如：ＯＯ老師專用"
                    value={customWatermark}
                    onChange={(e) => setCustomWatermark(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">紙張大小</label>

                <div className="grid grid-cols-3 gap-3">
                  {['A4', 'B4', 'A3'].map(size => (
                    <button
                      key={size}
                      onClick={() => setPaperSize(size)}
                      className={`py-2 rounded-lg font-bold border-2 transition-colors ${paperSize === size ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">邊界寬度</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'narrow', label: '窄' },
                    { id: 'normal', label: '標準' },
                    { id: 'wide', label: '寬' }
                  ].map(margin => (
                    <button
                      key={margin.id}
                      onClick={() => setMarginSetting(margin.id)}
                      className={`py-2 rounded-lg font-bold border-2 transition-colors ${marginSetting === margin.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {margin.label}
                    </button>
                  ))}
                </div>
              </div>


            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 transition-colors duration-300 flex-wrap">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => handleConfirmExport('word')}
                disabled={exportSelectedLessons.size === 0}
                className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
              >
                進階匯出 (Word/PDF)
              </button>
              <button 
                onClick={() => handleConfirmExport('pdf')}
                disabled={exportSelectedLessons.size === 0}
                className="px-6 py-2 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
              >
                匯出 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
