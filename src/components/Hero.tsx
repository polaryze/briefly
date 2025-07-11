import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();
  
  const newsletterTitle = 'The Weekly Digest - November Edition';
  
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (displayText.length < newsletterTitle.length) {
          setDisplayText(newsletterTitle.slice(0, displayText.length + 1));
        } else {
          setIsTyping(false);
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [displayText, isTyping, newsletterTitle]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-16">
      <div className="text-center max-w-6xl mx-auto relative z-10">
        {/* Main tagline - now the biggest element */}
        <h1 className="tagline-font text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold mb-8 leading-tight text-foreground animate-fade-in">
          "Where scattered posts<br />
          become <span className="gradient-text">structured stories</span>"
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Briefly auto-generates a sleek, intelligent monthly newsletter from your posts 
          across LinkedIn & X — powered by AI agents tuned to your tone.
        </p>

        {/* CTA Button */}
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
          onClick={() => navigate('/newsletter-builder')}
        >
          Generate My First Issue →
        </Button>

        {/* Newsletter Preview Animation */}
        <div className="mt-16 mx-auto max-w-md animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="glass-card rounded-3xl p-6 shadow-2xl">
            <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="text-lg font-semibold mb-2 border-r-2 border-foreground pr-1 overflow-hidden whitespace-nowrap text-foreground">
                {displayText}
                {isTyping && <span className="animate-blink">|</span>}
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded w-full"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-5/6"></div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              ✨ Generated from your social posts
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
