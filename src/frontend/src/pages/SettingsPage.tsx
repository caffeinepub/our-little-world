import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Music, User } from 'lucide-react';
import MusicPlayer from '../components/MusicPlayer';

export default function SettingsPage() {
  const [selectedIdentity, setSelectedIdentity] = useState<string>('');

  useEffect(() => {
    // Load saved identity from localStorage
    const saved = localStorage.getItem('selectedIdentity');
    if (saved) {
      setSelectedIdentity(saved);
    }
  }, []);

  const handleIdentityChange = (value: string) => {
    setSelectedIdentity(value);
    localStorage.setItem('selectedIdentity', value);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('identityChanged'));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          Settings ⚙️
        </h2>

        {/* Identity Selection */}
        <Card className="mb-6 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Your Identity
            </CardTitle>
            <CardDescription>
              Choose who you are to personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedIdentity} onValueChange={handleIdentityChange}>
              <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer">
                <RadioGroupItem value="takshi" id="takshi" />
                <Label htmlFor="takshi" className="flex-1 cursor-pointer font-medium">
                  Takshi 💕
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mt-3">
                <RadioGroupItem value="aashi" id="aashi" />
                <Label htmlFor="aashi" className="flex-1 cursor-pointer font-medium">
                  Aashi 💙
                </Label>
              </div>
            </RadioGroup>
            {selectedIdentity && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                You are currently: <span className="font-semibold">{selectedIdentity === 'takshi' ? 'Takshi' : 'Aashi'}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Music Player */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="w-5 h-5" />
              Background Music
            </CardTitle>
            <CardDescription>
              Play romantic music while browsing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MusicPlayer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
