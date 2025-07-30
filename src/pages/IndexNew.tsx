import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  
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
      // Simulate API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          clearTimeout(timeoutId);
          resolve(true);
        }, 1000);
        
        // Handle abort
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Request timeout'));
        });
      });
      
      setIsSubmitted(true);
    } catch (error) {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md px-6 py-4">
        {/* Animated Text */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-3 leading-tight">
            Briefly
          </h1>
          <p className="text-base md:text-lg text-gray-600 h-5">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Email Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                className={`h-11 text-base rounded-full border-2 focus:ring-0 bg-white text-black placeholder-gray-500 ${
                  emailError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-black'
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
                <p className="text-red-500 text-xs mt-1 text-center">
                  {emailError}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-semibold rounded-full disabled:opacity-50"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                <span>Join Waitlist</span>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-black mb-2">You're on the list!</h3>
            <p className="text-sm text-gray-600">
              We'll notify you when Briefly is ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 