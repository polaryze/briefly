import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNavigate } from 'react-router-dom';

const TopNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className={`mx-auto px-4 h-16 flex items-center justify-between transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'max-w-4xl rounded-2xl bg-background/60 backdrop-blur-md shadow-xl border border-border/30 mt-2 mb-2' 
          : 'max-w-7xl'
      }`}>
        <div className="text-2xl font-bold text-foreground">
          Briefly
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a 
            href="#features" 
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Features
          </a>
          <a 
            href="#testimonials" 
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Testimonials
          </a>
          <a 
            href="#pricing" 
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
            onClick={() => navigate('/newsletter-builder')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;