/**
 * Middleware de autenticação Supabase
 */
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../database/supabase.js';

// Estender o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verificar o token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Buscar informações adicionais do usuário na tabela users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, name')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware para verificar se o usuário é admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Middleware para verificar se o usuário é fisioterapeuta
export const requirePhysiotherapist = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'physiotherapist' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Physiotherapist access required' });
  }
  
  next();
};

// Middleware para verificar se o usuário é paciente
export const requirePatient = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'patient' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Patient access required' });
  }
  
  next();
};