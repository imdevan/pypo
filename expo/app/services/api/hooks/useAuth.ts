import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  loginLoginAccessTokenMutation, 
  loginTestTokenOptions, 
  usersReadUserMeOptions,
  usersRegisterUserMutation 
} from "@/client/@tanstack/react-query.gen"
import type { AxiosError } from "axios"

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...loginLoginAccessTokenMutation(),
    onSuccess: (data) => {
      // Store the token
      if (data.access_token) {
        // You can store this in MMKV or wherever you prefer
        console.log("Login successful, token received")
      }
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["usersReadUserMe"] })
    },
  })
}

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...usersRegisterUserMutation(),
    onSuccess: () => {
      // Invalidate user queries after successful registration
      queryClient.invalidateQueries({ queryKey: ["usersReadUserMe"] })
    },
  })
}

// Get current user query
export const useCurrentUser = (token?: string) => {
  return useQuery({
    ...usersReadUserMeOptions({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    enabled: !!token, // Only run query if token exists
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if ((error as AxiosError)?.response?.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Test token query
export const useTestToken = (token?: string) => {
  return useQuery({
    ...loginTestTokenOptions({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    enabled: !!token,
    retry: false, // Don't retry token tests
  })
} 