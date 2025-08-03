import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { Shield, ExternalLink, ArrowRight, Sparkles, Mail, Zap } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Input sanitization function
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
};

// Rate limiting for form submission
const SUBMISSION_COOLDOWN = 5000; // 5 seconds

export default function IndexNew() {
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');
  
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const fullText = "Newsletters reimagined";

  // Typing animation effect with loop
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // When animation completes, wait 2 seconds then restart
      const restartTimeout = setTimeout(() => {
        setDisplayText("");
        setCurrentIndex(0);
      }, 2000);
      return () => clearTimeout(restartTimeout);
    }
  }, [currentIndex, fullText]);

  // Mouse movement for background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Prevent zoom on input focus (iOS)
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    return () => document.removeEventListener('touchstart', preventZoom);
  }, []);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    
    if (email.length > 254) { // RFC 5321 limit
      setEmailError("Email is too long");
      return false;
    }
    
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'throwaway.email'
    ];
    
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
      setEmailError("Please use a valid email address");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    setEmail(sanitizedValue);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If admin bypass is active, redirect to newsletter builder instead
    if (adminBypass === 'bypass') {
      window.location.href = '/newsletter-builder?admin=bypass';
      return;
    }
    
    // Rate limiting
    const now = Date.now();
    if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
      setEmailError("Please wait a moment before trying again");
      return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }
    
    setIsLoading(true);
    setLastSubmissionTime(now);
    
    try {
      // Call the secure waitlist endpoint
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      // Success
      setIsSubmitted(true);

    } catch (error) {
      setEmailError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Regular waitlist content (same for both normal and bypass users)
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,0.1) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-4">
        <div className="w-full max-w-md">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            {/* Admin bypass indicator */}
            {adminBypass === 'bypass' && (
              <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Access Active</span>
                </div>
              </div>
            )}
            
            {/* Main title with enhanced styling */}
            <div className="relative mb-6">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent leading-tight">
                Briefly
              </h1>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            {/* Subtitle with typing animation */}
            <div className="relative">
              <p className="text-xl md:text-2xl text-gray-600 h-8 flex items-center justify-center">
                {displayText}
                <span className="animate-pulse text-black">|</span>
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-black to-transparent rounded-full" />
            </div>
            
            {/* Feature highlights */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Smart Templates</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Beautiful Design</span>
              </div>
            </div>
          </div>

          {/* Enhanced Email Form */}
          {!isSubmitted ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-2xl transform rotate-1 opacity-20" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {adminBypass === 'bypass' ? 'Ready to access the platform?' : 'Join the waitlist'}
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      className={`h-12 text-base rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm text-black placeholder-gray-500 transition-all duration-300 ${
                        emailError 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
                      }`}
                      required
                      maxLength={254}
                      autoComplete="email"
                      spellCheck="false"
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-2 text-center">
                        {emailError}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{adminBypass === 'bypass' ? 'Accessing...' : 'Joining...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{adminBypass === 'bypass' ? 'Access Platform' : 'Join Waitlist'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-2xl transform rotate-1 opacity-20" />
              <div className="relative bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-8 shadow-xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">You're on the list!</h3>
                  <p className="text-gray-600">
                    We'll notify you when Briefly is ready.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 