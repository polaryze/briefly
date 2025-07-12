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
        title: "LinkedIn integration coming soon",
        url: link,
        date: new Date().toISOString().slice(0, 10),
        thumbnail: "https://placehold.co/120x120?text=LI",
        text: "LinkedIn integration will be available soon with RapidAPI."
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
      prompt = `Write a concise, first-person summary (under 100 words) of the following YouTube content as if you are the creator. Use "I" or "my" to describe what was shared. Focus on the video titles and descriptions to create an engaging, personal update. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform} - ${p.type || 'video'}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else if (platform === "Instagram") {
      prompt = `Write a concise, first-person summary (under 100 words) of the following Instagram content as if you are the creator. Use "I" or "my" to describe what was shared. Focus on the post descriptions, engagement (likes/comments), and elaborate on what's happening in the posts. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}${p.likes ? ` (Likes: ${p.likes})` : ''}${p.comments ? ` (Comments: ${p.comments})` : ''}\n`).join("\n")}`;
    } else if (platform === "LinkedIn") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following LinkedIn content. Focus on professional updates, achievements, and insights shared. Keep it professional yet engaging. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the key professional updates. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else if (platform === "Twitter") {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following Twitter content. Focus on the tweets and discussions shared. Keep it conversational and engaging. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the main discussions and updates. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    } else {
      prompt = `Write a concise, natural paragraph (2-3 sentences) summarizing the following social media posts. Don't use sections, headers, or bullet points. Just write a short, flowing paragraph that captures the main content and tone of these posts. Keep it conversational and personal. Here are the posts:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    
    console.log('Instagram page loaded, searching for posts...');
    
    // Try multiple approaches to find posts
    let posts = [];
    
    // Approach 1: Try to get posts directly from the profile page
    posts = await page.evaluate(() => {
      const results = [];
      
      // Multiple selectors to find post containers
      const postSelectors = [
        'article',
        '[role="button"]',
        '._aabd',
        '[data-testid="post-container"]',
        'div[style*="background"]',
        'div[class*="post"]',
        'div[class*="feed"]'
      ];
      
      let postElements = [];
      for (const selector of postSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          postElements = Array.from(elements);
          break;
        }
      }
      
      console.log('Found', postElements.length, 'potential post elements');
      
      // Extract data from each post
      postElements.slice(0, 12).forEach((post, index) => {
        let text = '';
        let imageUrl = '';
        let postUrl = '';
        let date = '';
        
        // Try to extract image with multiple selectors
        const imgSelectors = [
          'img',
          'img[src*="instagram"]',
          'img[alt*="photo"]',
          'img[alt*="image"]',
          'img[src*="cdninstagram"]'
        ];
        
        for (const selector of imgSelectors) {
          const imgElement = post.querySelector(selector);
          if (imgElement && imgElement.src) {
            imageUrl = imgElement.src;
            break;
          }
        }
        
        // Try to extract text content
        const textSelectors = [
          '[data-testid="post-caption"]',
          '.caption',
          'p',
          'span',
          'div[class*="caption"]',
          'div[class*="text"]'
        ];
        
        for (const selector of textSelectors) {
          const textElement = post.querySelector(selector);
          if (textElement && textElement.textContent.trim().length > 0) {
            text = textElement.textContent.trim();
            break;
          }
        }
        
        // If no text found, try the whole element
        if (!text) {
          text = post.textContent.trim();
        }
        
        // Try to extract post URL
        const linkElement = post.querySelector('a');
        if (linkElement && linkElement.href) {
          postUrl = linkElement.href;
        }
        
        // Try to extract date
        const timeSelectors = ['time', '[datetime]', '[class*="time"]', '[class*="date"]'];
        for (const selector of timeSelectors) {
          const timeElement = post.querySelector(selector);
          if (timeElement) {
            date = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
            break;
          }
        }
        
        // Clean up text
        text = text.replace(/\s+/g, ' ').trim();
        
        // Include posts with either text or images
        if ((text && text.length > 5) || (imageUrl && imageUrl.length > 10)) {
          results.push({
            platform: "Instagram",
            title: text.slice(0, 100) + (text.length > 100 ? "..." : "") || "Instagram post",
            text: text || "Instagram post",
            url: postUrl || window.location.href,
            date: date ? date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            thumbnail: imageUrl || "https://placehold.co/120x120?text=IG",
            imageUrl: imageUrl || "https://placehold.co/120x120?text=IG"
          });
        }
      });
      
      return results;
    });
    
    console.log('Initial scraping found', posts.length, 'Instagram posts');
    
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
        const postElements = document.querySelectorAll('article, [role="button"], ._aabd, [data-testid="post-container"]');
        
        postElements.forEach((post, index) => {
          if (index < 8) {
            const imgElement = post.querySelector('img');
            const imageUrl = imgElement ? imgElement.src : '';
            const text = post.textContent?.trim().replace(/\s+/g, ' ') || "Instagram post";
            
            if (text && text.length > 5) {
              results.push({
                platform: "Instagram",
                title: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
                text: text,
                url: window.location.href,
                date: new Date().toISOString().slice(0, 10),
                thumbnail: imageUrl || "https://placehold.co/120x120?text=IG",
                imageUrl: imageUrl || "https://placehold.co/120x120?text=IG"
              });
            }
          }
        });
        
        return results;
      });
      
      posts.push(...morePosts);
      console.log('After scrolling, found', posts.length, 'total Instagram posts');
    }
    
    // If still no posts, try a simpler approach - just get any content
    if (posts.length === 0) {
      console.log('Trying fallback approach...');
      posts = await page.evaluate(() => {
        const results = [];
        
        // Look for any images on the page
        const allImages = document.querySelectorAll('img');
        const validImages = Array.from(allImages).filter(img => 
          img.src && 
          img.src.length > 10 && 
          !img.src.includes('data:image/svg') &&
          (img.src.includes('instagram') || img.src.includes('cdninstagram'))
        );
        
        console.log('Found', validImages.length, 'valid images');
        
        // Create posts from images
        validImages.slice(0, 4).forEach((img, index) => {
          results.push({
            platform: "Instagram",
            title: "Instagram post",
            text: "Instagram post",
            url: window.location.href,
            date: new Date().toISOString().slice(0, 10),
            thumbnail: img.src,
            imageUrl: img.src
          });
        });
        
        return results;
      });
      
      console.log('Fallback approach found', posts.length, 'posts');
    }
    
    // Filter to only include posts with actual images and limit to 4
    const postsWithImages = posts.filter(post => 
      post.imageUrl && 
      post.imageUrl !== '' && 
      post.imageUrl !== "https://placehold.co/120x120?text=IG" &&
      !post.imageUrl.includes('data:image/svg') && 
      !post.imageUrl.includes('placeholder') &&
      post.imageUrl.length > 10
    ).slice(0, 4);
    
    if (postsWithImages.length === 0) {
      // If no posts with images, return posts with placeholders for testing
      const fallbackPosts = posts.slice(0, 4).map(post => ({
        ...post,
        thumbnail: "https://placehold.co/120x120?text=IG",
        imageUrl: "https://placehold.co/120x120?text=IG"
      }));
      
      if (fallbackPosts.length > 0) {
        console.log('Returning', fallbackPosts.length, 'Instagram posts with placeholders');
        return fallbackPosts;
      }
      
      throw new Error('No posts found on this Instagram profile. The profile might be private or have no recent activity.');
    }
    
    console.log('Returning', postsWithImages.length, 'Instagram posts with images for highlights');
    console.log('Sample posts:', postsWithImages.slice(0, 2).map(p => ({ 
      title: p.title, 
      imageUrl: p.imageUrl
    })));
    
    return postsWithImages;
    
  } catch (error) {
    console.error('Instagram scraping error:', error);
    throw new Error(`Instagram scraping failed: ${error.message}. Please ensure the profile is public and has recent posts.`);
  } finally {
    await browser.close();
  }
}

// LinkedIn functionality will be implemented with RapidAPI
// Removed web scraping implementation

app.post('/api/scrape-and-transcribe', async (req, res) => {
  const { links, timeRange, twitterApiKey, testPrompt } = req.body;
  let results = [];
  // If testPrompt is present, use it directly
  if (testPrompt) {
    try {
      if (!process.env.OPENAI_API_KEY) throw new Error("Missing OpenAI API key");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
          results = results.concat(youtubeContent);
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
        // LinkedIn functionality will be implemented with RapidAPI
        // For now, return a placeholder
        results.push({
          platform: "LinkedIn",
          title: "LinkedIn integration coming soon",
          url: link,
          date: new Date().toISOString().slice(0, 10),
          thumbnail: "https://placehold.co/120x120?text=LI",
          text: "LinkedIn integration will be available soon with RapidAPI."
        });
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