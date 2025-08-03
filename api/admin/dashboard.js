import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check (in production, use proper JWT validation)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
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