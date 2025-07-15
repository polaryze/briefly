import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StickyFooter = () => {
  const [isVisible, setIsVisible] = useState(false);
  const closedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      // Only show if not closed in this session
      if (!closedRef.current) {
        setIsVisible(scrollPosition > windowHeight * 0.8);
      }
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check in case user already scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    closedRef.current = true;
  };

  if (!isVisible) return null;

  return (
    <div
      id="pricing"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in"
    >
      <div className="bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-md mx-auto border border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground mb-1">
              Build your first newsletter in 30 seconds
            </p>
            <p className="text-sm text-muted-foreground">
              Free to try, no credit card required
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
              onClick={() => navigate('/signin')}
            >
              Start Free
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-xl hover:bg-secondary text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyFooter;
