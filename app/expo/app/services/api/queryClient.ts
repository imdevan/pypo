import { QueryClient } from "@tanstack/react-query"

import { client as generatedClient } from "@/client/client.gen"
import Config from "@/config"

// Configure the generated client with the API URL
generatedClient.setConfig({
  baseURL: Config.API_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
})

// Create a QueryClient instance with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Stale time of 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time of 10 minutes
      gcTime: 10 * 60 * 1000,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Export the configured client for use in hooks
export { generatedClient as apiClient }

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}
