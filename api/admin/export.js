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
    // For demo purposes, create mock data
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

    // Create CSV content
    const csvHeader = 'Email,Subscribed At,IP Address\n';
    const csvRows = mockSubscribers.map(sub => 
      `${sub.email},${sub.subscribedAt},${sub.ip}`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist-export.csv"');
    
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data' 
    });
  }
} 