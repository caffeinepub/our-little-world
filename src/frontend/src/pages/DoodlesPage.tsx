import { useState, useRef, useEffect } from 'react';
import { useGetAllDrawings, useSaveDrawing } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Save, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function DoodlesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff69b4');
  const [brushSize, setBrushSize] = useState(3);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const { data: drawings = [], isLoading } = useGetAllDrawings();
  const saveDrawing = useSaveDrawing();

  const colors = [
    '#ff69b4', // pink
    '#dda0dd', // plum
    '#87ceeb', // sky blue
    '#98fb98', // pale green
    '#ffd700', // gold
    '#ff6347', // tomato
    '#9370db', // medium purple
    '#000000', // black
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      await saveDrawing.mutateAsync(dataUrl);
      toast.success('Drawing saved! 🎨');
      clearCanvas();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save drawing');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Drawing Canvas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Doodle Board 🎨
          </h2>

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full border-2 border-pink-200 rounded-xl cursor-crosshair touch-none"
            style={{ height: '400px' }}
          />

          {/* Controls */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      color === c ? 'border-pink-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Brush Size: {brushSize}px</label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saveDrawing.isPending}
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveDrawing.isPending ? 'Saving...' : 'Save Drawing'}
              </Button>
              <Button
                onClick={clearCanvas}
                variant="outline"
                className="rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Our Gallery 🖼️
          </h2>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-48 rounded-xl" />
              ))
            ) : drawings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Palette className="w-12 h-12 mx-auto mb-3 text-pink-300" />
                <p>No drawings yet</p>
                <p className="text-sm">Create your first masterpiece!</p>
              </div>
            ) : (
              drawings.slice().reverse().map((drawing) => (
                <div key={drawing.id} className="border border-pink-100 rounded-xl p-3 bg-white">
                  <img
                    src={drawing.drawingData}
                    alt="Drawing"
                    className="w-full rounded-lg mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(Number(drawing.timestamp) / 1000000), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
