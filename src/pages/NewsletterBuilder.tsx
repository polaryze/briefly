import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Loader2, Home, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import AINewsletterRenderer from "@/components/AINewsletterRenderer";
import { GmailSender } from "@/components/GmailSender";
import Loader from "@/components/Loader";
import { logger } from "@/lib/logger";
import { validateSocialMediaUrl, validateRequired } from "@/lib/validation";
import { LoadingButton } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { configManager } from "@/lib/config";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";
import { NEWSLETTER_TEMPLATES, getTemplateById, loadTemplateHTML, testTemplateLoading } from '../lib/newsletterTemplates';
import { getFallbackTemplate } from '../lib/placeholderNewsletter';
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
    placeholder: "@channel id",
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
  allImages?: Array<{url: string, postText: string, postDate: string, platform: string, likes?: number, comments?: number}>;
  allText?: string;
  dataFile?: string; // Virtual file containing all formatted data
  youtubeSummaries?: {[key: string]: string};
}

interface ValidationErrors {
  [key: string]: string;
}

// API keys are now managed through configManager for better security

// Helper functions for fetching data from different platforms
async function fetchXData(handleOrUrl: string) {
  try {
    // Use server endpoint instead of direct API call
    const response = await fetch('/api/rapidapi/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ handle: handleOrUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Twitter data');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    throw new Error(`X API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchInstagramData(usernameOrUrl: string) {
  try {
    // Extract username from URL if needed
    let username = usernameOrUrl;
    if (usernameOrUrl.includes('instagram.com/')) {
      username = usernameOrUrl.split('instagram.com/')[1]?.split('/')[0] || usernameOrUrl;
    }

    // Use server endpoint instead of direct API call
    const response = await fetch('/api/rapidapi/instagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Instagram data');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    throw new Error(`Instagram API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchYouTubeData(url: string) {
  try {
    // Use server endpoint instead of direct API call
    const response = await fetch('/api/rapidapi/youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch YouTube data');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    throw new Error(`YouTube API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function summarizeText(text: string): Promise<string> {
  try {
  const prompt = `Transform this social media post into a bullet point format written in first person. Write as if the original poster is describing their content for a newsletter. Use bullet points (•) and keep each point concise and engaging. Highlight the main value or insights provided:\n\n${text}`;
    
    const response = await fetch('/api/openai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: text,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize text');
    }

    const result = await response.json();
    return result.summary || text;
  } catch (error) {
    return text;
  }
}

// Batch summarization for better performance
async function summarizeTextBatch(allTexts: string, postCount: number): Promise<string> {
  try {
  const prompt = `Transform these ${postCount} social media posts into bullet point format written in first person. Write as if the original poster is describing their content for a newsletter. Use bullet points (•) and keep each point concise and engaging. Highlight the main value or insights provided. Separate each post summary with "---" on its own line:\n\n${allTexts}`;
    
    const response = await fetch('/api/openai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: allTexts,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize text batch');
    }

    const result = await response.json();
    return result.summary || allTexts;
  } catch (error) {
    return allTexts;
  }
}

async function summarizeYouTubeContent(text: string): Promise<string> {
  try {
  const prompt = `Transform this YouTube video content into bullet points written in first person. Write as if the YouTuber is describing what they created and shared for a newsletter. Use bullet points (•) and highlight the key insights, value, or main topics covered. Keep each point concise and engaging:\n\n${text}`;
    
    const response = await fetch('/api/openai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: text,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize YouTube content');
    }

    const result = await response.json();
    return result.summary || text;
  } catch (error) {
    return text;
  }
}

async function summarizeSocialMediaPosts(posts: any[], platform: string): Promise<any[]> {

  
  // Skip AI summarization for very short content to improve performance
  const totalPosts = posts.length;
  const averagePostLength = posts.reduce((sum, post) => sum + (post.text?.length || 0), 0) / totalPosts;
  
  // Skip AI summarization for Twitter/X if minimal data or very short content
  if (platform.toLowerCase() === 'twitter' && (totalPosts <= 2 || averagePostLength < 30)) {
    console.log(`⏭️ Skipping AI summarization for ${platform}: ${totalPosts} posts, avg length: ${averagePostLength.toFixed(1)} chars`);
    return posts.map(post => ({
      ...post,
      aiSummarized: false
    }));
  }
  
  // For Instagram and YouTube, only process if content is substantial
  if ((platform.toLowerCase() === 'instagram' || platform.toLowerCase() === 'youtube') && averagePostLength < 20) {
    console.log(`⏭️ Skipping AI summarization for ${platform}: content too short (avg: ${averagePostLength.toFixed(1)} chars)`);
    return posts.map(post => ({
      ...post,
      aiSummarized: false
    }));
  }
  
  // Batch processing for better performance
  const postsToSummarize = posts.filter(post => {
    const textToSummarize = post.text || '';
    return textToSummarize.length > 15; // Increased minimum length
  });
  
  const postsToKeep = posts.filter(post => {
    const textToSummarize = post.text || '';
    return textToSummarize.length <= 15;
  });
  
  // Skip if no posts need summarization
  if (postsToSummarize.length === 0) {
    console.log(`⏭️ No posts need summarization for ${platform}`);
    return posts.map(post => ({
      ...post,
      aiSummarized: false
    }));
  }
  
  // Batch summarize all posts at once with timeout
  if (postsToSummarize.length > 0) {
    try {
      const allTexts = postsToSummarize.map(post => post.text).join('\n\n---\n\n');
      const batchSummarizedText = await summarizeTextBatch(allTexts, postsToSummarize.length);
      
      // Split the batch response back into individual summaries
      const summaries = batchSummarizedText.split('\n\n---\n\n');
      
      const summarizedPosts = postsToSummarize.map((post, index) => ({
        ...post,
        text: summaries[index] || post.text,
        originalText: post.text,
        aiSummarized: true
      }));
      
      // Add posts that didn't need summarization
      const finalPosts = [...summarizedPosts, ...postsToKeep.map(post => ({
        ...post,
        aiSummarized: false
      }))];
      
      console.log(`✅ Completed AI summarization for ${platform}:`, finalPosts.length, 'posts');
      return finalPosts;
      
    } catch (error) {
      console.error(`❌ Failed to batch summarize ${platform} posts:`, error);
      // Fallback to original posts if batch summarization fails
      return posts.map(post => ({
        ...post,
        aiSummarized: false
      }));
    }
  } else {
    // No posts need summarization
    return posts.map(post => ({
      ...post,
      aiSummarized: false
    }));
  }
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
  try {
  const allText = posts.map((p) => p.text).join('\n');
  const prompt = `just reply with what is asked, nothing else. use all the text to make a newsletter about the updates, post, etc. that are present about the person. write in a first person perspective. write very short paragraphs for quick updates and keep things clean. use headings to divide everything in neat areas and return everything in html code as it needs to be embedded in mails later on. make sure the response is in plain text but html code. make dark themed with #101118 as the background color. use an appropriate color palette. add emojis to make it a lot more engaging. shorten the length of all paragraphs.\n\n${allText}`;
    
    const response = await fetch('/api/openai/summarize', {
      method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: allText,
        prompt: prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize posts with headings');
    }

    const result = await response.json();
    return result.summary || posts.map(p => p.text).join('\n\n');
  } catch (error) {
    return posts.map(p => p.text).join('\n\n');
  }
}

// Helper function to filter posts by timeline options
function filterPostsByTimeline(posts: any[], platform: string, timelineOptions?: any): any[] {
  if (!timelineOptions || !timelineOptions[platform] || !timelineOptions[platform].enabled) {
    return posts;
  }

  const options = timelineOptions[platform];
  let filteredPosts = [...posts];

  // Filter by time range
  if (options.timeRange && options.timeRange !== 'all') {
    const now = new Date();
    const timeRangeMap: { [key: string]: number } = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const timeLimit = timeRangeMap[options.timeRange];
    if (timeLimit) {
      const cutoffDate = new Date(now.getTime() - timeLimit);
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.posted);
        return postDate >= cutoffDate;
      });
    }
  }

  // Limit by post count
  if (options.postLimit && options.postLimit > 0) {
    filteredPosts = filteredPosts.slice(0, options.postLimit);
  }



  return filteredPosts;
}

// Function to process all platforms and collect data
async function processAllPlatforms(selected: any, inputs: any, timelineOptions?: any): Promise<TempData> {
  // Simple cache to avoid re-processing the same data
  const cacheKey = JSON.stringify({ selected, inputs, timelineOptions });
  if ((processAllPlatforms as any).cache && (processAllPlatforms as any).cache[cacheKey]) {
    return (processAllPlatforms as any).cache[cacheKey];
  }
  
  const tempData: TempData = {
    allImages: [],
    allText: ''
  };
  
  // Initialize cache if it doesn't exist
  if (!(processAllPlatforms as any).cache) {
    (processAllPlatforms as any).cache = {};
  }
  
        const platformProcessors = {
        twitter: async (input: string) => {
          try {
            const raw = await fetchXData(input);
            
            if (raw && Array.isArray(raw)) {
              // Filter posts more carefully - check for non-empty text and valid dates
              const posts = raw.filter(post => {
                const hasText = post.text && post.text.trim().length > 0;
                const hasDate = post.created_at && post.created_at !== 'Invalid Date';
                return hasText && hasDate;
              });
          
          const sortedPosts = posts.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
          
          // Apply timeline filtering
          const timelineFilteredPosts = filterPostsByTimeline(sortedPosts, 'twitter', timelineOptions);
          
          // Take top posts (default 3 if no timeline limit)
          const finalPosts = timelineFilteredPosts.slice(0, timelineOptions?.twitter?.postLimit || 3);
          
          // AI Summarization for Twitter posts (optimized)
          const summarizedPosts = await summarizeSocialMediaPosts(finalPosts, 'Twitter');
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
          
          console.log('X data processed:', {
            postsCount: summarizedPosts.length,
            imagesCount: images.length,
            aiSummarized: summarizedPosts.some(p => p.aiSummarized)
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
            imagesCount: images.length
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
      }
    },
    instagram: async (input: string) => {
      try {
        console.log('📸 Processing Instagram input:', input);
        const raw = await fetchInstagramData(input);
        
        if (raw && Array.isArray(raw)) {
          // Filter posts that have images and descriptions
          const posts = raw.filter(post => {
            const hasImages = post.entities?.media && post.entities.media.length > 0;
            const hasDescription = post.text && post.text.trim().length > 0;
            const hasDate = post.created_at && post.created_at !== 'Invalid Date';
            return hasImages && hasDescription && hasDate;
          });
          
          const sortedPosts = posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Apply timeline filtering
          const timelineFilteredPosts = filterPostsByTimeline(sortedPosts, 'instagram', timelineOptions);
          
          // Take top posts (default 3 if no timeline limit)
          const finalPosts = timelineFilteredPosts.slice(0, timelineOptions?.instagram?.postLimit || 3);
          
          // Always process AI for Instagram descriptions
          console.log('🤖 Starting Instagram AI summarization for descriptions...');
          const summarizedPosts = await summarizeSocialMediaPosts(finalPosts, 'Instagram');
          tempData.instagram = summarizedPosts;
          
          // Extract all images from posts
          const images = summarizedPosts.flatMap(post => {
            const postImages = post.images || [];
            console.log('📸 Instagram post images:', {
              postText: post.text?.substring(0, 50) + '...',
              imagesCount: postImages.length,
              images: postImages
            });
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'instagram',
              likes: post.likes || 0,
              comments: post.comments || 0
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += summarizedPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
          
          console.log('📸 Instagram data processed:', {
            postsCount: summarizedPosts.length,
            imagesCount: images.length,
            aiSummarized: summarizedPosts.some(p => p.aiSummarized)
          });
        } else {
          console.log('📸 Instagram: No valid data returned from API, using fallback');
          // Create fallback content with images and descriptions
          const fallbackPosts = [
            {
              text: "Behind the scenes of our latest project 📸 Excited to share the process with you all!",
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
              platform: 'instagram',
              likes: post.likes || 0,
              comments: post.comments || 0
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += fallbackPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
          
          console.log('📸 Instagram fallback data processed:', {
            postsCount: fallbackPosts.length,
            imagesCount: images.length
          });
        }
      } catch (error) {
        console.error('📸 Instagram processing error:', error);
        // Create fallback content with images and descriptions
        const fallbackPosts = [
          {
            text: "Behind the scenes of our latest project 📸 Excited to share the process with you all!",
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
            platform: 'instagram',
            likes: post.likes || 0,
            comments: post.comments || 0
          }));
        });
        tempData.allImages = [...(tempData.allImages || []), ...images];
        tempData.allText += fallbackPosts.map(p => `[Instagram] ${p.text}`).join('\n\n');
      }
    },
    youtube: async (input: string) => {
      try {
        console.log('🎬 Processing YouTube input:', input);
        const raw = await fetchYouTubeData(input);
        
        if (raw && Array.isArray(raw)) {
          // Filter posts that have subtitles/text content
          const posts = raw.filter(post => {
            const hasSubtitles = post.text && post.text.trim().length > 0;
            const hasDate = post.created_at && post.created_at !== 'Invalid Date';
            return hasSubtitles && hasDate;
          });
          
          const sortedPosts = posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Apply timeline filtering
          const timelineFilteredPosts = filterPostsByTimeline(sortedPosts, 'youtube', timelineOptions);
          
          // Take top posts (default 3 if no timeline limit)
          const finalPosts = timelineFilteredPosts.slice(0, timelineOptions?.youtube?.postLimit || 3);
          
          // Always process AI for YouTube subtitles in first person
          console.log('🤖 Starting YouTube AI summarization for subtitles...');
          const summarizedPosts = await summarizeSocialMediaPosts(finalPosts, 'YouTube');
          tempData.youtube = summarizedPosts;
          
          // Extract video thumbnails
          const images = summarizedPosts.flatMap(post => {
            const postImages = post.images || [];
            return postImages.map((img: any) => ({
              url: img.url,
              postText: post.text,
              postDate: post.posted,
              platform: 'youtube'
            }));
          });
          tempData.allImages = [...(tempData.allImages || []), ...images];
          tempData.allText += summarizedPosts.map(p => `[YouTube] ${p.text}`).join('\n\n');
          
          console.log('🎬 YouTube data processed:', {
            postsCount: summarizedPosts.length,
            imagesCount: images.length,
            aiSummarized: summarizedPosts.some(p => p.aiSummarized)
          });
        } else {
          console.log('🎬 YouTube: No valid data returned from API, using fallback');
          // Create fallback content with subtitles
          const fallbackPosts = [
            {
              text: "Just uploaded a new video! 🎬 In this video, I share my thoughts on the latest developments and what I've learned from the process.",
              posted: new Date().toISOString(),
              images: [{ url: "https://placehold.co/400x300?text=YouTube+Video" }],
              views: 1234,
              video_length: "10:30",
              url: `https://youtube.com/watch?v=sample_video_id`,
              is_video: true
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
            imagesCount: images.length
          });
        }
      } catch (error) {
        console.error('🎬 YouTube processing error:', error);
        // Create fallback content with subtitles
        const fallbackPosts = [
          {
            text: "Just uploaded a new video! 🎬 In this video, I share my thoughts on the latest developments and what I've learned from the process.",
            posted: new Date().toISOString(),
            images: [{ url: "https://placehold.co/400x300?text=YouTube+Video" }],
            views: 1234,
            video_length: "10:30",
            url: `https://youtube.com/watch?v=sample_video_id`,
            is_video: true
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
  
  // Store the result in the cache
  (processAllPlatforms as any).cache[cacheKey] = tempData;
  
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

// Helper functions for enhanced newsletter generation
async function processNewsletterData(data: TempData): Promise<TempData> {
  console.log('🔄 Processing newsletter data...');
  
  const processedData = { ...data };
  
  // Process Twitter data
  if (processedData.twitter?.length > 0) {
    processedData.twitter = processedData.twitter.map(post => ({
      ...post,
      processed: true,
      summary: post.text?.substring(0, 200) + (post.text?.length > 200 ? '...' : '')
    }));
  }
  
  // Process Instagram data
  if (processedData.instagram?.length > 0) {
    processedData.instagram = processedData.instagram.map(post => ({
      ...post,
      processed: true,
      summary: post.text?.substring(0, 200) + (post.text?.length > 200 ? '...' : '')
    }));
  }
  
  // Process YouTube data
  if (processedData.youtube?.length > 0) {
    processedData.youtube = processedData.youtube.map(video => ({
      ...video,
      processed: true,
      summary: video.text?.substring(0, 200) + (video.text?.length > 200 ? '...' : '')
    }));
  }
  
  console.log('✅ Newsletter data processed');
  return processedData;
}

function createEnhancedFallbackTemplate(templateName: string, data: TempData): string {
  const totalPosts = (data.twitter?.length || 0) + (data.instagram?.length || 0) + (data.youtube?.length || 0);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${templateName} - Newsletter</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
        }
        .content { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 { 
          color: #2d3748; 
          margin-bottom: 20px;
        }
        .stats {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .platform {
          display: inline-block;
          margin: 5px;
          padding: 5px 10px;
          background: #e2e8f0;
          border-radius: 15px;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${templateName}</h1>
        <p>Your personalized newsletter</p>
      </div>
      <div class="content">
        <h2>📊 Content Summary</h2>
        <div class="stats">
          <p><strong>${totalPosts}</strong> posts processed</p>
          ${data.twitter?.length ? `<span class="platform">Twitter: ${data.twitter.length}</span>` : ''}
          ${data.instagram?.length ? `<span class="platform">Instagram: ${data.instagram.length}</span>` : ''}
          ${data.youtube?.length ? `<span class="platform">YouTube: ${data.youtube.length}</span>` : ''}
        </div>
        <p>This is an enhanced fallback template for ${templateName}.</p>
        <p>The original template file could not be loaded, but your content has been processed successfully.</p>
        
        ${data.twitter && data.twitter.length > 0 ? `
        <h3>🐦 Latest from X (Twitter)</h3>
        ${data.twitter.map(post => `
          <div class="social-post">
            <p><strong>${new Date(post.posted).toLocaleDateString()}</strong></p>
            <p>${post.text}</p>
            ${post.url ? `<p><a href="${post.url}" target="_blank">View original post →</a></p>` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        ${data.instagram && data.instagram.length > 0 ? `
        <h3>📸 Instagram Updates</h3>
        ${data.instagram.map(post => `
          <div class="social-post">
            <p><strong>${new Date(post.posted).toLocaleDateString()}</strong></p>
            <p>${post.text}</p>
            ${post.url ? `<p><a href="${post.url}" target="_blank">View original post →</a></p>` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        ${data.youtube && data.youtube.length > 0 ? `
        <h3>📺 YouTube Highlights</h3>
        ${data.youtube.map(video => `
          <div class="social-post">
            <p><strong>${new Date(video.posted).toLocaleDateString()}</strong></p>
            <p>${video.text}</p>
            ${video.url ? `<p><a href="${video.url}" target="_blank">Watch video →</a></p>` : ''}
          </div>
        `).join('')}
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

async function generateEnhancedNewsletterContent(templateHtml: string, data: TempData, template: any): Promise<string> {
  console.log('🔄 Generating enhanced newsletter content...');
  
  let content = templateHtml;
  
  // Create structured content from collected data
  let structuredContent = '';
  
  // Add Twitter content if available
  if (data.twitter && data.twitter.length > 0) {
    structuredContent += '<h3>🐦 Latest from X (Twitter)</h3>';
    data.twitter.forEach((post, index) => {
      structuredContent += `<div class="social-post">
        <p><strong>${new Date(post.posted).toLocaleDateString()}</strong></p>
        <p>${post.text}</p>
        ${post.url ? `<p><a href="${post.url}" target="_blank">View original post →</a></p>` : ''}
      </div>`;
    });
    structuredContent += '<hr>';
  }
  
  // Add Instagram content if available
  if (data.instagram && data.instagram.length > 0) {
    structuredContent += '<h3>📸 Instagram Updates</h3>';
    data.instagram.forEach((post, index) => {
      structuredContent += `<div class="social-post">
        <p><strong>${new Date(post.posted).toLocaleDateString()}</strong></p>
        <p>${post.text}</p>
        ${post.url ? `<p><a href="${post.url}" target="_blank">View original post →</a></p>` : ''}
      </div>`;
    });
    structuredContent += '<hr>';
  }
  
  // Add YouTube content if available
  if (data.youtube && data.youtube.length > 0) {
    structuredContent += '<h3>📺 YouTube Highlights</h3>';
    data.youtube.forEach((video, index) => {
      structuredContent += `<div class="social-post">
        <p><strong>${new Date(video.posted).toLocaleDateString()}</strong></p>
        <p>${video.text}</p>
        ${video.url ? `<p><a href="${video.url}" target="_blank">Watch video →</a></p>` : ''}
      </div>`;
    });
    structuredContent += '<hr>';
  }
  
  // If no structured content, use allText as fallback
  if (!structuredContent && data.allText) {
    structuredContent = `<div class="newsletter-content">
      <p>${data.allText.substring(0, 1000)}</p>
    </div>`;
  }
  
  // Replace common placeholders in templates
  content = content.replace(/Lorem ipsum dolor sit amet/g, structuredContent);
  content = content.replace(/\[NEWSLETTER_CONTENT\]/g, structuredContent);
  content = content.replace(/\[SOCIAL_MEDIA_CONTENT\]/g, structuredContent);
  
  console.log('✅ Enhanced newsletter content generated');
  return content;
}

function extractCSSFromTemplate(templateHtml: string): string {
  // Extract CSS from <style> tags
  const styleMatch = templateHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return styleMatch ? styleMatch[1] : '';
}

// Function to replace sections in the cleaned newsletter template
const replaceNewsletterSections = (templateHtml: string, summaries: { [platform: string]: string[] }, images: Array<{url: string, postText: string, postDate: string, platform: string, likes?: number, comments?: number}>): string => {
  console.log('🔧 replaceNewsletterSections called with:');
  console.log('  - Template HTML length:', templateHtml.length);
  console.log('  - Summaries:', Object.keys(summaries).map(p => `${p}: ${summaries[p].length}`));
  console.log('  - Images:', images.length);
  
  let modifiedHtml = templateHtml;
  
  // Replace YouTube section
  if (summaries.youtube && summaries.youtube.length > 0) {
    const youtubeContent = summaries.youtube.join('\n\n');
    console.log('📺 Replacing YouTube section with:', youtubeContent.length, 'characters');
    modifiedHtml = modifiedHtml.replace(
      'REPLACE THIS TEXT FOR YOUTUBE SUMMARY',
      youtubeContent
    );
  } else {
    console.log('📺 No YouTube data, hiding section');
    // Hide YouTube section if no data
    const youtubeSectionRegex = /<!-- SECTION: YouTube -->[\s\S]*?<!-- SECTION: X \(formerly Twitter\) -->/;
    modifiedHtml = modifiedHtml.replace(youtubeSectionRegex, '<!-- SECTION: X (formerly Twitter) -->');
  }
  
  // Replace X (Twitter) section
  if (summaries.twitter && summaries.twitter.length > 0) {
    const twitterContent = summaries.twitter.join('\n\n');
    console.log('🐦 Replacing X section with:', twitterContent.length, 'characters');
    modifiedHtml = modifiedHtml.replace(
      'REPLACE THIS TEXT FOR X SUMMARY',
      twitterContent
    );
  } else {
    console.log('🐦 No X data, hiding section');
    // Hide X section if no data
    const xSectionRegex = /<!-- SECTION: X \(formerly Twitter\) -->[\s\S]*?<!-- SECTION: Instagram -->/;
    modifiedHtml = modifiedHtml.replace(xSectionRegex, '<!-- SECTION: Instagram -->');
  }
  
  // Replace Instagram section
  if (summaries.instagram && summaries.instagram.length > 0) {
    const instagramContent = summaries.instagram.join('\n\n');
    console.log('📸 Replacing Instagram section with:', instagramContent.length, 'characters');
    modifiedHtml = modifiedHtml.replace(
      'REPLACE THIS TEXT FOR INSTAGRAM SUMMARY',
      instagramContent
    );
  } else {
    console.log('📸 No Instagram data, hiding section');
    // Hide Instagram section if no data
    const instagramSectionRegex = /<!-- SECTION: Instagram -->[\s\S]*?<!-- SECTION: Content Placeholder -->/;
    modifiedHtml = modifiedHtml.replace(instagramSectionRegex, '<!-- SECTION: Content Placeholder -->');
  }
  
  // Replace images section with Instagram collage
  const instagramImages = images.filter(img => img.platform === 'instagram');
  console.log('📸 All images received:', images.length);
  console.log('📸 Instagram images filtered:', instagramImages.length);
  console.log('📸 Instagram image details:', instagramImages.map(img => ({
    url: img.url,
    postText: img.postText?.substring(0, 30) + '...',
    platform: img.platform
  })));
  
  if (instagramImages.length > 0) {
    console.log('📸 Creating Instagram collage with:', instagramImages.length, 'images');
    
    // Create a beautiful Instagram collage HTML
    const collageHtml = `
      <div style="margin: 2rem 0;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: bold; color: #1a1a1a; margin-bottom: 0.5rem;">Instagram Highlights</h2>
          <p style="color: #666; font-size: 0.9rem;">A glimpse into my visual journey</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; max-width: 100%;">
          ${instagramImages.map((image, index) => `
            <div style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
              <img 
                src="${image.url}" 
                alt="${image.postText ? image.postText.substring(0, 50) : 'Instagram post'}"
                style="width: 100%; height: 200px; object-fit: cover;"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div style="display: none; width: 100%; height: 200px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); align-items: center; justify-content: center;">
                <span style="color: white; font-size: 2rem;">📸</span>
              </div>
              
              ${image.postText ? `
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 1rem; color: white;">
                  <p style="font-size: 0.8rem; margin: 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${image.postText}
                  </p>
                  ${image.postDate ? `
                    <p style="font-size: 0.7rem; margin: 0.5rem 0 0 0; opacity: 0.8;">
                      ${new Date(image.postDate).toLocaleDateString()}
                    </p>
                  ` : ''}
                </div>
              ` : ''}
              
              <div style="position: absolute; top: 0.5rem; right: 0.5rem;">
                <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 12px; font-weight: 500;">
                  Instagram
                </span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 1.5rem; color: #666; font-size: 0.8rem;">
          <span style="margin: 0 1rem;">📸 ${instagramImages.length} posts</span>
          <span style="margin: 0 1rem;">❤️ ${instagramImages.reduce((sum, img) => sum + (img.likes || 0), 0)} total likes</span>
          <span style="margin: 0 1rem;">💬 ${instagramImages.reduce((sum, img) => sum + (img.comments || 0), 0)} total comments</span>
        </div>
      </div>
    `;
    
    modifiedHtml = modifiedHtml.replace(
      '<!-- SECTION: IMAGES HERE -->',
      collageHtml
    );
  } else {
    console.log('📸 No Instagram images, showing placeholder');
    // Hide images section if no images
    modifiedHtml = modifiedHtml.replace(
      '<!-- SECTION: IMAGES HERE -->',
      '<p style="text-align: center; color: #666;">No Instagram images available</p>'
    );
  }
  
  return modifiedHtml;
};

export default function NewsletterBuilder() {

  const navigate = useNavigate();
  const smoothNavigate = useSmoothNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');
  
  // Simple cache to avoid re-processing
  const [dataCache, setDataCache] = useState<{[key: string]: any}>({});
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

  // Timeline options for each platform
  const [timelineOptions, setTimelineOptions] = useState({
    twitter: {
      timeRange: '7d', // 1d, 7d, 30d, 90d, all
      postLimit: 10, // 1, 5, 10, 20, 50, 100
      enabled: false
    },
    instagram: {
      timeRange: '7d',
      postLimit: 10,
      enabled: false
    },
    youtube: {
      timeRange: '30d',
      postLimit: 5,
      enabled: false
    }
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

  // Test template loading on mount (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🧪 Development mode detected, testing template loading...');
      testTemplateLoading().catch(console.error);
    }
  }, []);

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

  // New function for step-by-step processing
  const processSocialMediaStepByStep = async (selected: any, inputs: any, timelineOptions?: any): Promise<{
    summaries: { [platform: string]: string[] };
    images: Array<{url: string, postText: string, postDate: string, platform: string, likes?: number, comments?: number}>;
    processingTime: number;
  }> => {
    const startTime = Date.now();
    const summaries: { [platform: string]: string[] } = {};
    const images: Array<{url: string, postText: string, postDate: string, platform: string, likes?: number, comments?: number}> = [];
    
    console.log('🚀 Starting step-by-step social media processing...');
    
    // Process each platform one by one
    const platforms = ['twitter', 'instagram', 'youtube'];
    
    for (const platform of platforms) {
      if (!selected[platform] || !inputs[platform]) {
        console.log(`⏭️ Skipping ${platform}: not selected or no input`);
        continue;
      }
      
      console.log(`📱 Processing ${platform}...`);
      setGenerationStep(`Processing ${platform} data...`);
      setGenerationProgress(20 + (platforms.indexOf(platform) * 15)); // 20, 35, 50
      
      try {
        let platformData: any[] = [];
        
        // Fetch data based on platform
        switch (platform) {
          case 'twitter':
            const twitterData = await fetchXData(inputs.twitter);
            if (twitterData && Array.isArray(twitterData)) {
              platformData = twitterData;
            }
            break;
            
          case 'instagram':
            const instagramData = await fetchInstagramData(inputs.instagram);
            if (instagramData && Array.isArray(instagramData)) {
              platformData = instagramData;
            }
            break;
            
          case 'youtube':
            const youtubeData = await fetchYouTubeData(inputs.youtube);
            if (youtubeData && Array.isArray(youtubeData)) {
              platformData = youtubeData;
            }
            break;
        }
        
        if (platformData.length === 0) {
          console.log(`⚠️ No data found for ${platform}`);
          summaries[platform] = [];
          continue;
        }
        
        // Filter by timeline if specified
        if (timelineOptions && timelineOptions[platform]) {
          platformData = filterPostsByTimeline(platformData, platform, timelineOptions[platform]);
        }
        
        console.log(`📊 Found ${platformData.length} posts for ${platform}`);
        
        // Extract images from API content only
        platformData.forEach(post => {
          console.log(`📸 Processing ${platform} post:`, {
            hasImages: !!post.images,
            imagesLength: post.images?.length || 0,
            images: post.images,
            text: post.text?.substring(0, 50) + '...'
          });
          
          if (post.images && post.images.length > 0) {
            post.images.forEach((image: any) => {
              // Handle both string URLs and image objects
              const imageUrl = typeof image === 'string' ? image : image.url;
              console.log(`📸 Image object:`, image, `Extracted URL:`, imageUrl);
              
              if (imageUrl) {
                images.push({
                  url: imageUrl,
                  postText: post.text || '',
                  postDate: post.created_at || '',
                  platform: platform,
                  likes: post.favorite_count || 0,
                  comments: post.reply_count || 0
                });
                console.log(`✅ Added image to collection:`, imageUrl);
              } else {
                console.log(`❌ No valid URL found for image:`, image);
              }
            });
          } else {
            console.log(`⚠️ No images found in ${platform} post`);
          }
        });
        
        // Summarize posts one by one
        setGenerationStep(`Summarizing ${platform} content...`);
        setGenerationProgress(50 + (platforms.indexOf(platform) * 10)); // 50, 60, 70
        const platformSummaries: string[] = [];
        
        for (let i = 0; i < platformData.length; i++) {
          const post = platformData[i];
          if (post.text && post.text.trim().length > 10) {
            try {
              const summary = await summarizeText(post.text);
              platformSummaries.push(summary);
              console.log(`✅ Summarized ${platform} post ${i + 1}/${platformData.length}`);
            } catch (error) {
              console.error(`❌ Failed to summarize ${platform} post ${i + 1}:`, error);
              platformSummaries.push(post.text); // Use original text as fallback
            }
          } else {
            platformSummaries.push(post.text || '');
          }
        }
        
        summaries[platform] = platformSummaries;
        console.log(`✅ Completed ${platform}: ${platformSummaries.length} summaries`);
        
      } catch (error) {
        console.error(`❌ Error processing ${platform}:`, error);
        summaries[platform] = [];
      }
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Total processing time: ${processingTime}ms`);
    console.log(`📊 Final summaries:`, Object.keys(summaries).map(p => `${p}: ${summaries[p].length}`));
    
    return { summaries, images, processingTime };
  };
  
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

  // Handle timeline option changes
  const handleTimelineOption = (platform: string, option: string, value: string | number) => {
    setTimelineOptions(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [option]: value
      }
    }));
  };

  // Toggle timeline options for a platform
  const toggleTimelineOptions = (platform: string) => {
    setTimelineOptions(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        enabled: !prev[platform as keyof typeof prev].enabled
      }
    }));
  };

  // Generate cache key for data
  const generateCacheKey = (platform: string, input: string, timelineOptions: any) => {
    const options = timelineOptions[platform];
    return `${platform}_${input}_${options?.timeRange || 'all'}_${options?.postLimit || 10}`;
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
            // Validate YouTube channel name format - accept @username, username, or YouTube URLs
            const cleanInput = input.trim();
            const isChannelName = /^[a-zA-Z0-9._-]+$/.test(cleanInput.replace('@', ''));
            const isYouTubeUrl = cleanInput.includes('youtube.com/');
            const hasAtSymbol = cleanInput.startsWith('@');
            
            if (!isChannelName && !isYouTubeUrl && !hasAtSymbol) {
              errors[social.key] = 'Enter a valid YouTube channel name (e.g., @username, username, or YouTube URL)';
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

    // API calls are now handled server-side, no need to validate keys on frontend
    console.log('✅ API calls handled server-side');

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
        // Use new step-by-step processing
        console.log('🚀 Starting step-by-step processing...');
        setGenerationProgress(10);
        setGenerationStep('Initializing data collection...');
        
        const { summaries, images, processingTime } = await processSocialMediaStepByStep(selected, inputs, timelineOptions);
        
        console.log('✅ Step-by-step processing completed:', {
          platforms: Object.keys(summaries).filter(p => summaries[p].length > 0),
          totalSummaries: Object.values(summaries).flat().length,
          totalImages: images.length,
          processingTime: `${processingTime}ms`
        });
        
        // Create temp data structure for compatibility
        const tempData: TempData = {
          allImages: images,
          allText: Object.values(summaries).flat().join('\n\n'),
          twitter: (summaries.twitter || []).map(text => ({ text })),
          instagram: (summaries.instagram || []).map(text => ({ text })),
          youtube: (summaries.youtube || []).map(text => ({ text }))
        };
        
        setTempData(tempData);
        setCollectedData(tempData);
        setShowTemplateSelection(true);
        setLoading(false);
        setIsTemplateSelectionPhase(false);
        
        console.log('🎯 Template selection ready!');
        console.log('showTemplateSelection:', true);
        console.log('collectedData keys:', Object.keys(tempData));

      } catch (error: any) {
        console.error('Newsletter generation error:', error);
        const errorMessage = error.message || "Unknown error";
        setError(errorMessage);
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

  // Enhanced success handling
  const handleNewsletterSuccess = (newsletterData: any) => {
    console.log('🎉 Newsletter generated successfully!');
    
    // Show success message
    const successMessage = `Newsletter generated successfully! Processed ${newsletterData.metadata?.totalPosts || 0} posts from ${newsletterData.metadata?.platforms?.length || 0} platforms.`;
    
    // You can add a toast notification here if you have a toast system
    console.log(successMessage);
    
    // Log analytics
    logger.info('Newsletter generation completed successfully', {
      template: newsletterData.metadata?.template,
      platforms: newsletterData.metadata?.platforms,
      totalPosts: newsletterData.metadata?.totalPosts,
      contentLength: newsletterData.rawContent?.length || 0
    });
  };

  // Enhanced error handling
  const handleNewsletterError = (error: any) => {
    console.error('❌ Newsletter generation failed:', error);
    
    // Enhanced error messages
    let userFriendlyError = "Something went wrong while generating your newsletter.";
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userFriendlyError = "Network connection issue. Please check your internet and try again.";
    } else if (error.message?.includes('template')) {
      userFriendlyError = "Template loading failed. Please try a different template.";
    } else if (error.message?.includes('API')) {
      userFriendlyError = "API service temporarily unavailable. Please try again in a few minutes.";
    } else if (error.message?.includes('rate limit')) {
      userFriendlyError = "Too many requests. Please wait a moment and try again.";
    }
    
    setError(userFriendlyError);
    
         // Log error for debugging
     console.error('Newsletter generation failed:', {
       errorMessage: error.message,
       stack: error.stack
     });
  };

  // Function to generate newsletter with OpenAI after template selection
  // TEMPORARY DEVELOPMENT FUNCTION: Uses templates directly without OpenAI
  // This bypasses OpenAI API calls and loads template HTML exactly as-is
  const generateNewsletterWithTemplate = async (templateId: string, data: TempData) => {
    console.log('🚀 Starting newsletter generation with template...');
    console.log('📊 Template ID:', templateId);
    console.log('📊 Data keys:', Object.keys(data));
    
    try {
      // More accurate progress tracking
      setGenerationProgress(10);
      setGenerationStep('Initializing newsletter generation...');
      
      // Get the template
      const template = NEWSLETTER_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      console.log('📄 Template found:', template.name);
      
      setGenerationProgress(25);
      setGenerationStep('Processing social media data...');
      
      // Process and enhance the data (simplified for performance)
      const processedData = data; // Skip additional processing for now
      
      setGenerationProgress(40);
      setGenerationStep('Loading template HTML...');
      
      // Load template HTML
      let templateHtml;
      try {
        templateHtml = await loadTemplateHTML(template);
        console.log('📄 Template HTML loaded successfully, length:', templateHtml.length);
      } catch (loadError) {
        console.error('❌ Failed to load template HTML:', loadError);
        console.log('📄 Using fallback template due to template loading failure');
        // Use our new fallback template
        templateHtml = getFallbackTemplate({
          authorName: 'Your',
          templateName: template.name
        });
        console.log('📄 Fallback template loaded, length:', templateHtml.length);
      }
      
      setGenerationProgress(55);
      setGenerationStep('Replacing newsletter sections...');
      
      // Use new section replacement logic for cleaned newsletter
      let newsletterContent;
      if (templateId === 'cleaned_newsletter') {
        // Convert data to summaries format - extract text from objects
        const summaries = {
          twitter: (processedData.twitter || []).map(post => post.text || '').filter(text => text.length > 0),
          instagram: (processedData.instagram || []).map(post => post.text || '').filter(text => text.length > 0),
          youtube: (processedData.youtube || []).map(post => post.text || '').filter(text => text.length > 0)
        };
        
        console.log('📊 Data conversion for newsletter sections:');
        console.log('  - Twitter summaries:', summaries.twitter.length);
        console.log('  - Instagram summaries:', summaries.instagram.length);
        console.log('  - YouTube summaries:', summaries.youtube.length);
        console.log('  - Images:', processedData.allImages?.length || 0);
        
        newsletterContent = replaceNewsletterSections(templateHtml, summaries, processedData.allImages || []);
        console.log('✅ Sections replaced for cleaned newsletter');
      } else {
        // Fallback to old method for other templates
        newsletterContent = await generateEnhancedNewsletterContent(templateHtml, processedData, template);
      }
      
      setGenerationProgress(75);
      setGenerationStep('Applying styling and formatting...');
      
      // Create enhanced newsletter data structure
      const newsletterData = {
        sections: [
          {
            title: "Newsletter Content",
            icon: "📰",
            content: newsletterContent
          }
        ],
        rawContent: newsletterContent,
        editedContent: newsletterContent,
        css: extractCSSFromTemplate(templateHtml),
        error: undefined,
        youtubeSummaries: processedData.youtubeSummaries || {},
        metadata: {
          template: template.name,
          generatedAt: new Date().toISOString(),
          platforms: Object.keys(processedData).filter(key => 
            ['twitter', 'instagram', 'youtube'].includes(key) && processedData[key]?.length > 0
          ),
          totalPosts: (processedData.twitter?.length || 0) + 
                     (processedData.instagram?.length || 0) + 
                     (processedData.youtube?.length || 0)
        }
      };
      
      setGenerationProgress(95);
      setGenerationStep('Finalizing newsletter...');
      
      setGenerationProgress(100);
      setGenerationStep('Complete!');
      
      console.log('✅ Newsletter generated successfully');
      console.log('📊 Metadata:', newsletterData.metadata);
      
      // Set the newsletter data
      setNewsletter(newsletterData);
      setNewsletterData(processedData);
      logger.info('Newsletter generated successfully', {
        platformsUsed: Object.keys(selected).filter(key => selected[key]),
        totalPosts: Object.values(processedData).filter(Array.isArray).flat().length
      });
      
      // Clear temp data after successful generation
      setTempData({});
      
      // Update loading states to show the newsletter
      setLoading(false);
      setShowLoadingPage(false);
      setShowTemplateSelection(false);
      setGenerationProgress(0);
      setGenerationStep('');
      
      handleNewsletterSuccess(newsletterData);
      
    } catch (error: any) {
      console.error('❌ Newsletter generation error:', error);
      
      // Enhanced error handling
      const errorMessage = error.message || "Failed to generate newsletter";
      const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
      const isTemplateError = error.message?.includes('template');
      
      let userFriendlyError = "Something went wrong while generating your newsletter.";
      
      if (isNetworkError) {
        userFriendlyError = "Network connection issue. Please check your internet and try again.";
      } else if (isTemplateError) {
        userFriendlyError = "Template loading failed. Please try a different template.";
      } else if (error.message?.includes('API')) {
        userFriendlyError = "API service temporarily unavailable. Please try again in a few minutes.";
      }
      
      setError(userFriendlyError);
      setLoading(false);
      setShowLoadingPage(false);
      setGenerationProgress(0);
      setGenerationStep('');
      
      console.error('Newsletter generation failed:', {
        errorMessage: error.message,
        stack: error.stack,
        templateId,
        dataKeys: Object.keys(data)
      });
      
      handleNewsletterError(error);
    }
  };

  const generateNewsletterWithOpenAI = async (templateId: string, data: TempData) => {
    console.log('🚀 Starting newsletter generation with OpenAI...');
    console.log('📊 Template ID:', templateId);
    console.log('📊 Data keys:', Object.keys(data));
    
    try {
      
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
          const response = await fetch('/api/openai/summarize', {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              content: sectionPrompt,
              prompt: `You are a newsletter section editor. Populate section ${sectionNumber} with social media data. Return ONLY the complete HTML document. Exchange ${exchangeCount + 1}/${maxExchanges}.`
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

  // AI summarization logic
  const processAISummarization = async (platform: string, posts: any[]) => {
    if (!posts || posts.length === 0) return posts;

    const totalPosts = posts.length;
    const totalLength = posts.reduce((sum, post) => sum + (post.text?.length || 0), 0);
    const averagePostLength = totalLength / totalPosts;

    // Skip AI summarization if content is too short or too long
    if (totalPosts > 10) {
      return posts.slice(0, 10);
    }

    if (averagePostLength < 50) {
      return posts;
    }

    if (posts.length === 0) {
      return posts;
    }

    try {
      const response = await fetch('/api/openai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          posts: posts.slice(0, 5), // Limit to 5 posts for summarization
          maxSummaries: 3
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to summarize ${platform} posts`);
      }

      const data = await response.json();
      const finalPosts = data.summaries || posts;

      return finalPosts;
    } catch (error) {
      console.error(`Error summarizing ${platform} posts:`, error);
      return posts;
    }
  };

  return (
    <div className="h-screen sm:min-h-screen bg-white relative page-transition overflow-hidden">
      {showLoadingPage ? (
        // Loading Page - Show dedicated loading screen with custom loader
        <Loader progress={generationProgress} step={generationStep} />
      ) : showTemplateSelection ? (
        // Template Selection Phase - Hide form, show only template selection
        <div className="h-screen sm:min-h-screen bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto">

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
            
                        <CardCarousel className="mb-6 px-4 py-4">
              {(() => {
                console.log('📋 Rendering templates:', NEWSLETTER_TEMPLATES.length, 'templates available');
                return NEWSLETTER_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => template.enabled && setSelectedTemplate(template.id)}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-500 ease-in-out transform hover:scale-102 ${
                    template.enabled 
                      ? `cursor-pointer ${
                          selectedTemplate === template.id
                            ? 'border-black bg-gray-50 shadow-xl scale-105'
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-lg hover:-translate-y-1'
                        }`
                      : 'cursor-not-allowed opacity-60 border-gray-300'
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
                      {template.enabled ? (
                        <>
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
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-base sm:text-lg">Coming Soon</span>
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
              {/* Back button on left */}
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
              
              {/* Generate Newsletter button on right */}
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
                  
                  {/* Gmail Sender Component */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <GmailSender 
                      newsletterHtml={newsletter?.rawContent || ''}
                      onSendComplete={(success) => {
                        if (success) {
                          console.log('✅ Newsletter sent successfully via Gmail');
                        } else {
                          console.log('❌ Failed to send newsletter via Gmail');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              

                      </div>
                      

            
          </div>
        </div>
      ) : (
        // Newsletter Builder Form - Only show when NOT selecting templates
        <div className="h-screen sm:min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 transition-all duration-500 ease-in-out overflow-y-auto">
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
            {/* Admin Bypass Indicator */}
            {adminBypass === 'bypass' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Bypass Active</span>
                </div>
                <p className="text-xs text-blue-600 text-center mt-1">
                  Direct access granted via admin dashboard
                </p>
              </div>
            )}
            
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
                        
                        {/* Timeline Options */}
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTimelineOptions(s.key)}
                            className="text-xs h-6 px-2"
                          >
                            {timelineOptions[s.key as keyof typeof timelineOptions]?.enabled ? '⚙️' : '⚙️'} Timeline
                          </Button>
                          
                          {timelineOptions[s.key as keyof typeof timelineOptions]?.enabled && (
                            <div className="flex items-center gap-1 text-xs">
                              <select
                                value={timelineOptions[s.key as keyof typeof timelineOptions]?.timeRange || '7d'}
                                onChange={(e) => handleTimelineOption(s.key, 'timeRange', e.target.value)}
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                                disabled={loading}
                              >
                                <option value="1d">1 day</option>
                                <option value="7d">7 days</option>
                                <option value="30d">30 days</option>
                                <option value="90d">90 days</option>
                                <option value="all">All time</option>
                              </select>
                              
                              <span className="text-gray-500">•</span>
                              
                              <select
                                value={timelineOptions[s.key as keyof typeof timelineOptions]?.postLimit || 10}
                                onChange={(e) => handleTimelineOption(s.key, 'postLimit', parseInt(e.target.value))}
                                className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                                disabled={loading}
                              >
                                <option value="1">1 post</option>
                                <option value="5">5 posts</option>
                                <option value="10">10 posts</option>
                                <option value="20">20 posts</option>
                                <option value="50">50 posts</option>
                                <option value="100">100 posts</option>
                              </select>
                      </div>
                          )}
                        </div>
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