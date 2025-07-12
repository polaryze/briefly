import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Post {
  platform: string
  title: string
  text?: string
  url: string
  date: string
  thumbnail: string
  imageUrl?: string
  videoId?: string
  description?: string
  type?: string
  transcript?: string
  likes?: number
  comments?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { links, timeRange } = await req.json()
    let results: Post[] = []

    for (const link of links) {
      if (link.includes("youtube.com")) {
        const atMatch = link.match(/youtube\.com\/@([\w-]+)/)
        const idMatch = link.match(/youtube\.com\/channel\/([\w-]+)/)
        
        if (atMatch) {
          const vids = await fetchYouTubeContent(atMatch[1], timeRange, true)
          results = results.concat(vids)
        } else if (idMatch) {
          const vids = await fetchYouTubeContent(idMatch[1], timeRange, false)
          results = results.concat(vids)
        }
      } else if (link.includes("instagram.com")) {
        const instagramPosts = await scrapeInstagramPosts(link, timeRange)
        results = results.concat(instagramPosts)
      } else if (link.includes("linkedin.com")) {
        const linkedInPosts = await fetchLinkedInPosts(link, timeRange)
        results = results.concat(linkedInPosts)
      } else if (link.includes("twitter.com") || link.startsWith("@")) {
        let username = link
        if (link.includes("twitter.com")) {
          const match = link.match(/twitter.com\/(#!\/)?([A-Za-z0-9_]+)/)
          username = match ? match[2] : link
        }
        const tweets = await fetchTwitterPosts(username, timeRange)
        results = results.concat(tweets)
      }
    }

    // Generate newsletter using OpenAI
    let newsletter: string | null = null
    try {
      newsletter = await generateNewsletterWithOpenAI(results)
    } catch (err: any) {
      newsletter = `Newsletter generation failed: ${err.message}`
    }

    return new Response(
      JSON.stringify({ posts: results, newsletter }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: `Scraping failed: ${error.message}`,
        posts: [],
        newsletter: null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Helper to extract YouTube channel ID or username from URL
function extractYouTubeChannelId(url: string) {
  const atMatch = url.match(/youtube\.com\/@([\w-]+)/)
  if (atMatch) return atMatch[1]
  const idMatch = url.match(/youtube\.com\/channel\/([\w-]+)/)
  if (idMatch) return idMatch[1]
  return null
}

// Helper to get channel_id from @username page
async function getChannelIdFromUsername(username: string) {
  try {
    const res = await fetch(`https://www.youtube.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Could not access YouTube profile`)
    }
    
    const html = await res.text()
    
    // Try multiple patterns to find channel ID
    const patterns = [
      /"channelId":"([\w-]+)"/,
      /"externalId":"([\w-]+)"/,
      /"channelId":"([^"]+)"/,
      /"browseId":"([\w-]+)"/,
      /"channelId":\s*"([\w-]+)"/
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    if (html.includes('This channel is not available') || html.includes('This account has been terminated')) {
      throw new Error(`Channel "${username}" is not available or has been terminated`)
    }
    
    if (html.includes('This channel does not exist')) {
      throw new Error(`Channel "@${username}" does not exist`)
    }
    
    return null
    
  } catch (error) {
    console.error(`Error fetching channel ID for @${username}:`, error.message)
    throw new Error(`Could not access YouTube channel "@${username}": ${error.message}`)
  }
}

// Enhanced YouTube scraping with community posts and better video data
async function fetchYouTubeContent(channel: string, timeRange: string, isUsername = false) {
  let videos: Post[] = []
  let communityPosts: Post[] = []
  
  // Get channel ID
  let channelId = channel
  if (isUsername) {
    try {
      channelId = await getChannelIdFromUsername(channel)
      if (!channelId) {
        throw new Error(`Could not find channel ID for username: ${channel}. The channel might be private, deleted, or the username might be incorrect.`)
      }
    } catch (error) {
      throw new Error(`YouTube channel error: ${error.message}`)
    }
  }
  
  // Fetch videos using RSS feed
  try {
    const channelFeedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    const res = await fetch(channelFeedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Could not fetch RSS feed for channel ID ${channelId}`)
    }
    
    const xml = await res.text()
    
    if (xml.includes('This channel does not exist') || xml.includes('Channel not found')) {
      throw new Error(`Channel with ID ${channelId} does not exist or is not accessible`)
    }
    
    const items = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
    
    if (items.length === 0) {
      throw new Error(`No videos found for this channel. The channel might be empty or private.`)
    }
    
    const now = new Date()
    const cutoff = new Date(now)
    if (timeRange === "week") cutoff.setDate(now.getDate() - 7)
    else cutoff.setMonth(now.getMonth() - 1)
    
    videos = items.map((m) => {
      const entry = m[1]
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""
      const url = (entry.match(/<link rel='alternate' href='([\s\S]*?)'/) || [])[1] || ""
      const date = (entry.match(/<published>([\s\S]*?)<\/published>/) || [])[1] || ""
      const id = (entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/) || [])[1] || ""
      const description = (entry.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || ""
      const thumbnail = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""
      
      return { 
        platform: "YouTube", 
        type: "video",
        title, 
        url, 
        date: date.slice(0, 10), 
        thumbnail, 
        videoId: id,
        description: description.replace(/<[^>]*>/g, '').trim(),
        text: `${title}\n\n${description.replace(/<[^>]*>/g, '').trim()}`
      }
    }).filter((v) => v.date && new Date(v.date) >= cutoff)
    
    if (videos.length === 0) {
      throw new Error(`No recent videos found for this channel in the selected time range (${timeRange}).`)
    }
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw new Error(`YouTube video fetching failed: ${error.message}`)
  }
  
  // Try to fetch community posts
  try {
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
      }))
    }
  } catch (error) {
    console.error('Error fetching community posts:', error)
  }
  
  return [...videos, ...communityPosts]
}

// Instagram scraping function
async function scrapeInstagramPosts(link: string, timeRange: string) {
  // Extract username from Instagram URL
  const usernameMatch = link.match(/instagram\.com\/([^\/\?]+)/)
  if (!usernameMatch) {
    throw new Error('Invalid Instagram URL. Please provide a valid Instagram profile URL.')
  }
  
  const username = usernameMatch[1]
  
  // For now, return a more realistic mock since Instagram scraping requires special handling
  // In production, you'd want to use a proper Instagram API or scraping service
  return [{
    platform: "Instagram",
    title: `Latest Instagram posts from @${username}`,
    text: `Recent Instagram content from @${username}. Check out the latest posts and stories for updates.`,
    url: link,
    date: new Date().toISOString().slice(0, 10),
    thumbnail: "https://placehold.co/120x120?text=IG",
    imageUrl: "https://placehold.co/120x120?text=IG"
  }]
}

// LinkedIn scraping function using RapidAPI
async function fetchLinkedInPosts(link: string, timeRange: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    throw new Error("Missing RapidAPI key. Please add RAPIDAPI_KEY to your environment variables.")
  }
  
  try {
    // First, get profile data
    const profileUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=${encodeURIComponent(link)}&include_skills=false&include_certifications=false&include_publications=false&include_honors=false&include_volunteers=false&include_projects=false&include_patents=false&include_courses=false&include_organizations=false&include_profile_status=false&include_company_public_url=false`
    
    const profileOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
      }
    }

    const profileResponse = await fetch(profileUrl, profileOptions)
    const profileResult = await profileResponse.json()
    
    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResult.message || 'Failed to fetch LinkedIn profile data'}`)
    }
    
    const posts: Post[] = []
    
    // Try to get recent posts
    const postsUrl = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=${encodeURIComponent(link)}&type=posts`
    
    const postsResponse = await fetch(postsUrl, profileOptions)
    const postsResult = await postsResponse.json()
    
    if (postsResponse.ok && postsResult.data && postsResult.data.length > 0) {
      // Use the latest post
      const latestPost = postsResult.data[0]
      
      posts.push({
        platform: "LinkedIn",
        title: latestPost.title || latestPost.text?.slice(0, 100) || "Latest LinkedIn Post",
        text: latestPost.text || latestPost.description || "Recent professional update",
        url: latestPost.url || link,
        date: latestPost.date || latestPost.created_at || new Date().toISOString().slice(0, 10),
        thumbnail: latestPost.image || latestPost.thumbnail || latestPost.media?.[0]?.url || "https://placehold.co/120x120?text=LI",
        imageUrl: latestPost.image || latestPost.thumbnail || latestPost.media?.[0]?.url || "https://placehold.co/120x120?text=LI"
      })
    } else {
      // Fallback to profile data if no posts available
      if (profileResult.data) {
        const profile = profileResult.data
        
        if (profile.headline) {
          posts.push({
            platform: "LinkedIn",
            title: profile.headline,
            text: profile.headline,
            url: link,
            date: new Date().toISOString().slice(0, 10),
            thumbnail: profile.profilePicture || "https://placehold.co/120x120?text=LI",
            imageUrl: profile.profilePicture || "https://placehold.co/120x120?text=LI"
          })
        }
        
        if (profile.summary) {
          posts.push({
            platform: "LinkedIn",
            title: "Professional Summary",
            text: profile.summary,
            url: link,
            date: new Date().toISOString().slice(0, 10),
            thumbnail: profile.profilePicture || "https://placehold.co/120x120?text=LI",
            imageUrl: profile.profilePicture || "https://placehold.co/120x120?text=LI"
          })
        }
      }
    }
    
    // If still no posts, create a default post
    if (posts.length === 0) {
      posts.push({
        platform: "LinkedIn",
        title: "LinkedIn Profile",
        text: "Professional profile information from LinkedIn",
        url: link,
        date: new Date().toISOString().slice(0, 10),
        thumbnail: "https://placehold.co/120x120?text=LI",
        imageUrl: "https://placehold.co/120x120?text=LI"
      })
    }
    
    return posts
    
  } catch (error) {
    console.error('LinkedIn RapidAPI error:', error)
    throw new Error(`LinkedIn API failed: ${error.message}`)
  }
}

// Twitter/X scraping function using RapidAPI
async function fetchTwitterPosts(username: string, timeRange: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
  if (!rapidApiKey) {
    throw new Error("Missing RapidAPI key. Please add RAPIDAPI_KEY to your environment variables.")
  }
  
  try {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, "")
    
    // First, get user info to get their user ID
    const userUrl = `https://twitter241.p.rapidapi.com/user?username=${cleanUsername}`
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    }

    const userResponse = await fetch(userUrl, options)
    const userResult = await userResponse.json()
    
    if (!userResponse.ok) {
      throw new Error(`Twitter API error: ${userResult.message || 'Failed to fetch Twitter user data'}`)
    }
    
    const posts: Post[] = []
    
    // Get user's latest tweets
    const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user_id=${userResult.data.id}&count=10`
    
    const tweetsResponse = await fetch(tweetsUrl, options)
    const tweetsResult = await tweetsResponse.json()
    
    if (!tweetsResponse.ok) {
      throw new Error(`Twitter API error: ${tweetsResult.message || 'Failed to fetch Twitter posts'}`)
    }
    
    // If we have recent tweets, use the latest one
    if (tweetsResult.data && tweetsResult.data.length > 0) {
      const latestTweet = tweetsResult.data[0] // Get the most recent tweet
      
      posts.push({
        platform: "Twitter",
        title: latestTweet.text?.slice(0, 100) || "Latest Twitter Post",
        text: latestTweet.text || "Recent Twitter update",
        url: `https://twitter.com/${cleanUsername}/status/${latestTweet.id}`,
        date: latestTweet.created_at || new Date().toISOString().slice(0, 10),
        thumbnail: latestTweet.media?.[0]?.url || latestTweet.media?.[0]?.preview_image_url || "https://placehold.co/120x120?text=TW",
        imageUrl: latestTweet.media?.[0]?.url || latestTweet.media?.[0]?.preview_image_url || "https://placehold.co/120x120?text=TW"
      })
    } else {
      // Fallback to user profile data if no tweets available
      if (userResult.data) {
        const user = userResult.data
        
        posts.push({
          platform: "Twitter",
          title: user.name || `@${cleanUsername}`,
          text: user.description || `Twitter profile of @${cleanUsername}`,
          url: `https://twitter.com/${cleanUsername}`,
          date: new Date().toISOString().slice(0, 10),
          thumbnail: user.profile_image_url || "https://placehold.co/120x120?text=TW",
          imageUrl: user.profile_image_url || "https://placehold.co/120x120?text=TW"
        })
      }
    }
    
    // If still no posts, create a default post
    if (posts.length === 0) {
      posts.push({
        platform: "Twitter",
        title: "Twitter Profile",
        text: "Twitter profile information",
        url: `https://twitter.com/${cleanUsername}`,
        date: new Date().toISOString().slice(0, 10),
        thumbnail: "https://placehold.co/120x120?text=TW",
        imageUrl: "https://placehold.co/120x120?text=TW"
      })
    }
    
    return posts
    
  } catch (error) {
    console.error('Twitter RapidAPI error:', error)
    throw new Error(`Twitter API failed: ${error.message}`)
  }
}

// OpenAI newsletter generation
async function generateNewsletterWithOpenAI(posts: Post[]) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiApiKey) throw new Error("Missing OpenAI API key")
  
  // Group posts by platform
  const postsByPlatform: { [key: string]: Post[] } = {}
  posts.forEach(post => {
    if (!postsByPlatform[post.platform]) {
      postsByPlatform[post.platform] = []
    }
    postsByPlatform[post.platform].push(post)
  })
  
  // Generate separate summaries for each platform
  const summaries: { [key: string]: string } = {}
  
  for (const [platform, platformPosts] of Object.entries(postsByPlatform)) {
    let prompt
    
    if (platform === "YouTube") {
      prompt = `Write a concise, first-person summary (under 100 words) of the following YouTube content as if you are the creator. Use "I" or "my" to describe what was shared. Focus on the video titles and descriptions to create an engaging, personal update. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform} - ${p.type || 'video'}] ${p.text || p.transcript || ""}\n`).join("\n")}`
    } else if (platform === "Instagram") {
      prompt = `Write a concise, first-person summary (under 100 words) of the following Instagram content as if you are the creator. Use "I" or "my" to describe what was shared. Focus on the post descriptions, engagement (likes/comments), and elaborate on what's happening in the posts. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}${p.likes ? ` (Likes: ${p.likes})` : ''}${p.comments ? ` (Comments: ${p.comments})` : ''}\n`).join("\n")}`
    } else if (platform === "LinkedIn") {
      prompt = `Write a concise, first-person summary (under 100 words) of the following LinkedIn content as if you are the professional. Use "I" or "my" to describe what was shared. Focus on the professional experience, achievements, and career highlights to create an engaging, personal update. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`
    } else if (platform === "Twitter") {
      prompt = `Write a concise, first-person summary (under 100 words) of the following Twitter content as if you are the creator. Use "I" or "my" to describe what was shared. Focus on the tweets, engagement, and key messages to create an engaging, personal update. Do not use sections, headers, or bullet points. Here is the content:\n\n${platformPosts.map((p, i) => `${i + 1}. [${p.platform}] ${p.text || p.transcript || ""}\n`).join("\n")}`
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates engaging, personal newsletter content from social media posts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })
      
      const data = await response.json()
      if (data.choices && data.choices[0]) {
        summaries[platform] = data.choices[0].message.content.trim()
      }
    } catch (error) {
      console.error(`Error generating summary for ${platform}:`, error)
      summaries[platform] = `Content from ${platform}`
    }
  }
  
  // Combine all summaries into a newsletter
  const newsletterParts = Object.values(summaries)
  return newsletterParts.join('\n\n')
} 