import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
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
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [heroDots, setHeroDots] = useState('');


  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

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
      
      setHeroDots(reactiveDots.join(', '));
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

  const buttons = [
    {
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
        <div className="lg:hidden flex flex-col items-center justify-center w-full px-4 sm:px-8 relative h-screen overflow-hidden" style={{ touchAction: 'none' }}>
          {/* Background Animation - Mobile Only */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Efficient particle system - 26 particles total */}
            {(() => {
              const particles = [];
              const colors = ['bg-gray-800', 'bg-black', 'bg-gray-600', 'bg-gray-900', 'bg-gray-700'];
              const sizes = ['w-1 h-1', 'w-1.5 h-1.5', 'w-2 h-2', 'w-2.5 h-2.5'];
              const opacities = ['opacity-60', 'opacity-65', 'opacity-70', 'opacity-75'];
              
                            // Generate 26 particles with scattered positioning
              for (let i = 0; i < 26; i++) {
                // Use different prime numbers to create scattered distribution
                const baseTop = (i * 7.3 + i * 13.7) % 100; // Scatter across screen height
                const baseLeft = (i * 11.9 + i * 19.3) % 100; // Scatter across screen width
                const color = colors[i % colors.length];
                const size = sizes[i % sizes.length];
                const opacity = opacities[i % opacities.length];
                
                // Create unique movement patterns for each particle
                const moveX = (i % 2 === 0 ? 1 : -1) * (60 + (i % 3) * 20);
                const moveY = (i % 3 === 0 ? 1 : -1) * (50 + (i % 4) * 15);
                const transformX = (i % 2 === 0 ? 1 : -1) * (40 + (i % 5) * 10);
                const transformY = (i % 3 === 0 ? 1 : -1) * (30 + (i % 3) * 10);
                const transformZ = (i % 4 === 0 ? 1 : -1) * (20 + (i % 3) * 6);
                
                // Add floating animation with different delays and durations - slower and smoother
                const animationDelay = (i * 0.5) % 4; // 0-4 seconds delay
                const animationDuration = 8 + (i % 4) * 3; // 8-20 seconds duration
                
                particles.push(
                  <div 
                    key={i}
                    className={`absolute ${size} ${color} rounded-full ${opacity} animate-float-dust`}
                    style={{
                      top: `${baseTop}%`,
                      left: `${baseLeft}%`,
                      animationDelay: `${animationDelay}s`,
                      animationDuration: `${animationDuration}s`
                    }}
                  ></div>
                );
              }
              return particles;
            })()}
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
          
          /* Floating dust animation - slower and smoother */
          @keyframes float-dust {
            0%, 100% { 
              transform: translate(0, 0) scale(1);
              opacity: 0.6;
            }
            25% { 
              transform: translate(6px, -8px) scale(1.05);
              opacity: 0.7;
            }
            50% { 
              transform: translate(-4px, -12px) scale(0.95);
              opacity: 0.65;
            }
            75% { 
              transform: translate(8px, -6px) scale(1.02);
              opacity: 0.7;
            }
          }
          
          .animate-float-dust { 
            animation: float-dust 8s ease-in-out infinite;
            will-change: transform, opacity;
          }
        `
      }} />
    </div>
  );
};

export default IndexNew;