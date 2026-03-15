import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import {
  LayoutDashboard,
  FileImage,
  Stethoscope,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClinicalPulseFAB } from './ClinicalPulseFAB';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileImage, label: 'X-Ray Analysis', path: '/xray-analysis' },
  { icon: Stethoscope, label: 'Symptom Checker', path: '/symptom-checker' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/chat' },
];

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <MedicalDisclaimer variant="banner" />

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-[33px] bottom-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <img src="/logo.svg" alt="MediVision" className="h-9 w-9" />
          <span className="font-display font-bold text-sidebar-foreground">MediVision</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300',
                  isActive 
                    ? 'text-white' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-2xl z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-white")} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-primary-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-[33px] left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MediVision" className="h-8 w-8" />
          <span className="font-display font-bold text-foreground">MediVision</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 top-[33px] z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-right">
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-[33px]">
        <div className="min-h-[calc(100vh-33px)]">
          {/* Page Header */}
          {title && (
            <div className="h-16 hidden lg:flex items-center gap-4 px-6 border-b border-border bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-display font-semibold">{title}</h1>
            </div>
          )}

          {/* Mobile Padding */}
          <div className="lg:hidden h-16" />

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
        <ClinicalPulseFAB />
      </main>

      {/* Global Optical Engine (Liquid Glass Refraction Filter) */}
      <svg className="fixed h-0 w-0 opacity-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-refraction">
            {/* Fractal noise for organic displacement */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.01" 
              numOctaves="2" 
              result="noise"
              seed="1" 
            />
            
            {/* Increase contrast of noise for better refraction map */}
            <feColorMatrix 
              in="noise" 
              type="matrix" 
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 10 -4" 
              result="refractionMap" 
            />

            {/* Apply displacement to the SourceGraphic (or Backdrop) */}
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="refractionMap" 
              scale="8" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
