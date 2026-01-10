import { useState } from "react"
import { ViewStyle, Alert } from "react-native"
import { View } from "react-native"

import { TagPublic, TagCreate, TagUpdate } from "@/client/types.gen"
import { Button } from "@/components/lib/Button"
import { PopupForm } from "@/components/lib/PopupForm"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { TextField } from "@/components/lib/TextField"
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useMountLog } from "@/utils/useMountLog"

/**
 * TagsScreen displays and manages global tags
 */
export function TagsScreen() {
  const { themed } = useAppTheme()

  // Screen mount verification - temporary debug logs
  useMountLog("Tags")

  const { data: tagsData, isLoading, error } = useTags()
  console.log("🚀 ~ TagsScreen ~ tagsData:", tagsData)
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()

  const [editingTag, setEditingTag] = useState<TagPublic | null>(null)
  const [newTag, setNewTag] = useState<TagCreate>({
    name: "",
    description: "",
  })
  const [editForm, setEditForm] = useState<TagUpdate>({
    name: "",
    description: "",
  })
  const [createTagError, setCreateTagError] = useState<string | null>(null)

  const handleCreateTag = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!newTag.name.trim()) {
        console.log("TagsScreen: Tag name validation failed")
        setCreateTagError("Tag name is required")
        reject(new Error("Tag name is required"))
        return
      }

      createTagMutation.mutate(
        { body: newTag },
        {
          onSuccess: () => {
            setNewTag({ name: "", description: "" })
            setCreateTagError(null)
            resolve()
          },
          onError: (error: any) => {
            // Extract the detail message from the error response
            const errorMessage = error?.response?.data?.detail || "Failed to create tag"
            setCreateTagError(errorMessage)
            reject(new Error(errorMessage))
          },
        },
      )
    })
  }

  const handleUpdateTag = () => {
    if (!editingTag || !editForm.name?.trim()) {
      Alert.alert("Error", "Tag name is required")
      return
    }

    updateTagMutation.mutate(
      { body: editForm, path: { tag_id: editingTag.id } },
      {
        onSuccess: () => {
          setEditingTag(null)
          setEditForm({ name: "", description: "" })
        },
        onError: (_error) => {
          Alert.alert("Error", "Failed to update tag")
        },
      },
    )
  }

  const handleDeleteTag = (tag: TagPublic) => {
    deleteTagMutation.mutate(
      { path: { tag_id: tag.id } },
      {
        onError: (_error) => {
          Alert.alert("Error", "Failed to delete tag")
        },
      },
    )

    // Alert.alert(
    //   "Delete Tag",
    //   `Are you sure you want to delete "${tag.name}"?`,
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: () => {
    //         deleteTagMutation.mutate(
    //           { path: { tag_id: tag.id } },
    //           {
    //             onError: (error) => {
    //               Alert.alert("Error", "Failed to delete tag")
    //             },
    //           }
    //         )
    //       },
    //     },
    //   ]
    // )
  }

  const startEditing = (tag: TagPublic) => {
    setEditingTag(tag)
    setEditForm({
      name: tag.name,
      description: tag.description || "",
    })
  }

  const cancelEditing = () => {
    setEditingTag(null)
    setEditForm({ name: "", description: "" })
  }

  const resetNewTag = () => {
    setNewTag({ name: "", description: "" })
    setCreateTagError(null)
  }

  return (
    <Screen preset="auto" contentContainerStyle={[themed($styles.container)]}>
      {/* Header Section */}
      <View style={themed($headerSection)}>
        <Text text="Global Tags" style={themed($title)} />
        <Text text="Manage tags for categorizing items" style={themed($subtitle)} />
      </View>

      {/* Create New Tag Section */}
      <PopupForm
        title="Create New Tag"
        triggerText="Add Tag"
        onSuccess={handleCreateTag}
        onCancel={resetNewTag}
        disabled={createTagMutation.isPending}
        error={createTagError}
        onClearError={() => setCreateTagError(null)}
      >
        <TextField
          label="Tag Name"
          value={newTag.name}
          onChangeText={(text) => setNewTag({ ...newTag, name: text })}
          placeholder="Enter tag name"
          style={themed($input)}
        />
        <TextField
          label="Description"
          value={newTag.description || ""}
          onChangeText={(text) => setNewTag({ ...newTag, description: text })}
          placeholder="Enter description (optional)"
          style={themed($input)}
          multiline
        />
      </PopupForm>

      {/* Tags List Section */}
      <View style={themed($section)}>
        <Text text="Existing Tags" style={themed($sectionTitle)} />
        {isLoading ? (
          <View style={themed($infoCard)}>
            <Text text="Loading tags..." style={themed($value)} />
          </View>
        ) : error ? (
          <View style={themed($infoCard)}>
            <Text text="Error loading tags" style={themed($errorValue)} />
          </View>
        ) : tagsData?.data && tagsData.data.length > 0 ? (
          tagsData.data.map((tag) => (
            <View key={tag.id} style={themed($tagCard)}>
              {editingTag?.id === tag.id ? (
                // Edit Form
                <View style={themed($editForm)}>
                  <TextField
                    label="Tag Name"
                    value={editForm.name || ""}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    style={themed($input)}
                  />
                  <TextField
                    label="Description"
                    value={editForm.description || ""}
                    onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                    style={themed($input)}
                    multiline
                  />
                  <View style={themed($formActions)}>
                    <Button
                      text="Cancel"
                      onPress={cancelEditing}
                      style={themed($cancelButton)}
                      textStyle={themed($cancelButtonText)}
                    />
                    <Button
                      text="Save"
                      onPress={handleUpdateTag}
                      style={themed($saveButton)}
                      textStyle={themed($saveButtonText)}
                      disabled={updateTagMutation.isPending}
                    />
                  </View>
                </View>
              ) : (
                // Tag Display
                <View style={themed($tagContent)}>
                  <View style={themed($tagInfo)}>
                    <View style={themed($tagHeader)}>
                      <Text text={tag.name} style={themed($tagName)} />
                    </View>
                    {!!tag.description && (
                      <Text text={tag.description} style={themed($tagDescription)} />
                    )}
                    <Text
                      text={`Created: ${new Date(tag.created_at).toLocaleDateString()}`}
                      style={themed($tagDate)}
                    />
                  </View>
                  <View style={themed($tagActions)}>
                    <Button
                      text="Edit"
                      onPress={() => startEditing(tag)}
                      style={themed($editButton)}
                      textStyle={themed($editButtonText)}
                    />
                    <Button
                      text="Delete"
                      onPress={() => handleDeleteTag(tag)}
                      style={themed($deleteButton)}
                      textStyle={themed($deleteButtonText)}
                      disabled={deleteTagMutation.isPending}
                    />
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={themed($infoCard)}>
            <Text text="No tags found. Create your first tag!" style={themed($value)} />
          </View>
        )}
      </View>
    </Screen>
  )
}

const $headerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $title: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

const $subtitle: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginTop: spacing.xs,
  textAlign: "center",
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $sectionTitle: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  marginBottom: spacing.md,
  color: colors.text,
})

const $input: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $formActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.sm,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral400,
  flex: 1,
})

const $cancelButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  flex: 1,
})

const $saveButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
})

const $tagCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.lg,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
})

const $tagContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
})

const $tagInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $tagHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $tagName: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.bold,
  color: colors.text,
})

const $tagDescription: ThemedStyle<any> = ({ colors, spacing, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $tagDate: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
})

const $tagActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $editButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $editButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
  fontSize: 12,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $deleteButtonText: ThemedStyle<any> = ({ colors }) => ({
  color: colors.background,
  fontSize: 12,
})

const $editForm: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  padding: spacing.lg,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
})

const $value: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

const $errorValue: ThemedStyle<any> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.error,
})
