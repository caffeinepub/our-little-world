import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Message, Drawing, Note, Memory, Reaction, ReactionType, MessageType, DailyCheckInQuestion, DailyAnswer } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// Polling defaults
const POLLING_INTERVAL = 3000; // 3 seconds for near-real-time feel

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Check
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Chat/Messages
export function useGetAllMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, messageType }: { content: string; messageType: MessageType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(content, messageType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// Drawings
export function useGetAllDrawings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Drawing[]>({
    queryKey: ['drawings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDrawings();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSaveDrawing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drawingData: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDrawing(drawingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
    },
  });
}

// Notes
export function useGetAllNotes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSaveNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, date }: { content: string; date: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveNote(content, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNote(noteId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Memories
export function useGetAllMemories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Memory[]>({
    queryKey: ['memories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMemories();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSaveMemory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photo, caption }: { photo: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMemory(photo, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

// Reactions
export function useGetReactionCounts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ hearts: bigint; hugs: bigint; kisses: bigint }>({
    queryKey: ['reactionCounts'],
    queryFn: async () => {
      if (!actor) return { hearts: 0n, hugs: 0n, kisses: 0n };
      return actor.getReactionCounts();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useGetRecentReactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reaction[]>({
    queryKey: ['recentReactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentReactions();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useAddReaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReaction(reactionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactionCounts'] });
      queryClient.invalidateQueries({ queryKey: ['recentReactions'] });
    },
  });
}

// Daily Check-In
export function useGetTodaysQuestion() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyCheckInQuestion | null>({
    queryKey: ['todaysQuestion'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTodaysQuestion();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useGetAnswersForQuestion(questionId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ currentUserAnswer?: DailyAnswer; otherUserAnswer?: DailyAnswer } | null>({
    queryKey: ['answers', questionId],
    queryFn: async () => {
      if (!actor || !questionId) return null;
      return actor.getAnswersForQuestion(questionId);
    },
    enabled: !!actor && !actorFetching && !!questionId,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useSubmitDailyAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answer, questionId }: { answer: string; questionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDailyAnswer(answer, questionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['pastQuestions'] });
    },
  });
}

export function useGetPastQuestions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['pastQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPastQuestions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin - Scheduled Questions
export function useGetAllScheduledQuestions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyCheckInQuestion[]>({
    queryKey: ['scheduledQuestions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useCreateScheduledQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ question, date }: { question: string; date: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDailyQuestion(question, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['todaysQuestion'] });
    },
  });
}

export function useUpdateScheduledQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, question, date }: { questionId: string; question: string; date: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDailyQuestion(questionId, question, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['todaysQuestion'] });
    },
  });
}
