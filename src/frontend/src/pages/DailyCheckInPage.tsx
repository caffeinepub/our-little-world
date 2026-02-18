import { useState } from 'react';
import { useGetTodaysQuestion, useGetAnswersForQuestion, useSubmitDailyAnswer, useGetPastQuestions } from '../hooks/useQueries';
import { useUserProfiles } from '../hooks/useUserProfiles';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DailyCheckInPage() {
  const [answer, setAnswer] = useState('');

  const { data: todaysQuestion, isLoading: questionLoading } = useGetTodaysQuestion();
  const questionId = todaysQuestion?.id || '';
  const { data: answersData, isLoading: answersLoading } = useGetAnswersForQuestion(questionId);
  const { data: pastQuestionIds = [], isLoading: historyLoading } = useGetPastQuestions();
  const submitAnswer = useSubmitDailyAnswer();

  // Get unique users from answers
  const allUsers = [
    answersData?.currentUserAnswer?.user,
    answersData?.otherUserAnswer?.user,
  ].filter(Boolean);
  const { profileMap } = useUserProfiles(allUsers as any[]);

  const hasSubmitted = !!answersData?.currentUserAnswer;
  const otherHasSubmitted = !!answersData?.otherUserAnswer;
  const bothSubmitted = hasSubmitted && otherHasSubmitted;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error('Please write an answer');
      return;
    }

    if (!questionId) {
      toast.error('No question available');
      return;
    }

    try {
      await submitAnswer.mutateAsync({
        answer: answer.trim(),
        questionId,
      });
      setAnswer('');
      toast.success('Answer submitted! 💕');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    }
  };

  // Get unique past question IDs (excluding today)
  const uniquePastQuestionIds = Array.from(new Set(pastQuestionIds))
    .filter((id) => id !== questionId)
    .slice(0, 10); // Show last 10

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Daily Check-In
            </h2>
            <p className="text-sm text-muted-foreground">Answer today's question together</p>
          </div>
        </div>

        {/* Today's Question */}
        <Card className="mb-6 border-green-100">
          <CardHeader>
            <CardTitle className="text-lg">Today's Question</CardTitle>
            <CardDescription>{format(new Date(), 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            {questionLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : todaysQuestion ? (
              <p className="text-lg font-medium text-foreground mb-4">{todaysQuestion.question}</p>
            ) : (
              <p className="text-muted-foreground">No question available for today</p>
            )}

            {/* Answer Input */}
            {!hasSubmitted && todaysQuestion && (
              <div className="space-y-3 mt-4">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write your answer..."
                  className="rounded-xl resize-none"
                  rows={4}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitAnswer.isPending}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 rounded-xl"
                >
                  {submitAnswer.isPending ? 'Submitting...' : 'Submit Answer'}
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Your partner's answer is hidden until you submit yours</span>
                </div>
              </div>
            )}

            {/* Answers Display */}
            {hasSubmitted && answersData && (
              <div className="space-y-4 mt-4">
                {/* Current User's Answer */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                      {profileMap.get(answersData.currentUserAnswer!.user.toString())?.displayName?.[0] || 'Y'}
                    </div>
                    <span className="font-medium text-sm">
                      {profileMap.get(answersData.currentUserAnswer!.user.toString())?.displayName || 'You'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{answersData.currentUserAnswer!.answer}</p>
                </div>

                {/* Other User's Answer */}
                {bothSubmitted ? (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                        {profileMap.get(answersData.otherUserAnswer!.user.toString())?.displayName?.[0] || '?'}
                      </div>
                      <span className="font-medium text-sm">
                        {profileMap.get(answersData.otherUserAnswer!.user.toString())?.displayName || 'Partner'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{answersData.otherUserAnswer!.answer}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Waiting for your partner...</p>
                      <p className="text-xs text-muted-foreground">Their answer will appear once they submit</p>
                    </div>
                  </div>
                )}

                {bothSubmitted && (
                  <div className="flex items-center gap-2 text-sm text-green-600 justify-center">
                    <Unlock className="w-4 h-4" />
                    <span>Both answers revealed! 💕</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Past Check-Ins</h3>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : uniquePastQuestionIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No past check-ins yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uniquePastQuestionIds.map((qId) => (
                <PastQuestionCard key={qId} questionId={qId} profileMap={profileMap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastQuestionCard({ questionId, profileMap }: { questionId: string; profileMap: Map<string, any> }) {
  const { data: answersData } = useGetAnswersForQuestion(questionId);
  const bothSubmitted = !!answersData?.currentUserAnswer && !!answersData?.otherUserAnswer;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Question ID: {questionId.substring(0, 20)}...
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bothSubmitted && answersData ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-xs">
                  {profileMap.get(answersData.currentUserAnswer!.user.toString())?.displayName || 'You'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-2">{answersData.currentUserAnswer!.answer}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-xs">
                  {profileMap.get(answersData.otherUserAnswer!.user.toString())?.displayName || 'Partner'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-2">{answersData.otherUserAnswer!.answer}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Incomplete - waiting for both answers</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
