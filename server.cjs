const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Server-side API keys (secure)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Validate API keys
if (!OPENAI_API_KEY) {
  console.error('❌ OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
}

if (!RAPIDAPI_KEY) {
  console.error('❌ RapidAPI key not configured. Please set RAPIDAPI_KEY environment variable.');
}

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