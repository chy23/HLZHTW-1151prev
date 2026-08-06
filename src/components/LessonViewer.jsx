import React, { useState } from 'react';
import { Pencil } from 'lucide-react';

const EditableText = ({ text, onSave, isAnswer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(text);

  if (isEditing) {
    return (
      <input 
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { setIsEditing(false); if(val !== text && val.trim() !== '') onSave(val); }}
        onKeyDown={e => { if(e.key === 'Enter') e.target.blur(); }}
        className={`border-b-2 border-blue-500 bg-blue-50 dark:bg-slate-700 dark:text-white px-1 outline-none min-w-[60px] max-w-full ${isAnswer ? 'text-red-600 font-bold' : ''}`}
        style={{ width: `${Math.max(val.length + 1, 3)}ch` }}
      />
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 px-1 rounded transition-colors ${isAnswer ? 'text-red-600 font-bold' : ''}`}
      onClick={() => { setVal(text); setIsEditing(true); }}
      title="點擊修改內容"
    >
      {text}
    </span>
  );
};

const LessonViewer = ({ lesson, selections, toggleSelection, isTeacherMode, onUpdate }) => {
  if (!lesson) return <div className="p-8 text-center text-slate-500">請選擇一課</div>;

  const handleSave = (type, index, field, newValue) => {
    if (lesson[type] && lesson[type][index]) {
      lesson[type][index][field] = newValue;
      if (onUpdate) onUpdate();
    }
  };

  const getDisplayIndex = (type, originalIndex) => {
    if (!selections[type].has(originalIndex)) return '';
    let count = 0;
    for (let i = 0; i <= originalIndex; i++) {
      if (selections[type].has(i)) count++;
    }
    return `${count}. `;
  };

  const renderVocab = (v, index) => {
    const isSelected = selections.vocab.has(index);
    return (
      <div key={index} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-200 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 bg-slate-50 dark:bg-slate-900 opacity-40 grayscale hover:opacity-70'}`}>
        <input type="checkbox" checked={isSelected} onChange={() => toggleSelection('vocab', index)} className="mt-1.5 w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer" />
        <div>
          <span className="text-lg font-bold mr-1">{getDisplayIndex('vocab', index)}</span>
          {isTeacherMode ? (
            <span className="underline decoration-red-600 decoration-2 underline-offset-4 tracking-widest mr-1">
              <EditableText text={v.word} isAnswer={true} onSave={(val) => handleSave('vocab', index, 'word', val)} />
            </span>
          ) : (
            <span className="text-slate-400 mr-1">（　　　　　）</span>
          )}
          <span className="text-lg flex-1 ml-1">
            ：<EditableText text={v.meaning} onSave={(val) => handleSave('vocab', index, 'meaning', val)} />
          </span>
        </div>
      </div>
    );
  };

  const renderFillIn = (item, index) => {
    const isSelected = selections.fillIn.has(index);
    const parts = item.sentence.split(/（\s*）/);
    
    return (
      <div key={index} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-200 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 bg-slate-50 dark:bg-slate-900 opacity-40 grayscale hover:opacity-70'}`}>
        <input type="checkbox" checked={isSelected} onChange={() => toggleSelection('fillIn', index)} className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer" />
        <div className="text-lg leading-loose flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold">{getDisplayIndex('fillIn', index)}</span>
            <EditableText text={item.sentence} onSave={(val) => handleSave('fillIn', index, 'sentence', val)} />
          </div>
          <div className="pl-6">
            {parts.map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < parts.length - 1 && (
                  <span>
                    {isTeacherMode ? `( ` : ''}
                    {isTeacherMode ? (
                      <EditableText text={item.answer} isAnswer={true} onSave={(val) => handleSave('fillIn', index, 'answer', val)} />
                    ) : (
                      <span className="text-slate-400">（　　　　　　　）</span>
                    )}
                    {isTeacherMode ? ` )` : ''}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (q, index) => {
    const isSelected = selections.questions.has(index);
    return (
      <div key={index} className={`flex items-start gap-3 p-5 rounded-xl border-2 transition-all ${isSelected ? 'border-blue-200 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 bg-slate-50 dark:bg-slate-900 opacity-40 grayscale hover:opacity-70'}`}>
        <input type="checkbox" checked={isSelected} onChange={() => toggleSelection('questions', index)} className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer" />
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="font-bold text-lg flex items-start gap-1">
              <span>{getDisplayIndex('questions', index)}</span>
              <EditableText text={q.q} onSave={(val) => handleSave('questions', index, 'q', val)} />
            </span>
            {isTeacherMode && (
              <span className={`text-sm text-white px-2.5 py-0.5 font-bold shrink-0 shadow-sm ${
                q.type === '提取訊息' ? 'bg-blue-600' :
                q.type === '推論訊息' ? 'bg-orange-500' :
                q.type === '詮釋整合' ? 'bg-green-600' :
                q.type === '比較評估' ? 'bg-purple-600' : 'bg-slate-600'
              }`}>{q.type}</span>
            )}
          </div>
          {isTeacherMode ? (
            <div className="text-red-600 font-bold bg-red-50 p-4 rounded-lg border border-red-100 text-lg">
              <div className="flex gap-1">
                <span className="shrink-0">答：</span>
                <EditableText text={q.a} onSave={(val) => handleSave('questions', index, 'a', val)} />
              </div>
            </div>
          ) : (
            <div className="h-28 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-lg w-full"></div>
          )}
        </div>
      </div>
    );
  };

  const selectedFillIn = lesson.fillIn.filter((_, i) => selections.fillIn.has(i));
  const unselectedFillIn = lesson.fillIn.filter((_, i) => !selections.fillIn.has(i));
  const distractors = unselectedFillIn.slice(0, 2).map(item => item.answer);
  const wordBank = [...selectedFillIn.map(item => item.answer), ...distractors].sort((a, b) => a.localeCompare(b, 'zh-TW'));

  return (
    <div className="max-w-5xl mx-auto" style={{ fontFamily: "'標楷體', 'BiauKai', 'DFKai-SB', sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-10 pb-6 border-b-2 border-slate-200">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          115六上國語預習講義 翰林版 第 {lesson.id} 課 {lesson.title} 作者：{lesson.author} 
          <span className={isTeacherMode ? 'text-red-600 ml-3' : 'text-slate-500 ml-3'}>
            （{isTeacherMode ? '教用版' : '學用版'}）
          </span>
        </h1>
        <div className="flex justify-end gap-8 text-xl text-slate-700 dark:text-slate-300">
          <span>班級：_______</span>
          <span>座號：_______</span>
          <span>姓名：_____________</span>
        </div>
      </div>

      <div className="space-y-12">
        {/* Task 1 */}
        <section>
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <span className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-md">1</span>
            課前任務 1、讀讀看
          </h2>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-xl space-y-3">
            <p>(1) 先朗讀課文三遍，標示出標點符號。；！？。</p>
            <p>(2) 自然段有 {isTeacherMode ? <span className="text-red-600 font-bold px-2">{lesson.paragraphs}</span> : '＿＿＿'} 段。</p>
            <p>(3) 圈出不懂的語詞、找重點句、句型、修辭。劃線標註段落重點句。</p>
            {isTeacherMode && (
              <div className="pt-2">
                <p>(4) 結構說明：</p>
                <div className="text-red-600 font-bold mt-2 ml-6 leading-relaxed">{lesson.structure}</div>
              </div>
            )}
            {isTeacherMode && lesson.criteria && (
              <div className="pt-2">
                <p>(5) 判定標準：</p>
                <div className="text-red-600 font-bold mt-2 ml-6 leading-relaxed">{lesson.criteria}</div>
              </div>
            )}
          </div>
        </section>

        {/* Task 2 */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
              <span className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-md">2</span>
              課前任務 2、語詞解釋
            </h2>
            <span className="text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1"><Pencil className="w-3 h-3"/>點擊文字可直接修改，勾選可匯出</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.vocab.map((v, index) => renderVocab(v, index))}
          </div>
        </section>

        {/* Task 3 */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
              <span className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-md">3</span>
              課前任務 3、語詞選填
            </h2>
            <span className="text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1"><Pencil className="w-3 h-3"/>點擊文字可直接修改，勾選可匯出</span>
          </div>
          {wordBank.length > 0 && (
            <div className="border border-slate-400 rounded-xl p-5 mb-5 text-2xl leading-loose bg-white dark:bg-slate-800 shadow-sm flex flex-wrap gap-2 justify-center">
              {wordBank.map((word, i) => <span key={i} className="font-bold">{word}</span>)}
            </div>
          )}
          <div className="space-y-4">
            {lesson.fillIn.map((item, index) => renderFillIn(item, index))}
          </div>
        </section>

        {/* Task 4 */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
              <span className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-md">4</span>
              課前任務 4、文意預習
            </h2>
            <span className="text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full flex items-center gap-1"><Pencil className="w-3 h-3"/>點擊文字可直接修改，勾選可匯出</span>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {lesson.questions.map((q, index) => renderQuestion(q, index))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LessonViewer;
