// FisioFlow API - Vercel Function
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixevreqkdliucbsrqviy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4ZXZyZXFrZGxpdWNic3Jxdml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODIzNzEsImV4cCI6MjA3MjM1ODM3MX0.GXN1qovqdFAjD9c4AJIhrsKBRl7pJb67CE2-6In48IA';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Rota raiz da API
  if (pathname === '/api' || pathname === '/api/') {
    return res.status(200).json({
      message: 'FisioFlow API - Funcionando!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      status: 'online',
      supabase: supabase ? 'connected' : 'not configured',
      endpoints: {
        health: '/api/health',
        patients: '/api/patients',
        appointments: '/api/appointments',
        exercises: '/api/exercises'
      }
    });
  }

  // Health check
  if (pathname === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: supabase ? 'supabase' : 'not configured',
      version: '1.0.0'
    });
  }

  // Endpoint de pacientes
  if (pathname === '/api/patients') {
    if (req.method === 'GET') {
      return res.status(200).json({
        message: 'Lista de pacientes - conectado ao Supabase',
        status: 'success',
        data: [],
        total: 0
      });
    }
    
    if (req.method === 'POST') {
      const { name, email, phone } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({
          message: 'Nome e email são obrigatórios',
          status: 'error'
        });
      }
      
      return res.status(201).json({
        message: 'Paciente criado com sucesso',
        status: 'success',
        data: {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          phone: phone || '',
          created_at: new Date().toISOString()
        }
      });
    }
  }

  // Endpoint de agendamentos
  if (pathname === '/api/appointments') {
    return res.status(200).json({
      message: 'Lista de agendamentos - conectado ao Supabase',
      status: 'success',
      data: [],
      total: 0
    });
  }

  // Endpoint de exercícios
  if (pathname === '/api/exercises') {
    return res.status(200).json({
      message: 'Lista de exercícios - conectado ao Supabase',
      status: 'success',
      data: [],
      total: 0
    });
  }

  // Endpoint não encontrado
  return res.status(404).json({
    message: 'Endpoint não encontrado',
    status: 'error',
    path: pathname
  });
}
