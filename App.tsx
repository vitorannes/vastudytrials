import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Timer, CheckCircle, Settings, X, Plus, Loader2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { syncService } from './services/syncService';
import { useTimer } from './hooks/useTimer';
import { StudySession, QuestionsLog, Theme } from './types';

// Components
import { TimerView } from './components/TimerView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';

// Helper seguro para ler do localStorage sem quebrar o app
const safeJSONParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Erro ao ler ${key} do localStorage, resetando para padrão.`, e);
    return fallback;
  }
};

const App = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'questions' | 'settings'>('dashboard');
  
  // Data State - Usando safeJSONParse para evitar crash inicial
  const [sessions, setSessions] = useState<StudySession[]>(() => safeJSONParse('studyHub_sessions', []));
  const [logs, setLogs] = useState<QuestionsLog[]>(() => safeJSONParse('studyHub_logs', []));
  const [subjects, setSubjects] = useState<string[]>(() => safeJSONParse('studyHub_subjects', []));
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Timer Hook (Solves the drift issue)
  const timer = useTimer();
  const [currentSubject, setCurrentSubject] = useState('');
  const [studyType, setStudyType] = useState<'theory' | 'exercises'>('theory');
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('vastudy_theme') as Theme) || 'light');

  // Modals State
  const [showManualTimeModal, setShowManualTimeModal] = useState(false);
  const [showPostSessionModal, setShowPostSessionModal] = useState(false);
  const [tempSession, setTempSession] = useState<StudySession | null>(null);
  const [postQuestions, setPostQuestions] = useState({ total: '', correct: '' });

  // --- Effects ---

  // Auth Listener
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingSession(false);
      if (session?.user) handleSync(session.user.id);
    }).catch(err => {
      console.error("Erro ao verificar sessão:", err);
      setIsLoadingSession(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         // Optionally sync on login
         handleSync(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Theme Applier
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('vastudy_theme', theme);
  }, [theme]);

  // Data Persistence
  useEffect(() => {
    localStorage.setItem('studyHub_sessions', JSON.stringify(sessions));
    localStorage.setItem('studyHub_logs', JSON.stringify(logs));
    localStorage.setItem('studyHub_subjects', JSON.stringify(subjects));
  }, [sessions, logs, subjects]);

  // --- Handlers ---

  const handleSync = async (userId: string = user?.id) => {
    if (!userId) return;
    setIsSyncing(true);
    const { sessions: mergedSessions, logs: mergedLogs, error } = await syncService.syncData(sessions, logs, userId);
    
    if (!error) {
      setSessions(mergedSessions);
      setLogs(mergedLogs);
      
      // Update subjects list from merged data
      const allSubjects = new Set([...subjects, ...mergedSessions.map(s => s.subject), ...mergedLogs.map(l => l.subject)]);
      setSubjects(Array.from(allSubjects).sort());
    } else {
      console.error("Sync error", error);
    }
    setIsSyncing(false);
  };

  const registerSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects(prev => [...prev, trimmed].sort());
    }
  };

  const handleFinishTimer = () => {
    if (!currentSubject) return alert("Informe a matéria");
    timer.pause();

    const newSession: StudySession = {
      id: Date.now(),
      subject: currentSubject,
      duration: timer.seconds,
      date: new Date().toISOString(),
      type: studyType,
      user_id: user?.id
    };

    if (studyType === 'exercises') {
      setTempSession(newSession);
      setShowPostSessionModal(true);
    } else {
      setSessions(prev => [...prev, newSession]);
      registerSubject(currentSubject);
      timer.reset();
      alert("Sessão salva!");
      if (user) handleSync(user.id);
    }
  };

  const savePostSession = () => {
    const t = parseInt(postQuestions.total);
    const c = parseInt(postQuestions.correct);
    if (!tempSession || isNaN(t) || isNaN(c)) return;

    setSessions(prev => [...prev, tempSession]);
    const newLog: QuestionsLog = {
      id: Date.now(),
      subject: tempSession.subject,
      total: t,
      correct: c,
      wrong: t - c,
      date: new Date().toISOString(),
      user_id: user?.id
    };
    setLogs(prev => [...prev, newLog]);
    registerSubject(tempSession.subject);
    
    // Cleanup
    timer.reset();
    setTempSession(null);
    setPostQuestions({ total: '', correct: '' });
    setShowPostSessionModal(false);
    if (user) handleSync(user.id);
  };

  const resetData = () => {
    if(confirm("Tem certeza?")) {
      setSessions([]);
      setLogs([]);
      setSubjects([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- Render Logic ---

  if (isLoadingSession) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bgLight dark:bg-slate-900 text-brand-600">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen bg-bgLight dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-surfaceLight dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-10 transition-colors">
        <div className="p-6 flex items-center justify-start gap-3 h-20 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">V</div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">VAstudy</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'timer'} onClick={() => setActiveTab('timer')} icon={<Timer size={20}/>} label="Cronômetro" />
          <NavButton active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<CheckCircle size={20}/>} label="Questões" />
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Configurações" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 relative">
        {activeTab === 'dashboard' && <DashboardView sessions={sessions} logs={logs} />}
        
        {activeTab === 'timer' && (
          <TimerView 
            timerSeconds={timer.seconds}
            timerRunning={timer.isRunning}
            studyType={studyType}
            setStudyType={setStudyType}
            subject={currentSubject}
            setSubject={setCurrentSubject}
            subjectsList={subjects}
            onStart={timer.start}
            onPause={timer.pause}
            onFinish={handleFinishTimer}
            onManualTime={() => setShowManualTimeModal(true)}
          />
        )}

        {/* Simplified Questions View for brevity - reusing Dashboard logic mostly */}
        {activeTab === 'questions' && (
             <div className="max-w-xl mx-auto">
                 <h2 className="text-2xl font-bold mb-4">Registro Rápido de Questões</h2>
                 <div className="bg-surfaceLight dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                     <div className="space-y-4">
                         <input placeholder="Matéria" list="subjects-list" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" onChange={(e) => setTempSession({ ...tempSession!, subject: e.target.value } as any)} />
                         <div className="grid grid-cols-2 gap-4">
                             <input type="number" placeholder="Total" className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" onChange={(e) => setPostQuestions(p => ({...p, total: e.target.value}))} />
                             <input type="number" placeholder="Acertos" className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" onChange={(e) => setPostQuestions(p => ({...p, correct: e.target.value}))} />
                         </div>
                         <button className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold" onClick={() => {
                             // Simple inline handler for manual question add
                             const t = parseInt(postQuestions.total);
                             const c = parseInt(postQuestions.correct);
                             const sub = (document.querySelector('input[placeholder="Matéria"]') as HTMLInputElement).value;
                             if(!sub || isNaN(t)) return;
                             setLogs(prev => [...prev, { id: Date.now(), subject: sub, total: t, correct: c, wrong: t-c, date: new Date().toISOString(), user_id: user?.id}]);
                             registerSubject(sub);
                             alert("Registrado!");
                         }}>Registrar</button>
                     </div>
                 </div>
             </div>
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            user={user} 
            theme={theme} 
            toggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
            onSync={() => handleSync(user?.id)}
            isSyncing={isSyncing}
            onReset={resetData}
          />
        )}
      </main>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-50">
          <MobileNavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24}/>} label="Dash" />
          <MobileNavBtn active={activeTab === 'timer'} onClick={() => setActiveTab('timer')} icon={<Timer size={24}/>} label="Timer" />
          <MobileNavBtn active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<CheckCircle size={24}/>} label="Quest" />
          <MobileNavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={24}/>} label="Config" />
      </div>

      {/* Modals */}
      {showPostSessionModal && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Resultado das Questões</h3>
                <input type="number" placeholder="Total" className="w-full mb-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg dark:text-white" value={postQuestions.total} onChange={e => setPostQuestions({...postQuestions, total: e.target.value})} />
                <input type="number" placeholder="Acertos" className="w-full mb-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg dark:text-white" value={postQuestions.correct} onChange={e => setPostQuestions({...postQuestions, correct: e.target.value})} />
                <button onClick={savePostSession} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">Salvar</button>
            </div>
         </div>
      )}
      
      {showManualTimeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm relative">
               <button onClick={() => setShowManualTimeModal(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button>
               <h3 className="text-xl font-bold mb-4 dark:text-white">Tempo Manual</h3>
               <input placeholder="Matéria" list="subjects-list" className="w-full mb-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg dark:text-white" onChange={(e) => setCurrentSubject(e.target.value)} />
               <input type="number" placeholder="Minutos" className="w-full mb-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg dark:text-white" onChange={(e) => timer.setSeconds(parseInt(e.target.value) * 60)} />
               <button onClick={() => { handleFinishTimer(); setShowManualTimeModal(false); }} className="w-full bg-brand-600 text-white p-3 rounded-lg font-bold">Registrar</button>
           </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for Nav
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-lg font-medium transition-all ${active ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border-l-4 border-brand-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
    {icon} <span>{label}</span>
  </button>
);

const MobileNavBtn = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-lg w-16 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
        {icon} <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
);

export default App;