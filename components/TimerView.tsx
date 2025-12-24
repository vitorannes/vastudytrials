import React from 'react';
import { Play, Pause, Save, BookOpen, PenTool, Plus } from 'lucide-react';

interface TimerViewProps {
  timerSeconds: number;
  timerRunning: boolean;
  studyType: 'theory' | 'exercises';
  subject: string;
  setSubject: (s: string) => void;
  setStudyType: (t: 'theory' | 'exercises') => void;
  onStart: () => void;
  onPause: () => void;
  onFinish: () => void;
  onManualTime: () => void;
  subjectsList: string[];
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const TimerView: React.FC<TimerViewProps> = ({
  timerSeconds,
  timerRunning,
  studyType,
  subject,
  setSubject,
  setStudyType,
  onStart,
  onPause,
  onFinish,
  onManualTime,
  subjectsList
}) => {
  return (
    <div className="flex justify-center items-center h-full min-h-[500px]">
      <div className="bg-surfaceLight dark:bg-slate-800 p-8 rounded-3xl text-center w-full max-w-xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors">
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r transition-colors duration-500 ${studyType === 'theory' ? 'from-brand-500 to-brand-700' : 'from-amber-400 to-orange-500'}`}></div>

        <h2 className="text-xl mb-6 font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Cronômetro</h2>

        <div className="flex justify-center gap-4 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl w-fit mx-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => !timerRunning && setStudyType('theory')}
            disabled={timerRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${studyType === 'theory' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <BookOpen size={16} /> Teoria
          </button>
          <button
            onClick={() => !timerRunning && setStudyType('exercises')}
            disabled={timerRunning}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${studyType === 'exercises' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <PenTool size={16} /> Questões
          </button>
        </div>

        <div className="text-5xl sm:text-7xl md:text-8xl font-mono mb-8 font-bold tracking-tighter text-slate-800 dark:text-white transition-colors tabular-nums break-all">
          {formatTime(timerSeconds)}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {!timerRunning ? (
            <>
              {timerSeconds === 0 ? (
                <button onClick={onStart} className={`flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand-500/30 ${!subject ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500'}`}>
                  <Play /> Iniciar
                </button>
              ) : (
                <>
                  <button onClick={onStart} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl font-bold flex gap-2 text-white shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-105">
                    <Play /> Retomar
                  </button>
                  <button onClick={onFinish} className="bg-brand-600 hover:bg-brand-500 px-8 py-4 rounded-xl font-bold flex gap-2 text-white shadow-lg shadow-brand-600/30 transition-all transform hover:scale-105">
                    <Save /> Salvar
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={onPause} className="bg-amber-500 hover:bg-amber-400 px-8 py-4 rounded-xl font-bold flex gap-2 text-white shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105">
                <Pause /> Pausar
              </button>
              <button onClick={onFinish} className="bg-brand-600 hover:bg-brand-500 px-8 py-4 rounded-xl font-bold flex gap-2 text-white shadow-lg shadow-brand-600/30 transition-all transform hover:scale-105">
                <Save /> Finalizar
              </button>
            </>
          )}
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <input
            className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-center text-slate-900 dark:text-white w-full border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-lg placeholder-slate-400 transition-colors font-medium"
            placeholder="O que você vai estudar?"
            list="subjects-list"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={timerRunning || (timerSeconds > 0 && !timerRunning)}
          />
          <datalist id="subjects-list">
            {subjectsList.map((s, i) => <option key={i} value={s} />)}
          </datalist>
          
          <button onClick={onManualTime} className="text-sm text-slate-500 dark:text-slate-400 mt-4 flex items-center justify-center gap-2 mx-auto hover:text-brand-600 dark:hover:text-white transition-colors font-medium">
            <Plus size={16} /> Entrada Manual de Tempo
          </button>
        </div>
      </div>
    </div>
  );
};