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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
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

  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        error: 'Supabase not configured',
        envCheck: {
          SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'Set' : 'Missing'
        }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Get all subscribers first
    const { data: allSubscribers, error: dataError } = await supabase
      .from('waitlist')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (dataError) {
      console.error('Error getting subscribers:', dataError);
      return res.status(500).json({ 
        error: 'Failed to load dashboard data',
        details: dataError.message
      });
    }

    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const subscribers = allSubscribers || [];
    const todaySubscribers = subscribers.filter(s => 
      new Date(s.subscribed_at) >= today
    );
    const weekSubscribers = subscribers.filter(s => 
      new Date(s.subscribed_at) >= weekAgo
    );

    const stats = {
      total: subscribers.length,
      today: todaySubscribers.length,
      thisWeek: weekSubscribers.length
    };

    const dashboardData = {
      stats,
      recentSubscribers: subscribers.slice(0, 10) // Show last 10
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard data',
      details: error.message
    });
  }
} 