import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

interface BypassRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
  requireAuth?: boolean;
}

const BypassRoute: React.FC<BypassRouteProps> = ({ 
  children, 
  fallbackPath = "/",
  requireAuth = true
}) => {
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');

  // Check if admin bypass is present
  if (adminBypass === 'bypass') {
    // Allow direct access for admin bypass
    return <>{children}</>;
  }

  // If bypass is not present and auth is required, redirect to fallback
  if (requireAuth) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If no auth required, render children normally
  return <>{children}</>;
};

export default BypassRoute; 