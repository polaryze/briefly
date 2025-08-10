import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Wand2 } from 'lucide-react';
import StyledButton from '../components/StyledButton';

const IndexNew = () => {
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');
  
  const [text, setText] = useState('');
  const fullText = 'Newsletters reimagined';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showBriefly, setShowBriefly] = useState(false);

  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [reactiveDots, setReactiveDots] = useState('');
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [heroDots, setHeroDots] = useState('');


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



    updateHeroDots();
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
    window.location.href = '/newsletter-builder';
  };



  const buttons = [
    {
      id: 'generate',
      icon: <Wand2 className="w-6 h-6" />,
      delay: 150,
      size: 'large',
      onClick: handleGenerateNewsletter,
      title: 'Generate Newsletter'
    }
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
        <div className="hidden lg:flex flex-col items-center justify-center w-full px-16 xl:px-24 gap-0">
          {/* Centered content */}
          <div className="relative z-10 text-center">
            <div 
              className={`text-6xl xl:text-8xl font-bold text-black mb-4 transition-all duration-1000 ${
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
              className={`text-lg xl:text-2xl font-light text-gray-600 mb-8 transition-all duration-1000 ${
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
                className="inline-block w-0.5 text-lg xl:text-2xl font-light ml-1"
                style={{
                  animation: 'blink 1s infinite'
                }}
              >
                |
              </span>
            </div>
            
            {/* StyledButton below tagline */}
            <div
              className={`${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '450ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <StyledButton />
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
              className={`text-base sm:text-lg font-light text-gray-600 transition-all duration-1000 ${
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
                className="inline-block w-0.5 text-base sm:text-lg font-light ml-1"
                style={{
                  animation: 'blink 1s infinite'
                }}
              >
                |
              </span>
            </div>
          </div>

          {/* Bottom circular buttons - moved up to avoid iOS search bar */}
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
            <div
              className={`${
                showBriefly ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
              style={{
                animationDelay: '400ms',
                transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
                willChange: 'transform'
              }}
            >
              <StyledButton />
            </div>
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