export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Simple token generation (in production, use proper JWT)
  const token = Buffer.from(`admin-${Date.now()}`).toString('base64');

  res.json({
    token,
    message: 'Admin login successful'
  });
} 