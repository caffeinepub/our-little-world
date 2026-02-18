import { useState } from 'react';
import { useGetAllMemories, useSaveMemory } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalBlob } from '../backend';
import { formatDistanceToNow } from 'date-fns';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function MemoryWallPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: memories = [], isLoading } = useGetAllMemories();
  const saveMemory = useSaveMemory();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption.trim()) {
      toast.error('Please select an image and add a caption.');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await saveMemory.mutateAsync({ photo: blob, caption: caption.trim() });
      
      toast.success('Memory saved! 📸');
      setIsDialogOpen(false);
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadProgress(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save memory');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Memory Wall 📸
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a Memory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="photo">Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="rounded-xl"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-3 w-full h-48 object-cover rounded-xl"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="rounded-xl"
                  />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !caption.trim() || saveMemory.isPending}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
                >
                  {saveMemory.isPending ? 'Uploading...' : 'Save Memory'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-64 rounded-xl" />
            ))
          ) : memories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-pink-300" />
              <p className="text-lg mb-2">No memories yet 💕</p>
              <p className="text-sm">Start capturing your special moments!</p>
            </div>
          ) : (
            memories.slice().reverse().map((memory) => (
              <div key={memory.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-pink-100">
                <img
                  src={memory.photo.getDirectURL()}
                  alt={memory.caption}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-medium mb-2">{memory.caption}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(Number(memory.timestamp) / 1000000), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
