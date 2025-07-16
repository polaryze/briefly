import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useSmoothNavigate = () => {
  const navigate = useNavigate();

  const smoothNavigate = useCallback((to: string, delay: number = 250) => {
    // Add exit animation class to the page wrapper
    const pageWrapper = document.querySelector('.page-transition-wrapper');
    if (pageWrapper) {
      pageWrapper.classList.add('page-exiting');
    }

    // Navigate after the exit animation completes
    setTimeout(() => {
      navigate(to);
    }, delay);
  }, [navigate]);

  return smoothNavigate;
};

export default useSmoothNavigate; 