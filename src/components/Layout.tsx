import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Hospital,
  Stethoscope, 
  Calendar, 
  Pill, 
  BarChart3, 
  Video, 
  AlertTriangle, 
  TrendingUp,
  Globe,
  Menu,
  X,
  MapPin,
  ShoppingCart,
  Shield,
  User,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState } from 'react';
import { toast } from '../hooks/use-toast';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut, isDoctor } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = isDoctor ? [
    { path: '/doctor-dashboard', icon: BarChart3, label: 'Dashboard' },
  ] : [
    { path: '/', icon: Hospital, label: t('home') },
    { path: '/symptoms', icon: Stethoscope, label: t('symptoms') },
    { path: '/appointments', icon: Calendar, label: t('appointments') },
    { path: '/reminders', icon: Pill, label: t('reminders') },
    { path: '/teleconsultation', icon: Video, label: t('teleconsultation') },
    { path: '/alerts', icon: AlertTriangle, label: t('alerts') },
    { path: '/hospital-locator', icon: MapPin, label: t('hospitals') },
    { path: '/medicine-hub', icon: ShoppingCart, label: t('medicineHub') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/" className="flex  items-center space-x-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Hospital className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-primary bg-clip-text text-transparent">
              Medicare-ai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                  <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-1 sm:px-2 py-1 rounded-md text-xs font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button onClick={() => { window.open('https://mental-health-ai-backend-suggestion.onrender.com'); }} >Report Analysis</Button>
            <Button onClick={() => { window.open('https://mental-health-ai-kohl.vercel.app'); }} >Mental Health AI</Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-2 text-xs"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">{language.toUpperCase()}</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="w-full py-3 px-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="w-full justify-start space-x-2 mt-3"
              >
                <Globe className="h-4 w-4" />
                <span>Language: {language.toUpperCase()}</span>
              </Button>
              
              {/* Mobile User Info */}
              <div className="pt-3 border-t mt-3">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start space-x-2 mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3 col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2">
                <Hospital className="h-5 w-5 text-primary" />
                <span className="font-semibold">Medi-care AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted AI-powered healthcare companion for better health management.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm sm:text-base">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Symptom Analysis</li>
                <li>Appointment Booking</li>
                <li>Health Monitoring</li>
                <li>Teleconsultation</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm sm:text-base">Emergency</h4>
              <p className="text-sm text-muted-foreground">
                For medical emergencies, call 108 for ambulance services.
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = 'tel:108'}
              >
                Emergency: 108
              </Button>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
            Built for healthcare innovation by team BIT for BYTE
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
