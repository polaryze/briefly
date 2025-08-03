import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables not configured');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

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
    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error getting total count:', totalError);
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    // Get today's count
    const { count: today, error: todayError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', today.toISOString());

    if (todayError) {
      console.error('Error getting today count:', todayError);
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    // Get this week's count
    const { count: thisWeek, error: weekError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString());

    if (weekError) {
      console.error('Error getting week count:', weekError);
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    // Get recent subscribers
    const { data: recentSubscribers, error: recentError } = await supabase
      .from('waitlist')
      .select('email, subscribed_at, ip_address')
      .order('subscribed_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error getting recent subscribers:', recentError);
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    const stats = {
      total: total || 0,
      today: today || 0,
      thisWeek: thisWeek || 0
    };

    const dashboardData = {
      stats,
      recentSubscribers: recentSubscribers || []
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard data' 
    });
  }
} 