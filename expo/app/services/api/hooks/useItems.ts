import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createApiUrl, getAuthHeaders } from "../queryClient"
import type { ItemResponse, ItemsResponse } from "../types"

// Get all items query
export const useItems = (token?: string) => {
  return useQuery({
    queryKey: ["items"],
    queryFn: async (): Promise<ItemsResponse> => {
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch(createApiUrl("items/"), {
        headers: getAuthHeaders(token),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized")
        }
        throw new Error(`Failed to fetch items: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!token,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Unauthorized") {
        return false
      }
      return failureCount < 3
    },
  })
}

// Create item mutation
export const useCreateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      token 
    }: { 
      title: string; 
      description?: string; 
      token: string 
    }): Promise<ItemResponse> => {
      const response = await fetch(createApiUrl("items/"), {
        method: "POST",
        headers: {
          ...getAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create item: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      description, 
      token 
    }: { 
      id: string; 
      title: string; 
      description?: string; 
      token: string 
    }): Promise<ItemResponse> => {
      const response = await fetch(createApiUrl(`items/${id}`), {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update item: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      token 
    }: { 
      id: string; 
      token: string 
    }): Promise<void> => {
      const response = await fetch(createApiUrl(`items/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(token),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
} 