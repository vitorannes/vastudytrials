import React from 'react';
import { supabase } from '../services/supabaseClient';
import { LogOut, RefreshCw, Trash2, Moon, Sun, AlertCircle, Cloud, User } from 'lucide-react';

interface SettingsProps {
  user: any;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ user, theme, toggleTheme, onSync, isSyncing, onReset }) => {

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App.tsx auth listener will handle the redirect to AuthView
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configurações</h2>
        <p className="text-slate-500 dark:text-slate-400">Personalize sua experiência.</p>
      </header>

      {/* Theme Toggle */}
      <div className="bg-surfaceLight dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-white">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aparência</h3>
            <p className="text-sm text-slate-500">Alternar entre modo claro e escuro.</p>
          </div>
        </div>
        <button onClick={toggleTheme} className="bg-slate-200 dark:bg-slate-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></span>
        </button>
      </div>

      {/* Sync / Account */}
      <div className="bg-surfaceLight dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 text-green-600 dark:text-green-400">
            <Cloud size={20} /> Conta e Sincronização
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold shadow-sm">
                <User size={24} />
              </div>
              <div className="text-sm">
                <p className="text-slate-900 dark:text-white font-bold text-base">Conectado</p>
                <p className="text-slate-500 dark:text-slate-300">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors flex flex-col items-center gap-1 text-xs font-medium"
              title="Sair da conta"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Status da Sincronização:</span>
            <button 
              onClick={onSync} 
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle size={20} /> Zona de Perigo
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4 text-sm">
          Esta ação apagará apenas os dados salvos neste navegador (localStorage). Os dados sincronizados com a nuvem permanecerão seguros no banco de dados.
        </p>
        <button onClick={onReset} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition-colors shadow-lg shadow-red-600/20">
          <Trash2 size={20} /> Limpar Cache Local
        </button>
      </div>
    </div>
  );
};