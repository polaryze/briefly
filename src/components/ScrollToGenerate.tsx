import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Sparkles } from 'lucide-react';

interface ScrollToGenerateProps {
  onGenerate: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  className?: string;
}

const ScrollToGenerate: React.FC<ScrollToGenerateProps> = ({
  onGenerate,
  isGenerating = false,
  disabled = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate visibility percentage
      const visibleHeight = Math.min(windowHeight, elementTop + elementHeight) - Math.max(0, elementTop);
      const visibilityPercentage = Math.max(0, Math.min(100, (visibleHeight / elementHeight) * 100));

      setIsVisible(visibilityPercentage > 50);
      setScrollProgress(visibilityPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGenerate = () => {
    if (!disabled && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative transition-all duration-500 ease-in-out ${className}`}
    >
      {/* Scroll Progress Indicator */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className={`
        relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-500 ease-in-out
        ${isVisible 
          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-lg' 
          : 'border-gray-200 bg-white shadow-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:scale-[1.02]'}
      `}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
              ${isVisible 
                ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className={`
              text-lg sm:text-xl font-bold transition-colors duration-300
              ${isVisible ? 'text-primary' : 'text-gray-700'}
            `}>
              Generate Newsletter
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {isVisible 
              ? "Ready to create your newsletter from your social media content!"
              : "Scroll down to generate your newsletter from your social media posts"
            }
          </p>
        </div>

        {/* Animated Arrow Up */}
        <div className={`
          flex items-center justify-center mb-6 transition-all duration-500 ease-in-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2'}
        `}>
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
            ${isVisible 
              ? 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg animate-pulse' 
              : 'bg-gray-100 text-gray-500'
            }
          `}>
            <ChevronUp className={`
              w-6 h-6 transition-all duration-500
              ${isVisible ? 'animate-bounce' : ''}
            `} />
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={disabled || isGenerating || !isVisible}
            className={`
              group relative overflow-hidden transition-all duration-300 ease-in-out
              ${isVisible 
                ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
              px-8 py-3 text-base font-semibold rounded-xl
              ${!disabled && isVisible ? 'hover:scale-105 active:scale-95' : ''}
            `}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                {isVisible ? 'Generate Now' : 'Scroll to Generate'}
              </div>
            )}
          </Button>
        </div>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Creating your newsletter...
            </p>
          </div>
        )}

        {/* Scroll Hint - Positioned much higher to avoid Safari web bar */}
        {!isVisible && !isGenerating && (
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 text-center">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
              <ChevronUp className="w-3 h-3 animate-bounce" />
              <span>Scroll to generate sample</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollToGenerate; 