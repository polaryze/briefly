// Simple storage that persists across function calls
// In production, use a proper database
let waitlistEmails = [];

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
    // Calculate statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Use the actual waitlist data
    const stats = {
      total: waitlistEmails.length,
      today: waitlistEmails.filter(s => new Date(s.subscribedAt) >= today).length,
      thisWeek: waitlistEmails.filter(s => new Date(s.subscribedAt) >= weekAgo).length
    };

    const dashboardData = {
      stats,
      recentSubscribers: waitlistEmails.slice(0, 10) // Show last 10
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard data' 
    });
  }
} 