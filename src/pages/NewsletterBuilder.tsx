import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Loader2, Home, ChevronLeft, ChevronRight } from "lucide-react";
import AINewsletterRenderer from "@/components/AINewsletterRenderer";
import Loader from "@/components/Loader";
import { logger } from "@/lib/logger";
import { validateSocialMediaUrl, validateRequired } from "@/lib/validation";
import { LoadingButton } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { configManager } from "@/lib/config";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";
import { NEWSLETTER_TEMPLATES, getTemplateById, loadTemplateHTML } from '../lib/newsletterTemplates';
import { identifyTemplate } from '../lib/templateIntelligence';
import { CardCarousel } from '@/components/ui/card-carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SOCIALS = [
  {
    key: "twitter",
    label: "X",
    placeholder: "nasdaily",
    disabled: false,
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
    color: "#000000"
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "nasdaily",
    disabled: false,
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E",
    color: "#000000"
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "UCJsUvAqDzczYv2UpFmu4PcA",
    disabled: false,
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/%3E%3C/svg%3E",
    color: "#000000"
  }
];

// Temporary data storage during newsletter generation
interface TempData {
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
              model: "gpt-4o",
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
  const prompt = `Summarize this social media post in 1-2 sentences, written in first person as if the original poster is describing their content for a newsletter. Keep it engaging and highlight the main points or value provided:\n\n${text}`;
  const body = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional newsletter writer helping to summarize social media content." },
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

async function summarizeYouTubeContent(text: string): Promise<string> {
  const openaiValidation = configManager.validateOpenAIKey();
  if (!openaiValidation.isValid) return text;
  
  const OPENAI_API_KEY = configManager.getOpenAIKey();
  const prompt = `Transform this YouTube video content into a first-person summary for a newsletter. Write it as if the YouTuber is describing what they created and shared. Make it engaging and highlight the key insights or value provided. Keep it to 2-3 sentences maximum:\n\n${text}`;
  const body = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a professional newsletter writer helping to transform YouTube content into engaging first-person summaries." },
      { role: "user", content: prompt }
    ],
    max_tokens: 150,
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

async function summarizeSocialMediaPosts(posts: any[], platform: string): Promise<any[]> {
  console.log(`🤖 Starting AI summarization for ${platform} posts...`);
  
  const summarizedPosts = [];
  
  for (const post of posts) {
    try {
      const textToSummarize = post.text || '';
      
              if (textToSummarize.length > 10) {
          console.log(`🤖 Summarizing ${platform} post:`, textToSummarize.substring(0, 100) + '...');
          const summarizedText = await summarizeText(textToSummarize);
        
        // Create new post object with summarized text
        const summarizedPost = {
          ...post,
          text: summarizedText,
          originalText: textToSummarize, // Keep original for reference
          aiSummarized: true
        };
        
        summarizedPosts.push(summarizedPost);
        console.log(`✅ ${platform} post processed:`, summarizedText);
      } else {
        // If text is too short, keep original
        summarizedPosts.push({
          ...post,
          aiSummarized: false
        });
      }
    } catch (error) {
      console.error(`❌ Failed to summarize ${platform} post:`, error);
      // Keep original post if summarization fails
      summarizedPosts.push({
        ...post,
        aiSummarized: false
      });
    }
  }
  
  console.log(`✅ Completed AI summarization for ${platform}:`, summarizedPosts.length, 'posts');
  return summarizedPosts;
}

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

async function summarizePostsWithHeadings(posts: any[]): Promise<string> {
  const openaiValidation = configManager.validateOpenAIKey();
  if (!openaiValidation.isValid) return posts.map(p => p.text).join('\n\n');
  
  const OPENAI_API_KEY = configManager.getOpenAIKey();
  const allText = posts.map((p) => p.text).join('\n');
  const prompt = `just reply with what is asked, nothing else. use all the text to make a newsletter about the updates, post, etc. that are present about the person. write in a first person perspective. write very short paragraphs for quick updates and keep things clean. use headings to divide everything in neat areas and return everything in html code as it needs to be embedded in mails later on. make sure the response is in plain text but html code. make dark themed with #101118 as the background color. use an appropriate color palette. add emojis to make it a lot more engaging. shorten the length of all paragraphs.\n\n${allText}`;
  const body = {
    model: "gpt-4o",
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
          
          // AI Summarization for Twitter posts
          console.log('🤖 Starting Twitter AI summarization...');
          const summarizedPosts = await summarizeSocialMediaPosts(sortedPosts, 'Twitter');
          tempData.twitter = summarizedPosts;
          
          const images = summarizedPosts.flatMap(post => {
            const postImages = post.images || [];
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'x'
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += summarizedPosts.map(p => `[X] ${p.text}`).join('\n\n');
          
          // Add detailed logging for X data
          console.log('X data processed:', {
            postsCount: summarizedPosts.length,
            imagesCount: images.length,
            textLength: summarizedPosts.map(p => p.text).join('\n\n').length,
            posts: summarizedPosts.map(p => ({ text: p.text.substring(0, 100) + '...', date: p.posted })),
            allTextLength: tempData.allText?.length,
            aiSummarized: summarizedPosts.every(p => p.aiSummarized)
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
        
        // AI Summarization for Instagram posts
        console.log('🤖 Starting Instagram AI summarization...');
        const summarizedPosts = await summarizeSocialMediaPosts(sortedPosts, 'Instagram');
        tempData.instagram = summarizedPosts;
        
        const images = summarizedPosts.flatMap(post => {
          const postImages = post.images || [];
          return postImages.map((img: any) => ({
            url: img.url,
            postText: post.text,
            postDate: post.posted,
            platform: 'instagram'
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += summarizedPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
          
          console.log('Instagram data processed:', {
            postsCount: summarizedPosts.length,
            imagesCount: images.length,
            textLength: summarizedPosts.map(p => p.text).join('\n\n').length,
            aiSummarized: summarizedPosts.every(p => p.aiSummarized)
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
        console.log('🎬 Processing YouTube input:', input);
        const raw = await fetchYouTubeData(input);
        console.log('🎬 YouTube raw data received:', raw);
        
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
            
          console.log('🎬 YouTube data processed:', {
            postsCount: sortedPosts.length,
            imagesCount: images.length,
            textLength: sortedPosts.map(p => p.text).join('\n\n').length,
            posts: sortedPosts.map(p => ({
              text: p.text?.substring(0, 100) + '...',
              posted: p.posted,
              views: p.views,
              video_length: p.video_length
            }))
          });
                } else {
          console.log('🎬 YouTube: No valid data returned from API, using fallback');
          // Create fallback content to ensure we have something
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
          
          console.log('🎬 YouTube fallback data processed:', {
            postsCount: fallbackPosts.length,
            imagesCount: images.length,
            textLength: fallbackPosts.map(p => p.text).join('\n\n').length
          });
        }
      } catch (error) {
        console.error('🎬 YouTube processing error:', error);
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
        
        console.log('🎬 YouTube error fallback data processed:', {
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
  
  // Remove unwanted explanatory text patterns
  html = html.replace(/^Here's a stunning[^]*?```html\s*/gi, '');
  html = html.replace(/```\s*###\s*Key Features[^]*$/gi, '');
  html = html.replace(/Thank you for reading![^]*?Best,\s*Your Name[^]*?(?=<|$)/gi, '');
  html = html.replace(/###\s*Key Features:[^]*$/gi, '');
  html = html.replace(/This newsletter is designed[^]*$/gi, '');
  html = html.replace(/^[^<]*?(?=<html|<!DOCTYPE)/gi, '');
  
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
            margin: 0; padding: 0; height: 100%; width: 100%;
            background: #fafafa;
          }
          body { 
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            max-width: 640px;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
          }
          h1 { 
            font-family: Futura, Arial, Helvetica, sans-serif;
            color: #1a202c; 
            font-size: 2.5rem; 
            font-weight: 700;
            margin: 1.5rem 0 1rem 0;
            line-height: 1.2;
          }
          h2 { 
            font-family: Futura, Arial, Helvetica, sans-serif;
            color: #2d3748; 
            font-size: 1.875rem; 
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            line-height: 1.3;
          }
          h3 { 
            font-family: Futura, Arial, Helvetica, sans-serif;
            color: #4a5568; 
            font-size: 1.25rem; 
            font-weight: 600;
            margin: 1.5rem 0 0.75rem 0;
          }
          p { 
            margin-bottom: 1.25rem; 
            color: #4a5568;
            font-size: 1rem;
            line-height: 1.7;
          }
          a { 
            color: #3182ce; 
            text-decoration: none; 
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s ease;
          }
          a:hover { 
            border-bottom-color: #3182ce;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 1rem 0;
          }
          .header { 
            text-align: center; 
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #e2e8f0;
          }
          .footer { 
            text-align: center; 
            margin-top: 3rem; 
            padding-top: 2rem; 
            border-top: 2px solid #e2e8f0;
            color: #718096;
            font-size: 0.875rem;
          }
          .section {
            margin: 2.5rem 0;
            padding: 1.5rem;
            background: #f7fafc;
            border-radius: 12px;
            border-left: 4px solid #3182ce;
          }
          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .quote {
            background: #edf2f7;
            border-left: 4px solid #4299e1;
            padding: 1.5rem;
            margin: 1.5rem 0;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #2d3748;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            h1 { font-size: 2rem; }
            h2 { font-size: 1.5rem; }
            .section { padding: 1rem; }
          }
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
  const smoothNavigate = useSmoothNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState({
    twitter: false,
    instagram: false,
    youtube: false,
  });
  const [inputs, setInputs] = useState({
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
  
  // Template selection state
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [collectedData, setCollectedData] = useState<TempData>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isTemplateSelectionPhase, setIsTemplateSelectionPhase] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [showLoadingPage, setShowLoadingPage] = useState(false);

  // Handle edited newsletter content from editor
  useEffect(() => {
    if (location.state?.hasEditedContent && location.state?.editedNewsletter) {
      console.log('Received edited newsletter:', location.state.editedNewsletter);
      setNewsletter(location.state.editedNewsletter);
      setNewsletterData(location.state.editedNewsletter);
      // Clear the state to prevent re-processing
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Reset loading state when template selection is shown
  useEffect(() => {
    if (showTemplateSelection && loading && !selectedTemplate) {
      console.log('🔄 Force resetting loading state when template selection is shown');
      setLoading(false);
    }
  }, [showTemplateSelection, loading, selectedTemplate]);
  
  // Debug loading state changes
  useEffect(() => {
    console.log('🔄 Loading state changed:', loading);
    console.log('🔄 Generation progress:', generationProgress);
    console.log('🔄 Generation step:', generationStep);
  }, [loading, generationProgress, generationStep]);
  
  // Debug newsletter state changes
  useEffect(() => {
    console.log('🔄 Newsletter state changed:', newsletter ? 'has newsletter' : 'no newsletter');
    console.log('🔄 Newsletter data:', newsletter);
  }, [newsletter]);
  
  // Debug showLoadingPage state changes
  useEffect(() => {
    console.log('🔄 showLoadingPage state changed:', showLoadingPage);
  }, [showLoadingPage]);
  
  // Debug what's being rendered
  useEffect(() => {
    console.log('🔄 Render state:');
    console.log('  - showLoadingPage:', showLoadingPage);
    console.log('  - newsletter:', newsletter ? 'has newsletter' : 'no newsletter');
    console.log('  - showTemplateSelection:', showTemplateSelection);
    console.log('  - loading:', loading);
    
    if (showLoadingPage && !newsletter) {
      console.log('🔄 Should render: LOADING PAGE');
    } else if (showTemplateSelection) {
      console.log('🔄 Should render: TEMPLATE SELECTION');
    } else if (newsletter) {
      console.log('🔄 Should render: NEWSLETTER');
    } else {
      console.log('🔄 Should render: FORM');
    }
  }, [showLoadingPage, newsletter, showTemplateSelection, loading]);
  
  // Debug modal state
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Hidden feature: bypass social media input with "skibidi"
  const [typedKeys, setTypedKeys] = useState('');
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only listen for alphabetic keys
      if (/^[a-zA-Z]$/.test(event.key)) {
        const newTypedKeys = typedKeys + event.key.toLowerCase();
        setTypedKeys(newTypedKeys);
        
        // Check if "skibidi" is typed
        if (newTypedKeys.includes('skibidi')) {
          console.log('🎭 Hidden feature activated: "skibidi" detected!');
          setTypedKeys(''); // Reset for next use
          
          // Bypass social media input and go directly to template selection
          setShowTemplateSelection(true);
          setIsTemplateSelectionPhase(true);
          setCollectedData({}); // Empty data since we're bypassing
        }
        
        // Keep only last 10 characters to prevent memory buildup
        if (newTypedKeys.length > 10) {
          setTypedKeys(newTypedKeys.slice(-10));
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [typedKeys]);

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
                  if (social.key === 'twitter') {
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
    // Add a subtle fade transition before clearing the newsletter
    const container = document.querySelector('.newsletter-container');
    if (container) {
      container.classList.add('fade-out');
      setTimeout(() => {
    setNewsletter(null);
    setNewsletterData(null);
    setError(null);
    setValidationErrors({});
    setTempData({}); // Clear temp data when going back
      }, 150); // Short delay for smooth transition
    } else {
      setNewsletter(null);
      setNewsletterData(null);
      setError(null);
      setValidationErrors({});
      setTempData({}); // Clear temp data when going back
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called!');
    console.log('Selected platforms:', selected);
    console.log('Inputs:', inputs);
    console.log('Selected template:', selectedTemplate);

    // If no template is selected, show template selection
    if (!selectedTemplate) {
      console.log('📋 No template selected, showing template selection...');
      
      if (!validateInputs()) {
        console.log('❌ Validation failed');
        return;
      }

      console.log('✅ Validation passed, starting data collection...');
      setLoading(true);
      setIsTemplateSelectionPhase(true);
      setNewsletter(null);
      setError(null);
      setValidationErrors({});
      setTempData({}); // Clear previous temp data

      try {
        // Process all selected platforms and collect data
        logger.info('Processing all platforms', { selected });
        const tempData = await processAllPlatforms(selected, inputs);
        setTempData(tempData); // Store temp data

        console.log('Data collected successfully:', {
          platforms: Object.keys(selected).filter(key => selected[key]),
          totalText: tempData.allText?.length || 0,
          totalImages: tempData.allImages?.length || 0
        });

        // Store collected data and show template selection  
        setCollectedData(tempData);
        setShowTemplateSelection(true);
        setLoading(false);
        setIsTemplateSelectionPhase(false);
        console.log('🔄 Loading state reset to false');
        
        console.log('🎯 Template selection should now be visible!');
        console.log('showTemplateSelection:', true);
        console.log('collectedData keys:', Object.keys(tempData));

      } catch (error: any) {
        console.error('Newsletter generation error:', error);
        setError(error.message || "Unknown error");
        setTempData({});
        setLoading(false);
        setIsTemplateSelectionPhase(false);
      }
    } else {
      // Template is selected, generate newsletter
      console.log('🎯 Template selected, generating newsletter...');
      console.log('selectedTemplate:', selectedTemplate);
      console.log('collectedData:', collectedData);
      console.log('collectedData keys:', Object.keys(collectedData));
      console.log('loading state:', loading);
      console.log('button disabled:', !selectedTemplate || loading);
      
      if (selectedTemplate) {
        console.log('✅ Calling generateNewsletterWithTemplate with:', selectedTemplate, collectedData);
        console.log('🔄 Setting loading state to true...');
        setLoading(true); // Set loading to true when starting generation
        setIsTemplateSelectionPhase(false); // Ensure we're not in template selection phase
        setGenerationProgress(0);
        setGenerationStep('Initializing...');
        setShowLoadingPage(true); // Show the dedicated loading page
        console.log('🔄 showLoadingPage set to true');
        console.log('🔄 Loading state set, calling generateNewsletterWithTemplate...');
        generateNewsletterWithTemplate(selectedTemplate, collectedData);
      } else {
        console.log('❌ No template selected');
      }
    }
  };




  // OLD IMPLEMENTATION - TO BE REMOVED
  const handleSubmitOLD = async (e: React.FormEvent) => {
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
        Generate ONLY the HTML newsletter content. Do not include any explanatory text, descriptions, or meta-commentary. Return only the complete HTML document.

        DESIGN & VISUAL REQUIREMENTS:
        - Create a **premium magazine-style layout** with modern typography and elegant spacing
        - Use a **maximum width of 640px** for optimal email client compatibility
        - Implement **beautiful visual hierarchy** with varied font sizes, weights, and spacing
        - Add **subtle shadows, rounded corners (12px), and modern card-based layouts**
        - Create **engaging image layouts**: hero image at top, then mix of side-by-side images, centered images
        - For Instagram images ONLY: Create an **elegant carousel or photo grid layout** (2-3 images per row)
        - For other platforms: Display images individually without carousels
        - Use **sophisticated color palette**: whites, light grays, and strategic accent colors
        - Add **modern UI elements**: subtle borders, elegant dividers, and beautiful spacing
        - Implement **responsive design** that looks perfect on mobile and desktop

        TYPOGRAPHY & CONTENT:
        - Use **professional font stack**: Arial, Helvetica, sans-serif for all text; Futura or Arial for headlines
        - Create **engaging headlines** with proper hierarchy (H1 for main title, H2 for sections, H3 for subsections)
        - Write in **first-person narrative style** as if the person is personally sharing their week
        - Keep paragraphs **concise and scannable** (2-3 lines max)
        - Add **strategic emojis** for visual interest and personality
        - Use **pull quotes** or highlighted text boxes for key insights
        - Include **platform badges** or subtle indicators for content sources

        IMAGE HANDLING:
        - **Never repeat the same image twice**
        - **Never crop images** - only resize maintaining aspect ratio by scaling equally from all sides
        - Use proper width/height attributes to maintain aspect ratio
        - For Instagram: Use carousel/grid layout only
        - For other platforms: Display images individually

        LAYOUT STRUCTURE:
        - **Header section**: Elegant title, date, and personal greeting
        - **Hero image**: One impactful image with overlay text or caption
        - **Content sections**: Organize by themes (projects, learnings, social highlights, etc.)
        - **Image placements**: Mix of full-width, side-by-side, and wrapped text layouts
        - **Footer**: Professional closing with personal touch (no generic signatures)

        TECHNICAL REQUIREMENTS:
        - Complete HTML structure with <html>, <head>, <body> tags
        - Embedded CSS in <style> tag (no external stylesheets)
        - Email-client compatible CSS (use tables for complex layouts if needed)
        - Responsive design with mobile-first approach
        - All images with proper alt tags and fallbacks
        - Clean, semantic HTML structure
        - Remove any scraper artifacts or single-word errors
        - Ensure all text is dark and readable
        - Professional email newsletter standards

        CONTENT PROCESSING:
        - Filter and clean all scraped content
        - Combine posts from different platforms into cohesive narrative
        - Create engaging section headers that group related content
        - Transform social media posts into newsletter-worthy prose
        - Maintain authentic voice while elevating the presentation

        CRITICAL: Return ONLY the HTML content. No explanatory text, no feature descriptions, no commentary. Start with <html> and end with </html>.

DATA SUMMARY:
- Total posts: ${dataSummary.totalPosts}
- Total images: ${dataSummary.totalImages}
- Platforms with data: ${dataSummary.platformsWithData.join(', ')}

        FORMATTED DATA:
${tempData.dataFile}

        RAW POSTS:
${formattedText}

IMAGES TO INCLUDE:
${imageData}`;
        
        const body = {
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert newsletter designer and writer who creates visually stunning, magazine-quality publications. You excel at transforming social media content into sophisticated, engaging newsletters that readers love to receive and share." },
            { role: "user", content: prompt }
          ],
          max_tokens: 2000,
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

  // Function to generate newsletter with OpenAI after template selection
  // TEMPORARY DEVELOPMENT FUNCTION: Uses templates directly without OpenAI
  // This bypasses OpenAI API calls and loads template HTML exactly as-is
  const generateNewsletterWithTemplate = async (templateId: string, data: TempData) => {
    console.log('🚀 Starting newsletter generation with template directly...');
    console.log('📊 Template ID:', templateId);
    console.log('📊 Data keys:', Object.keys(data));
    
    try {
      // Progress steps to show loading
      setGenerationProgress(10);
      setGenerationStep('Initializing...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGenerationProgress(30);
      setGenerationStep('Loading template...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the template
      const template = NEWSLETTER_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      console.log('📄 Template found:', template.name);
      console.log('📄 Template path:', template.htmlPath);
      
      // Load template HTML
      console.log('🔄 Attempting to load template HTML...');
      let templateHtml;
      try {
        templateHtml = await loadTemplateHTML(template);
        console.log('📄 Template HTML loaded successfully, length:', templateHtml.length);
      } catch (loadError) {
        console.error('❌ Failed to load template HTML:', loadError);
        // Fallback: create a simple HTML template
        templateHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Newsletter Template</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              h1 { color: #333; }
              p { line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${template.name}</h1>
            <p>This is a fallback template for ${template.name}.</p>
            <p>The original template file could not be loaded.</p>
          </body>
          </html>
        `;
        console.log('📄 Using fallback template HTML');
      }
      
      console.log('🔗 Template contains images:', templateHtml.includes('<img'));
      console.log('🔗 Template contains links:', templateHtml.includes('<a href'));
      console.log('📄 First 200 chars of template:', templateHtml.substring(0, 200));
      
      // Complete immediately
      setGenerationProgress(100);
      setGenerationStep('Complete!');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay to show loading page
      
      // TEMPORARY DEVELOPMENT: Use template HTML directly without any cleaning
      // This ensures ALL template content is preserved exactly as-is
      // TODO: Remove this bypass when ready to use OpenAI again
      let templateContent = templateHtml;
      

      
      // Create newsletter data structure
      const newsletterData = {
        sections: [
          {
            title: "Template Content",
            icon: "📄",
            content: templateContent
          }
        ],
        rawContent: templateContent,
        editedContent: templateContent,
        css: "", // Template CSS is already included in the HTML
        error: undefined,
        youtubeSummaries: {}
      };
      
      console.log('✅ Newsletter generated successfully with template');
      console.log('📄 Final HTML length:', templateContent.length);
      
      // Set the newsletter data
      console.log('🔄 Setting newsletter state:', newsletterData);
      setNewsletter(newsletterData);
      setNewsletterData(data);
      setLoading(false);
      setShowLoadingPage(false);
      setShowTemplateSelection(false); // Hide template selection when newsletter is ready
      setGenerationProgress(0);
      setGenerationStep('');
      console.log('🔄 Newsletter state set, should show newsletter now');
      console.log('🔄 showLoadingPage set to false');
      console.log('🔄 showTemplateSelection set to false');
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error: any) {
      console.error('❌ Newsletter generation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        templateId,
        dataKeys: Object.keys(data)
      });
      setError(error.message || "Failed to generate newsletter");
      setLoading(false);
      setShowLoadingPage(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  const generateNewsletterWithOpenAI = async (templateId: string, data: TempData) => {
    console.log('🚀 Starting newsletter generation with OpenAI...');
    console.log('📊 Template ID:', templateId);
    console.log('📊 Data keys:', Object.keys(data));
    
    try {
      const OPENAI_API_KEY = configManager.getOpenAIKey();
      
      // Progress step 1: Initializing
      setGenerationProgress(10);
      setGenerationStep('Initializing...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI to update
      
      // Progress step 2: Loading template
      setGenerationProgress(20);
      setGenerationStep('Loading template...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the template
      const template = NEWSLETTER_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      console.log('📄 Template found:', template.name);
      
      // Progress step 3: Processing social media data
      setGenerationProgress(30);
      setGenerationStep('Processing social media data...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Progress step 4: Analyzing sections
      setGenerationProgress(50);
      setGenerationStep('Analyzing newsletter sections...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Load template HTML
      const templateHtml = await loadTemplateHTML(template);
      
      // Extract sections from template
      const sections = extractNewsletterSections(templateHtml);
      const sectionIds = ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'];
      
      // Progress step 5: Populating sections
      setGenerationProgress(70);
      setGenerationStep('Populating sections...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Progress step 6: Generating content
      setGenerationProgress(85);
      setGenerationStep('Generating newsletter content...');
      
      // Create a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
      
      let populatedHtml = templateHtml;
      let exchangeCount = 0;
      const maxExchanges = 5;
      
      // Process each section individually
      for (let i = 0; i < sectionIds.length && exchangeCount < maxExchanges; i++) {
        const sectionId = sectionIds[i];
        const sectionNumber = i + 1;
        
        setGenerationStep(`Populating section ${sectionNumber}/5...`);
        
        // Create section-specific prompt
        const sectionPrompt = createSectionSpecificPrompt(sectionId, sectionNumber, data, populatedHtml);
        
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { 
                  role: "system", 
                  content: `You are a newsletter section editor. Populate section ${sectionNumber} with social media data. Return ONLY the complete HTML document. Exchange ${exchangeCount + 1}/${maxExchanges}.` 
                },
                { role: "user", content: sectionPrompt }
              ],
              max_tokens: 4000,
              temperature: 0.1
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log('📡 OpenAI API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }
          
          const responseData = await response.json();
          const content = responseData.choices[0]?.message?.content?.trim();
          
          if (!content) {
            throw new Error('No content received from OpenAI');
          }
          
          // Update the populated HTML with the new section content
          populatedHtml = content;
          exchangeCount++;
          
          console.log(`✅ Section ${sectionNumber} populated (Exchange ${exchangeCount}/${maxExchanges})`);
          
        } catch (sectionError) {
          console.error(`❌ Error populating section ${sectionNumber}:`, sectionError);
          // Continue with next section even if one fails
        }
      }
      
      // Progress step 7: Finalizing
      setGenerationProgress(95);
      setGenerationStep('Finalizing newsletter...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Artificial delay
      
      // Progress step 8: Complete
      setGenerationProgress(100);
      setGenerationStep('Newsletter ready!');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second at 100%
      
      logger.info('Newsletter generated with OpenAI', {
        templateId,
        templateName: template.name,
        htmlLength: populatedHtml.length,
        exchangesUsed: exchangeCount
      });
      
      // Set the populated newsletter after progress reaches 100%
      setNewsletter({ rawContent: populatedHtml });
      setNewsletterData(data);
      
      // Newsletter is ready
      console.log('📝 Newsletter ready');
      
      setShowTemplateSelection(false);
      setShowLoadingPage(false); // Hide the loading page
      
    } catch (error) {
      console.error('Newsletter generation error:', error);
      setError(error.message || "Failed to generate newsletter");
      setShowTemplateSelection(false); // Hide template selection on error
      setShowLoadingPage(false); // Hide the loading page on error
    } finally {
      setLoading(false);
      setGenerationProgress(0);
      setGenerationStep('');
    }
  };

  // Create a focused prompt for replacing placeholders in the template
  const createTemplateReplacementPrompt = (templateHtml: string, data: TempData): string => {
    const socialData = formatSocialDataForPrompt(data);
    
    // Extract and analyze the newsletter sections
    const sections = extractNewsletterSections(templateHtml);
    
    return `POPULATE TEMPLATE 5 NEWSLETTER WITH SOCIAL MEDIA DATA

SOCIAL MEDIA DATA:
${socialData}

NEWSLETTER SECTIONS TO POPULATE:
${sections}

SPECIFIC FORMATTING FOR TEMPLATE 5:

CONTENT STRUCTURE:
1. BULLET POINT SUMMARY: Create a concise bullet-point summary of the social media content
   - Format as: "- [brief summary of activity/event/update]"
   - Example: "- I went to Tokyo and had amazing food"
   - Example: "- Met some friends and fans at the event"
   - Example: "- Going on hiatus for the next month"

2. THUMBNAILS AND IMAGES: After the bullet points, organize all thumbnails, images, and links
   - Display all social media images in an organized grid/layout
   - Include links to the original posts
   - Maintain proper spacing and alignment
   - Use actual engagement numbers and post dates

CONTENT REQUIREMENTS:
- Replace all "Lorem ipsum" text with actual social media content
- Use real engagement numbers from the provided data
- Maintain the original structure and styling of each section
- Make content engaging and newsletter-appropriate
- Use actual brand/company names from the data
- Focus on creating engaging bullet points that summarize activities

BULLET POINT GUIDELINES:
- Keep each bullet point concise (1-2 sentences max)
- Focus on activities, events, updates, and highlights
- Use engaging, conversational tone
- Include key details like locations, people met, achievements
- Make it feel personal and authentic

THUMBNAIL ORGANIZATION:
- Display images in a clean, organized manner
- Include post captions or descriptions
- Show engagement metrics (likes, comments, views)
- Link to original posts where possible
- Maintain visual hierarchy and spacing

CRITICAL REQUIREMENTS:
- Return ONLY the complete HTML from <!DOCTYPE> to </html>
- Maintain ALL original CSS classes, IDs, and styling
- Keep all original images and their src attributes
- Use actual engagement numbers from the provided data
- Make content newsletter-appropriate and engaging
- Ensure bullet points come first, followed by organized thumbnails

RESPONSE FORMAT:
Return ONLY the complete modified HTML document. Start with <!DOCTYPE html> and end with </html>.`;
  };

  // Extract sections that need replacement from the template
  const extractNewsletterSections = (templateHtml: string): string => {
    console.log('🔍 Extracting newsletter sections from template...');
    const sections = [];
    
    // Find all newsletter sections with their IDs
    const sectionMatches = templateHtml.match(/<div[^>]*id="section-(\d+)"[^>]*class="newsletter-section"[^>]*>.*?<\/div>/gs);
    
    if (sectionMatches) {
      sections.push('NEWSLETTER SECTIONS FOUND:');
      sectionMatches.forEach((match, index) => {
        const sectionId = match.match(/id="section-(\d+)"/)?.[1] || 'unknown';
        const sectionContent = match.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
        
        let sectionPurpose = '';
        switch(sectionId) {
          case '1':
            sectionPurpose = 'Header and Initial Promo - Main headline and promotional content';
            break;
          case '2':
            sectionPurpose = 'Game Zones - Feature showcase section';
            break;
          case '3':
            sectionPurpose = 'First Content Block - Main content section';
            break;
          case '4':
            sectionPurpose = 'Special Offer - Promotional offers section';
            break;
          case '5':
            sectionPurpose = 'Second Content Block and Footer - Secondary content and footer';
            break;
          default:
            sectionPurpose = 'Unknown section';
        }
        
        sections.push(`SECTION ${sectionId}: ${sectionPurpose}`);
        sections.push(`Content: ${sectionContent}`);
        sections.push('');
      });
      console.log('📝 Found', sectionMatches.length, 'newsletter sections');
    }
    
    // Find Lorem ipsum text that needs replacement
    const loremMatches = templateHtml.match(/Lorem ipsum[^<]*/g);
    if (loremMatches) {
      sections.push('\nLOREM IPSUM TEXT TO REPLACE:');
      loremMatches.forEach((match, index) => {
        sections.push(`${index + 1}. ${match}`);
      });
      console.log('📝 Found', loremMatches.length, 'Lorem ipsum matches');
    }
    
    // Find placeholder engagement numbers
    const numberMatches = templateHtml.match(/\b(89|32|15)\b/g);
    if (numberMatches) {
      sections.push('\nPLACEHOLDER ENGAGEMENT NUMBERS:');
      numberMatches.forEach((match, index) => {
        sections.push(`${index + 1}. ${match} (replace with real engagement data)`);
      });
      console.log('📝 Found', numberMatches.length, 'placeholder numbers');
    }
    
    const result = sections.join('\n');
    console.log('📋 Extracted sections length:', result.length);
    return result;
  };

  // Format social media data for the prompt
  const formatSocialDataForPrompt = (data: TempData): string => {
    let formattedData = '';
    
    if (data.twitter && data.twitter.length > 0) {
      formattedData += 'TWITTER:\n';
      data.twitter.slice(0, 2).forEach((post, index) => {
        formattedData += `${index + 1}. ${(post.text || 'Twitter post').substring(0, 200)}...\n`;
        formattedData += `   Engagement: ${post.likes || 0} likes, ${post.comments || 0} comments\n\n`;
      });
    }
    
    if (data.instagram && data.instagram.length > 0) {
      formattedData += 'INSTAGRAM:\n';
      data.instagram.slice(0, 2).forEach((post, index) => {
        formattedData += `${index + 1}. ${(post.text || 'Instagram post').substring(0, 200)}...\n`;
        formattedData += `   Engagement: ${post.likes || 0} likes, ${post.comments || 0} comments\n\n`;
      });
    }
    
    if (data.youtube && data.youtube.length > 0) {
      formattedData += 'YOUTUBE:\n';
      data.youtube.slice(0, 1).forEach((video, index) => {
        formattedData += `${index + 1}. ${(video.text || 'YouTube video').substring(0, 200)}...\n`;
        formattedData += `   Views: ${video.views || 0}, Duration: ${video.video_length || 'N/A'}\n\n`;
      });
    }
    
    return formattedData || 'No social media data available';
  };

  // Extract sections from generated newsletter for editing
  // Debug function to check available sections
  const checkAvailableSections = () => {
    const newsletterHtml = newsletter?.rawContent || newsletter;
    if (!newsletterHtml) return;
    
    console.log('🔍 Checking available sections in newsletter...');
    const allDivs = newsletterHtml.match(/<div[^>]*id="[^"]*"[^>]*>/g);
    console.log('All divs with IDs:', allDivs);
    
    const sectionDivs = newsletterHtml.match(/<div[^>]*id="section-[^"]*"[^>]*>/g);
    console.log('Section divs:', sectionDivs);
  };



  // Create section-specific prompt for individual section population
  const createSectionSpecificPrompt = (sectionId: string, sectionNumber: number, data: TempData, currentHtml: string): string => {
    const socialData = formatSocialDataForPrompt(data);
    
    let sectionPurpose = '';
    switch(sectionNumber) {
      case 1:
        sectionPurpose = 'Header and Initial Promo - Use the most engaging social media content for the main headline and promotional message';
        break;
      case 2:
        sectionPurpose = 'Game Zones - Feature social media posts about activities, events, or highlights';
        break;
      case 3:
        sectionPurpose = 'First Content Block - Use social media insights and key takeaways';
        break;
      case 4:
        sectionPurpose = 'Special Offer - Create promotional content based on social media engagement patterns';
        break;
      case 5:
        sectionPurpose = 'Second Content Block and Footer - Use remaining social media content and add footer information';
        break;
      default:
        sectionPurpose = 'General content section';
    }
    
    return `POPULATE NEWSLETTER SECTION ${sectionNumber}

SOCIAL MEDIA DATA:
${socialData}

SECTION PURPOSE:
${sectionPurpose}

CURRENT HTML (with previous sections populated):
${currentHtml}

INSTRUCTIONS:
You are populating section ${sectionNumber} of a newsletter template. Focus ONLY on this specific section while maintaining the structure of the entire document.

SECTION REQUIREMENTS:
- Replace all "Lorem ipsum" text in this section with actual social media content
- Use real engagement numbers from the provided data
- Maintain the original structure and styling of this section
- Make content engaging and newsletter-appropriate
- Use actual brand/company names from the data
- Focus on the content that fits this section's purpose

CRITICAL REQUIREMENTS:
- Return ONLY the complete HTML from <!DOCTYPE> to </html>
- Maintain ALL original CSS classes, IDs, and styling
- Keep all original images and their src attributes
- Only modify the content within the specified section
- Preserve all other sections as they are

RESPONSE FORMAT:
Return ONLY the complete modified HTML document. Start with <!DOCTYPE html> and end with </html>.`;
  };

  // Add custom styles for smooth dropdown animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .timeline-select-content {
        z-index: 50;
        position: relative;
        animation-delay: 0.05s;
      }
      
      .timeline-select-item {
        transition: all 0.15s ease-in-out;
      }
      
      .timeline-select-item:hover {
        background-color: #f9fafb;
        transform: translateX(2px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Log template availability on mount
  useEffect(() => {
    console.log('📋 NewsletterBuilder mounted - Templates available:', NEWSLETTER_TEMPLATES.length);
    NEWSLETTER_TEMPLATES.forEach((template, index) => {
      console.log(`📋 Template ${index + 1}:`, template.id, template.name, template.htmlPath);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white relative page-transition">
      {showLoadingPage ? (
        // Loading Page - Show dedicated loading screen with custom loader
        <Loader progress={generationProgress} step={generationStep} />
      ) : showTemplateSelection ? (
        // Template Selection Phase - Hide form, show only template selection
        <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">

          <Card className="max-w-6xl w-full p-4 sm:p-6 lg:p-8 bg-white border-gray-200 shadow-xl mx-auto mt-4 sm:mt-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Choose Your Newsletter Template</h2>
              <p className="text-sm sm:text-base text-gray-600 px-2 mb-4">Select a design from the templates below. We'll populate it with your social media content.</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <ChevronLeft className="w-4 h-4" />
                <span>Scroll to browse templates</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            
                        <CardCarousel className="mb-6">
              {(() => {
                console.log('📋 Rendering templates:', NEWSLETTER_TEMPLATES.length, 'templates available');
                return NEWSLETTER_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all duration-500 ease-in-out transform hover:scale-102 ${
                      selectedTemplate === template.id
                        ? 'border-black bg-gray-50 shadow-xl scale-105'
                        : 'border-gray-200 hover:border-gray-400 hover:shadow-lg hover:-translate-y-1'
                    }`}
                    style={{ width: '320px', flexShrink: 0 }}
                  >
                    <div className="aspect-[4/3] bg-white relative overflow-hidden">
                      <iframe 
                        src={template.htmlPath}
                        className="w-full h-full border-0 pointer-events-none transform scale-[0.5] origin-top-left"
                        style={{ width: '200%', height: '200%' }}
                        title={template.name}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-500 ease-in-out backdrop-blur-sm">
                        <span className="text-white font-bold text-base sm:text-lg transform hover:scale-110 transition-transform duration-300">Select Template</span>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">{template.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{template.description}</p>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        template.style === 'modern' ? 'bg-blue-100 text-blue-800' :
                        template.style === 'classic' ? 'bg-green-100 text-green-800' :
                        template.style === 'minimal' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {template.style}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </CardCarousel>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-4 sm:gap-0">
              {/* Debug info - hidden on mobile */}
              <div className="text-xs text-gray-500 hidden sm:block">
                Template: {selectedTemplate || 'None'} | 
                Loading: {loading ? 'Yes' : 'No'} | 
                Data: {Object.keys(collectedData).length} keys
              </div>
              
              {/* Mobile: Generate Newsletter first, then Back */}
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-4 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowTemplateSelection(false);
                    setCollectedData({});
                    setSelectedTemplate(null);
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  ← Back
                </Button>
                
                <LoadingButton
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  loading={loading}
                  loadingText="Generating Newsletter..."
                  disabled={!selectedTemplate || loading}
                  className="font-medium py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
                >
                  Generate Newsletter →
                </LoadingButton>
              </div>
            </div>
          </Card>
        </div>
      ) : newsletter ? (
        // Newsletter Display Phase
                  <div className="bg-gray-50 p-3 sm:p-6">
          <div className="flex flex-col lg:flex-row justify-center items-start gap-4 sm:gap-6">
            
            {/* Newsletter Window */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-400 overflow-hidden animate-in slide-in-from-left-6 duration-800 w-full lg:w-auto" 
                 style={{ width: '100%', maxWidth: '640px', height: '85vh' }}>
              
              {/* Newsletter Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Newsletter Preview</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* OpenAI Debug Button */}
                  {openAIDebug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDebugModal(true)}
                      className="flex items-center gap-2 text-xs hidden sm:flex"
                    >
                      🔍 Debug
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewsletter(null);
                      setNewsletterData(null);
                      setShowTemplateSelection(false);
                      setCollectedData({});
                      setSelectedTemplate(null);
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                </div>
              </div>
              
              {/* Newsletter Content */}
              <div className="h-full overflow-hidden" style={{ height: 'calc(100% - 65px)' }}>
                <div className="h-full overflow-y-auto">
                  <AINewsletterRenderer 
                    newsletterData={newsletter} 
                    posts={newsletterData}
                    onBackToBuilder={() => {
                      setNewsletter(null);
                      setNewsletterData(null);
                      setShowTemplateSelection(false);
                      setCollectedData({});
                      setSelectedTemplate(null);
                    }}
                  />
                </div>
              </div>
              

            </div>


            
          </div>
        </div>
      ) : (
        // Newsletter Builder Form - Only show when NOT selecting templates
        <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 transition-all duration-500 ease-in-out">
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
            <Button 
              variant="outline" 
              onClick={() => smoothNavigate('/')}
              size="icon"
              className="border-gray-300 hover:border-gray-400 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
          
          <Card className="max-w-2xl w-full p-4 sm:p-6 lg:p-8 bg-white border-gray-200 shadow-xl transition-all duration-500 ease-in-out transform animate-in fade-in slide-in-from-bottom-4 hover:shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 text-center">Build Your Weekly Newsletter</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3 text-center">Select Social Platforms</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                  {SOCIALS.map((s) => (
                    <div
                      key={s.key}
                      onClick={() => !s.disabled && !loading && handleCheck(s.key)}
                      className={`
                        relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-500 ease-in-out group transform hover:scale-105 hover:-translate-y-1 active:scale-95
                        ${s.key === 'youtube' ? 'col-span-2 sm:col-span-1' : ''}
                        ${selected[s.key as keyof typeof selected] 
                          ? 'border-black bg-gray-50 shadow-lg scale-105' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl'
                        }
                        ${s.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${loading ? 'cursor-not-allowed opacity-75' : ''}
                      `}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center transition-all duration-500 ease-in-out transform
                        ${selected[s.key as keyof typeof selected] ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                      `}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Platform icon */}
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-white p-1 sm:p-2 shadow-sm border border-gray-100">
                          <img 
                            src={s.icon} 
                            alt={s.label}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to text if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {s.label.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span className={`text-xs font-medium text-center ${selected[s.key as keyof typeof selected] ? 'text-black' : 'text-gray-600'}`}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Show input for each checked social */}
              <div className="space-y-1">
                {SOCIALS.map((s) =>
                  <div 
                    key={s.key}
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      selected[s.key as keyof typeof selected] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center pt-3">
                      <label className="block text-gray-600 text-xs font-medium sm:w-32 capitalize">{s.label}:</label>
                      <div className="flex-1 w-full">
                        <Input
                          type="text"
                          className={`${validationErrors[s.key] ? 'border-gray-800' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-500 w-full`}
                          value={inputs[s.key as keyof typeof inputs]}
                          onChange={e => handleInput(s.key, e.target.value)}
                          placeholder={s.placeholder}
                          disabled={loading}
                        />
                        {validationErrors[s.key] && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors[s.key]}</p>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {validationErrors.general && (
                <Alert variant="destructive" className="bg-gray-50 border-gray-200 text-gray-800">
                  <AlertDescription className="text-gray-700">{validationErrors.general}</AlertDescription>
              </Alert>
              )}

              <LoadingButton
                type="submit"
                loading={loading && !isTemplateSelectionPhase}
                loadingText="Generating Newsletter..."
                disabled={loading}
                className="mt-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 w-full"
              >
                {selectedTemplate ? "Generate Newsletter" : "Select Template"}
              </LoadingButton>
            </form>
            
            {/* Rotating circular icon for template selection loading */}
            {loading && isTemplateSelectionPhase && (
              <div className="flex flex-col items-center justify-center mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium text-center">Collecting your social media data...</p>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mt-4 bg-gray-50 border-gray-200 text-gray-800">
                <AlertDescription className="text-gray-700">{error}</AlertDescription>
              </Alert>
            )}
          </Card>
        </div>
      )}
      
      {/* Floating OpenAI Debug Modal */}
      {showDebugModal && openAIDebug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-auto max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-500 ease-out">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">OpenAI Debug Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugModal(false)}
                className="flex items-center gap-2"
              >
                ✕ Close
              </Button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="text-xs text-gray-600 font-mono">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
                  <pre className="bg-gray-100 rounded p-2 sm:p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(openAIDebug?.request || {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
                  <pre className="bg-gray-100 rounded p-2 sm:p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(openAIDebug?.response || openAIDebug, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 