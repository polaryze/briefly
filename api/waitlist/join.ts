import type { VercelRequest, VercelResponse } from '@vercel/node';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// In-memory storage for demo (in production, use a database)
let waitlistEmails: string[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const { email } = req.body;
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  
  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  
  if (sanitizedEmail.length > 254) {
    return res.status(400).json({ 
      error: 'Email is too long' 
    });
  }

  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address' 
    });
  }

  // Check for disposable email domains
  const disposableDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwaway.email',
    'temp-mail.org', 'sharklasers.com', 'guerrillamailblock.com'
  ];
  
  const domain = sanitizedEmail.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return res.status(400).json({ 
      error: 'Please use a valid email address' 
    });
  }

  try {
    // Check if email already exists
    if (waitlistEmails.includes(sanitizedEmail)) {
      return res.status(200).json({ 
        message: 'You are already on the waitlist!',
        alreadySubscribed: true
      });
    }

    // Add to waitlist
    waitlistEmails.push(sanitizedEmail);

    // Log for debugging (remove in production)
    console.log(`New waitlist signup: ${sanitizedEmail} from ${clientIP}`);

    res.status(200).json({ 
      message: 'Successfully joined the waitlist!',
      alreadySubscribed: false
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.' 
    });
  }
} 