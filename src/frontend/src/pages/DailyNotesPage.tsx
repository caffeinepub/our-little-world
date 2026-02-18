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

  // Helper to get display name with localStorage fallback
  const getDisplayName = (principalStr: string) => {
    const profile = profileMap.get(principalStr);
    if (profile?.displayName) return profile.displayName;
    
    const identity = localStorage.getItem('selectedIdentity');
    if (identity === 'takshi') return 'Takshi';
    if (identity === 'aashi') return 'Aashi';
    
    return 'Unknown';
  };

  const handleSaveNew = async () => {
    if (!newNote.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      const today = startOfDay(new Date());
      const timestamp = BigInt(today.getTime() * 1000000);
      await saveNote.mutateAsync({ content: newNote.trim(), date: timestamp });
      setNewNote('');
      toast.success('Note saved! 📝');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save note');
    }
  };

  const handleUpdate = async (noteId: string) => {
    if (!editContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    try {
      await updateNote.mutateAsync({ noteId, content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
      toast.success('Note updated! ✏️');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update note');
    }
  };

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Group notes by date
  const groupedNotes = notes.reduce((acc, note) => {
    const dateKey = format(new Date(Number(note.date) / 1000000), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const sortedDates = Object.keys(groupedNotes).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Daily Notes 📝
        </h2>

        {/* New Note Input */}
        <Card className="mb-6 border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg">Today's Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note for today..."
              className="rounded-xl resize-none"
              rows={4}
            />
            <Button
              onClick={handleSaveNew}
              disabled={!newNote.trim() || saveNote.isPending}
              className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saveNote.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-32 rounded-xl" />
            ))
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notes yet</p>
              <p className="text-sm">Start writing your first note!</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {format(new Date(dateKey), 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-3">
                  {groupedNotes[dateKey].map((note) => {
                    const isEditing = editingId === note.id;
                    const authorName = getDisplayName(note.authorId.toString());
                    const isOwnNote = userProfile && note.authorId.toString() === userProfile.name;

                    return (
                      <Card key={note.id} className="border-blue-100">
                        <CardContent className="p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="rounded-xl resize-none"
                                rows={4}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleUpdate(note.id)}
                                  disabled={updateNote.isPending}
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 rounded-xl"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={cancelEdit}
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
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {authorName}
                                </span>
                                {isOwnNote && (
                                  <Button
                                    onClick={() => startEdit(note)}
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap">{note.content}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
