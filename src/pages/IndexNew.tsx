import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Users, Menu, X, LogIn, DollarSign, HelpCircle, Wand2 } from 'lucide-react';
import { useSmoothNavigate } from '../hooks/useSmoothNavigate';
import StyledButton from '../components/StyledButton';

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
        className="min-h-screen bg-white flex items-center justify-between relative hero-section"
        style={{
          backgroundImage: heroDots,
          transform: `translate3d(0, ${scrollY * 0.3}px, 0)`,
          opacity: Math.max(0, 1 - scrollY / 500),
          willChange: 'transform, opacity',
          transition: 'background-image 0.2s ease-out'
        }}
      >
        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-50 transition-all duration-500"
          style={{
            opacity: scrollY < 200 ? 1 : 0
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Scroll to generate sample</span>
            <div className="w-5 h-5 animate-bounce">
              <svg 
                className="w-5 h-5 text-gray-600" 
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
        {/* Left side content */}
        <div className="ml-16 md:ml-24 relative z-10">
          <div 
            className={`text-6xl md:text-8xl font-bold text-black mb-4 transition-all duration-1000 cursor-pointer briefly-hover ${
              showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'
            }`}
            style={{
              transform: `translate3d(${scrollY * 0.2}px, 0, 0)`,
              willChange: 'transform'
            }}
          >
            Briefly
          </div>
          <div className="text-2xl md:text-4xl font-light text-gray-600">
            {text}
            <span 
              className="inline-block w-0.5 text-2xl md:text-4xl font-light ml-1"
              style={{
                animation: 'blink 1s infinite'
              }}
            >
              |
            </span>
          </div>
        </div>

        {/* Right side bento grid */}
        <div className="mr-16 md:mr-24 relative z-10">
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



      {/* Newsletter Generation Section */}
      <div 
        id="how-it-works"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center relative newsletter-section"
        style={{
          backgroundImage: newsletterDots,
          opacity: Math.max(0, (scrollY - 400) / 400),
          transform: `translate3d(0, ${Math.max(0, scrollY - 400) * 0.2}px, 0)`,
          willChange: 'transform, opacity',
          transition: 'background-image 0.2s ease-out'
        }}
      >
        <div className="text-center mb-64">
          <h2 
            className="text-5xl md:text-7xl font-bold text-gray-800 mb-8"
            style={{
              transform: `translate3d(0, ${Math.max(0, scrollY - 500) * 0.3}px, 0)`,
              marginTop: '-100px',
              willChange: 'transform'
            }}
          >
            Generate Sample
          </h2>
        </div>

        <div 
          className="bg-white rounded-3xl shadow-2xl p-6 max-w-xl w-full mx-8"
          style={{
            transform: `translate3d(0, ${Math.max(0, scrollY - 700) * 0.1}px, 0)`,
            boxShadow: `0 20px 40px rgba(0,0,0,${0.1 + Math.max(0, scrollY - 700) * 0.0001})`,
            willChange: 'transform'
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Blog Post</option>
                <option>Social Media</option>
                <option>Article</option>
                <option>News</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Professional</option>
                <option>Casual</option>
                <option>Friendly</option>
                <option>Formal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Content</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Paste your content here or describe what you want to create..."
              />
            </div>

            <Button 
              onClick={() => smoothNavigate('/newsletter-builder')}
              className="w-full bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Generate Newsletter
            </Button>
          </div>
        </div>
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