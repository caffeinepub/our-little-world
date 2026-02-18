import { MessageCircle, Palette, StickyNote, Image, Heart, Settings, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetCallerUserProfile, useIsAdmin } from '../hooks/useQueries';

type Page = 'home' | 'chat' | 'doodles' | 'notes' | 'memories' | 'reactions' | 'settings' | 'checkin' | 'admin';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsAdmin();

  const sections = [
    { id: 'checkin' as Page, label: 'Daily Check-In', icon: CheckCircle, color: 'from-green-400 to-emerald-400', emoji: '✅', adminOnly: false },
    { id: 'chat' as Page, label: 'Chat', icon: MessageCircle, color: 'from-pink-400 to-rose-400', emoji: '💬', adminOnly: false },
    { id: 'doodles' as Page, label: 'Doodles', icon: Palette, color: 'from-purple-400 to-indigo-400', emoji: '🎨', adminOnly: false },
    { id: 'notes' as Page, label: 'Daily Notes', icon: StickyNote, color: 'from-blue-400 to-cyan-400', emoji: '📝', adminOnly: false },
    { id: 'memories' as Page, label: 'Memories', icon: Image, color: 'from-pink-400 to-purple-400', emoji: '📸', adminOnly: false },
    { id: 'reactions' as Page, label: 'Reactions', icon: Heart, color: 'from-rose-400 to-pink-400', emoji: '💕', adminOnly: false },
    { id: 'admin' as Page, label: 'Admin', icon: Shield, color: 'from-purple-400 to-pink-400', emoji: '🛡️', adminOnly: true },
    { id: 'settings' as Page, label: 'Settings', icon: Settings, color: 'from-gray-400 to-slate-400', emoji: '⚙️', adminOnly: false },
  ];

  const visibleSections = sections.filter(section => !section.adminOnly || isAdmin);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Welcome back{userProfile ? `, ${userProfile.displayName}` : ''}! 💌
        </h2>
        <p className="text-muted-foreground text-lg">
          Your private space to share love, memories, and moments
        </p>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 border-2 border-transparent hover:border-pink-200 bg-white/80 backdrop-blur-sm overflow-hidden group"
              onClick={() => onNavigate(section.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center text-3xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {section.emoji}
                </div>
                <h3 className="font-semibold text-lg mb-1">{section.label}</h3>
                <Icon className="w-4 h-4 mx-auto text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Decorative Section */}
      <div className="mt-12 text-center">
        <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
          <p className="text-sm text-muted-foreground">
            Made with love, just for us 💗
          </p>
        </div>
      </div>
    </div>
  );
}
