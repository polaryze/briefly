const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'YOUR_RAPIDAPI_KEY';

app.post('/api/linkedin-scrape', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Missing LinkedIn username' });
  }

  // Use the provided URL and options, replacing USERNAME
  const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=https%3A%2F%2Fwww.linkedin.com%2Fin%2F${encodeURIComponent(username)}%2F&type=posts`;
  const options = {
    method: 'GET',
      headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    let data;
    try {
      data = JSON.parse(result);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse LinkedIn API response', raw: result });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Instagram placeholder
async function scrapeInstagram(usernameOrUrl) {
  return [{
    platform: 'instagram',
    title: 'Instagram Content',
    text: 'Sample Instagram post content (mock)',
    url: 'https://instagram.com/' + usernameOrUrl,
    date: new Date().toISOString(),
    thumbnail: 'https://placehold.co/120x120?text=IG',
    imageUrl: 'https://placehold.co/120x120?text=IG',
    likes: 42,
    comments: 5,
    allImages: ['https://placehold.co/120x120?text=IG']
  }];
}

// Helper: Twitter placeholder
async function scrapeTwitter(usernameOrUrl) {
  return [{
    platform: 'twitter',
    title: 'Twitter Content',
    text: 'Sample Twitter post content (mock)',
    url: 'https://twitter.com/' + usernameOrUrl,
    date: new Date().toISOString(),
    thumbnail: 'https://placehold.co/120x120?text=TW',
    imageUrl: 'https://placehold.co/120x120?text=TW',
    likes: 99,
    comments: 12,
    allImages: ['https://placehold.co/120x120?text=TW']
  }];
}

// Helper: YouTube placeholder
async function scrapeYouTube(url, summary) {
  return [{
    platform: 'youtube',
    title: 'YouTube Video',
    text: summary || 'Sample YouTube summary (mock)',
    url,
    date: new Date().toISOString(),
    thumbnail: 'https://placehold.co/120x120?text=YT',
    imageUrl: 'https://placehold.co/120x120?text=YT',
    likes: 0,
    comments: 0,
    allImages: ['https://placehold.co/120x120?text=YT']
  }];
}

// Main scraping endpoint
app.post('/api/scrape-socials', async (req, res) => {
  const { links = [], timeRange = 'week', youtubeSummaries = {} } = req.body || {};
  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: 'No social links provided' });
  }
  let posts = [];
  for (const link of links) {
    let username = null;
    let isLinkedIn = false;
    if (link.includes('linkedin.com')) {
      // Extract username from LinkedIn URL
      const match = link.match(/linkedin.com\/in\/([\w-]+)/);
      username = match ? match[1] : null;
      isLinkedIn = true;
    } else if (/^[\w-]+$/.test(link.trim())) {
      // If input is just a username (letters, numbers, dashes, underscores)
      username = link.trim();
      isLinkedIn = true;
    }
    if (isLinkedIn && username) {
      // Use the exact fetch snippet for LinkedIn
      const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=https%3A%2F%2Fwww.linkedin.com%2Fin%2F${encodeURIComponent(username)}%2F&type=posts`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
        }
      };
      try {
        const response = await fetch(url, options);
        const resultText = await response.text();
        let data;
        try {
          data = JSON.parse(resultText);
        } catch (err) {
          posts = posts.concat([{ platform: 'linkedin', title: 'LinkedIn Content', text: 'Failed to parse LinkedIn API response', url: link, date: new Date().toISOString(), thumbnail: '', imageUrl: '', likes: 0, comments: 0, allImages: [] }]);
          continue;
        }
        // Map to Post[]
        if (Array.isArray(data.data)) {
          posts = posts.concat(data.data.map(post => ({
            platform: 'linkedin',
            title: post.text?.slice(0, 40) || 'LinkedIn Post',
            text: post.text || '',
            url: post.post_url || link,
            date: post.posted || new Date().toISOString(),
            thumbnail: post.images?.[0]?.url || '',
            imageUrl: post.images?.[0]?.url || '',
            likes: post.num_likes || 0,
            comments: post.num_comments || 0,
            allImages: (post.images || []).map(img => img.url)
          })));
        } else {
          posts = posts.concat([{ platform: 'linkedin', title: 'LinkedIn Content', text: 'No posts found', url: link, date: new Date().toISOString(), thumbnail: '', imageUrl: '', likes: 0, comments: 0, allImages: [] }]);
        }
      } catch (error) {
        posts = posts.concat([{ platform: 'linkedin', title: 'LinkedIn Content', text: error.message, url: link, date: new Date().toISOString(), thumbnail: '', imageUrl: '', likes: 0, comments: 0, allImages: [] }]);
      }
      continue;
    }
    if (link.includes('instagram.com')) {
      // Extract username from Instagram URL
      const username = link.split('instagram.com/')[1]?.split('/')[0];
      const igPosts = await scrapeInstagram(username || link);
      posts = posts.concat(igPosts);
    } else if (link.includes('twitter.com') || link.startsWith('@')) {
      // Extract handle from Twitter URL or @handle
      let handle = link;
      if (link.includes('twitter.com/')) {
        handle = link.split('twitter.com/')[1]?.split('/')[0];
      } else if (link.startsWith('@')) {
        handle = link.slice(1);
      }
      const twPosts = await scrapeTwitter(handle);
      posts = posts.concat(twPosts);
    } else if (link.includes('youtube.com') || link.includes('youtu.be')) {
      // Use provided summary if available
      const summary = youtubeSummaries[link] || '';
      const ytPosts = await scrapeYouTube(link, summary);
      posts = posts.concat(ytPosts);
    }
  }
  // Compose a mock newsletter (for now)
  const newsletter = {
    sections: [
      {
        title: 'Social Media Highlights',
        icon: '📱',
        content: `<div class="space-y-6">${posts.map(post => `
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              ${post.platform === 'linkedin' ? '💼' : post.platform === 'instagram' ? '📸' : post.platform === 'twitter' ? '🐦' : '🎥'} ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Highlights
            </h3>
            <div class="space-y-4">
              <div class="p-4 bg-muted rounded-lg">
                <div class="flex items-start gap-3">
                  <img src="${post.thumbnail}" alt="Post thumbnail" class="w-16 h-16 object-cover rounded" />
                  <div class="flex-1">
                    <p class="text-sm text-muted-foreground mb-1">${new Date(post.date).toLocaleDateString()}</p>
                    <p class="text-foreground">${post.text}</p>
                    <p class="text-xs text-muted-foreground mt-2">❤️ ${post.likes} likes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>`).join('')}</div>`
      }
    ]
  };
  res.json({ posts, newsletter, summary: { totalLinks: links.length, processedLinks: posts.length, platforms: posts.map(p => p.platform) } });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 