import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start with invisible state
    setIsVisible(false);
    
    // Remove any exit classes that might be lingering
    const pageWrapper = document.querySelector('.page-transition-wrapper');
    if (pageWrapper) {
      pageWrapper.classList.remove('page-exiting');
    }
    
    // Small delay to ensure smooth entry animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`page-transition-wrapper ${className} ${
        isVisible ? 'page-visible' : 'page-hidden'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition; 