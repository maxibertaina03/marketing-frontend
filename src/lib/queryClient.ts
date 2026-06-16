import { QueryClient } from '@tanstack/react-query';

/** Cliente de React Query compartido por toda la app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});
