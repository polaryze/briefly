import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Zap, Users, Menu, X, LogIn, DollarSign, HelpCircle, Wand2 } from 'lucide-react';
import { useSmoothNavigate } from '../hooks/useSmoothNavigate';
import StyledButton from '../components/StyledButton';

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

// Newsletter Example Component
const NewsletterExample = () => {
  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <section className="mb-6 sm:mb-10 bg-gray-50 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <h2 className="flex items-center gap-2 text-lg sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">
        <span className="text-xl sm:text-3xl">{icon}</span> {title}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7f7fa] py-6 sm:py-12 px-2 sm:px-4">
      <article className="prose prose-neutral max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 notion-style overflow-hidden">
        {/* Header */}
        <header className="bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-2 border-b border-gray-200">
          <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-gray-900">Alex's Weekly Recap <span className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-500">(July 7, 2025)</span></h1>
          <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-700 opacity-90 mb-2">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex Kumar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200" />
            <span className="font-medium">by Alex Kumar</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">Week 27, 2025</span>
          </div>
          <div className="text-base sm:text-lg mt-1 opacity-90 font-light text-gray-700">Hey friends! Here's what I've been up to this week as a creator, entrepreneur, and engineer. Thanks for following along on my journey!</div>
        </header>
        
        {/* Hero Image */}
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Newsletter Hero" className="w-full h-40 sm:h-60 object-cover" />
        
        <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
          <Section title="New Project: IndieHub" icon="🚀">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=200&q=80" alt="IndieHub" className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow" />
              <div>
                <p className="text-sm sm:text-base text-gray-700 mb-2">This week I launched <span className="font-bold text-blue-700">IndieHub</span>, a platform for indie makers to share their projects and get feedback. We hit <b>120 signups</b> in the first 3 days! 🎉</p>
                <code className="block bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs sm:text-sm mb-1">Built with Next.js, Supabase, and Tailwind CSS</code>
              </div>
            </div>
          </Section>
          
          <Section title="Social Growth" icon="📈">
            <div className="flex gap-4 sm:gap-8 justify-center mb-2">
              <div className="flex flex-col items-center">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="X" className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                <span className="font-bold text-lg sm:text-xl">+320</span>
                <span className="text-xs text-gray-500">New X Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Instagram" className="w-8 h-8 sm:w-10 sm:h-10 mb-1" />
                <span className="font-bold text-lg sm:text-xl">+210</span>
                <span className="text-xs text-gray-500">New IG Followers</span>
              </div>
            </div>
          </Section>

          {/* Footer CTA */}
          <div className="text-center mt-6 sm:mt-8 mb-2">
            <a href="#" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold shadow hover:bg-blue-700 transition text-sm sm:text-base">Reply & let me know what you're working on! →</a>
          </div>
          <div className="text-center text-xs text-gray-400 mb-2">© 2025 Alex Kumar. Thanks for reading!</div>
        </main>
      </article>
    </div>
  );
};

// Interactive Newsletter Demo Component
const InteractiveNewsletterDemo = ({ scrollY }: { scrollY: number }) => {
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

  const handleSocialCheck = (key: string) => {
    setSocials((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSocialInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowGeneration(false);
    setProgress(0);
    
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
        }, 400);
      }
    }, 50);
  };

  return (
    <div className="flex flex-col items-center px-4">
      <Card 
        className="max-w-xl w-full p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
        style={{
          transform: `translate3d(0, ${Math.max(0, scrollY - 700) * 0.1}px, 0)`,
          willChange: 'transform'
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Build Your Weekly Newsletter</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Your Name</label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Socials to include</label>
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              {SOCIALS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={socials[s.key as keyof typeof socials]}
                    onChange={() => handleSocialCheck(s.key)}
                    disabled={loading}
                    className="accent-pink-400 w-4 h-4 rounded focus:ring-2 focus:ring-pink-400"
                  />
                  <span className="text-sm sm:text-base text-gray-800 capitalize">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Show prefilled input for each checked social */}
          <div className="space-y-2">
            {SOCIALS.map((s) =>
              socials[s.key as keyof typeof socials] && (
                <div key={s.key} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <label className="block text-gray-600 text-xs sm:text-sm sm:w-32 capitalize">{s.label}:</label>
                  <Input
                    type="text"
                    className="flex-1 w-full"
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
            <label className="block text-gray-700 text-sm mb-1">How far back?</label>
            <select
              className="border rounded px-3 py-2 text-sm sm:text-base w-full"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              disabled={loading}
            >
              {TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Newsletter...
              </div>
            ) : (
              'Generate Newsletter'
            )}
          </Button>
        </form>
        
        {/* Progress bar */}
        {loading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">Generating your newsletter...</p>
          </div>
        )}
      </Card>

      {/* Generated Newsletter */}
      {showGeneration && (
        <div 
          className="w-full max-w-2xl"
          style={{
            transform: `translate3d(0, ${Math.max(0, scrollY - 800) * 0.1}px, 0)`,
            willChange: 'transform'
          }}
        >
          <NewsletterExample />
        </div>
      )}
    </div>
  );
};

const IndexNew = () => {
  const [text, setText] = useState('');
  const fullText = 'Newsletters reimagined';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showBriefly, setShowBriefly] = useState(false);
  const navigate = useNavigate();
  const smoothNavigate = useSmoothNavigate();
  const { isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [reactiveDots, setReactiveDots] = useState('');
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [heroDots, setHeroDots] = useState('');
  const [newsletterDots, setNewsletterDots] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    // Add event listeners to document instead of window
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Update reactive dots when mouse position changes - optimized version
  useEffect(() => {
    const updateHeroDots = () => {
      const baseDot = `radial-gradient(circle at 15px 15px, rgba(0,0,0,0.08) 2px, transparent 0)`;
      const reactiveDots = [];
      const maxDistance = 120;
      const gridSize = 30;
      
      // Only calculate dots near the mouse cursor
      const mouseCol = Math.floor(mousePosition.x / gridSize);
      const mouseRow = Math.floor(mousePosition.y / gridSize);
      const affectedRange = Math.ceil(maxDistance / gridSize) + 1;
      
      for (let col = mouseCol - affectedRange; col <= mouseCol + affectedRange; col++) {
        for (let row = mouseRow - affectedRange; row <= mouseRow + affectedRange; row++) {
          const x = col * gridSize + gridSize / 2;
          const y = row * gridSize + gridSize / 2;
          
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - x, 2) + 
            Math.pow(mousePosition.y - y, 2)
          );
          
          if (distance < maxDistance) {
            const effect = Math.max(0, 1 - distance / maxDistance);
            const size = 2 * (1 + effect * 2);
            const opacity = 0.08 * (1 + effect * 4);
            
            reactiveDots.push(`radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,${opacity}) ${size}px, transparent 0)`);
          }
        }
      }
      
      setHeroDots(`${baseDot}, ${reactiveDots.join(', ')}`);
    };

    const updateNewsletterDots = () => {
      const baseDot = `radial-gradient(circle at 20px 20px, rgba(0,0,0,0.05) 2px, transparent 0)`;
      const reactiveDots = [];
      const maxDistance = 120;
      const gridSize = 40;
      
      const mouseCol = Math.floor(mousePosition.x / gridSize);
      const mouseRow = Math.floor(mousePosition.y / gridSize);
      const affectedRange = Math.ceil(maxDistance / gridSize) + 1;
      
      for (let col = mouseCol - affectedRange; col <= mouseCol + affectedRange; col++) {
        for (let row = mouseRow - affectedRange; row <= mouseRow + affectedRange; row++) {
          const x = col * gridSize + gridSize / 2;
          const y = row * gridSize + gridSize / 2;
          
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - x, 2) + 
            Math.pow(mousePosition.y - y, 2)
          );
          
          if (distance < maxDistance) {
            const effect = Math.max(0, 1 - distance / maxDistance);
            const size = 2 * (1 + effect * 2);
            const opacity = 0.05 * (1 + effect * 4);
            
            reactiveDots.push(`radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,${opacity}) ${size}px, transparent 0)`);
          }
        }
      }
      
      setNewsletterDots(`${baseDot}, ${reactiveDots.join(', ')}`);
    };

    updateHeroDots();
    updateNewsletterDots();
  }, [mousePosition]);

  useEffect(() => {
    const brieflyTimeout = setTimeout(() => {
      setShowBriefly(true);
    }, 300);

    return () => clearTimeout(brieflyTimeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      if (currentIndex < fullText.length) {
        const timeout = setTimeout(() => {
          setText(prev => prev + fullText[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setText('');
          setCurrentIndex(0);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, fullText, isTyping]);

  const buttons = [
    { id: 'auth', label: isSignedIn ? 'Profile' : 'Sign In', delay: 100, size: 'small' },
    { id: 'generate', label: 'Generate Newsletter', delay: 150, size: 'large' },
    { id: 'pricing', label: 'Pricing', delay: 200, size: 'small' },
    { id: 'support', label: 'Support', delay: 250, size: 'small' }
  ];

  // Calculate dot size and opacity based on mouse distance
  const getDotStyle = (baseSize: number, baseOpacity: number) => {
    const maxDistance = 150; // Distance in pixels where effect starts
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - window.innerWidth / 2, 2) + 
      Math.pow(mousePosition.y - window.innerHeight / 2, 2)
    );
    
    const effect = Math.max(0, 1 - distance / maxDistance);
    const sizeMultiplier = 1 + effect * 1.5; // Dots can get up to 2.5x bigger
    const opacityMultiplier = 1 + effect * 2; // Opacity can get up to 3x darker
    
    return {
      size: baseSize * sizeMultiplier,
      opacity: baseOpacity * opacityMultiplier
    };
  };

  // Simple reactive dot effect for second section
  const getSecondSectionDots = () => {
    const baseDot = `radial-gradient(circle at 20px 20px, rgba(0,0,0,0.05) 2px, transparent 0)`;
    
    if (mousePosition.x > 0 && mousePosition.y > 0) {
      const reactiveDots = [
        `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,0,0,0.6) 8px, transparent 0)`,
        `radial-gradient(circle at ${mousePosition.x - 15}px ${mousePosition.y}px, rgba(0,255,0,0.4) 6px, transparent 0)`
      ];
      return `${baseDot}, ${reactiveDots.join(', ')}`;
    }
    
    return baseDot;
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          transition: 'background-image 0.2s ease-out'
        }}
      >
        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-center z-50 transition-all duration-500"
          style={{
            opacity: scrollY < 200 ? 1 : 0
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">Scroll to generate sample</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce">
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Desktop Layout - Unchanged */}
        <div className="hidden lg:flex flex-row items-center justify-between w-full px-16 xl:px-24 gap-0">
          {/* Left side content */}
          <div className="relative z-10 text-left">
            <div 
              className={`text-6xl xl:text-8xl font-bold text-black mb-4 transition-all duration-1000 cursor-pointer briefly-hover ${
                showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'
              }`}
              style={{
                transform: `translate3d(${scrollY * 0.2}px, 0, 0)`,
                willChange: 'transform'
              }}
            >
              Briefly
            </div>
            <div className="text-2xl xl:text-4xl font-light text-gray-600">
              {text}
              <span 
                className="inline-block w-0.5 text-2xl xl:text-4xl font-light ml-1"
                style={{
                  animation: 'blink 1s infinite'
                }}
              >
                |
              </span>
            </div>
          </div>

          {/* Right side bento grid */}
          <div className="relative z-10">
            <div className="grid grid-cols-2 gap-4 w-80 h-80">
              {/* Top row */}
              {isSignedIn ? (
                <div
                  className={`flex items-center justify-center ${
                    showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                  }`}
                  style={{
                    animationDelay: '100ms',
                    transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                    willChange: 'transform'
                  }}
                >
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-[130px] h-[130px] ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                      }
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => navigate('/signin')}
                  className={`group flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                    showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                  }`}
                  style={{
                    animationDelay: '100ms',
                    transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                    willChange: 'transform'
                  }}
                >
                  <LogIn className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              )}
              
              <div
                className={`flex items-center justify-center ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '150ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <StyledButton />
              </div>

              {/* Bottom row */}
              <button
                onClick={() => navigate('/pricing')}
                className={`group flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '200ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              </button>
              
              <button
                onClick={() => navigate('/support')}
                className={`group flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '250ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <HelpCircle className="w-6 h-6 group-hover:rotate-6 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout - New Design */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full px-4 sm:px-8 relative h-screen">
          {/* Center content with fade-in animation */}
          <div className="flex flex-col items-center justify-center flex-1">
            <div 
              className={`text-4xl sm:text-5xl font-bold text-black mb-4 transition-all duration-1000 cursor-pointer briefly-hover ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              Briefly
            </div>
            <div 
              className={`text-lg sm:text-xl font-light text-gray-600 transition-all duration-1000 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '300ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              {text}
              <span 
                className="inline-block w-0.5 text-lg sm:text-xl font-light ml-1"
                style={{
                  animation: 'blink 1s infinite'
                }}
              >
                |
              </span>
            </div>
          </div>

          {/* Bottom circular buttons */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
            {isSignedIn ? (
              <div
                className={`flex items-center justify-center ${
                  showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`}
                style={{
                  animationDelay: '400ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-12 h-12 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                    }
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => navigate('/signin')}
                className={`group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 transform hover:scale-105 ${
                  showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`}
                style={{
                  animationDelay: '400ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <LogIn className="w-5 h-5 text-gray-700 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            )}
            
            <div
              className={`flex items-center justify-center ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '450ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <button
                onClick={() => navigate('/newsletter-builder')}
                className={`group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 transform hover:scale-105 ${
                  showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                }`}
                style={{
                  animationDelay: '450ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                <Wand2 className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            <button
              onClick={() => navigate('/pricing')}
              className={`group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '500ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <DollarSign className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => navigate('/support')}
              className={`group flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '550ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <HelpCircle className="w-5 h-5 text-gray-700 group-hover:rotate-6 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>



      {/* Newsletter Generation Section */}
      <div 
        id="how-it-works"
        className="min-h-screen bg-black flex flex-col items-center justify-center relative newsletter-section"
        style={{
          opacity: Math.max(0, (scrollY - 400) / 400),
          transform: `translate3d(0, ${Math.max(0, scrollY - 400) * 0.2}px, 0)`,
          willChange: 'transform, opacity'
        }}
      >
        <div className="text-center mb-32 sm:mb-64 px-4">
          <h2 
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-8"
            style={{
              transform: `translate3d(0, ${Math.max(0, scrollY - 500) * 0.3}px, 0)`,
              marginTop: '-50px sm:-100px',
              willChange: 'transform'
            }}
          >
            Generate Sample
          </h2>
        </div>

        <InteractiveNewsletterDemo scrollY={scrollY} />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          .briefly-hover {
            transition: letter-spacing 0.4s ease-out;
            will-change: letter-spacing;
            animation: brieflyReturn 0.4s ease-out;
          }
          
          .briefly-hover:hover {
            letter-spacing: 0.15em;
            animation: brieflyHover 0.5s ease-out forwards;
          }
          
          @keyframes brieflyHover {
            0% {
              letter-spacing: 0.02em;
            }
            30% {
              letter-spacing: 0.08em;
            }
            60% {
              letter-spacing: 0.12em;
            }
            100% {
              letter-spacing: 0.15em;
            }
          }
          
          @keyframes brieflyReturn {
            0% {
              letter-spacing: 0.15em;
            }
            100% {
              letter-spacing: 0em;
            }
          }
        `
      }} />
    </div>
  );
};

export default IndexNew; 