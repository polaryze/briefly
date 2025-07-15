import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SOCIALS = [
  { key: "twitter", label: "Twitter", placeholder: "@alexkumar", default: "@alexkumar" },
  { key: "instagram", label: "Instagram", placeholder: "@alex.gram", default: "@alex.gram" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/alexkumar", default: "https://linkedin.com/in/alexkumar" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@alexkumar", default: "https://youtube.com/@alexkumar" },
];

const TIME_RANGES = [
  { label: "Past week", value: "week" },
  { label: "Past month", value: "month" },
];

// Clean Example Newsletter Renderer (no debug panels, no back buttons)
const ExampleNewsletterRenderer = ({ newsletterData, posts }: { newsletterData: any; posts: any[] }) => {
  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="mb-10 bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 tracking-tight">
        <span className="text-3xl">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7f7fa] py-12 px-2 md:px-4">
      <article className="prose prose-neutral max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-gray-200 notion-style overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-8 flex flex-col gap-2 border-b border-gray-200">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight leading-tight text-gray-900">Alex's Weekly Recap <span className="text-2xl font-normal text-gray-500">(July 7, 2025)</span></h1>
          <div className="flex items-center gap-4 text-base text-gray-700 opacity-90 mb-2">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex Kumar" className="w-10 h-10 rounded-full border-2 border-gray-200" />
            <span className="font-medium">by Alex Kumar</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">Week 27, 2025</span>
          </div>
          <div className="text-lg mt-1 opacity-90 font-light text-gray-700">Hey friends! Here's what I've been up to this week as a creator, entrepreneur, and engineer. Thanks for following along on my journey!</div>
        </header>
        
        {/* Hero Image */}
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Newsletter Hero" className="w-full h-60 object-cover" />
        
        <main className="px-6 md:px-10 py-10">
          {newsletterData.sections?.map((section: any, index: number) => (
            <Section key={index} title={section.title} icon={section.icon}>
              <div 
                className="text-gray-700 prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </Section>
          ))}
          
          {/* Social Media Highlights */}
          {posts && posts.length > 0 && (
            <Section title="Social Media Highlights" icon="📱">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {posts.slice(0, 8).map((post: any, index: number) => (
                  <div key={index} className="relative group">
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title || "Social media post"}
                        className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">{post.platform}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-end justify-start p-2">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-white bg-blue-600/80 px-2 py-1 rounded block mb-1">
                          {post.platform}
                        </span>
                        <div className="text-xs text-white bg-blue-600/80 px-2 py-1 rounded block max-w-32">
                          <div className="line-clamp-2 text-xs leading-tight">
                            {post.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Footer CTA */}
          <div className="text-center mt-8 mb-2">
            <a href="#" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition">Reply & let me know what you're working on! →</a>
          </div>
          <div className="text-center text-xs text-gray-400 mb-2">© 2025 Alex Kumar. Thanks for reading!</div>
        </main>
      </article>
    </div>
  );
};

const NewsletterPreview = () => {
  const [name, setName] = useState("Alex Kumar");
  const [socials, setSocials] = useState({
    twitter: true,
    instagram: true,
    linkedin: false,
    youtube: true,
  });
  const [socialInputs, setSocialInputs] = useState({
    twitter: "@alexkumar",
    instagram: "@alex.gram",
    linkedin: "https://linkedin.com/in/alexkumar",
    youtube: "https://youtube.com/@alexkumar",
  });
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedNewsletter, setGeneratedNewsletter] = useState<any>(null);
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);

  const handleSocialCheck = (key: string) => {
    setSocials((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSocialInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowGeneration(false);
    setProgress(0);
    setGeneratedNewsletter(null);
    setGeneratedPosts([]);
    
    // Animate progress bar over 5-9 seconds
    const totalDuration = Math.floor(Math.random() * 4000) + 5000; // 5000-9000 ms
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(percent);
      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          setShowGeneration(true);
          
          // Generate mock AI newsletter data
          setGeneratedNewsletter({
            sections: [
              {
                title: "New Project: SocialSync",
                icon: "🚀",
                content: `<div className="flex flex-col md:flex-row gap-6 items-center">
                  <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80" alt="SocialSync" className="w-32 h-32 object-cover rounded-xl shadow" />
                  <div>
                    <p className="text-gray-700 mb-2">This week I launched <span className="font-bold text-blue-700">SocialSync</span>, a platform that automatically generates newsletters from your social media content. We hit <b>85 signups</b> in the first week! 🎉</p>
                    <code className="block bg-gray-100 text-gray-700 rounded px-2 py-1 text-sm mb-1">Built with React, Supabase, and OpenAI</code>
                  </div>
                </div>`
              },
              {
                title: "Project Deep Dive: Building SocialSync",
                icon: "🔍",
                content: `<p className="text-gray-700 mb-4">The idea started from my own struggle to keep up with newsletter creation. I spent three days prototyping different AI approaches, then built the MVP in just 7 days. The hardest part? Getting the AI to understand context across different social platforms.</p>
                <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80" alt="Wireframe" className="w-full h-48 object-cover rounded-xl my-4 shadow" />
                <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700 bg-blue-50 rounded">"The key insight was that each platform has its own voice - the AI needed to understand that."</blockquote>`
              },
              {
                title: "Social Growth",
                icon: "📈",
                content: `<div className="flex gap-8 justify-center mb-2">
                  <div className="flex flex-col items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="X" className="w-10 h-10 mb-1" />
                    <span className="font-bold text-xl">+180</span>
                    <span className="text-xs text-gray-500">New X Followers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Instagram" className="w-10 h-10 mb-1" />
                    <span className="font-bold text-xl">+120</span>
                    <span className="text-xs text-gray-500">New IG Followers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" className="w-10 h-10 mb-1" />
                    <span className="font-bold text-xl">+65</span>
                    <span className="text-xs text-gray-500">New LinkedIn</span>
                  </div>
                </div>`
              },
              {
                title: "Lessons Learned",
                icon: "📚",
                content: `<ul className="list-disc pl-5 text-gray-700">
                  <li><b>AI needs context:</b> The biggest challenge was teaching the AI to understand the difference between professional LinkedIn posts and casual Instagram stories.</li>
                  <li><b>User feedback is gold:</b> Early users helped me understand that they wanted more control over the tone and style.</li>
                  <li><b>Simple is better:</b> The most successful features were the ones that required zero setup.</li>
                </ul>`
              }
            ]
          });
          
          // Generate mock posts
          setGeneratedPosts([
            {
              platform: "Twitter",
              title: "Just launched SocialSync - AI-powered newsletter generation from your social posts! 🚀",
              thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80"
            },
            {
              platform: "Instagram",
              title: "Behind the scenes of building an AI newsletter generator",
              thumbnail: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=200&q=80"
            },
            {
              platform: "LinkedIn",
              title: "How I built an AI newsletter generator in 7 days",
              thumbnail: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?auto=format&fit=crop&w=200&q=80"
            },
            {
              platform: "YouTube",
              title: "Building AI-powered tools: A developer's journey",
              thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
            }
          ]);
        }, 400);
      }
    }, 50);
  };

  return (
    <section className="py-24 px-4 bg-background dark:bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See Your <span className="gradient-text">Newsletter</span> Come to Life
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simulate making your own newsletter by entering your social links below!
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Card className="max-w-xl w-full p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Build Your Weekly Newsletter</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-foreground text-sm mb-1">Your Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-foreground text-sm mb-1">Socials to include</label>
                <div className="flex gap-4 flex-wrap">
                  {SOCIALS.map((s) => (
                    <label key={s.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={socials[s.key as keyof typeof socials]}
                        onChange={() => handleSocialCheck(s.key)}
                        disabled={loading}
                        className="accent-primary w-4 h-4 rounded focus:ring-2 focus:ring-primary dark:accent-primary"
                      />
                      <span className="text-foreground capitalize">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Show prefilled input for each checked social */}
              <div className="space-y-2">
                {SOCIALS.map((s) =>
                  socials[s.key as keyof typeof socials] && (
                    <div key={s.key} className="flex flex-col md:flex-row gap-2 items-center">
                      <label className="block text-muted-foreground text-xs md:w-32 capitalize">{s.label}:</label>
                      <Input
                        type="text"
                        className="flex-1"
                        value={socialInputs[s.key as keyof typeof socialInputs]}
                        onChange={e => handleInputChange(s.key, e.target.value)}
                        placeholder={s.placeholder}
                        disabled={loading}
                      />
                    </div>
                  )
                )}
              </div>
              <div>
                <label className="block text-foreground text-sm mb-1">How far back?</label>
                <select
                  className="border border-border rounded px-3 py-2 text-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  disabled={loading}
                >
                  {TIME_RANGES.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <Button
                  id="get-started"
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground font-bold text-base shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="tracking-wider">Analyzing</span>
                      <span className="animate-pulse ml-1">...</span>
                    </>
                  ) : (
                    <>
                      Generate Newsletter
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
          <Card className="max-w-2xl w-full p-8 min-h-[300px] flex items-center justify-center shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 w-full">
                {/* Progress Bar */}
                <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400 animate-pulse"
                    style={{ width: `${progress}%`, transition: 'width 0.3s' }}
                  />
                </div>
                <svg className="animate-spin h-8 w-8 text-cyan-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                <span className="text-cyan-200 text-lg font-medium animate-pulse">AI is generating your newsletter…</span>
                <span className="text-gray-500 mt-2">This may take a few seconds</span>
              </div>
            ) : showGeneration ? (
              <ExampleNewsletterRenderer newsletterData={generatedNewsletter} posts={generatedPosts} />
            ) : (
              <span className="text-muted-foreground">Your generated newsletter will appear here.</span>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NewsletterPreview;
