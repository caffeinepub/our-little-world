import { useState, useEffect } from 'react';
import { Home, MessageCircle, Palette, StickyNote, Image, Heart, Settings, Menu, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import DoodlesPage from '../pages/DoodlesPage';
import DailyNotesPage from '../pages/DailyNotesPage';
import MemoryWallPage from '../pages/MemoryWallPage';
import ReactionsPage from '../pages/ReactionsPage';
import SettingsPage from '../pages/SettingsPage';
import DailyCheckInPage from '../pages/DailyCheckInPage';
import AdminPanelPage from '../pages/AdminPanelPage';
import FloatingHeartsBackground from './FloatingHeartsBackground';
import ProfileSetupModal from './ProfileSetupModal';

type Page = 'home' | 'chat' | 'doodles' | 'notes' | 'memories' | 'reactions' | 'settings' | 'checkin' | 'admin';

export default function AppShell() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsAdmin();

  // Load selected identity from localStorage
  useEffect(() => {
    const identity = localStorage.getItem('selectedIdentity');
    setSelectedIdentity(identity);

    // Listen for storage changes
    const handleStorageChange = () => {
      const newIdentity = localStorage.getItem('selectedIdentity');
      setSelectedIdentity(newIdentity);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleIdentityChange = () => {
      const newIdentity = localStorage.getItem('selectedIdentity');
      setSelectedIdentity(newIdentity);
    };
    window.addEventListener('identityChanged', handleIdentityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('identityChanged', handleIdentityChange);
    };
  }, []);

  const showProfileSetup = !profileLoading && isFetched && userProfile === null;

  // Check if user can access admin panel (must be Takshi)
  const canAccessAdmin = selectedIdentity === 'takshi';

  const navigation = [
    { id: 'home' as Page, label: 'Home', icon: Home, adminOnly: false },
    { id: 'checkin' as Page, label: 'Daily Check-In', icon: CheckCircle, adminOnly: false },
    { id: 'chat' as Page, label: 'Chat', icon: MessageCircle, adminOnly: false },
    { id: 'doodles' as Page, label: 'Doodles', icon: Palette, adminOnly: false },
    { id: 'notes' as Page, label: 'Notes', icon: StickyNote, adminOnly: false },
    { id: 'memories' as Page, label: 'Memories', icon: Image, adminOnly: false },
    { id: 'reactions' as Page, label: 'Reactions', icon: Heart, adminOnly: false },
    { id: 'admin' as Page, label: 'Admin', icon: Shield, adminOnly: true },
    { id: 'settings' as Page, label: 'Settings', icon: Settings, adminOnly: false },
  ];

  const visibleNavigation = navigation.filter(item => !item.adminOnly || canAccessAdmin);

  const handleNavigate = (page: Page) => {
    // Prevent navigation to admin if not Takshi
    if (page === 'admin' && selectedIdentity !== 'takshi') {
      setCurrentPage('home');
      setIsMenuOpen(false);
      return;
    }
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    // Access control for admin page - only Takshi can access
    if (currentPage === 'admin' && selectedIdentity !== 'takshi') {
      return (
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-100 p-12">
            <Shield className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <h2 className="text-3xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4 text-lg">
              Only Takshi can access the admin panel
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please select "Takshi" in Settings to access this page
            </p>
            <Button
              onClick={() => setCurrentPage('home')}
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
            >
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatPage />;
      case 'doodles':
        return <DoodlesPage />;
      case 'notes':
        return <DailyNotesPage />;
      case 'memories':
        return <MemoryWallPage />;
      case 'reactions':
        return <ReactionsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'checkin':
        return <DailyCheckInPage />;
      case 'admin':
        return <AdminPanelPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <FloatingHeartsBackground />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
              💕
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Our Love Space
            </h1>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 mt-8">
                {visibleNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? 'default' : 'ghost'}
                      className="justify-start"
                      onClick={() => handleNavigate(item.id)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate(item.id)}
                  className="rounded-xl"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} • Built with 💕 using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
