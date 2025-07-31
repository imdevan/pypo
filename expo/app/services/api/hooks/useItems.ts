import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  itemsReadItemsOptions,
  itemsCreateItemMutation,
  itemsUpdateItemMutation,
  itemsDeleteItemMutation
} from "@/client/@tanstack/react-query.gen"
import type { AxiosError } from "axios"

// Get all items query
export const useItems = (token?: string) => {
  return useQuery({
    ...itemsReadItemsOptions({
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
    enabled: !!token,
    retry: (failureCount, error) => {
      if ((error as AxiosError)?.response?.status === 401) {
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
    ...itemsCreateItemMutation(),
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["itemsReadItems"] })
    },
  })
}

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...itemsUpdateItemMutation(),
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["itemsReadItems"] })
    },
  })
}

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...itemsDeleteItemMutation(),
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: ["itemsReadItems"] })
    },
  })
} 