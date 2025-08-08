import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://usebriefly.io',
  'https://www.usebriefly.io',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[3];
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // JWT validation
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: 'Server not configured securely' });
    jwt.verify(authHeader.substring(7), jwtSecret);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured'
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Delete the subscriber
    const { data, error } = await supabase
      .from('waitlist')
      .delete()
      .eq('email', email)
      .select();

    if (error) {
      console.error('Error deleting subscriber:', error);
      return res.status(500).json({ 
        error: 'Failed to delete subscriber',
        details: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        error: 'Subscriber not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully',
      deletedEmail: email
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete subscriber',
      details: error.message
    });
  }
} 