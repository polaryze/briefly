import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowRight, Sparkles, Zap, Users } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-purple-500/5 pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tl from-blue-500/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-500/40 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-primary/50 rounded-full animate-pulse delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="space-y-8">
          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="block gradient-text">
                Your content.
              </span>
              <span className="block gradient-text">
                Our AI.
              </span>
              <span className="block gradient-text">
                Instant updates.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Transform your scattered social media posts into professional newsletters. 
            <span className="text-foreground font-medium"> AI-powered, effortless, engaging.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in">
            <Button 
              size="lg"
              onClick={() => navigate(isSignedIn ? '/newsletter-builder' : '/signin')}
              className="group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Building
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const heroSection = document.getElementById('how-it-works');
                heroSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 text-lg font-semibold border-2 hover:border-primary/50 transition-all duration-300"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 animate-fade-in">
            <div className="group">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">AI-Powered</div>
                <div className="text-sm text-muted-foreground">Smart content generation</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4 mx-auto group-hover:bg-blue-500/20 transition-colors">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">5 Minutes</div>
                <div className="text-sm text-muted-foreground">From posts to newsletter</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl mb-4 mx-auto group-hover:bg-green-500/20 transition-colors">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">Multi-Platform</div>
                <div className="text-sm text-muted-foreground">All your socials, unified</div>
              </div>
            </div>
          </div>

          {/* Newsletter Preview Card */}
          <div className="pt-16 animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Weekly Newsletter</div>
                    <div className="text-xs text-muted-foreground">Auto-generated</div>
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <div className="h-3 bg-muted rounded-full w-full group-hover:bg-primary/20 transition-colors"></div>
                  <div className="h-3 bg-muted rounded-full w-3/4 group-hover:bg-primary/20 transition-colors"></div>
                  <div className="h-3 bg-muted rounded-full w-5/6 group-hover:bg-primary/20 transition-colors"></div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                  ✨ Generated from your social content
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
