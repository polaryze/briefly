import { Bot, AudioWaveform, Wand2, Download, Plug, ArrowRight, Sparkles, Zap } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

const bentoItems = [
  {
    id: 1,
    title: "AI-Powered Content Intelligence",
    description: "Multiple specialized AI agents analyze your content style, tone, and engagement patterns to create newsletters that truly sound like you.",
    icon: Bot,
    className: "md:col-span-2 md:row-span-2",
    gradient: "from-purple-500/20 via-blue-500/20 to-primary/20",
    features: ["Content Analysis", "Tone Detection", "Style Matching", "Engagement Optimization"]
  },
  {
    id: 2,
    title: "Voice Preservation",
    description: "Advanced natural language processing ensures your unique voice, personality, and communication style shine through every newsletter.",
    icon: AudioWaveform,
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-pink-500/20 via-purple-500/20 to-blue-500/20",
    features: ["Tone Analysis", "Style Matching"]
  },
  {
    id: 3,
    title: "Zero-Effort Publishing",
    description: "Simply connect your social accounts and watch as beautiful, professional newsletters are generated automatically from your existing content.",
    icon: Wand2,
    className: "md:col-span-2 md:row-span-1",
    gradient: "from-green-500/20 via-teal-500/20 to-primary/20",
    features: ["Auto-Generation", "Smart Formatting", "Content Curation"]
  },
  {
    id: 4,
    title: "Universal Export",
    description: "Export to any platform you need - PDF for print, HTML for web, or optimized formats for Substack, ConvertKit, and more.",
    icon: Download,
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
    features: ["PDF Export", "HTML Export", "Platform Integration"]
  },
  {
    id: 5,
    title: "Seamless Integration",
    description: "Connect with LinkedIn, X, Instagram, YouTube, and more. One-click setup with secure, reliable data syncing.",
    icon: Plug,
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-cyan-500/20 via-blue-500/20 to-primary/20",
    features: ["Multi-Platform", "Secure Sync", "Real-time Updates"]
  },
];

const BentoGrid = () => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(entry.target.getAttribute('data-card-id') || '0');
            setVisibleCards(prev => new Set([...prev, cardId]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const registerCard = (element: HTMLDivElement | null, cardId: number) => {
    if (element && observerRef.current) {
      element.setAttribute('data-card-id', cardId.toString());
      observerRef.current.observe(element);
    }
  };

  return (
    <section
      id="features"
      className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            How Briefly Works
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Transform Your <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">Social Chaos</span><br />
            Into Professional Stories
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our AI-powered platform connects all your social accounts and automatically creates
            <span className="text-primary font-medium"> beautiful newsletters</span> that capture your unique voice
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
          {bentoItems.map((item) => {
            const IconComponent = item.icon;
            const isVisible = visibleCards.has(item.id);
            
            return (
              <div
                key={item.id}
                ref={(el) => registerCard(el, item.id)}
                className={`group cursor-pointer ${item.className} relative overflow-hidden transform transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ 
                  transitionDelay: `${item.id * 100}ms`
                }}
              >
                {/* Background with gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50`}></div>
                
                {/* Glass morphism effect */}
                <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl group-hover:border-border/80 transition-all duration-500"></div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 transition-all duration-500 blur-xl"></div>

                {/* Content */}
                <div className="relative z-10 p-8 h-full flex flex-col">
                  {/* Icon section */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-all duration-500"></div>
                      <div className="relative bg-gradient-to-br from-primary to-purple-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1 mb-6">
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg group-hover:text-foreground/90 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>

                  {/* Features list */}
                  {item.features && (
                    <div className="space-y-2 mb-6">
                      {item.features.map((feature, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground/80 transition-all duration-300"
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-purple-600"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA for larger cards */}
                  {item.id === 1 && (
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex items-center gap-2 text-primary font-medium text-sm cursor-pointer hover:gap-3 transition-all duration-200">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Animated background pattern */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-all duration-700">
                    <div className="relative w-full h-full">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{
                            top: `${(i % 4) * 25}%`,
                            left: `${Math.floor(i / 4) * 25}%`,
                            animationDelay: `${i * 100}ms`,
                            animationDuration: '2s'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl px-6 py-4">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Ready to automate your newsletter?</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
