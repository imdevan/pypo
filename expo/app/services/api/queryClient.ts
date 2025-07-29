import { QueryClient } from "@tanstack/react-query"
import Config from "@/config"

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

// Base API configuration
export const API_CONFIG = {
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
}

// Helper function to create API URL
export const createApiUrl = (endpoint: string) => `${API_CONFIG.baseURL}/${endpoint}`

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...API_CONFIG.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
} 