import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';

const IndexNew = () => {
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');
  
  const [text, setText] = useState('');
  const fullText = 'Newsletters reimagined';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showBriefly, setShowBriefly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    // Disable dot effects on mobile devices for better performance
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (isMobile) {
      setHeroDots('');
      setNewsletterDots('');
      return;
    }

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

  const handleGenerateNewsletter = () => {
    if (adminBypass === 'bypass') {
      window.location.href = '/newsletter-builder?admin=bypass';
    } else {
      window.location.href = '/newsletter-builder';
    }
  };

  const handleSignIn = () => {
    if (adminBypass === 'bypass') {
      window.location.href = '/newsletter-builder?admin=bypass';
    } else {
      window.location.href = '/signin';
    }
  };

  const buttons = [
    { id: 'auth', label: isLoggedIn ? 'Sign Out' : 'Sign In', delay: 100, size: 'small', onClick: handleSignIn },
    { id: 'generate', label: 'Generate Newsletter', delay: 150, size: 'large', onClick: handleGenerateNewsletter },
    { id: 'pricing', label: 'Pricing', delay: 200, size: 'small', onClick: () => window.location.href = '/pricing' },
    { id: 'support', label: 'Support', delay: 250, size: 'small', onClick: () => window.location.href = '/support' }
  ];

  return (
    <div className="relative">
      {/* Admin bypass indicator */}
      {adminBypass === 'bypass' && (
        <div className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Access Active</span>
          </div>
        </div>
      )}

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
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-row items-center justify-between w-full px-16 xl:px-24 gap-0">
          {/* Left side content */}
          <div className="relative z-10 text-left">
            <div 
              className={`text-6xl xl:text-8xl font-bold text-black mb-4 transition-all duration-1000 ${
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
              <button
                onClick={buttons[0].onClick}
                className={`px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '100ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                {buttons[0].label}
              </button>
              
              <button
                onClick={buttons[1].onClick}
                className={`px-4 py-3 text-sm font-medium bg-gradient-to-r from-black to-gray-800 text-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '150ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                {buttons[1].label}
              </button>

              {/* Bottom row */}
              <button
                onClick={buttons[2].onClick}
                className={`px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '200ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                {buttons[2].label}
              </button>
              
              <button
                onClick={buttons[3].onClick}
                className={`px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 hover:text-black transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 ${
                  showBriefly ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'
                }`}
                style={{
                  animationDelay: '250ms',
                  transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                  willChange: 'transform'
                }}
              >
                {buttons[3].label}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Optimized for iOS */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full px-4 sm:px-8 relative h-screen">
          {/* Center content with fade-in animation - moved up by 16px total */}
          <div className="flex flex-col items-center justify-center flex-1" style={{ marginTop: '-16px' }}>
            <div 
              className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-4 transition-all duration-1000 cursor-pointer briefly-hover ${
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

          {/* Bottom circular buttons - moved up to avoid iOS search bar */}
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
            <button
              onClick={buttons[0].onClick}
              className={`group flex items-center justify-center w-14 h-14 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '400ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <span className="text-sm font-medium text-gray-800">Sign In</span>
            </button>
            
            <button
              onClick={buttons[1].onClick}
              className={`group flex items-center justify-center w-16 h-16 bg-gradient-to-r from-black to-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '450ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <span className="text-sm font-medium">Generate</span>
            </button>

            <button
              onClick={buttons[2].onClick}
              className={`group flex items-center justify-center w-14 h-14 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '500ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <span className="text-sm font-medium text-gray-800">Pricing</span>
            </button>
            
            <button
              onClick={buttons[3].onClick}
              className={`group flex items-center justify-center w-14 h-14 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-300 transform hover:scale-105 ${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '550ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <span className="text-sm font-medium text-gray-800">Support</span>
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
        <div className="text-center mb-32 sm:mb-64 px-4">
          <h2 
            className="text-3xl sm:text-5xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-8"
            style={{
              transform: `translate3d(0, ${Math.max(0, scrollY - 500) * 0.3}px, 0)`,
              marginTop: '-50px sm:-100px',
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

            <button 
              onClick={handleGenerateNewsletter}
              className="w-full bg-gradient-to-r from-black to-gray-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
            >
              Generate Newsletter
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `
      }} />
    </div>
  );
};

export default IndexNew; 