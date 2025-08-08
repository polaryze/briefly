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
    // Get all subscribers
    const { data: subscribers, error } = await supabase
      .from('waitlist')
      .select('email, subscribed_at, ip_address')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error getting subscribers:', error);
      return res.status(500).json({ error: 'Failed to export data' });
    }

    // Create CSV content
    const csvHeader = 'Email,Subscribed At,IP Address\n';
    const csvRows = (subscribers || []).map(sub => 
      `${sub.email},${sub.subscribed_at},${sub.ip_address}`
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