import { useState } from 'react';
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

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsAdmin();

  const showProfileSetup = !profileLoading && isFetched && userProfile === null;

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

  const visibleNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    // Access control for admin page
    if (currentPage === 'admin' && !isAdmin) {
      return (
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-100 p-12">
            <Shield className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <h2 className="text-3xl font-bold mb-4 text-red-600">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              You don't have permission to access the admin panel
            </p>
            <Button
              onClick={() => handleNavigate('home')}
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
      case 'checkin':
        return <DailyCheckInPage />;
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
      case 'admin':
        return <AdminPanelPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative">
      <FloatingHeartsBackground />
      
      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/app-mark.dim_512x512.png" 
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Our Little World
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-white/95 backdrop-blur-md">
                <nav className="flex flex-col gap-2 mt-8">
                  {visibleNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 font-medium'
                            : 'hover:bg-pink-50 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 py-6 text-center text-sm text-muted-foreground border-t border-pink-100 bg-white/50 backdrop-blur-sm">
        <p>
          Built with <Heart className="inline w-4 h-4 text-pink-500" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs mt-1">© {new Date().getFullYear()} Our Little World</p>
      </footer>
    </div>
  );
}
