import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import AINewsletterRenderer from "@/components/AINewsletterRenderer";
import { logger } from "@/lib/logger";
import { validateSocialMediaUrl, validateRequired } from "@/lib/validation";
import { LoadingButton } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { configManager } from "@/lib/config";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username (public profile)", disabled: false },
  { key: "twitter", label: "X", placeholder: "@yourhandle or https://x.com/yourhandle", disabled: false },
  { key: "instagram", label: "Instagram", placeholder: "username or https://instagram.com/username", disabled: false },
  { key: "youtube", label: "YouTube", placeholder: "Channel ID (e.g., UCg6gPGh8HU2U01vaFCAsvmQ)", disabled: false },
];

// Custom Switch Component
const Switch = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onChange}
    className={`
      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
      ${checked 
        ? 'bg-primary hover:bg-primary/90' 
        : 'bg-muted hover:bg-muted/80'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform duration-300 ease-in-out
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

// Temporary data storage during newsletter generation
interface TempData {
  linkedin?: any[];
  twitter?: any[];
  instagram?: any[];
  youtube?: any[];
  allImages?: Array<{url: string, postText: string, postDate: string, platform: string}>;
  allText?: string;
  dataFile?: string; // Virtual file containing all formatted data
}

interface ValidationErrors {
  [key: string]: string;
}

// API keys are now managed through configManager for better security

// Helper functions for fetching data from different platforms
async function fetchLinkedInRaw(usernameOrUrl: string) {
  // Check if API key is available
  const rapidApiValidation = configManager.validateRapidAPIKey();
  if (!rapidApiValidation.isValid) {
    console.error('RapidAPI key not configured for LinkedIn');
    throw new Error(rapidApiValidation.error);
  }
  
  const RAPIDAPI_KEY = configManager.getRapidAPIKey();
  
  // Extract username if a URL is provided
  let username = usernameOrUrl;
  if (usernameOrUrl.includes('linkedin.com')) {
    const match = usernameOrUrl.match(/linkedin.com\/in\/([\w-]+)/);
    username = match ? match[1] : usernameOrUrl;
  }
  
  console.log('LinkedIn: Processing username:', username);
  
  try {
  // Use the exact same fetch snippet as DebugSocialAPIs
  const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=https%3A%2F%2Fwww.linkedin.com%2Fin%2F${encodeURIComponent(username)}%2F&type=posts`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
    }
  };
    
  const response = await fetch(url, options);
  const result = await response.text();
    console.log('LinkedIn API Response:', result);
    
  try {
    return JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse LinkedIn API response:', parseError);
      throw new Error('Failed to parse LinkedIn data');
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    throw new Error('Failed to fetch LinkedIn data');
  }
}

async function fetchXData(handleOrUrl: string) {
  // Check if API key is available
  const rapidApiValidation = configManager.validateRapidAPIKey();
  if (!rapidApiValidation.isValid) {
    console.error('RapidAPI key not configured');
    throw new Error(rapidApiValidation.error);
  }
  
  const RAPIDAPI_KEY = configManager.getRapidAPIKey();
  
  // Extract handle from URL or @handle format
  let handle = handleOrUrl;
  if (handleOrUrl.includes('twitter.com/') || handleOrUrl.includes('x.com/')) {
    const match = handleOrUrl.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
    handle = match ? match[1] : handleOrUrl;
  } else if (handleOrUrl.startsWith('@')) {
    handle = handleOrUrl.substring(1);
  }
  
  console.log('X: Processing handle:', handle);
  
  try {
    // Step 1: Get user ID by username
    const userUrl = `https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(handle)}`;
    const userOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    };
    
    const userResponse = await fetch(userUrl, userOptions);
    const userResult = await userResponse.text();
    console.log('X User API Response:', userResult);
    
    let userData;
    try {
      userData = JSON.parse(userResult);
      console.log('X userData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse X user API response:', parseError);
      throw new Error('Failed to get user data');
    }
    
    // Extract rest_id from user data - handle different response structures
    let restId = userData?.result?.data?.user?.result?.rest_id;
    console.log('X restId from path 1:', restId);
    
    // Try alternative paths if the first one doesn't work
    if (!restId) {
      restId = userData?.data?.user?.result?.rest_id;
      console.log('X restId from path 2:', restId);
    }
    if (!restId) {
      restId = userData?.data?.user?.rest_id;
      console.log('X restId from path 3:', restId);
    }
    if (!restId) {
      restId = userData?.user?.rest_id;
      console.log('X restId from path 4:', restId);
    }
    if (!restId) {
      restId = userData?.rest_id;
      console.log('X restId from path 5:', restId);
    }
    if (!restId) {
      restId = userData?.data?.rest_id;
      console.log('X restId from path 6:', restId);
    }
    if (!restId) {
      // Search through the entire response for rest_id
      const searchForRestId = (obj: any): string | null => {
        if (typeof obj !== 'object' || obj === null) return null;
        if (obj.rest_id) return obj.rest_id;
        for (const key in obj) {
          const result = searchForRestId(obj[key]);
          if (result) return result;
        }
        return null;
      };
      restId = searchForRestId(userData);
      console.log('X restId from search:', restId);
    }
    
    if (!restId) {
      console.error('No rest_id found in user data:', userData);
      console.log('Available keys in userData:', Object.keys(userData || {}));
      console.log('Available keys in userData.data:', Object.keys(userData?.data || {}));
      console.log('Full userData structure:', JSON.stringify(userData, null, 2));
      throw new Error('User not found or no rest_id available');
    }
    
    console.log('X User rest_id:', restId);
    
    // Step 2: Get tweets using rest_id
    const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user=${restId}&count=20`;
    const tweetsOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    };
    
    const tweetsResponse = await fetch(tweetsUrl, tweetsOptions);
    const tweetsResult = await tweetsResponse.text();
    console.log('X Tweets API Response:', tweetsResult);
    
    let tweetsData;
    try {
      tweetsData = JSON.parse(tweetsResult);
      console.log('X tweetsData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse X tweets API response:', parseError);
      throw new Error('Failed to get tweets data');
    }
    
    // Transform the response to match our expected format
    console.log('X tweets data structure:', tweetsData);
    console.log('X tweets data keys:', Object.keys(tweetsData || {}));
    
    let posts: any[] = [];
    
    // Handle the specific structure from the twitter241 API
    // The response structure is: result.timeline.instructions[].entry.content.itemContent.tweet_results.result
    if (tweetsData?.result?.timeline?.instructions && Array.isArray(tweetsData.result.timeline.instructions)) {
      console.log('X: Using twitter241 API timeline structure');
      
      // Extract tweets from timeline instructions
      const extractedTweets: any[] = [];
      
      for (const instruction of tweetsData.result.timeline.instructions) {
        if (instruction.type === 'TimelinePinEntry' && instruction.entry) {
          // Handle pinned tweets
          const tweetResult = instruction.entry.content?.itemContent?.tweet_results?.result;
          if (tweetResult && tweetResult.__typename === 'Tweet') {
            extractedTweets.push(tweetResult);
          }
        } else if (instruction.type === 'TimelineAddEntries' && instruction.entries && Array.isArray(instruction.entries)) {
          // Handle regular timeline entries
          for (const entry of instruction.entries) {
            if (entry.content?.entryType === 'TimelineTimelineItem' && entry.content.itemContent?.itemType === 'TimelineTweet') {
              const tweetResult = entry.content.itemContent.tweet_results?.result;
              if (tweetResult && tweetResult.__typename === 'Tweet') {
                extractedTweets.push(tweetResult);
              }
            }
          }
        }
      }
      
      posts = extractedTweets;
      console.log('X: Found', posts.length, 'posts in timeline structure');
      
      if (posts.length > 0) {
        console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
        console.log('X: Sample post core keys:', Object.keys(posts[0]?.core || {}));
        console.log('X: Sample post legacy keys:', Object.keys(posts[0]?.legacy || {}));
      }
    } 
    // Fallback to try multiple possible response structures
    else if (tweetsData?.data?.tweets && Array.isArray(tweetsData.data.tweets)) {
      console.log('X: Using main response structure');
      posts = tweetsData.data.tweets;
      console.log('X: Found', posts.length, 'posts in data.tweets');
      console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
    } else if (tweetsData?.data && Array.isArray(tweetsData.data)) {
      console.log('X: Using alternative response structure');
      posts = tweetsData.data;
      console.log('X: Found', posts.length, 'posts in data');
      console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
    } else if (tweetsData?.tweets && Array.isArray(tweetsData.tweets)) {
      console.log('X: Using tweets direct structure');
      posts = tweetsData.tweets;
      console.log('X: Found', posts.length, 'posts in tweets');
      console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
    } else if (Array.isArray(tweetsData)) {
      console.log('X: Using array structure');
      posts = tweetsData;
      console.log('X: Found', posts.length, 'posts in root array');
      console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
    } else {
      console.log('X: No recognizable structure found, trying to extract from any array');
      // Search for any array in the response that might contain tweets
      const findTweetArray = (obj: any): any[] | null => {
        if (Array.isArray(obj)) {
          // Check if this array contains objects that look like tweets
          if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
            const firstItem = obj[0];
            if (firstItem.text || firstItem.full_text || firstItem.tweet_text || firstItem.legacy?.full_text) {
              return obj;
            }
          }
        }
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            const result = findTweetArray(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };
      posts = findTweetArray(tweetsData) || [];
      console.log('X: Found', posts.length, 'posts via search');
      if (posts.length > 0) {
        console.log('X: Sample post keys:', Object.keys(posts[0] || {}));
      }
    }
    
    // Log the complete structure of the first tweet for debugging
    if (posts.length > 0) {
      console.log('X: Complete structure of first tweet:', JSON.stringify(posts[0], null, 2));
      console.log('X: First tweet keys:', Object.keys(posts[0]));
      if (posts[0].legacy) {
        console.log('X: First tweet legacy keys:', Object.keys(posts[0].legacy));
        console.log('X: First tweet legacy.full_text:', posts[0].legacy.full_text);
        console.log('X: First tweet legacy.created_at:', posts[0].legacy.created_at);
        console.log('X: First tweet legacy.favorite_count:', posts[0].legacy.favorite_count);
        console.log('X: First tweet legacy.reply_count:', posts[0].legacy.reply_count);
        console.log('X: First tweet legacy.retweet_count:', posts[0].legacy.retweet_count);
      }
      if (posts[0].core) {
        console.log('X: First tweet core keys:', Object.keys(posts[0].core));
      }
    }
    
    // Transform posts to our expected format
    const transformedPosts = posts.map((tweet: any) => {
      // For twitter241 API, the text is typically in legacy.full_text
      // Try multiple possible text fields in order of preference
      const possibleTextFields = [
        'legacy.full_text',    // Twitter241 API primary text location
        'full_text',           // Twitter API v1.1 full text
        'text',                // Basic text field
        'legacy.text',         // Legacy text field
        'tweet_text',          // Alternative text field
        'content',             // Generic content field
        'note_tweet.text',     // Note tweet text for long tweets
        'note_tweet_text',     // Note tweet text for long tweets
        'extended_tweet_text', // Extended tweet text
        'retweeted_status_text', // Retweeted status text
        'quoted_status_text',  // Quoted status text
        'display_text_range',  // Display text range
        'tweet_content',       // Tweet content
        'body',                // Body field
        'message'              // Message field
      ];
      
      let text = '';
      for (const field of possibleTextFields) {
        let fieldValue;
        
        // Handle nested field paths like 'legacy.full_text'
        if (field.includes('.')) {
          const parts = field.split('.');
          fieldValue = tweet;
          for (const part of parts) {
            fieldValue = fieldValue?.[part];
            if (!fieldValue) break;
          }
        } else {
          fieldValue = tweet[field] || tweet.legacy?.[field] || tweet.note_tweet?.[field];
        }
        
        if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
          text = fieldValue;
          console.log(`X: Found text in field "${field}":`, text.substring(0, 100) + '...');
          break;
        }
      }
      
      // If still no text found, try to extract from nested objects
      if (!text) {
        const searchForText = (obj: any, path: string = ''): string => {
          if (typeof obj === 'string' && obj.trim().length > 10) {
            console.log(`X: Found text in nested path "${path}":`, obj.substring(0, 100) + '...');
            return obj;
          }
          if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
              if (key.toLowerCase().includes('text') || key.toLowerCase().includes('content')) {
                const result = searchForText(obj[key], `${path}.${key}`);
                if (result) return result;
              }
            }
          }
          return '';
        };
        text = searchForText(tweet);
      }
      
      // Try multiple possible date fields
      const possibleDateFields = [
        'legacy.created_at',   // Twitter241 API primary date location
        'created_at',
        'date',
        'posted_at',
        'timestamp',
        'created_time',
        'publish_time',
        'post_date'
      ];
      
      let posted = '';
      for (const field of possibleDateFields) {
        let fieldValue;
        
        // Handle nested field paths like 'legacy.created_at'
        if (field.includes('.')) {
          const parts = field.split('.');
          fieldValue = tweet;
          for (const part of parts) {
            fieldValue = fieldValue?.[part];
            if (!fieldValue) break;
          }
        } else {
          fieldValue = tweet[field] || tweet.legacy?.[field];
        }
        
        if (fieldValue) {
          posted = fieldValue;
          break;
        }
      }
      
      if (!posted) {
        posted = new Date().toISOString();
      }
      
      // Try multiple possible image fields
      const images = [];
      
      // Check legacy.extended_entities.media first (twitter241 API)
      if (tweet.legacy?.extended_entities?.media) {
        const media = tweet.legacy.extended_entities.media.filter((m: any) => m.type === 'photo');
        images.push(...media.map((m: any) => ({ url: m.media_url_https || m.url })));
      }
      
      // Check extended_entities.media
      if (tweet.extended_entities?.media) {
        const media = tweet.extended_entities.media.filter((m: any) => m.type === 'photo');
        images.push(...media.map((m: any) => ({ url: m.media_url_https || m.url })));
      }
      
      // Check media array
      if (tweet.media && Array.isArray(tweet.media)) {
        const media = tweet.media.filter((m: any) => m.type === 'photo');
        images.push(...media.map((m: any) => ({ url: m.media_url_https || m.url })));
      }
      
      // Check attachments
      if (tweet.attachments?.media) {
        const media = tweet.attachments.media.filter((m: any) => m.type === 'photo');
        images.push(...media.map((m: any) => ({ url: m.media_url_https || m.url })));
      }
      
      const transformedPost = {
        text: text,
        posted: posted,
        images: images,
        likes: tweet.legacy?.favorite_count || tweet.favorite_count || tweet.likes || 0,
        comments: tweet.legacy?.reply_count || tweet.reply_count || tweet.comments || 0,
        retweets: tweet.legacy?.retweet_count || tweet.retweet_count || tweet.retweets || 0,
        url: tweet.url || `https://x.com/${handle}/status/${tweet.rest_id || tweet.id_str || tweet.id || tweet.legacy?.id_str}`,
        is_video: tweet.legacy?.extended_entities?.media?.some((m: any) => m.type === 'video') || 
                  tweet.extended_entities?.media?.some((m: any) => m.type === 'video') || 
                  tweet.media?.some((m: any) => m.type === 'video') || false
      };
      
      console.log('X post transformation detailed:', {
        originalTweetKeys: Object.keys(tweet),
        legacyKeys: Object.keys(tweet.legacy || {}),
        coreKeys: Object.keys(tweet.core || {}),
        restId: tweet.rest_id,
        extractedText: text?.substring(0, 100) + '...',
        textLength: text?.length || 0,
        extractedDate: posted,
        hasValidText: text && text.trim().length > 0,
        hasValidDate: posted && posted !== 'Invalid Date',
        imagesCount: images.length,
        rawLegacyData: {
          full_text: tweet.legacy?.full_text?.substring(0, 50) + '...',
          created_at: tweet.legacy?.created_at,
          favorite_count: tweet.legacy?.favorite_count,
          reply_count: tweet.legacy?.reply_count,
          retweet_count: tweet.legacy?.retweet_count
        },
        transformedPost: {
          text: transformedPost.text?.substring(0, 50) + '...',
          posted: transformedPost.posted,
          images: transformedPost.images.length,
          likes: transformedPost.likes,
          comments: transformedPost.comments,
          retweets: transformedPost.retweets
        }
      });
      
      return transformedPost;
    });
    
    console.log('X posts transformed:', transformedPosts.length);
    console.log('X sample transformed post:', transformedPosts[0]);
    
    return { data: transformedPosts };
    
  } catch (error) {
    console.error('X API error:', error);
    console.log('X API error details:', {
      message: error.message,
      stack: error.stack,
      userInput: handleOrUrl
    });
    
    // Fallback to mock data if API fails
    return {
      data: [
        {
          text: "Just launched a new feature! 🚀 Excited to see how it performs.",
          posted: new Date().toISOString(),
          images: [{ url: "https://placehold.co/400x300?text=X+Post" }],
          likes: 42,
          comments: 5,
          retweets: 8,
          url: `https://x.com/${handleOrUrl.replace('@', '')}/status/123456789`,
          is_video: false
        }
      ]
    };
  }
}

async function fetchInstagramData(profileOrUrl: string) {
  // Check if API key is available
  const rapidApiValidation = configManager.validateRapidAPIKey();
  if (!rapidApiValidation.isValid) {
    console.error('RapidAPI key not configured for Instagram');
    throw new Error(rapidApiValidation.error);
  }
  
  const RAPIDAPI_KEY = configManager.getRapidAPIKey();
  
  // Extract username from URL or use as-is
  let username = profileOrUrl;
  if (profileOrUrl.includes('instagram.com')) {
    const match = profileOrUrl.match(/instagram\.com\/([^\/\?]+)/);
    username = match ? match[1] : profileOrUrl;
  }
  
  console.log('Instagram: Processing username:', username);
  
  try {
    // Step 1: Get user ID by username
    const userUrl = `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/user_id_by_username?username=${encodeURIComponent(username)}`;
    const userOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com'
      }
    };
    
    const userResponse = await fetch(userUrl, userOptions);
    const userResult = await userResponse.text();
    console.log('Instagram User API Response:', userResult);
    
    let userData;
    try {
      userData = JSON.parse(userResult);
      console.log('Instagram userData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse Instagram user API response:', parseError);
      throw new Error('Failed to get user data');
    }
    
    // Extract user ID
    const userId = userData?.UserID;
    if (!userId) {
      console.error('No UserID found in user data:', userData);
      throw new Error('User not found or no UserID available');
    }
    
    console.log('Instagram User ID:', userId);
    
    // Step 2: Get posts using user ID
    const postsUrl = `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/posts_by_user_id?user_id=${userId}`;
    const postsOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com'
      }
    };
    
    const postsResponse = await fetch(postsUrl, postsOptions);
    const postsResult = await postsResponse.text();
    console.log('Instagram Posts API Response:', postsResult);
    
    let postsData;
    try {
      postsData = JSON.parse(postsResult);
      console.log('Instagram postsData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse Instagram posts API response:', parseError);
      throw new Error('Failed to get posts data');
    }
    
    console.log('Instagram posts data structure:', postsData);
    console.log('Instagram posts data keys:', Object.keys(postsData || {}));
    
    // Extract posts from the response
    let posts: any[] = [];
    
    if (postsData?.items && Array.isArray(postsData.items)) {
      console.log('Instagram: Found', postsData.items.length, 'posts');
      posts = postsData.items.slice(0, 3); // Get top 3 posts
      console.log('Instagram: Using top 3 posts');
    } else if (postsData?.data && Array.isArray(postsData.data)) {
      console.log('Instagram: Found', postsData.data.length, 'posts in data array');
      posts = postsData.data.slice(0, 3);
    } else if (Array.isArray(postsData)) {
      console.log('Instagram: Found', postsData.length, 'posts in root array');
      posts = postsData.slice(0, 3);
    } else {
      console.log('Instagram: No recognizable structure found');
      posts = [];
    }
    
    // Log the complete structure of the first post for debugging
    if (posts.length > 0) {
      console.log('Instagram: Complete structure of first post:', JSON.stringify(posts[0], null, 2));
      console.log('Instagram: First post keys:', Object.keys(posts[0]));
    }
    
    // Transform posts to our expected format
    const transformedPosts = posts.map((post: any) => {
      // Extract text/caption from the post
      let text = '';
      if (post.caption?.text) {
        text = post.caption.text;
      } else if (post.caption) {
        text = typeof post.caption === 'string' ? post.caption : '';
      } else if (post.text) {
        text = post.text;
      } else if (post.description) {
        text = post.description;
      }
      
      // Clean up the text
      if (text) {
        text = text.replace(/&#39;/g, "'")
                   .replace(/&quot;/g, '"')
                   .replace(/&amp;/g, '&')
                   .trim();
      }
      
      // If no text, create a default description
      if (!text) {
        text = `New post from ${username} 📸`;
      }
      
      // Extract date
      let posted = '';
      if (post.taken_at) {
        // Instagram uses Unix timestamp
        posted = new Date(post.taken_at * 1000).toISOString();
      } else if (post.created_at) {
        posted = new Date(post.created_at).toISOString();
      } else if (post.timestamp) {
        posted = new Date(post.timestamp).toISOString();
      } else {
        posted = new Date().toISOString();
      }
      
      // Extract images
      const images = [];
      
      // Check for image_versions2.candidates (Instagram's image structure)
      if (post.image_versions2?.candidates && Array.isArray(post.image_versions2.candidates)) {
        // Get the highest quality image (usually the first one)
        const bestImage = post.image_versions2.candidates[0];
        if (bestImage?.url) {
          images.push({ url: bestImage.url });
        }
      }
      
      // Check for carousel_media (multiple images)
      if (post.carousel_media && Array.isArray(post.carousel_media)) {
        post.carousel_media.forEach((media: any) => {
          if (media.image_versions2?.candidates && media.image_versions2.candidates.length > 0) {
            const bestImage = media.image_versions2.candidates[0];
            if (bestImage?.url) {
              images.push({ url: bestImage.url });
            }
          }
        });
      }
      
      // Check for direct image fields
      if (post.images && Array.isArray(post.images)) {
        post.images.forEach((img: any) => {
          if (img.url) {
            images.push({ url: img.url });
          }
        });
      }
      
      // If no images found, use a placeholder
      if (images.length === 0) {
        images.push({ url: "https://placehold.co/400x300?text=Instagram+Post" });
      }
      
      // Extract engagement metrics
      const likes = post.like_count || post.likes || post.like_count || 0;
      const comments = post.comment_count || post.comments || post.comment_count || 0;
      
      // Determine if it's a video
      const isVideo = post.media_type === 2 || post.media_type === 8 || post.is_video || false;
      
      const transformedPost = {
        text: text,
        posted: posted,
        images: images,
        likes: likes,
        comments: comments,
        url: `https://instagram.com/p/${post.code || post.shortcode || post.id}`,
        is_video: isVideo,
        platform: 'instagram'
      };
      
      console.log('Instagram post transformation:', {
        originalPostKeys: Object.keys(post),
        code: post.code,
        shortcode: post.shortcode,
        mediaType: post.media_type,
        extractedText: text?.substring(0, 100) + '...',
        textLength: text?.length || 0,
        extractedDate: posted,
        hasValidText: text && text.trim().length > 0,
        hasValidDate: posted && posted !== 'Invalid Date',
        imagesCount: images.length,
        likes: likes,
        comments: comments,
        isVideo: isVideo,
        transformedPost: {
          text: transformedPost.text?.substring(0, 50) + '...',
          posted: transformedPost.posted,
          images: transformedPost.images.length,
          likes: transformedPost.likes,
          comments: transformedPost.comments,
          url: transformedPost.url
        }
      });
      
      return transformedPost;
    });
    
    console.log('Instagram posts transformed:', transformedPosts.length);
    console.log('Instagram sample transformed post:', transformedPosts[0]);
    
    return { data: transformedPosts };
    
  } catch (error) {
    console.error('Instagram API error:', error);
    console.log('Instagram API error details:', {
      message: error.message,
      stack: error.stack,
      userInput: profileOrUrl
    });
    
    // Fallback to mock data if API fails
  return {
    data: [
      {
        text: "Behind the scenes of our latest project 📸",
        posted: new Date().toISOString(),
        images: [{ url: "https://placehold.co/400x300?text=Instagram+Post" }],
        likes: 89,
          comments: 12,
          url: `https://instagram.com/p/sample_post_id`,
          is_video: false,
          platform: 'instagram'
        }
      ]
    };
  }
}

async function fetchYouTubeData(channelId: string) {
  // Check if API key is available
  const rapidApiValidation = configManager.validateRapidAPIKey();
  if (!rapidApiValidation.isValid) {
    console.error('RapidAPI key not configured');
    throw new Error(rapidApiValidation.error);
  }
  
  const RAPIDAPI_KEY = configManager.getRapidAPIKey();
  
  console.log('YouTube: Processing channel ID:', channelId);
  
  try {
    // Step 1: Get videos from channel (we'll take the first video at index 0)
    const url = `https://youtube-v2.p.rapidapi.com/channel/videos?channel_id=${encodeURIComponent(channelId)}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
      }
    };
    
    const response = await fetch(url, options);
    const result = await response.text();
    console.log('YouTube Channel Videos API Response:', result);
    
    let videosData;
    try {
      videosData = JSON.parse(result);
      console.log('YouTube videosData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse YouTube videos API response:', parseError);
      throw new Error('Failed to get videos data');
    }
    
    console.log('YouTube videos data structure:', videosData);
    console.log('YouTube videos data keys:', Object.keys(videosData || {}));
    
    // Extract the first video (index 0)
    if (!videosData.videos || !Array.isArray(videosData.videos) || videosData.videos.length === 0) {
      console.error('No videos found in channel response:', videosData);
      throw new Error('No videos found in channel');
    }
    
    const firstVideo = videosData.videos[0];
    console.log('YouTube first video:', firstVideo);
    console.log('YouTube first video keys:', Object.keys(firstVideo));
    
    // Extract video_id from the first video
    const videoId = firstVideo.video_id;
    if (!videoId) {
      console.error('No video_id found in first video:', firstVideo);
      throw new Error('No video_id found in first video');
    }
    
    console.log('YouTube extracted video_id:', videoId);
    
    // Step 2: Get subtitles using the video_id
    const subtitlesUrl = `https://youtube-v2.p.rapidapi.com/video/subtitles?video_id=${videoId}`;
    const subtitlesOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
      }
    };
    
    let subtitlesText = '';
    let videoSummary = '';
    
    try {
      const subtitlesResponse = await fetch(subtitlesUrl, subtitlesOptions);
      const subtitlesResult = await subtitlesResponse.text();
      console.log('YouTube Subtitles API Response:', subtitlesResult);
      
      let subtitlesData;
      try {
        subtitlesData = JSON.parse(subtitlesResult);
        console.log('YouTube subtitlesData parsed successfully');
      } catch (parseError) {
        console.error('Failed to parse YouTube subtitles API response:', parseError);
        console.log('Using video title as fallback content');
        subtitlesText = `Video: ${firstVideo.title}`;
      }
      
      console.log('YouTube subtitles data structure:', subtitlesData);
      console.log('YouTube subtitles data keys:', Object.keys(subtitlesData || {}));
      
      // Extract subtitles text
      if (subtitlesData && subtitlesData.is_available && subtitlesData.subtitles && Array.isArray(subtitlesData.subtitles)) {
        console.log('YouTube: Found', subtitlesData.subtitles.length, 'subtitle segments');
        
        // Combine all subtitle text
        subtitlesText = subtitlesData.subtitles
          .map((subtitle: any) => subtitle.text)
          .filter((text: string) => text && text.trim() !== '[Music]' && text.trim() !== 'Oh' && text.trim().length > 1)
          .join(' ')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&');
        
        console.log('YouTube extracted subtitles length:', subtitlesText.length);
        console.log('YouTube subtitles preview:', subtitlesText.substring(0, 200) + '...');
        
        // Use ChatGPT to summarize the video content
        const openaiValidation = configManager.validateOpenAIKey();
        if (subtitlesText.length > 50 && openaiValidation.isValid) {
          const OPENAI_API_KEY = configManager.getOpenAIKey();
          try {
            const summaryPrompt = `Summarize this YouTube video transcript in 2-3 sentences, written in first person as if the video creator is describing their video for a newsletter. Keep it engaging and highlight the main points or value provided:\n\n${subtitlesText}`;
            
            const summaryBody = {
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a professional newsletter writer helping to summarize video content." },
                { role: "user", content: summaryPrompt }
              ],
              max_tokens: 150,
              temperature: 0.7
            };
            
            const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
              },
              body: JSON.stringify(summaryBody)
            });
            
            const summaryData = await summaryResponse.json();
            videoSummary = summaryData.choices?.[0]?.message?.content?.trim() || '';
            console.log('YouTube video summary generated:', videoSummary);
            
          } catch (summaryError) {
            console.error('Failed to generate video summary:', summaryError);
            videoSummary = `I shared a new video titled "${firstVideo.title}" covering important topics and insights.`;
          }
        } else {
          videoSummary = `I shared a new video titled "${firstVideo.title}" - check it out for valuable insights!`;
        }
      } else {
        console.log('YouTube: No subtitles available or invalid response structure');
        subtitlesText = `Video: ${firstVideo.title}`;
        videoSummary = `I published a new video: "${firstVideo.title}". While subtitles aren't available, this video covers valuable content worth checking out!`;
      }
      
    } catch (subtitlesError) {
      console.error('YouTube subtitles API error:', subtitlesError);
      subtitlesText = `Video: ${firstVideo.title}`;
      videoSummary = `I shared a new video titled "${firstVideo.title}" - check it out for valuable insights!`;
    }
    
    // Transform the video data to match our expected format
    const transformedPost = {
      text: videoSummary || `New video: "${firstVideo.title}" - ${firstVideo.description || 'Check out my latest video!'}`,
      posted: firstVideo.published_time || new Date().toISOString(),
      images: firstVideo.thumbnails && firstVideo.thumbnails.length > 0 
        ? [{ url: firstVideo.thumbnails[firstVideo.thumbnails.length - 1].url }] // Use the largest thumbnail
        : [{ url: "https://placehold.co/400x300?text=YouTube+Video" }],
      likes: 0, // YouTube API doesn't provide likes in this response
      comments: 0, // YouTube API doesn't provide comments in this response
      views: firstVideo.number_of_views || 0,
      video_length: firstVideo.video_length || '',
      video_id: videoId,
      url: `https://youtube.com/watch?v=${videoId}`,
      is_video: true,
      subtitles: subtitlesText, // Store original subtitles for reference
      video_summary: videoSummary // Store the AI-generated summary
    };
    
    console.log('YouTube post transformation:', {
      originalVideoKeys: Object.keys(firstVideo),
      videoId: videoId,
      title: firstVideo.title,
      views: firstVideo.number_of_views,
      publishedTime: firstVideo.published_time,
      thumbnailsCount: firstVideo.thumbnails?.length || 0,
      subtitlesLength: subtitlesText.length,
      hasSummary: !!videoSummary,
      transformedPost: {
        text: transformedPost.text.substring(0, 100) + '...',
        posted: transformedPost.posted,
        images: transformedPost.images.length,
        views: transformedPost.views,
        video_length: transformedPost.video_length,
        subtitles_preview: subtitlesText.substring(0, 100) + '...',
        summary_preview: videoSummary.substring(0, 100) + '...'
      }
    });
    
    return { data: [transformedPost] };
    
  } catch (error) {
    console.error('YouTube API error:', error);
    console.log('YouTube API error details:', {
      message: error.message,
      stack: error.stack,
      channelId: channelId
    });
    
    // Fallback to mock data if API fails
  return {
    data: [
      {
        text: "New tutorial video is live! Check out how to build this feature step by step.",
        posted: new Date().toISOString(),
        images: [{ url: "https://placehold.co/400x300?text=YouTube+Video" }],
        likes: 156,
          comments: 23,
          views: 1000,
          video_length: "10:30",
          video_id: "sample_video_id",
          url: `https://youtube.com/watch?v=sample_video_id`,
          is_video: true,
          subtitles: "This is a sample video about building features step by step.",
          video_summary: "I created a comprehensive tutorial showing how to build this feature from scratch, covering all the essential steps and best practices."
        }
      ]
    };
  }
}

async function summarizeText(text: string): Promise<string> {
  const openaiValidation = configManager.validateOpenAIKey();
  if (!openaiValidation.isValid) return text;
  
  const OPENAI_API_KEY = configManager.getOpenAIKey();
  const prompt = `Summarize the following LinkedIn post in 1-2 sentences, first-person, professional, and engaging.\n\nPost: ${text}`;
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional newsletter writer." },
      { role: "user", content: prompt }
    ],
    max_tokens: 120,
    temperature: 0.7
  };
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || text;
}

const validateLinkedInInput = (input: string): boolean => {
  // Accepts either a LinkedIn profile URL or a username (alphanumeric, dashes, underscores)
  if (!input) return false;
  const urlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/i;
  const usernamePattern = /^[\w-]+$/;
  return urlPattern.test(input) || usernamePattern.test(input.trim());
};

const validateXInput = (input: string): boolean => {
  // Accepts X URLs, @handles, or just handles
  if (!input) return false;
  
  // Remove any leading/trailing whitespace
  const trimmedInput = input.trim();
  
  // URL patterns for X
  const urlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w-]+/i;
  
  // Handle patterns (with or without @)
  const handlePattern = /^@?[\w-]+$/;
  
  // Check if it's a valid URL or handle
  const isValidUrl = urlPattern.test(trimmedInput);
  const isValidHandle = handlePattern.test(trimmedInput);
  
  console.log('X validation:', {
    input: trimmedInput,
    isValidUrl,
    isValidHandle,
    isValid: isValidUrl || isValidHandle
  });
  
  return isValidUrl || isValidHandle;
};

function extractLinkedInUsername(link: string): string | null {
  // Accepts either a LinkedIn profile URL or a username
  if (link.includes('linkedin.com')) {
    const match = link.match(/linkedin.com\/in\/([\w-]+)/);
    return match ? match[1] : null;
  }
  // If it's just a username
  if (/^[\w-]+$/.test(link.trim())) {
    return link.trim();
  }
  return null;
}

async function summarizePostsWithHeadings(posts: any[]): Promise<string> {
  const openaiValidation = configManager.validateOpenAIKey();
  if (!openaiValidation.isValid) return posts.map(p => p.text).join('\n\n');
  
  const OPENAI_API_KEY = configManager.getOpenAIKey();
  const allText = posts.map((p) => p.text).join('\n');
  const prompt = `just reply with what is asked, nothing else. use all the text to make a newsletter about the updates, post, etc. that are present about the person. write in a first person perspective. write very short paragraphs for quick updates and keep things clean. use headings to divide everything in neat areas and return everything in html code as it needs to be embedded in mails later on. make sure the response is in plain text but html code. make dark themed with #101118 as the background color. use an appropriate color palette. add emojis to make it a lot more engaging. shorten the length of all paragraphs.\n\n${allText}`;
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional newsletter writer." },
      { role: "user", content: prompt }
    ],
    max_tokens: 1200,
    temperature: 0.7
  };
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Function to process all platforms and collect data
async function processAllPlatforms(selected: any, inputs: any): Promise<TempData> {
  const tempData: TempData = {
    allImages: [],
    allText: ''
  };
  
  const platformProcessors = {
    linkedin: async (input: string) => {
      try {
      const usernameOrUrl = extractLinkedInUsername(input) || input;
      const raw = await fetchLinkedInRaw(usernameOrUrl);
      if (raw && Array.isArray(raw.data)) {
        const posts = raw.data.filter(post => !post.is_video && post.text && post.posted);
        const sortedPosts = posts.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()).slice(0, 3);
        tempData.linkedin = sortedPosts;
        
        // Collect images and text
        const images = sortedPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'linkedin'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += sortedPosts.map(p => `[LinkedIn] ${p.text}`).join('\n\n');
        
        // Add detailed logging for LinkedIn data
        console.log('LinkedIn data processed:', {
          postsCount: sortedPosts.length,
          imagesCount: images.length,
          textLength: sortedPosts.map(p => p.text).join('\n\n').length
          });
        } else {
          console.log('LinkedIn: No valid data returned from API, using fallback');
          // Create fallback content to ensure we have something
          const fallbackPosts = [
            {
              text: "Just shared insights about building scalable systems and team collaboration. Check out my latest thoughts on professional growth!",
              posted: new Date().toISOString(),
              images: [{ url: "https://placehold.co/400x300?text=LinkedIn+Post" }],
              likes: 25,
              comments: 8,
              url: `https://linkedin.com/in/${input}/recent-activity`,
              is_video: false
            }
          ];
          tempData.linkedin = fallbackPosts;
          
          const images = fallbackPosts.flatMap(post => {
            const postImages = post.images || [];
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'linkedin'
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += fallbackPosts.map(p => `[LinkedIn] ${p.text}`).join('\n\n');
          
          console.log('LinkedIn fallback data processed:', {
            postsCount: fallbackPosts.length,
            imagesCount: images.length,
            textLength: fallbackPosts.map(p => p.text).join('\n\n').length
          });
        }
      } catch (error) {
        console.error('LinkedIn processing error:', error);
        // Create fallback content even on error
        const fallbackPosts = [
          {
            text: "Just shared insights about building scalable systems and team collaboration. Check out my latest thoughts on professional growth!",
            posted: new Date().toISOString(),
            images: [{ url: "https://placehold.co/400x300?text=LinkedIn+Post" }],
            likes: 25,
            comments: 8,
            url: `https://linkedin.com/in/${input}/recent-activity`,
            is_video: false
          }
        ];
        tempData.linkedin = fallbackPosts;
        
        const images = fallbackPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'linkedin'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += fallbackPosts.map(p => `[LinkedIn] ${p.text}`).join('\n\n');
        
        console.log('LinkedIn error fallback data processed:', {
          postsCount: fallbackPosts.length,
          imagesCount: images.length,
          textLength: fallbackPosts.map(p => p.text).join('\n\n').length
        });
      }
    },
    twitter: async (input: string) => {
      try {
        console.log('Processing X input:', input);
        const raw = await fetchXData(input);
        console.log('X raw response:', raw);
        console.log('X raw response type:', typeof raw);
        console.log('X raw response keys:', Object.keys(raw || {}));
        console.log('X raw response data type:', typeof raw?.data);
        console.log('X raw response data is array:', Array.isArray(raw?.data));
        
        if (raw && Array.isArray(raw.data)) {
          // Filter posts more carefully - check for non-empty text and valid dates
          const posts = raw.data.filter(post => {
            const hasText = post.text && post.text.trim().length > 0;
            const hasDate = post.posted && post.posted !== 'Invalid Date';
            console.log('X post filter check:', {
              text: post.text?.substring(0, 50) + '...',
              hasText,
              posted: post.posted,
              hasDate,
              passed: hasText && hasDate
            });
            return hasText && hasDate;
          });
          console.log('X filtered posts:', posts.length);
          console.log('X sample filtered post:', posts[0]);
          
          const sortedPosts = posts.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()).slice(0, 3);
          tempData.twitter = sortedPosts;
          
          const images = sortedPosts.flatMap(post => {
            const postImages = post.images || [];
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'x'
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += sortedPosts.map(p => `[X] ${p.text}`).join('\n\n');
          
          // Add detailed logging for X data
          console.log('X data processed:', {
            postsCount: sortedPosts.length,
            imagesCount: images.length,
            textLength: sortedPosts.map(p => p.text).join('\n\n').length,
            posts: sortedPosts.map(p => ({ text: p.text.substring(0, 100) + '...', date: p.posted })),
            allTextLength: tempData.allText?.length
          });
        } else {
          console.log('X: No valid data returned from API, using fallback');
          // Create fallback content to ensure we have something
          const fallbackPosts = [
            {
              text: "Just launched a new feature! 🚀 Excited to see how it performs.",
              posted: new Date().toISOString(),
              images: [{ url: "https://placehold.co/400x300?text=X+Post" }],
              likes: 42,
              comments: 5,
              retweets: 8,
              url: `https://x.com/${input.replace('@', '')}/status/123456789`,
              is_video: false
            }
          ];
          tempData.twitter = fallbackPosts;
          
          const images = fallbackPosts.flatMap(post => {
            const postImages = post.images || [];
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'x'
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += fallbackPosts.map(p => `[X] ${p.text}`).join('\n\n');
          
          console.log('X fallback data processed:', {
            postsCount: fallbackPosts.length,
            imagesCount: images.length,
            textLength: fallbackPosts.map(p => p.text).join('\n\n').length
          });
        }
      } catch (error) {
        console.error('X processing error:', error);
        // Create fallback content even on error
        const fallbackPosts = [
          {
            text: "Just launched a new feature! 🚀 Excited to see how it performs.",
            posted: new Date().toISOString(),
            images: [{ url: "https://placehold.co/400x300?text=X+Post" }],
            likes: 42,
            comments: 5,
            retweets: 8,
            url: `https://x.com/${input.replace('@', '')}/status/123456789`,
            is_video: false
          }
        ];
        tempData.twitter = fallbackPosts;
        
        const images = fallbackPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'x'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += fallbackPosts.map(p => `[X] ${p.text}`).join('\n\n');
        
        console.log('X error fallback data processed:', {
          postsCount: fallbackPosts.length,
          imagesCount: images.length,
          textLength: fallbackPosts.map(p => p.text).join('\n\n').length
        });
      }
    },
    instagram: async (input: string) => {
      try {
      const raw = await fetchInstagramData(input);
      if (raw && Array.isArray(raw.data)) {
        const posts = raw.data.filter(post => post.text && post.posted);
        const sortedPosts = posts.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()).slice(0, 3);
        tempData.instagram = sortedPosts;
        
        const images = sortedPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'instagram'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += sortedPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
          
          console.log('Instagram data processed:', {
            postsCount: sortedPosts.length,
            imagesCount: images.length,
            textLength: sortedPosts.map(p => p.text).join('\n\n').length
          });
        }
      } catch (error) {
        console.error('Instagram processing error:', error);
        // Instagram already returns mock data, so this is unlikely to error
        // But we'll handle it just in case
        const fallbackPosts = [
          {
            text: "Behind the scenes of our latest project 📸",
            posted: new Date().toISOString(),
            images: [{ url: "https://placehold.co/400x300?text=Instagram+Post" }],
            likes: 89,
            comments: 12,
            url: `https://instagram.com/p/sample_post_id`,
            is_video: false
          }
        ];
        tempData.instagram = fallbackPosts;
        
        const images = fallbackPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'instagram'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += fallbackPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
        
        console.log('Instagram error fallback data processed:', {
          postsCount: fallbackPosts.length,
          imagesCount: images.length,
          textLength: fallbackPosts.map(p => p.text).join('\n\n').length
        });
      }
    },
    youtube: async (input: string) => {
      try {
      const raw = await fetchYouTubeData(input);
      if (raw && Array.isArray(raw.data)) {
        const posts = raw.data.filter(post => post.text && post.posted);
        const sortedPosts = posts.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime()).slice(0, 3);
        tempData.youtube = sortedPosts;
        
        const images = sortedPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'youtube'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += sortedPosts.map(p => `[YouTube] ${p.text}`).join('\n\n');
          
          console.log('YouTube data processed:', {
            postsCount: sortedPosts.length,
            imagesCount: images.length,
            textLength: sortedPosts.map(p => p.text).join('\n\n').length
          });
        }
      } catch (error) {
        console.error('YouTube processing error:', error);
        // Create fallback content even on error
        const fallbackPosts = [
          {
            text: "I created a comprehensive tutorial showing how to build this feature from scratch, covering all the essential steps and best practices.",
            posted: new Date().toISOString(),
            images: [{ url: "https://placehold.co/400x300?text=YouTube+Video" }],
            likes: 156,
            comments: 23,
            views: 1000,
            video_length: "10:30",
            video_id: "sample_video_id",
            url: `https://youtube.com/watch?v=sample_video_id`,
            is_video: true,
            subtitles: "This is a sample video about building features step by step.",
            video_summary: "I created a comprehensive tutorial showing how to build this feature from scratch, covering all the essential steps and best practices."
          }
        ];
        tempData.youtube = fallbackPosts;
        
        const images = fallbackPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'youtube'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += fallbackPosts.map(p => `[YouTube] ${p.text}`).join('\n\n');
        
        console.log('YouTube error fallback data processed:', {
          postsCount: fallbackPosts.length,
          imagesCount: images.length,
          textLength: fallbackPosts.map(p => p.text).join('\n\n').length
        });
      }
    }
  };

  // Process all selected platforms
  const promises = Object.keys(selected)
    .filter(key => selected[key])
    .map(key => platformProcessors[key as keyof typeof platformProcessors](inputs[key]));

  await Promise.all(promises);
  
  // Create a well-formatted data file for ChatGPT
  const createDataFile = (data: TempData) => {
    const timestamp = new Date().toISOString();
    const platforms = Object.keys(data).filter(key => data[key] && Array.isArray(data[key]) && data[key].length > 0);
    
    let fileContent = `# Social Media Newsletter Data
Generated: ${timestamp}
Platforms: ${platforms.join(', ')}
Total Posts: ${Object.values(data).filter(Array.isArray).flat().length}
Total Images: ${data.allImages?.length || 0}

## Posts by Platform
`;

    platforms.forEach(platform => {
      const posts = data[platform as keyof TempData] as any[];
      if (posts && posts.length > 0) {
        fileContent += `\n### ${platform.charAt(0).toUpperCase() + platform.slice(1)} Posts (${posts.length})\n`;
        posts.forEach((post, index) => {
          fileContent += `${index + 1}. ${post.text}\n`;
          if (post.images && post.images.length > 0) {
            fileContent += `   Images: ${post.images.map((img: any) => img.url).join(', ')}\n`;
          }
          fileContent += `   Date: ${post.posted}\n\n`;
        });
      }
    });

    if (data.allImages && data.allImages.length > 0) {
      fileContent += `\n## All Images\n`;
      data.allImages.forEach((img, index) => {
        fileContent += `${index + 1}. ${img.url} (${img.platform})\n`;
      });
    }

    return fileContent;
  };

  tempData.dataFile = createDataFile(tempData);
  
  return tempData;
}

function cleanOpenAIHtml(html: string): string {
  // Remove markdown code fences if they exist
  if (html.startsWith('```html')) {
    html = html.substring(7); // Remove ```html
  }
  
  // Remove ``` at the end
  if (html.endsWith('```')) {
    html = html.substring(0, html.length - 3);
  }
  
  // Also handle cases where there might be extra whitespace
  html = html.replace(/^```html\s*/g, '');
  html = html.replace(/\s*```$/g, '');
  
  // If the HTML already has complete structure, return it as-is
  if (html.includes('<html') && html.includes('<body')) {
    return html.trim();
  }
  
  // Only add structure if it's missing - but keep it minimal
  if (!html.includes('<html') && !html.includes('<body')) {
    html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Newsletter</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html { 
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
          }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            max-width: 640px;
            margin: 0 auto;
            padding: 0;
            background: #101118;
            border: 0;
            outline: 0;
            height: 100%;
            width: 100%;
          }
          h1, h2, h3 { color: #ffffff; margin-top: 1.5rem; margin-bottom: 0.5rem; }
          p { margin-bottom: 1rem; color: #ffffff; }
          a { color: #60a5fa; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .header { text-align: center; margin-bottom: 2rem; }
          .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #374151; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  }
  
  return html.trim();
}

export default function NewsletterBuilder() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({
    linkedin: false,
    twitter: false,
    instagram: false,
    youtube: false,
  });
  const [inputs, setInputs] = useState({
    linkedin: "",
    twitter: "",
    instagram: "",
    youtube: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState<any>(null);
  const [newsletterData, setNewsletterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [openAIDebug, setOpenAIDebug] = useState<any>(null);
  const [tempData, setTempData] = useState<TempData>({});

  const handleCheck = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    // Clear validation error when toggling
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate selected social media inputs
    SOCIALS.forEach((social) => {
      if (selected[social.key as keyof typeof selected]) {
        const input = inputs[social.key as keyof typeof inputs];
        const requiredValidation = validateRequired(input, social.label);
        
        if (!requiredValidation.isValid) {
          errors[social.key] = requiredValidation.error!;
          isValid = false;
        } else {
          // Validate URL or username for LinkedIn
          if (social.key === 'linkedin') {
            if (!validateLinkedInInput(input)) {
              errors[social.key] = 'Enter a valid LinkedIn profile URL or username';
              isValid = false;
            }
          } else if (social.key === 'twitter') {
            if (!validateXInput(input)) {
              errors[social.key] = 'Enter a valid X profile URL or handle (e.g., @username or username)';
              isValid = false;
            }
          } else if (social.key === 'youtube') {
            // Validate YouTube channel ID format
            const channelIdPattern = /^UC[a-zA-Z0-9_-]{22}$/;
            if (!channelIdPattern.test(input.trim())) {
              errors[social.key] = 'Enter a valid YouTube channel ID (starts with UC and 24 characters total)';
              isValid = false;
            }
          } else if (social.key === 'instagram') {
            // Accept Instagram URLs or usernames directly
            const isUrl = input.includes('instagram.com');
            const isUsername = /^[a-zA-Z0-9._]+$/.test(input.trim());
            
            if (!isUrl && !isUsername) {
              errors[social.key] = 'Enter a valid Instagram URL or username (e.g., username or https://instagram.com/username)';
              isValid = false;
            }
          } else {
            const urlValidation = validateSocialMediaUrl(input, social.key);
            if (!urlValidation.isValid) {
              errors[social.key] = urlValidation.error!;
              isValid = false;
            }
          }
        }
      }
    });

    // Check if at least one platform is selected
    if (!Object.keys(selected).some(key => selected[key as keyof typeof selected])) {
      errors.general = "Please select at least one platform.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleBackToBuilder = () => {
    setNewsletter(null);
    setNewsletterData(null);
    setError(null);
    setValidationErrors({});
    setTempData({}); // Clear temp data when going back
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }
    setLoading(true);
    setNewsletter(null);
    setError(null);
    setValidationErrors({});
    setTempData({}); // Clear previous temp data
    
    try {
      // Process all selected platforms and collect data
      logger.info('Processing all platforms', { selected });
      const tempData = await processAllPlatforms(selected, inputs);
      setTempData(tempData); // Store temp data
      
      // Debug logging to see what data was collected
      console.log('Temp data after processing:', {
        allText: tempData.allText,
        allTextLength: tempData.allText?.length,
        allTextTrimmed: tempData.allText?.trim(),
        allTextTrimmedLength: tempData.allText?.trim().length,
        platforms: Object.keys(selected).filter(key => selected[key]),
        dataKeys: Object.keys(tempData),
        platformData: {
          linkedin: tempData.linkedin?.length || 0,
          twitter: tempData.twitter?.length || 0,
          instagram: tempData.instagram?.length || 0,
          youtube: tempData.youtube?.length || 0
        }
      });
      
      // Check if we have any content from any platform
      const hasAnyContent = tempData.allText && tempData.allText.trim().length > 0;
      const hasAnyPosts = Object.values(tempData).some(value => Array.isArray(value) && value.length > 0);
      
      console.log('Content validation:', {
        hasAnyContent,
        hasAnyPosts,
        allTextLength: tempData.allText?.length || 0,
        allTextTrimmedLength: tempData.allText?.trim().length || 0
      });
      
      if (!tempData.allText || tempData.allText.trim() === '') {
        console.error('No content found from any platform. Temp data:', tempData);
        console.error('Platform breakdown:', {
          selected: Object.keys(selected).filter(key => selected[key]),
          linkedinPosts: tempData.linkedin?.length || 0,
          twitterPosts: tempData.twitter?.length || 0,
          instagramPosts: tempData.instagram?.length || 0,
          youtubePosts: tempData.youtube?.length || 0
        });
        
        // Final fallback: create some basic content based on selected platforms
        console.log('Creating fallback content for selected platforms');
        const fallbackContent = Object.keys(selected)
          .filter(key => selected[key])
          .map(platform => {
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            return `[${platformName}] This is a sample post from ${platformName}. The API might be temporarily unavailable, but here's some example content to generate your newsletter.`;
          })
          .join('\n\n');
        
        tempData.allText = fallbackContent;
        console.log('Fallback content created:', fallbackContent);
      }
      
      // Debug logging
      console.log('Temp data collected:', tempData);
      console.log('Total text length:', tempData.allText?.length);
      console.log('Total images:', tempData.allImages?.length);
      
      // Format data more cleanly for ChatGPT
      const formattedText = tempData.allText || '';
      const formattedImages = tempData.allImages || [];
      
      // Create a structured summary for debugging
      const dataSummary = {
        platforms: Object.keys(selected).filter(key => selected[key]),
        totalPosts: Object.values(tempData).filter(Array.isArray).flat().length,
        totalImages: formattedImages.length,
        textLength: formattedText.length,
        platformsWithData: Object.keys(tempData).filter(key => tempData[key] && Array.isArray(tempData[key]) && tempData[key].length > 0)
      };
      console.log('Data summary for ChatGPT:', dataSummary);
      
      // Generate unified newsletter using all collected data
      let aiSummaryRawResponse: any = null;
      let aiSummary = '';
      
      // Validate OpenAI API key before making the request
      const openaiValidation = configManager.validateOpenAIKey();
      if (!openaiValidation.isValid) {
        console.error('OpenAI API key validation failed:', openaiValidation.error);
        throw new Error(openaiValidation.error);
      }
      
      const OPENAI_API_KEY = configManager.getOpenAIKey();
      
      try {
        const imageData = tempData.allImages?.map(img => 
          `Image URL: ${img.url} | Associated Text: ${img.postText} | Platform: ${img.platform}`
        ).join('\n') || '';
        
        const prompt = `
        Generate a complete HTML newsletter from the following posts and images from multiple social media platforms. Create a professional, clean newsletter with proper HTML structure including <html>, <head>, <body> tags and embedded CSS styling. 
        
        IMPORTANT: The data below contains posts from multiple platforms (LinkedIn, Twitter/X, Instagram, YouTube). Each post is prefixed with [Platform] to indicate its source.
        
        Requirements:
        - keep your max width to 640px.
        - make a carousel or collage out of the instagram images. make its size moderate not too big.
        - REMOVE any SINGLE WORDS that are not part of the text.
        - REMOVE any text that may have been mistakenly added by the scrapers BE CAREFUL.
        - all the images should have a border radius of 12px.
        - keep all the headings bold.
        - keep ALL text dark in color. including in links and lists.
        - keep one heading image and rest all should be smaller images. they can be either placed at the right left or <center className=""></center>
        - Just reply with what is asked, nothing else.
        - Use all the text to make a newsletter about the updates, post, etc. that are present about the person.
        - Write in a first person perspective.
        - Write very short paragraphs for quick updates and keep things clean.
        - Use headings to divide everything in neat areas and return everything in html code as it needs to be embedded in mails later on.
        - Make sure the response is in plain text but html code. add emojis to make it a lot more engaging. 
        - shorten the length of all paragraphs.
        - Use complete HTML structure with <html>, <head>, <body> tags
        - Include embedded CSS in <style> tag for professional styling
        - Write in first-person perspective as if the person is writing their own newsletter
        - Organize content with clear headings and sections
        - Use a clean, modern design with good typography
        - Include responsive design for mobile devices
        - Add proper spacing, colors, and visual hierarchy
        - Make it look like a professional email newsletter
        - Include the provided images in the newsletter layout where appropriate
        - Use the image URLs provided to display images in the newsletter
        - Ensure images are properly sized and responsive
        - Organize content by platform or theme as appropriate
        - Combine content from different platforms into cohesive sections
        - Maintain the professional tone while incorporating the casual nature of social media posts

DATA SUMMARY:
- Total posts: ${dataSummary.totalPosts}
- Total images: ${dataSummary.totalImages}
- Platforms with data: ${dataSummary.platformsWithData.join(', ')}

FORMATTED DATA FILE:
${tempData.dataFile}

RAW POSTS FOR PROCESSING:
${formattedText}

IMAGES TO INCLUDE:
${imageData}`;
        
        const body = {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a professional newsletter writer." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1200,
          temperature: 0.7
        };
        
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(body)
      });
      
        aiSummaryRawResponse = await resp.json();
        console.log('OpenAI Raw Response:', aiSummaryRawResponse);
        console.log('OpenAI Response Status:', resp.status);
        console.log('OpenAI Response OK:', resp.ok);
      
        if (!resp.ok) {
          console.error('OpenAI API Error:', aiSummaryRawResponse);
          throw new Error(`OpenAI API error: ${aiSummaryRawResponse.error?.message || 'Unknown error'}`);
        }
        
        aiSummary = aiSummaryRawResponse.choices?.[0]?.message?.content?.trim() || '';
        console.log('Raw AI Summary before cleaning:', aiSummary);
        console.log('AI Summary length before cleaning:', aiSummary.length);
      } catch (err) {
        console.error('OpenAI API call failed:', err);
        aiSummary = '';
      }
      
      setOpenAIDebug(aiSummaryRawResponse);
      aiSummary = cleanOpenAIHtml(aiSummary);
      logger.info('AI summary for newsletter', { aiSummary });
      
      // Debug logging
      console.log('Cleaned AI Summary:', aiSummary);
      console.log('AI Summary length:', aiSummary.length);
      
      // Compose newsletter HTML
      const newsletterHtml = aiSummary;
      
      console.log('Final Newsletter HTML:', newsletterHtml);
      console.log('Newsletter HTML length:', newsletterHtml.length);
      
      setNewsletter({ rawContent: newsletterHtml });
      setNewsletterData(tempData); // Pass temp data instead of just posts
      logger.info('Newsletter generated successfully', {
        platformsUsed: Object.keys(selected).filter(key => selected[key]),
        totalPosts: Object.values(tempData).filter(Array.isArray).flat().length
      });
      
      // Clear temp data after successful generation
      setTempData({});
      
    } catch (err: any) {
      logger.error('Newsletter generation failed', err);
      setError(err.message || "Unknown error");
      // Clear temp data on error
      setTempData({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background py-12 px-2 md:px-4">
      <div className="w-full max-w-6xl mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
      
      {!newsletter ? (
      <Card className="max-w-2xl w-full p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Build Your Weekly Newsletter</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
              <label className="block text-foreground text-sm mb-1">Select Social Platforms</label>
            <div className="grid grid-cols-2 gap-4">
              {SOCIALS.map((s) => (
                <label key={s.key} className={`flex items-center gap-3 cursor-pointer ${s.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Switch
                    checked={selected[s.key as keyof typeof selected]}
                    onChange={() => handleCheck(s.key)}
                    disabled={loading || s.disabled}
                  />
                    <span className={`text-foreground capitalize ${s.disabled ? 'text-muted-foreground' : ''}`}>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
            
          {/* Show input for each checked social */}
          <div className="space-y-2">
            {SOCIALS.map((s) =>
              selected[s.key as keyof typeof selected] && (
                <div key={s.key} className="flex flex-col md:flex-row gap-2 items-center">
                    <label className="block text-muted-foreground text-xs md:w-32 capitalize">{s.label}:</label>
                    <div className="flex-1">
                  <Input
                    type="text"
                        className={validationErrors[s.key] ? 'border-destructive' : ''}
                    value={inputs[s.key as keyof typeof inputs]}
                    onChange={e => handleInput(s.key, e.target.value)}
                    placeholder={s.placeholder}
                    disabled={loading}
                  />
                      {validationErrors[s.key] && (
                        <p className="text-xs text-destructive mt-1">{validationErrors[s.key]}</p>
                        )}
                      </div>
                  </div>
                )
                                  )}
                                </div>

            {validationErrors.general && (
              <Alert variant="destructive">
                <AlertDescription>{validationErrors.general}</AlertDescription>
              </Alert>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Generating Newsletter..."
              disabled={loading}
              className="mt-2"
            >
              Generate Newsletter
            </LoadingButton>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Card>
      ) : (
        <AINewsletterRenderer 
          newsletterData={newsletter} 
          posts={newsletterData} 
          onBackToBuilder={handleBackToBuilder}
        />
      )}
      {newsletter && openAIDebug && (
        <Card className="max-w-2xl w-full p-4 mt-8 text-xs text-muted-foreground">
          <b>OpenAI Raw Response Debug:</b>
          <pre className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">{JSON.stringify(openAIDebug, null, 2)}</pre>
      </Card>
      )}
    </div>
  );
} 