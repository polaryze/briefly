import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Simple loading component
const SimpleLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth0()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <SimpleLoader />
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
} 