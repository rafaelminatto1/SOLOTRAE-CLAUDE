/**
 * Authentication API routes for FisioFlow
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../database/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';

const router = Router();

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', validateRequest(commonSchemas.user), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, phone, specialization } = (req as any).validatedData;

    // Validate required fields
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Email, password, name, and role are required' });
      return;
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        phone: phone || null
      }
    });

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError);
      if (authError?.message?.includes('already registered')) {
        res.status(409).json({ error: 'User already exists' });
      } else {
        res.status(400).json({ error: authError?.message || 'Registration failed' });
      }
      return;
    }

    // Create user profile in users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        phone: phone || null
      });

    if (userError) {
      console.error('User profile creation error:', userError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      res.status(500).json({ error: 'Failed to create user profile' });
      return;
    }

    // Create role-specific record
    if (role === 'physiotherapist') {
      const { error: physioError } = await supabaseAdmin
        .from('physiotherapists')
        .insert({
          user_id: authData.user.id,
          specialization: specialization || 'General',
          license_number: `LIC${Date.now()}`
        });
      
      if (physioError) {
        console.error('Physiotherapist profile creation error:', physioError);
      }
    } else if (role === 'patient') {
      const { error: patientError } = await supabaseAdmin
        .from('patients')
        .insert({
          user_id: authData.user.id
        });
      
      if (patientError) {
        console.error('Patient profile creation error:', patientError);
      }
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: authData.user.id,
          email,
          full_name: name,
          role: role.toUpperCase(),
          two_factor_enabled: false,
          is_active: true
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user || !authData.session) {
      console.error('Supabase auth error:', authError);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('User profile fetch error:', profileError);
      res.status(500).json({ error: 'Failed to fetch user profile' });
      return;
    }

    res.json({
      message: 'Login successful',
      data: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.name,
          role: userProfile.role.toUpperCase(),
          two_factor_enabled: false,
          is_active: true
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Current User
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.name,
          role: user.role.toUpperCase(),
          two_factor_enabled: false,
          is_active: true
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Sign out the user session
      await supabaseAdmin.auth.admin.signOut(token);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logout successful' }); // Always return success for logout
  }
});

// Middleware de autenticação removido - usando o do arquivo middleware/auth.ts

export default router;