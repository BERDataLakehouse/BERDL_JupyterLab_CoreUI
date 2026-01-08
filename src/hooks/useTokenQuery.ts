import { useQuery } from '@tanstack/react-query';
import { fetchTokenInfo, NoTokenError } from '../api/authApi';
import { CHECK_INTERVAL_MS } from '../constants';

/**
 * React Query hook for fetching and polling token information.
 *
 * @param enabled - Whether to enable the query (disable when blocked)
 * @returns Query result with token info, loading state, and error
 */
export function useTokenQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['kbase-token-info'],
    queryFn: fetchTokenInfo,
    enabled,
    staleTime: CHECK_INTERVAL_MS,
    refetchInterval: CHECK_INTERVAL_MS,
    retry: (failureCount, error) => {
      if (error instanceof NoTokenError) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000
  });
}
