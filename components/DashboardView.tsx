import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { StudySession, QuestionsLog } from '../types';

interface DashboardProps {
  sessions: StudySession[];
  logs: QuestionsLog[];
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export const DashboardView: React.FC<DashboardProps> = ({ sessions, logs }) => {
  const totalSeconds = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalQuestions = logs.reduce((acc, curr) => acc + curr.total, 0);
  const totalCorrect = logs.reduce((acc, curr) => acc + curr.correct, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Prepare chart data
  const subjectData = sessions.reduce((acc: any, curr) => {
    const existing = acc.find((i: any) => i.name === curr.subject);
    if (existing) {
      if (curr.type === 'theory') existing.Teoria += curr.duration;
      else existing.Exercicios += curr.duration;
    } else {
      acc.push({ 
        name: curr.subject, 
        Teoria: curr.type === 'theory' ? curr.duration : 0, 
        Exercicios: curr.type === 'exercises' ? curr.duration : 0 
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400">Visão geral da sua evolução.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Time */}
        <div className="bg-surfaceLight dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Horas Totais</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(totalSeconds)}</h3>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-surfaceLight dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Questões Feitas</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuestions}</h3>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-surfaceLight dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <Target size={24} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Precisão</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{accuracy}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surfaceLight dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 h-96 flex flex-col shadow-sm">
          <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2 text-lg mb-4">
            <TrendingUp size={20} className="text-brand-600" />
            Tempo por Matéria
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={80} tick={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: '#94a3b8', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: 'var(--tw-prose-invert-bg)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatTime(value)}
                />
                <Legend />
                <Bar dataKey="Teoria" stackId="a" fill="#3b82f6" barSize={20} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Exercicios" stackId="a" fill="#f59e0b" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};