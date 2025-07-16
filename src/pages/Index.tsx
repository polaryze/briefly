import React from "react";
import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import BentoGrid from "@/components/BentoGrid";
import Testimonials from "@/components/Testimonials";
import StickyFooter from "@/components/StickyFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Hero />
      <BentoGrid />
      <Testimonials />
      
      {/* Modern Footer */}
      <footer className="relative overflow-hidden bg-background border-t border-border/50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-2xl font-bold text-foreground">Briefly</span>
            </div>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Transform your social media content into professional newsletters with AI-powered intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="mailto:hello@briefly.ai" className="text-primary hover:text-primary/80 transition-colors font-medium">
                hello@briefly.ai
              </a>
              <span className="hidden sm:block text-muted-foreground">•</span>
              <a 
                href="https://twitter.com/brieflyai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                @brieflyai
              </a>
            </div>
            
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Briefly AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <StickyFooter />
    </div>
  );
};

export default Index;
