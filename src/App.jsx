import { useState, useEffect } from 'react'
import { FileText, FileDown, BookOpen, GraduationCap, Settings2, X } from 'lucide-react'
import LessonViewer from './components/LessonViewer'
import { lessonsData } from './data/lessonsData'
import { exportToWord } from './utils/exportUtils'

function App() {
  const [currentLesson, setCurrentLesson] = useState(lessonsData[0]);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [selections, setSelections] = useState({
    vocab: new Set(),
    fillIn: new Set(),
    questions: new Set()
  });

  // Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [marginSetting, setMarginSetting] = useState('normal');


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
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    const paddedId = String(currentLesson.id).padStart(2, '0');
    const filename = `${paddedId}第${currentLesson.id}課預習單_${currentLesson.title}_彙整版`;
    const margin = margins[marginSetting];
    
    // Export to Word without watermark
    exportToWord(currentLesson, selections, filename, paperSize, margin, false);
    
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Watermarks */}
      <div className="fixed top-20 right-4 text-slate-300/80 text-sm font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>
      <div className="fixed bottom-4 right-4 text-slate-300/80 text-sm font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <img src="./icon.jpg" alt="Icon" className="w-8 h-8 rounded-lg shadow-2xs border border-blue-200 object-cover" />
            <span>國語預習單生成系統</span>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={currentLesson.id}
              onChange={(e) => setCurrentLesson(lessonsData.find(l => l.id === Number(e.target.value)))}
            >
              {lessonsData.map(l => (
                <option key={l.id} value={l.id}>第 {l.id} 課 {l.title}</option>
              ))}
            </select>
            
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => setIsTeacherMode(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${!isTeacherMode ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap className="w-4 h-4" />
                學用版預覽
              </button>
              <button 
                onClick={() => setIsTeacherMode(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${isTeacherMode ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
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
              匯出 Word
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
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <LessonViewer 
            lesson={currentLesson} 
            selections={selections} 
            toggleSelection={toggleSelection} 
            isTeacherMode={isTeacherMode} 
          />
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                匯出 Word 設定
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">紙張大小</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">邊界寬度</label>
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

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmExport}
                className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                確認匯出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
