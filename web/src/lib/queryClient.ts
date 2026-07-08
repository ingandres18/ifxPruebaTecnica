import { QueryClient } from "@tanstack/react-query"

/** Cliente único de TanStack Query: fuente de estado de servidor para toda la app (SPEC §6). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
