import { useState, useEffect } from 'react';
import { useGetAllScheduledQuestions, useCreateScheduledQuestion, useUpdateScheduledQuestion } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus, Edit2, Save, X, Shield, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { DailyCheckInQuestion } from '../backend';

export default function AdminPanelPage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [questionText, setQuestionText] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<DailyCheckInQuestion | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);

  const { data: scheduledQuestions = [], isLoading } = useGetAllScheduledQuestions();
  const createQuestion = useCreateScheduledQuestion();
  const updateQuestion = useUpdateScheduledQuestion();

  // Check selected identity on mount
  useEffect(() => {
    const identity = localStorage.getItem('selectedIdentity');
    setSelectedIdentity(identity);
  }, []);

  // If not Takshi, show access denied
  if (selectedIdentity !== 'takshi') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-100 p-12">
          <Shield className="w-16 h-16 mx-auto mb-6 text-red-500" />
          <h2 className="text-3xl font-bold mb-4 text-red-600">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-4 text-lg">
            Only Takshi can access the admin panel
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <AlertCircle className="w-4 h-4" />
            <span>Please select "Takshi" in Settings to access this page</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      const dateObj = new Date(selectedDate);
      const timestamp = BigInt(dateObj.getTime() * 1000000); // Convert to nanoseconds

      if (editingQuestion) {
        await updateQuestion.mutateAsync({
          questionId: editingQuestion.id,
          question: questionText.trim(),
          date: timestamp,
        });
        toast.success('Question updated successfully! ✅');
        setEditingQuestion(null);
      } else {
        await createQuestion.mutateAsync({
          question: questionText.trim(),
          date: timestamp,
        });
        toast.success('Question scheduled successfully! ✅');
      }

      setQuestionText('');
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to save question');
    }
  };

  const handleEdit = (question: DailyCheckInQuestion) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    const dateObj = new Date(Number(question.date) / 1000000);
    setSelectedDate(format(dateObj, 'yyyy-MM-dd'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Sort questions by date (upcoming first)
  const sortedQuestions = [...scheduledQuestions].sort((a, b) => {
    return Number(a.date - b.date);
  });

  const upcomingQuestions = sortedQuestions.filter(q => Number(q.date) >= Date.now() * 1000000);
  const pastQuestions = sortedQuestions.filter(q => Number(q.date) < Date.now() * 1000000);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-sm text-muted-foreground">Schedule Daily Check-In questions</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Automatic Question Rotation</p>
            <p className="text-blue-700">
              Questions scheduled for future dates will automatically become active on their designated day. 
              The system displays the earliest scheduled question as "today's question" when its date arrives.
            </p>
          </div>
        </div>

        {/* Question Form */}
        <Card className="mb-6 border-purple-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {editingQuestion ? (
                <>
                  <Edit2 className="w-5 h-5" />
                  Update Question
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Schedule a Question
                </>
              )}
            </CardTitle>
            <CardDescription>
              {editingQuestion 
                ? 'Edit the scheduled question below' 
                : 'Create a new question for a specific date - it will automatically appear on that day'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What's your favorite memory from this week?"
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!questionText.trim() || !selectedDate || createQuestion.isPending || updateQuestion.isPending}
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingQuestion ? 'Update' : 'Save'}
              </Button>
              {editingQuestion && (
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Questions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Upcoming Questions</h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl">
              <p>No upcoming questions scheduled</p>
              <p className="text-sm mt-1">Create one above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={handleEdit}
                  isEditing={editingQuestion?.id === question.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Questions */}
        {pastQuestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Past Questions</h3>
            <div className="space-y-3">
              {pastQuestions.slice(0, 10).map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={handleEdit}
                  isEditing={editingQuestion?.id === question.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: DailyCheckInQuestion;
  onEdit: (question: DailyCheckInQuestion) => void;
  isEditing: boolean;
}

function QuestionCard({ question, onEdit, isEditing }: QuestionCardProps) {
  const dateObj = new Date(Number(question.date) / 1000000);
  const isPast = dateObj < new Date();
  const isToday = format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <Card className={`border-2 transition-all ${isEditing ? 'border-purple-300 bg-purple-50/50' : 'border-gray-100 hover:border-purple-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${isPast ? 'text-muted-foreground' : isToday ? 'text-green-600' : 'text-purple-600'}`}>
                {format(dateObj, 'MMMM d, yyyy')}
              </span>
              {isToday && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Today
                </span>
              )}
              {isPast && !isToday && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Past
                </span>
              )}
            </div>
            <p className="text-foreground">{question.question}</p>
          </div>
          <Button
            onClick={() => onEdit(question)}
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
