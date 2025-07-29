import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createApiUrl, getAuthHeaders } from "../queryClient"
import type { LoginRequest, LoginResponse, UserResponse } from "../types"

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const formData = new URLSearchParams()
      formData.append("grant_type", "password")
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch(createApiUrl("login/access-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`)
      }

      const data: LoginResponse = await response.json()
      return data
    },
    onSuccess: (data) => {
      // Store the token
      if (data.access_token) {
        // You can store this in MMKV or wherever you prefer
        console.log("Login successful, token received")
      }
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(createApiUrl("users/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`)
      }

      const data: UserResponse = await response.json()
      return data
    },
    onSuccess: () => {
      // Invalidate user queries after successful registration
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })
}

// Get current user query
export const useCurrentUser = (token?: string) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<UserResponse> => {
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(createApiUrl("users/me"), {
        headers: getAuthHeaders(token),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized")
        }
        throw new Error(`Failed to fetch user: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!token, // Only run query if token exists
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof Error && error.message === "Unauthorized") {
        return false
      }
      return failureCount < 3
    },
  })
}

// Test token query
export const useTestToken = (token?: string) => {
  return useQuery({
    queryKey: ["testToken"],
    queryFn: async (): Promise<UserResponse> => {
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(createApiUrl("login/test-token"), {
        method: "POST",
        headers: getAuthHeaders(token),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Token is invalid")
        }
        throw new Error(`Token test failed: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!token,
    retry: false, // Don't retry token tests
  })
} 