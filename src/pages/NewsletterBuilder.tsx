import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { GmailConnect } from "@/components/GmailConnect";

const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username (public profile)", disabled: false },
  { key: "twitter", label: "X", placeholder: "@yourhandle or https://twitter.com/yourhandle", disabled: false },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourprofile", disabled: false },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", disabled: false },
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
  const [loading, setLoading] = useState(false);
  const [newsletter, setNewsletter] = useState<string | null>(null);
  const [newsletterData, setNewsletterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNewsletter(null);
    setError(null);
    try {
      const links = SOCIALS.filter((s) => selected[s.key as keyof typeof selected] && inputs[s.key as keyof typeof inputs])
        .map((s) => inputs[s.key as keyof typeof inputs]);
      if (links.length === 0) throw new Error("Please provide at least one social link.");
      
      // Use Supabase Edge Functions
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.functions.invoke('scrape-socials', {
        body: { links, timeRange: "week" }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to fetch newsletter");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setNewsletter(data.newsletter);
      setNewsletterData(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
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
      <Card className="max-w-2xl w-full p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Build Your Weekly Newsletter</h2>
        <div className="mb-4 p-3 bg-accent/10 dark:bg-accent/15 rounded-lg border border-accent/20 dark:border-accent/25">
          <p className="text-sm text-foreground mb-2">
            <strong>Enhanced: Multi-Platform Analysis!</strong> 
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Instagram: Deep post analysis with engagement data and high-quality images</li>
            <li>• YouTube: Latest video thumbnails and titles with detailed descriptions</li>
            <li>• LinkedIn: Professional profile data and experience via RapidAPI</li>
            <li>• X (Twitter): Latest tweets and thoughts via RapidAPI</li>
            <li>• AI summarizes content with platform-specific context</li>
          </ul>
        </div>
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
                  <Input
                    type="text"
                    className="flex-1"
                    value={inputs[s.key as keyof typeof inputs]}
                    onChange={e => handleInput(s.key, e.target.value)}
                    placeholder={s.placeholder}
                    disabled={loading}
                  />
                </div>
              )
            )}
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Generating..." : "Generate Newsletter"}
          </Button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>
      <Card className="max-w-2xl w-full p-8 min-h-[300px] shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground animate-pulse">Processing your social links...</span>
          </div>
        ) : newsletter ? (
          <div className="space-y-6">
            {/* Newsletter Summary with Side-by-side Images */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Newsletter Summary</h3>
              
              {/* Summary and Images Layout */}
              <div className="flex gap-8">
                {/* Summary Text */}
                <div className="flex-1">
                  <div className="text-foreground leading-relaxed text-justify space-y-4">
                    {newsletter.split('\n\n').map((paragraph, index) => (
                      <div key={index} className="mb-4">
                        {paragraph.startsWith('**') ? (
                          // Platform-specific paragraph with bold header
                          <div>
                            <div className="font-semibold text-foreground mb-2">
                              {paragraph.split('**: ')[0].replace('**', '')}
                            </div>
                            <p className="text-foreground">
                              {paragraph.split('**: ')[1]}
                            </p>
                          </div>
                        ) : (
                          // Regular paragraph
                          <p>{paragraph}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                                  {/* Social Media Highlights */}
                <div className="flex-shrink-0 w-80">
                  {/* X (Twitter) Latest Post */}
                  {newsletterData && newsletterData.some((post: any) => 
                    post.platform === "Twitter" && 
                    post.thumbnail && 
                    post.thumbnail !== "https://placehold.co/120x120?text=TW" &&
                    !post.thumbnail.includes('data:image/svg') &&
                    !post.thumbnail.includes('placeholder') &&
                    post.thumbnail.length > 10
                  ) && (
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Latest X Post</h4>
                      <div className="flex justify-center">
                        {newsletterData
                          .filter((post: any) => 
                            post.platform === "Twitter" && 
                            post.thumbnail && 
                            post.thumbnail !== "https://placehold.co/120x120?text=TW" &&
                            !post.thumbnail.includes('data:image/svg') &&
                            !post.thumbnail.includes('placeholder') &&
                            !post.thumbnail.includes('placehold.co') &&
                            post.thumbnail.length > 10
                          )
                          .slice(0, 1) // Show only the latest post
                          .map((post: any, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={post.thumbnail} 
                                alt={post.title || "X post"}
                                className="w-48 h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Hover overlay with platform badge */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-end justify-start p-2">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded block mb-1">
                                    X
                                  </span>
                                  <div className="text-xs text-white bg-primary/80 px-2 py-1 rounded block max-w-40">
                                    <div className="line-clamp-2 text-xs leading-tight">
                                      {post.title}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Latest Post */}
                  {newsletterData && newsletterData.some((post: any) => 
                    post.platform === "LinkedIn" && 
                    post.thumbnail && 
                    post.thumbnail !== "https://placehold.co/120x120?text=LI" &&
                    !post.thumbnail.includes('data:image/svg') &&
                    !post.thumbnail.includes('placeholder') &&
                    post.thumbnail.length > 10
                  ) && (
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Latest LinkedIn Post</h4>
                      <div className="flex justify-center">
                        {newsletterData
                          .filter((post: any) => 
                            post.platform === "LinkedIn" && 
                            post.thumbnail && 
                            post.thumbnail !== "https://placehold.co/120x120?text=LI" &&
                            !post.thumbnail.includes('data:image/svg') &&
                            !post.thumbnail.includes('placeholder') &&
                            !post.thumbnail.includes('placehold.co') &&
                            post.thumbnail.length > 10
                          )
                          .slice(0, 1) // Show only the latest post
                          .map((post: any, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={post.thumbnail} 
                                alt={post.title || "LinkedIn post"}
                                className="w-48 h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Hover overlay with platform badge */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-end justify-start p-2">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded block mb-1">
                                    LI
                                  </span>
                                  <div className="text-xs text-white bg-primary/80 px-2 py-1 rounded block max-w-40">
                                    <div className="line-clamp-2 text-xs leading-tight">
                                      {post.title}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Instagram Latest Image */}
                  {newsletterData && newsletterData.some((post: any) => 
                    post.platform === "Instagram" && 
                    post.thumbnail && 
                    post.thumbnail !== "https://placehold.co/120x120?text=IG" &&
                    !post.thumbnail.includes('data:image/svg') &&
                    !post.thumbnail.includes('placeholder') &&
                    post.thumbnail.length > 10
                  ) && (
                    <div className="mb-8">
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">Latest Instagram Post</h4>
                      <div className="flex justify-center">
                        {newsletterData
                          .filter((post: any) => 
                            post.platform === "Instagram" && 
                            post.thumbnail && 
                            post.thumbnail !== "https://placehold.co/120x120?text=IG" &&
                            !post.thumbnail.includes('data:image/svg') &&
                            !post.thumbnail.includes('placeholder') &&
                            !post.thumbnail.includes('placehold.co') &&
                            post.thumbnail.length > 10
                          )
                          .slice(0, 1) // Show only the latest image
                          .map((post: any, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={post.thumbnail} 
                                alt={post.title || "Instagram post"}
                                className="w-48 h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Hover overlay with platform badge and engagement info */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-end justify-start p-2">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded block mb-1">
                                    IG
                                  </span>
                                  {post.likes && (
                                                                      <span className="text-xs text-white bg-primary/80 px-2 py-1 rounded block">
                                    {post.likes}
                                  </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube Videos Grid */}
                  {newsletterData && newsletterData.some((post: any) => 
                    post.platform === "YouTube" && 
                    post.thumbnail && 
                    post.thumbnail !== "https://placehold.co/120x120?text=YT" &&
                    !post.thumbnail.includes('data:image/svg') &&
                    !post.thumbnail.includes('placeholder') &&
                    post.thumbnail.length > 10
                  ) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-4">YouTube Latest</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {newsletterData
                          .filter((post: any) => 
                            post.platform === "YouTube" && 
                            post.thumbnail && 
                            post.thumbnail !== "https://placehold.co/120x120?text=YT" &&
                            !post.thumbnail.includes('data:image/svg') &&
                            !post.thumbnail.includes('placeholder') &&
                            !post.thumbnail.includes('placehold.co') &&
                            post.thumbnail.length > 10
                          )
                          .slice(0, 4) // Show up to 4 videos
                          .map((post: any, index: number) => (
                            <div key={index} className="relative group">
                              <img 
                                src={post.thumbnail} 
                                alt={post.title || "YouTube video"}
                                className="w-36 h-36 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {/* Video title overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-end justify-start p-2">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded block mb-1">
                                    YT
                                  </span>
                                  <div className="text-xs text-white bg-primary/80 px-2 py-1 rounded block max-w-32">
                                    <div className="line-clamp-2 text-xs leading-tight">
                                      {post.title}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-muted-foreground">Your generated newsletter will appear here.</span>
          </div>
        )}
      </Card>
      
      {/* Gmail Integration */}
      {newsletter && (
        <div className="max-w-2xl w-full mt-8">
          <GmailConnect 
            newsletterContent={newsletter}
            newsletterTitle="Weekly Newsletter"
          />
        </div>
      )}
    </div>
  );
} 