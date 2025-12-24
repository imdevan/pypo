import { QueryClient } from "@tanstack/react-query"
import axios from "axios"

import { client as generatedClient } from "@/client/client.gen"
import Config from "@/config"

// Configure axios with timeout for better error handling
const axiosInstance = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
})

// Configure the generated client with the API URL and axios instance
generatedClient.setConfig({
  baseURL: Config.API_URL,
  axios: axiosInstance,
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
      // Ensure components re-render on all query state changes
      notifyOnChangeProps: "all",
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
