import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Wand2 } from 'lucide-react';
import StyledButton from '../components/StyledButton';

// TypeScript declaration for device orientation
declare global {
  interface Window {
    DeviceOrientationEvent: typeof DeviceOrientationEvent;
  }
}

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
  const [deviceOrientation, setDeviceOrientation] = useState({ x: 0, y: 0, z: 0 });


  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // Normalize orientation values to -1 to 1 range
      const x = event.beta ? Math.max(-1, Math.min(1, (event.beta - 45) / 45)) : 0;
      const y = event.gamma ? Math.max(-1, Math.min(1, event.gamma / 90)) : 0;
      const z = event.alpha ? Math.max(-1, Math.min(1, (event.alpha - 180) / 180)) : 0;
      
      setDeviceOrientation({ x, y, z });
    };

    // Add event listeners to document instead of window
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Add device orientation listener (mobile only)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
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
        <div className="lg:hidden flex flex-col items-center justify-center w-full px-4 sm:px-8 relative h-screen overflow-hidden">
          {/* Background Animation - Mobile Only */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating particles - reactive to device orientation */}
            <div 
              className="absolute w-2 h-2 bg-gray-800 rounded-full opacity-60"
              style={{
                top: `calc(25% + ${deviceOrientation.x * 20}px)`,
                left: `calc(25% + ${deviceOrientation.y * 15}px)`,
                transform: `translate3d(${deviceOrientation.x * 10}px, ${deviceOrientation.y * 8}px, ${deviceOrientation.z * 5}px)`
              }}
            ></div>
            <div 
              className="absolute w-1.5 h-1.5 bg-black rounded-full opacity-70"
              style={{
                top: `calc(33.33% + ${deviceOrientation.x * -15}px)`,
                left: `calc(75% + ${deviceOrientation.y * -20}px)`,
                transform: `translate3d(${deviceOrientation.x * -8}px, ${deviceOrientation.y * -12}px, ${deviceOrientation.z * 3}px)`
              }}
            ></div>
            <div 
              className="absolute w-1 h-1 bg-gray-600 rounded-full opacity-65"
              style={{
                top: `calc(66.67% + ${deviceOrientation.x * 25}px)`,
                left: `calc(33.33% + ${deviceOrientation.y * 18}px)`,
                transform: `translate3d(${deviceOrientation.x * 15}px, ${deviceOrientation.y * 10}px, ${deviceOrientation.z * 4}px)`
              }}
            ></div>
            <div 
              className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full opacity-75"
              style={{
                top: `calc(75% + ${deviceOrientation.x * -18}px)`,
                left: `calc(66.67% + ${deviceOrientation.y * -25}px)`,
                transform: `translate3d(${deviceOrientation.x * -12}px, ${deviceOrientation.y * -15}px, ${deviceOrientation.z * 6}px)`
              }}
            ></div>
            <div 
              className="absolute w-1.5 h-1.5 bg-black rounded-full opacity-60"
              style={{
                top: `calc(50% + ${deviceOrientation.x * 22}px)`,
                left: `calc(16.67% + ${deviceOrientation.y * 12}px)`,
                transform: `translate3d(${deviceOrientation.x * 18}px, ${deviceOrientation.y * 6}px, ${deviceOrientation.z * 2}px)`
              }}
            ></div>
            <div 
              className="absolute w-1 h-1 bg-gray-700 rounded-full opacity-70"
              style={{
                top: `calc(66.67% + ${deviceOrientation.x * -20}px)`,
                left: `calc(83.33% + ${deviceOrientation.y * -22}px)`,
                transform: `translate3d(${deviceOrientation.x * -16}px, ${deviceOrientation.y * -18}px, ${deviceOrientation.z * 5}px)`
              }}
            ></div>
            
            {/* Subtle gradient orbs - also reactive */}
            <div 
              className="absolute w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-40"
              style={{
                top: `${deviceOrientation.x * 10}px`,
                left: `${deviceOrientation.y * 8}px`,
                transform: `scale(${1 + Math.abs(deviceOrientation.x) * 0.1})`
              }}
            ></div>
            <div 
              className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-gray-200 to-transparent rounded-full opacity-35"
              style={{
                transform: `scale(${1 + Math.abs(deviceOrientation.y) * 0.15}) translate(${deviceOrientation.x * 5}px, ${deviceOrientation.y * 3}px)`
              }}
            ></div>
            
            {/* Gentle wave lines - subtle orientation effect */}
            <div 
              className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"
              style={{
                transform: `translateY(${deviceOrientation.x * 3}px) skewX(${deviceOrientation.y * 2}deg)`
              }}
            ></div>
            <div 
              className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-45"
              style={{
                transform: `translateY(${deviceOrientation.x * -2}px) skewX(${deviceOrientation.y * -1.5}deg)`
              }}
            ></div>
          </div>
          
          {/* Center content with fade-in animation - moved up by 16px total */}
          <div className="flex flex-col items-center justify-center flex-1 relative z-10" style={{ marginTop: '-16px' }}>
            <div 
              className={`text-6xl sm:text-7xl lg:text-8xl font-bold text-black mb-4 transition-all duration-1000 cursor-pointer briefly-hover ${
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
          <div className="absolute bottom-52 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
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
          
          /* Mobile Background Animations */
          @keyframes float-1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -15px) rotate(90deg); }
            50% { transform: translate(-5px, -25px) rotate(180deg); }
            75% { transform: translate(-15px, -10px) rotate(270deg); }
          }
          
          @keyframes float-2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-12px, -20px) rotate(120deg); }
            66% { transform: translate(8px, -30px) rotate(240deg); }
          }
          
          @keyframes float-3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(15px, -18px) scale(1.2); }
          }
          
          @keyframes float-4 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-8px, -12px) rotate(-90deg); }
            50% { transform: translate(12px, -20px) rotate(-180deg); }
            75% { transform: translate(5px, -8px) rotate(-270deg); }
          }
          
          @keyframes float-5 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-18px, -15px) scale(0.8); }
          }
          
          @keyframes float-6 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(10px, -22px) rotate(180deg); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          
          @keyframes pulse-slower {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.25; transform: scale(1.1); }
          }
          
          @keyframes wave-1 {
            0%, 100% { transform: translateX(-100%); opacity: 0.2; }
            50% { transform: translateX(0%); opacity: 0.3; }
          }
          
          @keyframes wave-2 {
            0%, 100% { transform: translateX(100%); opacity: 0.15; }
            50% { transform: translateX(0%); opacity: 0.25; }
          }
          
          .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
          .animate-float-2 { animation: float-2 12s ease-in-out infinite; }
          .animate-float-3 { animation: float-3 10s ease-in-out infinite; }
          .animate-float-4 { animation: float-4 15s ease-in-out infinite; }
          .animate-float-5 { animation: float-5 9s ease-in-out infinite; }
          .animate-float-6 { animation: float-6 11s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
          .animate-pulse-slower { animation: pulse-slower 8s ease-in-out infinite; }
          .animate-wave-1 { animation: wave-1 20s linear infinite; }
          .animate-wave-2 { animation: wave-2 25s linear infinite; }
        `
      }} />
    </div>
  );
};

export default IndexNew; 