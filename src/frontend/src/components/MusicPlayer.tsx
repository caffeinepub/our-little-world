import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        loop
        src="/assets/music/romantic-instrumental.mp3"
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          size="lg"
          className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-full w-14 h-14"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12 text-right">{volume}%</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {isPlaying ? '🎵 Playing romantic music...' : '🎵 Click play to start music'}
      </p>
    </div>
  );
}
