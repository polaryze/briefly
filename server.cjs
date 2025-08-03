// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Server-side API keys and secrets
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Change this!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';

// Waitlist storage file
const WAITLIST_FILE = path.join(__dirname, 'waitlist.json');

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Rate limiting for waitlist submissions
const submissionAttempts = new Map();

// Admin session management
const adminSessions = new Map();

// Validate required environment variables
console.log('🔧 Environment Variables Check:');
console.log(`   OpenAI API Key: ${OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   RapidAPI Key: ${RAPIDAPI_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   JWT Secret: ${JWT_SECRET !== 'your-super-secret-jwt-key-change-this' ? '✅ Configured' : '⚠️  Using default'}`);
console.log(`   Admin Password: ${ADMIN_PASSWORD !== 'admin123' ? '✅ Configured' : '⚠️  Using default (admin123)'}`);
console.log(`   Encryption Key: ${ENCRYPTION_KEY.length === 32 ? '✅ Valid length' : '❌ Must be exactly 32 characters'}`);

if (!OPENAI_API_KEY) {
  console.error('❌ OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
}

if (!RAPIDAPI_KEY) {
  console.error('❌ RapidAPI key not configured. Please set RAPIDAPI_KEY environment variable.');
}

if (ENCRYPTION_KEY.length !== 32) {
  console.error('❌ ENCRYPTION_KEY must be exactly 32 characters long!');
  console.error('   Current length:', ENCRYPTION_KEY.length);
  console.error('   Please update your .env file with a 32-character encryption key.');
}

// Encryption functions
function encryptEmail(email) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
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

function decryptEmail(encryptedData) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Helper function to load waitlist data
async function loadWaitlist() {
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf8');
    const waitlist = JSON.parse(data);
    
    // Decrypt emails if they're encrypted
    return waitlist.map(entry => {
      if (entry.encryptedEmail) {
        const decryptedEmail = decryptEmail(entry.encryptedEmail);
        return {
          ...entry,
          email: decryptedEmail || 'DECRYPTION_ERROR',
          encryptedEmail: undefined // Don't send encrypted data to frontend
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
async function saveWaitlist(waitlist) {
  try {
    // Encrypt emails before saving
    const encryptedWaitlist = waitlist.map(entry => {
      const encryptedEmail = encryptEmail(entry.email);
      return {
        ...entry,
        email: undefined, // Remove plain text email
        encryptedEmail: encryptedEmail
      };
    });
    
    await fs.writeFile(WAITLIST_FILE, JSON.stringify(encryptedWaitlist, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving waitlist:', error);
    return false;
  }
}

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    token,
    message: 'Admin login successful'
  });
});

// Admin dashboard data
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const waitlist = await loadWaitlist();
    
    // Calculate statistics
    const totalSubscribers = waitlist.length;
    const today = new Date().toISOString().split('T')[0];
    const todaySubscribers = waitlist.filter(entry => 
      entry.subscribedAt.startsWith(today)
    ).length;
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekSubscribers = waitlist.filter(entry => 
      new Date(entry.subscribedAt) > thisWeek
    ).length;

    // Get recent subscribers (last 20)
    const recentSubscribers = waitlist
      .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt))
      .slice(0, 20);

    res.json({
      stats: {
        total: totalSubscribers,
        today: todaySubscribers,
        thisWeek: weekSubscribers
      },
      recentSubscribers: recentSubscribers.map(entry => ({
        email: entry.email,
        subscribedAt: entry.subscribedAt,
        ip: entry.ip
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Export waitlist as CSV
app.get('/api/admin/export', authenticateAdmin, async (req, res) => {
  try {
    const waitlist = await loadWaitlist();
    
    const csvHeader = 'Email,Subscribed At,IP Address,User Agent\n';
    const csvData = waitlist.map(entry => 
      `"${entry.email}","${entry.subscribedAt}","${entry.ip || ''}","${entry.userAgent || ''}"`
    ).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=waitlist-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete subscriber (GDPR compliance)
app.delete('/api/admin/subscriber/:email', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const waitlist = await loadWaitlist();
    
    const filteredWaitlist = waitlist.filter(entry => entry.email !== email);
    
    if (filteredWaitlist.length === waitlist.length) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    
    const saved = await saveWaitlist(filteredWaitlist);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to delete subscriber' });
    }
    
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// Waitlist endpoint
app.post('/api/waitlist/join', async (req, res) => {
  const { email } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Rate limiting: max 5 attempts per IP per hour
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  if (!submissionAttempts.has(clientIP)) {
    submissionAttempts.set(clientIP, { count: 0, firstAttempt: now });
  }
  
  const attempts = submissionAttempts.get(clientIP);
  if (now - attempts.firstAttempt > oneHour) {
    // Reset after an hour
    attempts.count = 0;
    attempts.firstAttempt = now;
  }
  
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Too many attempts. Please try again later.' 
    });
  }
  
  attempts.count++;

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
    const existingEntry = waitlist.find(entry => entry.email === sanitizedEmail);
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
      userAgent: req.get('User-Agent') || 'Unknown'
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
});

// Get waitlist stats (admin only - you can add authentication later)
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const waitlist = await loadWaitlist();
    res.json({
      totalSubscribers: waitlist.length,
      recentSubscribers: waitlist.slice(-10) // Last 10 subscribers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// OpenAI API endpoint
app.post('/api/openai/summarize', async (req, res) => {
  const { content, prompt } = req.body;
  
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured on server' 
    });
  }

  if (!content) {
    return res.status(400).json({ 
      error: 'Content is required' 
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt || 'You are a helpful assistant that creates engaging newsletter content from social media posts. Summarize the content in a conversational, first-person tone with bullet points.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${errorData.error?.message || response.statusText}` 
      });
    }

    const result = await response.json();
    res.json({ 
      summary: result.choices[0]?.message?.content || 'No summary generated'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Failed to generate summary' 
    });
  }
});

// RapidAPI endpoints
app.post('/api/rapidapi/twitter', async (req, res) => {
  const { handle } = req.body;
  
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ 
      error: 'RapidAPI key not configured on server' 
    });
  }

  if (!handle) {
    return res.status(400).json({ 
      error: 'Twitter handle is required' 
    });
  }

  try {
    // Get user data first
    const userUrl = `https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(handle)}`;
    const userOptions = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'twitter241.p.rapidapi.com'
      }
    };

    const userResponse = await fetch(userUrl, userOptions);
    const userResult = await userResponse.text();
    
    let userData;
    try {
      userData = JSON.parse(userResult);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse Twitter user data' });
    }

    // Extract rest_id from user data
    let restId = userData?.result?.data?.user?.result?.rest_id;
    if (!restId) {
      restId = userData?.data?.user?.result?.rest_id;
    }
    if (!restId) {
      restId = userData?.data?.user?.rest_id;
    }
    if (!restId) {
      restId = userData?.user?.rest_id;
    }
    if (!restId) {
      restId = userData?.data?.rest_id;
    }

    if (!restId) {
      return res.status(404).json({ error: 'User not found or no rest_id available' });
    }

    // Get tweets using rest_id
    const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user=${restId}&count=20`;
    const tweetsOptions = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'twitter241.p.rapidapi.com'
      }
    };

    const tweetsResponse = await fetch(tweetsUrl, tweetsOptions);
    const tweetsResult = await tweetsResponse.text();
    
    let tweetsData;
    try {
      tweetsData = JSON.parse(tweetsResult);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse Twitter tweets data' });
    }

    // Transform tweets to standard format
    let posts = [];
    if (tweetsData?.result?.timeline?.instructions && Array.isArray(tweetsData.result.timeline.instructions)) {
      const extractedTweets = [];
      for (const instruction of tweetsData.result.timeline.instructions) {
        if (instruction.type === 'TimelineAddEntries' && instruction.entries) {
          for (const entry of instruction.entries) {
            if (entry.content?.itemContent?.tweet_results?.result) {
              extractedTweets.push(entry.content.itemContent.tweet_results.result);
            }
          }
        }
      }
      posts = extractedTweets;
    } else if (tweetsData?.result?.data?.tweets && Array.isArray(tweetsData.result.data.tweets)) {
      posts = tweetsData.result.data.tweets;
    } else if (tweetsData?.data && Array.isArray(tweetsData.data)) {
      posts = tweetsData.data;
    } else if (tweetsData?.tweets && Array.isArray(tweetsData.tweets)) {
      posts = tweetsData.tweets;
    } else if (Array.isArray(tweetsData)) {
      posts = tweetsData;
    }

    // Transform posts to standard format
    const transformedPosts = posts.map((post) => {
      let text = '';
      const searchForText = (obj, path = '') => {
        if (typeof obj === 'string') {
          if (obj.length > 10 && !text) {
            text = obj;
            return obj;
          }
          return '';
        }
        if (typeof obj !== 'object' || obj === null) return '';
        
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key;
          if (key === 'full_text' || key === 'text' || key === 'tweet_text' || key === 'content') {
            if (typeof obj[key] === 'string' && obj[key].length > 10) {
              text = obj[key];
              return obj[key];
            }
          }
          const result = searchForText(obj[key], currentPath);
          if (result) return result;
        }
        return '';
      };
      
      searchForText(post);
      
      const legacy = post.legacy || post.tweet?.legacy || {};
      const core = post.core || post.tweet?.core || {};
      
      return {
        id: legacy.id_str || post.id_str || post.id || Math.random().toString(36),
        text: text || legacy.full_text || post.text || 'No text available',
        created_at: legacy.created_at || post.created_at || new Date().toISOString(),
        favorite_count: legacy.favorite_count || post.favorite_count || 0,
        reply_count: legacy.reply_count || post.reply_count || 0,
        retweet_count: legacy.retweet_count || post.retweet_count || 0,
        user: {
          screen_name: legacy.screen_name || core.screen_name || post.screen_name || 'unknown',
          name: legacy.name || core.name || post.name || 'Unknown User',
          profile_image_url: core.profile_image_url || post.profile_image_url || ''
        },
        entities: post.entities || legacy.entities || {},
        platform: 'twitter'
      };
    });

    res.json({ data: transformedPosts });
  } catch (error) {
    res.status(500).json({ 
      error: `Twitter API error: ${error.message || 'Unknown error'}` 
    });
  }
});

app.post('/api/rapidapi/instagram', async (req, res) => {
  const { username } = req.body;
  
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ 
      error: 'RapidAPI key not configured on server' 
    });
  }

  if (!username) {
    return res.status(400).json({ 
      error: 'Instagram username is required' 
    });
  }

  try {
    const url = `https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/media_by_username/${username}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com'
      }
    };

    const response = await fetch(url, options);
    const result = await response.text();
    
    let data;
    try {
      data = JSON.parse(result);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse Instagram API response' });
    }

    // Transform to standard format
    const posts = (data.data || []).map(post => ({
      id: post.id || Math.random().toString(36),
      text: post.caption || post.text || 'No caption available',
      created_at: post.timestamp || post.created_at || new Date().toISOString(),
      favorite_count: post.likes || post.like_count || 0,
      reply_count: post.comments || post.comment_count || 0,
      retweet_count: 0, // Instagram doesn't have retweets
      user: {
        screen_name: username,
        name: data.user?.full_name || username,
        profile_image_url: data.user?.profile_pic_url || ''
      },
      entities: {},
      platform: 'instagram',
      images: post.media_url ? [post.media_url] : []
    }));

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ 
      error: `Instagram API error: ${error.message || 'Unknown error'}` 
    });
  }
});

app.post('/api/rapidapi/youtube', async (req, res) => {
  const { url } = req.body;
  
  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ 
      error: 'RapidAPI key not configured on server' 
    });
  }

  if (!url) {
    return res.status(400).json({ 
      error: 'YouTube URL is required' 
    });
  }

  try {
    // Extract video ID from URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const apiUrl = `https://youtube-video-download-info.p.rapidapi.com/dl?id=${videoId}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
      }
    };

    const response = await fetch(apiUrl, options);
    const result = await response.text();
    
    let data;
    try {
      data = JSON.parse(result);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse YouTube API response' });
    }

    // Transform to standard format
    const post = {
      id: videoId,
      text: data.title || 'No title available',
      created_at: data.upload_date || new Date().toISOString(),
      favorite_count: data.likes || 0,
      reply_count: data.comment_count || 0,
      retweet_count: 0, // YouTube doesn't have retweets
      user: {
        screen_name: data.channel || 'Unknown Channel',
        name: data.channel || 'Unknown Channel',
        profile_image_url: data.thumbnail || ''
      },
      entities: {},
      platform: 'youtube',
      images: data.thumbnail ? [data.thumbnail] : []
    };

    res.json({ data: [post] });
  } catch (error) {
    res.status(500).json({ 
      error: `YouTube API error: ${error.message || 'Unknown error'}` 
    });
  }
});

// Disable all other API endpoints - return waitlist responses
app.post('/api/gmail/send', async (req, res) => {
  res.status(503).json({ 
    error: 'Service temporarily unavailable',
    message: 'Briefly is currently in development. Please join our waitlist at the homepage.'
  });
});

app.post('/api/linkedin-scrape', async (req, res) => {
  res.status(503).json({ 
    error: 'Service temporarily unavailable',
    message: 'Briefly is currently in development. Please join our waitlist at the homepage.'
  });
});

app.post('/api/scrape-socials', async (req, res) => {
  res.status(503).json({ 
    error: 'Service temporarily unavailable',
    message: 'Briefly is currently in development. Please join our waitlist at the homepage.'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'maintenance',
    message: 'Briefly is currently in development mode'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // Silent startup - no logging
}); 