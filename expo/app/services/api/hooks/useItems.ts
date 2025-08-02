import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  itemsReadItemsOptions,
  itemsCreateItemMutation,
  itemsUpdateItemMutation,
  itemsDeleteItemMutation
} from "@/client/@tanstack/react-query.gen"
import type { AxiosError } from "axios"
import { ItemPublic } from "@/client/types.gen"

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
    onSuccess: (createdItem) => {
      // Update all itemsReadItems queries by using a partial match
      queryClient.setQueriesData(
        { 
          queryKey: [{ _id: 'itemsReadItems' }], 
          exact: false 
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return { data: [createdItem], count: 1 };
          return {
            data: [createdItem, ...oldData.data],
            count: oldData.count + 1
          };
        }
      );
    },
  })
}

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...itemsUpdateItemMutation(),
    onSuccess: (updatedItem) => {
      // Update all itemsReadItems queries with the updated item
      queryClient.setQueriesData(
        { 
          queryKey: [{ _id: 'itemsReadItems' }], 
          exact: false 
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            )
          };
        }
      );
    },
  })
}

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    ...itemsDeleteItemMutation(),
    onSuccess: (_, variables) => {
      // Update all itemsReadItems queries by removing the deleted item
      queryClient.setQueriesData(
        { 
          queryKey: [{ _id: 'itemsReadItems' }], 
          exact: false 
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter(item => item.id !== variables.path.id),
            count: oldData.count - 1
          };
        }
      );
    },
  })
} 