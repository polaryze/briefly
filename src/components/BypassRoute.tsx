import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

interface BypassRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const BypassRoute: React.FC<BypassRouteProps> = ({ 
  children, 
  fallbackPath = "/" 
}) => {
  const [searchParams] = useSearchParams();
  const adminBypass = searchParams.get('admin');

  // Check if admin bypass is present
  if (adminBypass === 'bypass') {
    // Allow direct access for admin bypass
    return <>{children}</>;
  }

  // Redirect to fallback path if no bypass
  return <Navigate to={fallbackPath} replace />;
};

export default BypassRoute; 