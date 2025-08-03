// In-memory storage (shared with waitlist function)
// In production, this should be a database
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

    // For demo purposes, create mock data since we don't have persistent storage
    // In production, this would come from a database
    const mockSubscribers = [
      {
        email: 'demo@example.com',
        subscribedAt: new Date().toISOString(),
        ip: '192.168.1.1'
      },
      {
        email: 'test@example.com',
        subscribedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ip: '192.168.1.2'
      }
    ];

    const stats = {
      total: mockSubscribers.length,
      today: mockSubscribers.filter(s => new Date(s.subscribedAt) >= today).length,
      thisWeek: mockSubscribers.filter(s => new Date(s.subscribedAt) >= weekAgo).length
    };

    const dashboardData = {
      stats,
      recentSubscribers: mockSubscribers.slice(0, 10) // Show last 10
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard data' 
    });
  }
} 