import { useState } from 'react';
import { useGetAllNotes, useSaveNote, useUpdateNote, useGetCallerUserProfile } from '../hooks/useQueries';
import { useUserProfiles } from '../hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay, isSameDay } from 'date-fns';

export default function DailyNotesPage() {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: notes = [], isLoading } = useGetAllNotes();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveNote = useSaveNote();
  const updateNote = useUpdateNote();

  // Get unique authors from notes
  const uniqueAuthors = Array.from(new Set(notes.map((n) => n.authorId)));
  const { profileMap } = useUserProfiles(uniqueAuthors);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const now = BigInt(Date.now() * 1000000);
      await saveNote.mutateAsync({ content: newNote.trim(), date: now });
      setNewNote('');
      toast.success('Note added! 📝');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    }
  };

  const handleStartEdit = (note: any) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    try {
      await updateNote.mutateAsync({ noteId: editingId, content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
      toast.success('Note updated! ✨');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Group notes by day
  const groupedNotes = notes.reduce((acc, note) => {
    const date = new Date(Number(note.date) / 1000000);
    const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const sortedDays = Object.keys(groupedNotes).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Daily Notes 📝
        </h2>

        {/* Add Note */}
        <div className="mb-6 space-y-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a sweet note..."
            className="rounded-xl resize-none"
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim() || saveNote.isPending}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            {saveNote.isPending ? 'Adding...' : 'Add Note'}
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-32 rounded-xl" />
            ))
          ) : sortedDays.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No notes yet 💕</p>
              <p className="text-sm">Start writing your thoughts!</p>
            </div>
          ) : (
            sortedDays.map((dayKey) => {
              const dayNotes = groupedNotes[dayKey];
              const date = new Date(dayKey);
              const isToday = isSameDay(date, new Date());

              return (
                <div key={dayKey}>
                  <h3 className="text-lg font-semibold mb-3 text-pink-600">
                    {isToday ? 'Today' : format(date, 'MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {dayNotes.map((note) => {
                      const isEditing = editingId === note.id;
                      const authorProfile = profileMap.get(note.authorId.toString());
                      const authorName = authorProfile?.displayName || 'Unknown';

                      return (
                        <Card key={note.id} className="border-pink-100">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                {authorName}
                              </CardTitle>
                              {!isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStartEdit(note)}
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="rounded-xl resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleSaveEdit}
                                    disabled={!editContent.trim() || updateNote.isPending}
                                    size="sm"
                                    className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 rounded-xl"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{note.content}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
