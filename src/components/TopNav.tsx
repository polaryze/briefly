import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Menu, X, Sparkles, Zap, ArrowRight, LogOut, User } from 'lucide-react';

const TopNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth0();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileMenuOpen && !(event.target as Element).closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const navItems = [
    { label: 'Features', href: '#features', icon: Sparkles },
    { label: 'How it Works', href: '#how-it-works', icon: Zap },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Profile Dropdown Menu - Rendered via Portal */}
      {isProfileMenuOpen && createPortal(
        <div className="fixed top-20 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[99999]">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout({ logoutParams: { returnTo: window.location.origin } });
              setIsProfileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>,
        document.body
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-700 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-r from-black to-gray-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Briefly
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  AI Newsletter
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/newsletter-builder')}
                    className="font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Dashboard
                  </Button>
                  <div className="relative profile-menu">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200 bg-white rounded-full flex items-center justify-center overflow-hidden">
                        {user?.picture ? (
                          <img 
                            src={user.picture} 
                            alt={user.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">👤</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                    </button>
                    

                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/signin')}
                    className="font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/newsletter-builder')}
                    className="group bg-gradient-to-r from-black to-gray-700 hover:from-gray-700 hover:to-black text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Start Free
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-6 space-y-4">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* Mobile CTA */}
            <div className="pt-4 border-t border-border/50 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/newsletter-builder');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full font-medium"
                  >
                    Dashboard
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 ring-2 ring-primary/20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                      {user?.picture ? (
                        <img 
                          src={user.picture} 
                          alt={user.name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">👤</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout({ logoutParams: { returnTo: window.location.origin } });
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 p-0 h-auto"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/newsletter-builder');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-700 hover:to-black text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default TopNav;