import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import {
  tagsReadTagsOptions,
  tagsCreateNewTagMutation,
  tagsUpdateExistingTagMutation,
  tagsDeleteExistingTagMutation,
} from "@/client/@tanstack/react-query.gen"
import { TagCreate, TagPublic, TagUpdate } from "@/client/types.gen"
import { useAuth } from "@/context/AuthContext"

// Get all tags query
export const useTags = () => {
  const { authToken } = useAuth()

  return useQuery({
    ...tagsReadTagsOptions({
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

// Create tag mutation
export const useCreateTag = () => {
  const { authToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    ...tagsCreateNewTagMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (createdTag) => {
      // Invalidate and refetch tags
      //   queryClient.invalidateQueries({ queryKey: ["tagsReadTags"] })
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "tagsReadTags" }],
          exact: false,
        },
        (oldData: { data: TagPublic[]; count: number } | undefined) => {
          if (!oldData) return { data: [createdTag], count: 1 }
          return {
            data: [createdTag, ...oldData.data],
            count: oldData.count + 1,
          }
        },
      )
    },
  })
}

// Update tag mutation
export const useUpdateTag = () => {
  const { authToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    ...tagsUpdateExistingTagMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (updatedTag) => {
      // Update all itemsReadItems queries with the updated item
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "tagsReadTags" }],
          exact: false,
        },
        (oldData: { data: TagPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
          }
        },
      )
    },
    // },
    // onSuccess: () => {
    //   // Invalidate and refetch tags
    //   queryClient.invalidateQueries({ queryKey: ["tagsReadTags"] })
    // },
  })
}

// Delete tag mutation
export const useDeleteTag = () => {
  const { authToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    ...tagsDeleteExistingTagMutation({
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),
    onSuccess: (_, variables) => {
      console.log("useDeleteTag called successfully with variables", variables)
      // Invalidate and refetch tags
      // queryClient.invalidateQueries({ queryKey: ["tagsReadTags"] })
      queryClient.setQueriesData(
        {
          queryKey: [{ _id: "tagsReadTags" }],
          exact: false,
        },
        (oldData: { data: TagPublic[]; count: number } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.filter((tag) => tag.id !== variables.path.tag_id),
            count: oldData.count - 1,
          }
        },
      )
    },
  })
}
