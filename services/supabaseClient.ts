import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Passo 1: Acesse https://supabase.com/dashboard/project/_/settings/api
// Passo 2: Substitua as strings abaixo pelas suas credenciais reais.

// URL do Projeto (Ex: https://xyzcompany.supabase.co)
const PROJECT_URL = "https://bkifbghhiopjwrogxrkf.supabase.co";

// Chave Pública Anônima (anon public key)
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWZiZ2hoaW9wandyb2d4cmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTM2NDgsImV4cCI6MjA4MjE2OTY0OH0.rbDKCmPwCw-hYR0Of57J92n4ZpzyZsJ6ZsYi-0_qbQU";

// --------------------------------

// Helper para tentar pegar de variáveis de ambiente (caso você use .env)
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  } catch (e) { }
  return undefined;
};

// A lógica abaixo prioriza variáveis de ambiente (.env), 
// mas usa as strings hardcoded acima (PROJECT_URL/ANON_KEY) se não encontrar o .env.
// Se você colou suas chaves acima, vai funcionar.

const finalUrl = getEnv('SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || PROJECT_URL;
const finalKey = getEnv('SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || ANON_KEY;

if (finalUrl === "SUA_URL_DO_SUPABASE_AQUI" || finalKey === "SUA_CHAVE_ANON_PUBLIC_AQUI") {
  console.warn("⚠️ AVISO: As chaves do Supabase não foram configuradas. O login e a sincronização não funcionarão.");
}

export const supabase = createClient(finalUrl, finalKey);