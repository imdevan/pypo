import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import {
  itemsReadItemsOptions,
  itemsCreateItemMutation,
  itemsUpdateItemMutation,
  itemsDeleteItemMutation,
} from "@/client/@tanstack/react-query.gen"
import { ItemPublic } from "@/client/types.gen"
import { useAuth } from "@/context/AuthContext"

// Get all items query
export const useItems = () => {
  const { authToken } = useAuth()

  return useQuery({
    ...itemsReadItemsOptions({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    enabled: !!authToken,
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
  const { authToken } = useAuth()

  return useMutation({
    ...itemsCreateItemMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (createdItem) => {
      // Update all itemsReadItems queries by using a partial match
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "itemsReadItems" }],
          exact: false,
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return { data: [createdItem], count: 1 }
          return {
            data: [createdItem, ...oldData.data],
            count: oldData.count + 1,
          }
        },
      )
    },
  })
}

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  const { authToken } = useAuth()

  return useMutation({
    ...itemsUpdateItemMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (updatedItem) => {
      // Update all itemsReadItems queries with the updated item
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "itemsReadItems" }],
          exact: false,
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
          }
        },
      )
    },
  })
}

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  const { authToken } = useAuth()

  return useMutation({
    ...itemsDeleteItemMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (_, variables) => {
      // Update all itemsReadItems queries by removing the deleted item
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "itemsReadItems" }],
          exact: false,
        },
        (oldData: { data: ItemPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.filter((item) => item.id !== variables.path.id),
            count: oldData.count - 1,
          }
        },
      )
    },
  })
}
