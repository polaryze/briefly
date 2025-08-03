import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Encryption functions
function encryptEmail(email: string, encryptionKey: string) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(encryptionKey, 'utf8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

// Helper function to load waitlist data
async function loadWaitlist(): Promise<any[]> {
  try {
    const waitlistPath = path.join(process.cwd(), 'waitlist.json');
    const data = await fs.readFile(waitlistPath, 'utf8');
    const waitlist = JSON.parse(data);
    
    // Decrypt emails if they're encrypted
    return waitlist.map((entry: any) => {
      if (entry.encryptedEmail) {
        // For now, just return the encrypted version
        // In production, you'd want to decrypt here
        return {
          ...entry,
          email: 'DECRYPTED_EMAIL', // Placeholder
          encryptedEmail: undefined
        };
      }
      return entry;
    });
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Helper function to save waitlist data
async function saveWaitlist(waitlist: any[]): Promise<boolean> {
  try {
    const waitlistPath = path.join(process.cwd(), 'waitlist.json');
    
    // Encrypt emails before saving
    const encryptedWaitlist = waitlist.map(entry => {
      const encryptionKey = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
      const encryptedEmail = encryptEmail(entry.email, encryptionKey);
      return {
        ...entry,
        email: undefined, // Remove plain text email
        encryptedEmail: encryptedEmail
      };
    });
    
    await fs.writeFile(waitlistPath, JSON.stringify(encryptedWaitlist, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving waitlist:', error);
    return false;
  }
}

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
    // Load existing waitlist
    const waitlist = await loadWaitlist();
    
    // Check if email already exists
    const existingEntry = waitlist.find((entry: any) => entry.email === sanitizedEmail);
    if (existingEntry) {
      return res.status(200).json({ 
        message: 'You are already on the waitlist!',
        alreadySubscribed: true
      });
    }

    // Add new entry
    const newEntry = {
      email: sanitizedEmail,
      subscribedAt: new Date().toISOString(),
      ip: clientIP,
      userAgent: req.headers['user-agent'] || 'Unknown'
    };

    waitlist.push(newEntry);

    // Save to file (will be encrypted)
    const saved = await saveWaitlist(waitlist);
    if (!saved) {
      return res.status(500).json({ 
        error: 'Failed to save email. Please try again.' 
      });
    }

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