import React from 'react';
import { Loader2, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  text,
  className 
}) => {
  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin', sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={cn('animate-bounce', sizeClasses[size], 'bg-current rounded-full')} style={{ animationDelay: '0ms' }} />
      <div className={cn('animate-bounce', sizeClasses[size], 'bg-current rounded-full')} style={{ animationDelay: '150ms' }} />
      <div className={cn('animate-bounce', sizeClasses[size], 'bg-current rounded-full')} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const renderPulse = () => (
    <div className={cn('animate-pulse bg-current rounded-full', sizeClasses[size])} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {renderLoader()}
      {text && (
        <span className={cn('text-muted-foreground', textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  children: React.ReactNode;
  isLoading: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  children,
  isLoading,
  text = 'Loading...',
  className
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Loading text={text} size="lg" />
      </div>
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}; 