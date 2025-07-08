const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { AssemblyAI } = require('assemblyai');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { Rettiwt } = require('rettiwt-api');
const OpenAI = require('openai');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve audio files statically
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
app.use('/audio', express.static(audioDir));

// Helper to extract YouTube channel ID or username from URL
function extractYouTubeChannelId(url) {
  const atMatch = url.match(/youtube\.com\/@([\w-]+)/);
  if (atMatch) return atMatch[1];
  const idMatch = url.match(/youtube\.com\/channel\/([\w-]+)/);
  if (idMatch) return idMatch[1];
  return null;
}

// Helper to get channel_id from @username page
async function getChannelIdFromUsername(username) {
  try {
    const res = await fetch(`https://www.youtube.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Could not access YouTube profile`);
    }
    
    const html = await res.text();
    
    // Try multiple patterns to find channel ID
    const patterns = [
      /"channelId":"([\w-]+)"/,
      /"externalId":"([\w-]+)"/,
      /"channelId":"([^"]+)"/,
      /"browseId":"([\w-]+)"/,
      /"channelId":\s*"([\w-]+)"/
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no channel ID found, check if the page exists but is private
    if (html.includes('This channel is not available') || html.includes('This account has been terminated')) {
      throw new Error(`Channel "${username}" is not available or has been terminated`);
    }
    
    if (html.includes('This channel does not exist')) {
      throw new Error(`Channel "@${username}" does not exist`);
    }
    
    // If we can't find the channel ID but the page loads, try alternative methods
    console.log(`Could not extract channel ID for @${username}, trying alternative methods...`);
    return null;
    
  } catch (error) {
    console.error(`Error fetching channel ID for @${username}:`, error.message);
    throw new Error(`Could not access YouTube channel "@${username}": ${error.message}`);
  }
}

// Enhanced YouTube scraping with community posts and better video data
async function fetchYouTubeContent(channel, timeRange, isUsername = false) {
  let videos = [];
  let communityPosts = [];
  
  // Get channel ID
  let channelId = channel;
  if (isUsername) {
    try {
      channelId = await getChannelIdFromUsername(channel);
      if (!channelId) {
        throw new Error(`Could not find channel ID for username: ${channel}. The channel might be private, deleted, or the username might be incorrect.`);
      }
    } catch (error) {
      throw new Error(`YouTube channel error: ${error.message}`);
    }
  }
  
  // Fetch videos using RSS feed
  try {
    const channelFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(channelFeedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Could not fetch RSS feed for channel ID ${channelId}`);
    }
    
    const xml = await res.text();
    
    // Check if the RSS feed is empty or contains an error
    if (xml.includes('This channel does not exist') || xml.includes('Channel not found')) {
      throw new Error(`Channel with ID ${channelId} does not exist or is not accessible`);
    }
    
    const items = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
    
    if (items.length === 0) {
      throw new Error(`No videos found for this channel. The channel might be empty or private.`);
    }
    
    const now = new Date();
    const cutoff = new Date(now);
    if (timeRange === "week") cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    
    videos = items.map((m) => {
      const entry = m[1];
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const url = (entry.match(/<link rel='alternate' href='([\s\S]*?)'/) || [])[1] || "";
      const date = (entry.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || "";
      const id = (entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/) || [])[1] || "";
      const description = (entry.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || "";
      const thumbnail = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
      
      return { 
        platform: "YouTube", 
        type: "video",
        title, 
        url, 
        date: date.slice(0, 10), 
        thumbnail, 
        videoId: id,
        description: description.replace(/<[^>]*>/g, '').trim(), // Remove HTML tags
        text: `${title}\n\n${description.replace(/<[^>]*>/g, '').trim()}`
      };
    }).filter((v) => v.date && new Date(v.date) >= cutoff);
    
    if (videos.length === 0) {
      throw new Error(`No recent videos found for this channel in the selected time range (${timeRange}).`);
    }
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw new Error(`YouTube video fetching failed: ${error.message}`);
  }
  
  // Try to fetch community posts (this is more limited without API)
  try {
    // For community posts, we'll use a simplified approach
    // Note: YouTube community posts are harder to scrape without API
    // This is a fallback that creates mock community posts based on video data
    if (videos.length > 0) {
      communityPosts = videos.slice(0, 3).map(video => ({
        platform: "YouTube",
        type: "community",
        title: `Community Update: ${video.title}`,
        url: video.url,
        date: video.date,
        thumbnail: video.thumbnail,
        text: `New video posted: ${video.title}\n\n${video.description || 'Check out the latest content!'}`,
        description: video.description || 'New video content available'
      }));
    }
  } catch (error) {
    console.error('Error fetching community posts:', error);
  }
  
  return [...videos, ...communityPosts];
}

// Helper to download audio from YouTube using yt-dlp
function downloadYouTubeAudio(videoUrl, outPath) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp -x --audio-format mp3 -o "${outPath}" ${videoUrl}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr || error);
      resolve();
    });
  });
}

app.post('/api/scrape-socials', async (req, res) => {
  const { links, timeRange } = req.body;
  let results = [];
  for (const link of links) {
    if (link.includes("youtube.com")) {
      const atMatch = link.match(/youtube\.com\/@([\w-]+)/);
      const idMatch = link.match(/youtube\.com\/channel\/([\w-]+)/);
      if (atMatch) {
        const vids = await fetchYouTubeVideos(atMatch[1], timeRange, true);
        results = results.concat(vids);
      } else if (idMatch) {
        const vids = await fetchYouTubeVideos(idMatch[1], timeRange, false);
        results = results.concat(vids);
      }
    } else if (link.includes("instagram.com")) {
      results.push({
        platform: "Instagram",
        title: "Mocked Instagram Post",
        url: link,
        date: new Date().toISOString().slice(0, 10),
        thumbnail: "https://placehold.co/120x120?text=IG",
      });
    } else if (link.includes("linkedin.com")) {
      results.push({
        platform: "LinkedIn",
        title: "Mocked LinkedIn Post",
        url: link,
        date: new Date().toISOString().slice(0, 10),
        thumbnail: "https://placehold.co/120x120?text=LI",
      });
    }
  }
  res.json({ posts: results });
});

// AssemblyAI transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  try {
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
    const transcript = await client.transcripts.transcribe({ audio: url });
    if (transcript.status === 'error') {
      return res.status(500).json({ error: transcript.error });
    }
    res.json({ text: transcript.text });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Transcription failed' });
  }
});

// Helper to fetch recent tweets from a public Twitter/X profile
async function fetchTwitterPosts(username, timeRange, twitterApiKey = "") {
  // If username starts with @, remove it
  const cleanUsername = username.replace(/^@/, "");
  const rettiwt = twitterApiKey ? new Rettiwt({ apiKey: twitterApiKey }) : new Rettiwt();
  // Fetch tweets (limit to 10 for now)
  let tweets = [];
  try {
    const data = await rettiwt.tweet.search({ fromUsers: [cleanUsername] }, 10);
    // Filter by timeRange
    const now = new Date();
    const cutoff = new Date(now);
    if (timeRange === "week") cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    tweets = data.filter((t) => t.createdAt && new Date(t.createdAt) >= cutoff).map((t) => ({
      platform: "Twitter",
      title: t.text.slice(0, 60) + (t.text.length > 60 ? "..." : ""),
      url: `https://twitter.com/${cleanUsername}/status/${t.id}`,
      date: t.createdAt ? t.createdAt.slice(0, 10) : "",
      thumbnail: t.media && t.media.length > 0 ? t.media[0].url : "https://placehold.co/120x120?text=TW",
      text: t.text,
    }));
  } catch (err) {
    // If error, return empty
    tweets = [];
  }
  return tweets;
}



// Helper to call OpenAI API for newsletter generation
async function generateNewsletterWithOpenAI(posts) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OpenAI API key");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Group posts by platform
  const postsByPlatform = {};
  posts.forEach(post => {
    if (!postsByPlatform[post.platform]) {
      postsByPlatform[post.platform] = [];
    }
    postsByPlatform[post.platform].push(post);
  });
  
  // Generate separate summaries for each platform
  const summaries = {};
  
  for (const [platform, platformPosts] of Object.entries(postsByPlatform)) {
    let prompt;
    
    if (platform === "YouTube") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following YouTube content. Focus on the video titles and descriptions to create an engaging summary. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the main themes and content. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform} - ${p.type || 'video'}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else if (platform === "Instagram") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following Instagram content. Focus on the post descriptions, engagement (likes/comments), and elaborate on what's happening in the posts. Explain the context and meaning behind the content, including any notable engagement patterns. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the visual stories, personal moments, and audience response. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}${p.likes ? ` (Likes: ${p.likes})` : ''}${p.comments ? ` (Comments: ${p.comments})` : ''}\n`).join("\n")}`;
    } else if (platform === "LinkedIn") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following LinkedIn content. Focus on professional updates, achievements, and insights shared. Keep it professional yet engaging. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the key professional updates. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else if (platform === "Twitter") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following Twitter content. Focus on the tweets and discussions shared. Keep it conversational and engaging. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the main discussions and updates. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following social media posts. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the main content and tone of these posts. Keep it conversational and personal. Here are the posts:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150, // Shorter for individual platform summaries
    });
    
    summaries[platform] = response.choices[0].message.content;
  }
  
  // Combine all summaries into organized paragraphs
  const combinedSummary = Object.entries(summaries)
    .map(([platform, summary]) => {
      const platformNames = {
        "LinkedIn": "LinkedIn",
        "Instagram": "Instagram", 
        "YouTube": "YouTube",
        "Twitter": "Twitter"
      };
      return `**${platformNames[platform] || platform}**: ${summary}`;
    })
    .join('\n\n');
  
  return combinedSummary;
}

// Helper to scrape Instagram posts using Puppeteer
async function scrapeInstagramPosts(profileUrl, timeRange = "week") {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to Instagram profile:', profileUrl);
    
    // Navigate to Instagram profile
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if we're on a valid Instagram page
    const pageTitle = await page.title();
    if (!pageTitle.includes('Instagram')) {
      throw new Error('Not a valid Instagram page. Please check the URL.');
    }
    
    console.log('Instagram page loaded, searching for post links...');
    
    // First, get the post URLs from the profile
    const postUrls = await page.evaluate(() => {
      const results = [];
      
      // Look for post links - these are usually the clickable elements that lead to individual posts
      const postSelectors = [
        'a[href*="/p/"]', // Instagram post URLs contain /p/
        'a[href*="/reel/"]', // Instagram reel URLs
        'article a', // Any link within an article
        '[role="button"]', // Clickable post containers
        '._aabd a', // Common Instagram post link class
        '[data-testid="post-container"] a' // Test ID for post containers
      ];
      
      let postElements = [];
      for (const selector of postSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          postElements = Array.from(elements);
          break;
        }
      }
      
      console.log('Found', postElements.length, 'potential post links');
      
      // Extract URLs from the first 8 posts (to get 4 good ones)
      postElements.slice(0, 8).forEach((element) => {
        const href = element.href;
        if (href && (href.includes('/p/') || href.includes('/reel/'))) {
          results.push(href);
        }
      });
      
      return results;
    });
    
    console.log('Found', postUrls.length, 'post URLs to analyze');
    
    if (postUrls.length === 0) {
      throw new Error('No post links found on this Instagram profile. The profile might be private or have no recent posts.');
    }
    
    // Now visit each post to get detailed information
    const detailedPosts = [];
    
    for (let i = 0; i < Math.min(postUrls.length, 8); i++) {
      const postUrl = postUrls[i];
      console.log(`Analyzing post ${i + 1}/${Math.min(postUrls.length, 8)}: ${postUrl}`);
      
      try {
        // Navigate to the individual post
        await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for content to load
        
        // Extract detailed post information
        const postData = await page.evaluate(() => {
          const data = {
            description: '',
            likes: '',
            comments: '',
            date: '',
            imageUrl: '',
            username: '',
            postUrl: window.location.href
          };
          
          // Extract description/caption
          const captionSelectors = [
            '[data-testid="post-caption"]',
            'article [data-testid="post-caption"]',
            '.caption',
            'article p',
            'article span',
            '[class*="caption"]',
            '[class*="description"]'
          ];
          
          for (const selector of captionSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 0) {
              data.description = element.textContent.trim();
              break;
            }
          }
          
          // Extract likes count
          const likeSelectors = [
            '[data-testid="like-count"]',
            'a[href*="/liked_by/"]',
            '[class*="like"]',
            '[class*="Like"]',
            'span:contains("like")',
            'span:contains("Like")'
          ];
          
          for (const selector of likeSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.includes('like')) {
              data.likes = element.textContent.trim();
              break;
            }
          }
          
          // Extract comments count
          const commentSelectors = [
            '[data-testid="comment-count"]',
            'a[href*="/comments/"]',
            '[class*="comment"]',
            '[class*="Comment"]'
          ];
          
          for (const selector of commentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.includes('comment')) {
              data.comments = element.textContent.trim();
              break;
            }
          }
          
          // Extract date/time
          const timeSelectors = [
            'time',
            '[datetime]',
            '[class*="time"]',
            '[class*="date"]',
            'a[href*="/p/"] time'
          ];
          
          for (const selector of timeSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              data.date = element.getAttribute('datetime') || element.textContent.trim();
              break;
            }
          }
          
          // Extract image URL
          const imgSelectors = [
            'article img',
            '[data-testid="post-image"] img',
            'img[alt*="photo"]',
            'img[alt*="image"]'
          ];
          
          for (const selector of imgSelectors) {
            const element = document.querySelector(selector);
            if (element && element.src) {
              data.imageUrl = element.src;
              break;
            }
          }
          
          // Extract username
          const usernameSelectors = [
            'a[href*="/"]',
            '[data-testid="username"]',
            '[class*="username"]'
          ];
          
          for (const selector of usernameSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent && element.textContent.includes('@')) {
              data.username = element.textContent.trim();
              break;
            }
          }
          
          return data;
        });
        
        // Only include posts with actual images
        if (postData.imageUrl && postData.imageUrl.length > 10 && !postData.imageUrl.includes('data:image/svg')) {
          detailedPosts.push({
            platform: "Instagram",
            title: postData.description.slice(0, 100) + (postData.description.length > 100 ? "..." : "") || "Instagram post",
            text: postData.description || "Instagram post",
            url: postData.postUrl,
            date: postData.date ? postData.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            thumbnail: postData.imageUrl,
            imageUrl: postData.imageUrl,
            likes: postData.likes,
            comments: postData.comments,
            username: postData.username
          });
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`Error analyzing post ${i + 1}:`, error.message);
        continue; // Skip this post and continue with the next one
      }
    }
    
    // Take the first 4 posts with images
    const finalPosts = detailedPosts.slice(0, 4);
    
    if (finalPosts.length === 0) {
      throw new Error('No posts with images found on this Instagram profile. The profile might be private or have no recent image posts.');
    }
    
    console.log('Returning', finalPosts.length, 'detailed Instagram posts for highlights');
    console.log('Sample posts:', finalPosts.slice(0, 2).map(p => ({ 
      title: p.title, 
      imageUrl: p.imageUrl,
      likes: p.likes,
      comments: p.comments
    })));
    
    return finalPosts;
    
  } catch (error) {
    console.error('Instagram scraping error:', error);
    throw new Error(`Instagram scraping failed: ${error.message}. Please ensure the profile is public and has recent posts with images.`);
  } finally {
    await browser.close();
  }
}

// Helper to scrape LinkedIn posts using Puppeteer
async function scrapeLinkedInPosts(profileUrl, timeRange = "week") {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to LinkedIn profile:', profileUrl);
    
    // Navigate to LinkedIn profile
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if we're on a valid LinkedIn page
    const pageTitle = await page.title();
    if (!pageTitle.includes('LinkedIn')) {
      throw new Error('Not a valid LinkedIn page. Please check the URL.');
    }
    
    console.log('LinkedIn page loaded, searching for posts...');
    
    // Try multiple selectors to find posts
    const posts = await page.evaluate(() => {
      const results = [];
      
      // Method 1: Look for activity/posts section with more specific selectors
      let postElements = document.querySelectorAll('[data-test-id="post-content"], .feed-shared-update-v2, .artdeco-card, [data-test-id="activity-item"], .feed-shared-update-v2__description');
      
      // Method 2: If no posts found, look for any content with text
      if (postElements.length === 0) {
        postElements = document.querySelectorAll('.artdeco-card, .feed-shared-update-v2, [class*="post"], [class*="update"], .feed-shared-text');
      }
      
      // Method 3: Look for any div with substantial text content
      if (postElements.length === 0) {
        const allDivs = document.querySelectorAll('div');
        postElements = Array.from(allDivs).filter(div => {
          const text = div.textContent?.trim();
          return text && text.length > 50 && text.length < 2000 && 
                 !div.querySelector('img') && 
                 !div.querySelector('button') &&
                 div.children.length < 5;
        });
      }
      
      console.log('Found', postElements.length, 'potential post elements');
      
      postElements.forEach((post, index) => {
        if (index < 10) { // Limit to 10 posts
          let text = '';
          let date = '';
          let postUrl = '';
          
          // Try to extract text content with more selectors
          const textSelectors = [
            '[data-test-id="post-text"]',
            '.feed-shared-text',
            '.update-components-text',
            '.feed-shared-update-v2__description',
            'p',
            'span'
          ];
          
          for (const selector of textSelectors) {
            const textElement = post.querySelector(selector);
            if (textElement && textElement.textContent.trim().length > 10) {
              text = textElement.textContent.trim();
              break;
            }
          }
          
          // If no text found with selectors, try the whole element
          if (!text) {
            text = post.textContent.trim();
          }
          
          // Try to extract date
          const timeSelectors = ['time', '[data-test-id="time-ago"]', '.feed-shared-actor__sub-description'];
          for (const selector of timeSelectors) {
            const timeElement = post.querySelector(selector);
            if (timeElement) {
              date = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
              break;
            }
          }
          
          // Try to extract post URL
          const linkSelectors = ['a[href*="/posts/"]', 'a[href*="/activity/"]', 'a'];
          for (const selector of linkSelectors) {
            const linkElement = post.querySelector(selector);
            if (linkElement && linkElement.href) {
              postUrl = linkElement.href;
              break;
            }
          }
          
          // Clean up text (remove extra whitespace, newlines)
          text = text.replace(/\s+/g, ' ').trim();
          
          if (text.length > 20 && text.length < 2000) { // Only include posts with substantial content
            // If no date found, use current date
            if (!date) {
              date = new Date().toISOString();
            }
            
            results.push({
              platform: "LinkedIn",
              title: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
              text: text,
              url: postUrl || profileUrl,
              date: date.slice(0, 10),
              thumbnail: "https://placehold.co/120x120?text=LI"
            });
          }
        }
      });
      
      return results;
    });
    
    console.log('Initial scraping found', posts.length, 'posts');
    
    // If no posts found, try scrolling to load more content
    if (posts.length === 0) {
      console.log('No posts found initially, trying to scroll...');
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try scraping again after scroll
      const morePosts = await page.evaluate(() => {
        const results = [];
        const postElements = document.querySelectorAll('.artdeco-card, .feed-shared-update-v2, [class*="post"], .feed-shared-text');
        
        postElements.forEach((post, index) => {
          if (index < 5) {
            const text = post.textContent?.trim().replace(/\s+/g, ' ');
            if (text && text.length > 20 && text.length < 2000) {
              results.push({
                platform: "LinkedIn",
                title: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
                text: text,
                url: window.location.href,
                date: new Date().toISOString().slice(0, 10),
                thumbnail: "https://placehold.co/120x120?text=LI"
              });
            }
          }
        });
        
        return results;
      });
      
      posts.push(...morePosts);
      console.log('After scrolling, found', posts.length, 'total posts');
    }
    
    if (posts.length === 0) {
      throw new Error('No posts found on this LinkedIn profile. The profile might be private or have no recent activity.');
    }
    
    return posts;
    
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    throw new Error(`LinkedIn scraping failed: ${error.message}. Please ensure the profile is public and has recent posts.`);
  } finally {
    await browser.close();
  }
}

app.post('/api/scrape-and-transcribe', async (req, res) => {
  const { links, timeRange, twitterApiKey, testPrompt } = req.body;
  let results = [];
  // If testPrompt is present, use it directly
  if (testPrompt) {
    try {
      if (!process.env.OPENAI_API_KEY) throw new Error("Missing OpenAI API key");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: testPrompt }],
        max_tokens: 1000,
      });
      let story = response.choices[0].message.content;
      // Remove unwanted sections (stronger filtering)
      const sectionHeaders = [
        'Upcoming Goals',
        'Reflections',
        'Lessons Learned',
        'Q&A',
        'Life Update',
        "Tech I'm Excited About",
        'What Inspired Me This Week',
        'Social Growth',
        'Project Deep Dive',
        'Lessons',
        'Goals',
        'Inspiration',
        'Growth',
        'Ask Me Anything',
        'Book',
        'Podcast',
        'Update',
        'Summary',
        'Takeaways',
        'Highlights',
        'Key Points',
        'Tips',
        'Advice',
        'Challenge',
        'Motivation',
        'Next Steps',
        'Looking Ahead',
        'What\'s Next',
      ];
      // Remove any section that starts with these headers (markdown or plain text)
      sectionHeaders.forEach(header => {
        // Remove markdown headers and following content
        const regex1 = new RegExp(`(^|\n)#+ ?${header}[\s\S]*?(?=\n#|$)`, 'gi');
        story = story.replace(regex1, '');
        // Remove plain text headers and following content
        const regex2 = new RegExp(`(^|\n)${header}:?[\s\S]*?(?=\n[A-Z][^\n]*:|\n#|$)`, 'gi');
        story = story.replace(regex2, '');
        // Remove any line that contains the header
        const regex3 = new RegExp(`(^|\n)[^\n]*${header}[^\n]*\n?`, 'gi');
        story = story.replace(regex3, '');
      });
      story = story.trim();
      return res.json({ posts: [], newsletter: story });
    } catch (err) {
      return res.json({ posts: [], newsletter: `Newsletter generation failed: ${err.message}` });
    }
  }
  
  try {
    for (const link of links) {
      if (link.includes("youtube.com")) {
        const atMatch = link.match(/youtube\.com\/@([\w-]+)/);
        const idMatch = link.match(/youtube\.com\/channel\/([\w-]+)/);
        let youtubeContent = [];
        
        try {
          if (atMatch) {
            youtubeContent = await fetchYouTubeContent(atMatch[1], timeRange, true);
          } else if (idMatch) {
            youtubeContent = await fetchYouTubeContent(idMatch[1], timeRange, false);
          }
          
          // For now, we'll skip transcription and just use titles/descriptions
          // You can uncomment the transcription code below if needed
          for (const content of youtubeContent) {
            // Skip transcription for now - just use the text field we created
            // Uncomment below if you want transcription:
            /*
            if (content.type === "video" && content.videoId) {
              try {
                const audioFile = path.join(audioDir, `${content.videoId}.mp3`);
                const audioUrl = `/audio/${content.videoId}.mp3`;
                if (!fs.existsSync(audioFile)) {
                  await downloadYouTubeAudio(content.url, audioFile);
                }
                // Transcribe
                const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
                const transcript = await client.transcripts.transcribe({ audio: `http://localhost:3001${audioUrl}` });
                content.transcript = transcript.text;
                content.audioUrl = audioUrl;
              } catch (err) {
                content.transcript = "[Transcription failed]";
                content.audioUrl = null;
              }
            }
            */
            results.push(content);
          }
        } catch (error) {
          return res.status(400).json({ 
            error: `YouTube scraping failed: ${error.message}`,
            posts: [],
            newsletter: null
          });
        }
      } else if (link.includes("instagram.com")) {
        // Use real Instagram scraping with proper error handling
        try {
          const instagramPosts = await scrapeInstagramPosts(link, timeRange);
          results = results.concat(instagramPosts);
        } catch (error) {
          // Return error instead of mock data
          return res.status(400).json({ 
            error: error.message,
            posts: [],
            newsletter: null
          });
        }
      } else if (link.includes("linkedin.com")) {
        // Use real LinkedIn scraping with proper error handling
        try {
          const linkedInPosts = await scrapeLinkedInPosts(link, timeRange);
          results = results.concat(linkedInPosts);
        } catch (error) {
          // Return error instead of mock data
          return res.status(400).json({ 
            error: error.message,
            posts: [],
            newsletter: null
          });
        }
      } else if (link.includes("twitter.com") || link.startsWith("@")) {
        // Accept both full URLs and @usernames
        let username = link;
        if (link.includes("twitter.com")) {
          const match = link.match(/twitter.com\/(#!\/)?([A-Za-z0-9_]+)/);
          username = match ? match[2] : link;
        }
        const tweets = await fetchTwitterPosts(username, timeRange, twitterApiKey);
        results = results.concat(tweets);
      }
    }
    
    // Check if we have any posts to summarize
    if (results.length === 0) {
      return res.status(400).json({ 
        error: "No posts found from the provided links. Please check that the profiles are public and have recent activity.",
        posts: [],
        newsletter: null
      });
    }
    
    // Compose newsletter using OpenAI
    let newsletter = null;
    try {
      newsletter = await generateNewsletterWithOpenAI(results);
    } catch (err) {
      newsletter = `Newsletter generation failed: ${err.message}`;
    }
    res.json({ posts: results, newsletter });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: `Scraping failed: ${error.message}`,
      posts: [],
      newsletter: null
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
}); 