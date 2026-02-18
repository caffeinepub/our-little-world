import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import MusicPlayer from '../components/MusicPlayer';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Settings ⚙️
        </h2>

        <div className="space-y-4">
          {/* Music Player */}
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Music className="w-5 h-5 text-pink-500" />
                Background Music
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MusicPlayer />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
