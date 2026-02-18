import { useGetReactionCounts, useGetRecentReactions, useAddReaction } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ReactionType } from '../backend';

export default function ReactionsPage() {
  const { data: counts, isLoading: countsLoading } = useGetReactionCounts();
  const { data: recentReactions = [], isLoading: reactionsLoading } = useGetRecentReactions();
  const addReaction = useAddReaction();

  const handleReaction = async (type: ReactionType) => {
    try {
      await addReaction.mutateAsync(type);
      const emoji = type === ReactionType.heart ? '💕' : type === ReactionType.hug ? '🤗' : '💋';
      toast.success(`Sent ${emoji}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reaction');
    }
  };

  const reactions = [
    { type: ReactionType.heart, emoji: '💕', label: 'Heart', color: 'from-pink-400 to-rose-400', count: counts?.hearts },
    { type: ReactionType.hug, emoji: '🤗', label: 'Hug', color: 'from-purple-400 to-indigo-400', count: counts?.hugs },
    { type: ReactionType.kiss, emoji: '💋', label: 'Kiss', color: 'from-red-400 to-pink-400', count: counts?.kisses },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center">
          Send Love 💕
        </h2>

        {/* Reaction Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {reactions.map((reaction) => (
            <Card
              key={reaction.type}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 border-2 border-transparent hover:border-pink-200 overflow-hidden"
              onClick={() => handleReaction(reaction.type)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${reaction.color} flex items-center justify-center text-4xl shadow-lg`}>
                  {reaction.emoji}
                </div>
                <h3 className="font-semibold text-lg mb-2">{reaction.label}</h3>
                {countsLoading ? (
                  <Skeleton className="h-6 w-16 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold text-pink-500">
                    {reaction.count?.toString() || '0'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reactionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-12 rounded-xl" />
              ))
            ) : recentReactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No reactions yet</p>
                <p className="text-sm">Be the first to send some love!</p>
              </div>
            ) : (
              recentReactions.map((reaction, index) => {
                const emoji = reaction.type === ReactionType.heart ? '💕' : reaction.type === ReactionType.hug ? '🤗' : '💋';
                const label = reaction.type === ReactionType.heart ? 'Heart' : reaction.type === ReactionType.hug ? 'Hug' : 'Kiss';
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sent a {label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(Number(reaction.timestamp) / 1000000), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
