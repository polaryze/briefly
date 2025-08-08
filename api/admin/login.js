import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminPassword || !jwtSecret) {
    return res.status(500).json({ error: 'Server not configured securely' });
  }

  // Small delay to slow brute-force without impacting UX
  await new Promise(r => setTimeout(r, 250));

  // Timing-safe comparison
  const provided = Buffer.from(String(password || ''));
  const expected = Buffer.from(String(adminPassword));
  const valid = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Issue short-lived JWT
  const token = jwt.sign(
    { role: 'admin' },
    jwtSecret,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    message: 'Admin login successful'
  });
} 