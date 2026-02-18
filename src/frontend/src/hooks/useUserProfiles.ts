import { useQueries } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

/**
 * Hook to resolve multiple user profiles by their principals.
 * Returns a map of principal string to UserProfile or null.
 */
export function useUserProfiles(principals: Principal[]) {
  const { actor, isFetching: actorFetching } = useActor();

  const queries = useQueries({
    queries: principals.map((principal) => ({
      queryKey: ['userProfile', principal.toString()],
      queryFn: async () => {
        if (!actor) return null;
        return actor.getUserProfile(principal);
      },
      enabled: !!actor && !actorFetching,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Build a map of principal string to profile
  const profileMap = new Map<string, UserProfile | null>();
  principals.forEach((principal, index) => {
    const query = queries[index];
    if (query.data !== undefined) {
      profileMap.set(principal.toString(), query.data);
    }
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetched = queries.every((q) => q.isFetched);

  return {
    profileMap,
    isLoading,
    isFetched,
  };
}
