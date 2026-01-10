import { FC, useEffect, useState } from "react"
import { Alert, View } from "react-native"
import type { ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { CompositeNavigationProp } from "@react-navigation/native"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/lib/Button"
import { DropDown } from "@/components/lib/DropDown"
import { ImageUrlInput } from "@/components/lib/ImageUrlInput"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { TextField } from "@/components/lib/TextField"
import { VideoUploadInput } from "@/components/lib/VideoUploadInput"
import { DemoTabParamList } from "@/navigators/TabNavigator"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useCreateItem } from "@/services/api/hooks"
import { useTags } from "@/services/api/hooks/useTags"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ThemedStyle } from "@/theme/types"
import { useScreenMountLog } from "@/utils/useScreenMountLog"
import { Platform } from "react-native"
import { generateVideoThumbnail, cleanupThumbnail } from "@/utils/video/thumbnail"

interface AddItemScreenProps { }

export const AddItemScreen: FC<AddItemScreenProps> = () => {
  const { themed } = useAppTheme()
  const navigation = useNavigation<BottomTabNavigationProp<DemoTabParamList>>()
  const insets = useSafeAreaInsets()

  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemImageUrl, setNewItemImageUrl] = useState("")
  const [newItemVideoUrl, setNewItemVideoUrl] = useState<string | null>(null)
  const [newItemVideoThumbnailUrl, setNewItemVideoThumbnailUrl] = useState<string | null>(null)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Screen mount verification - temporary debug logs
  useScreenMountLog("AddItem")

  const { data: tagsData, isLoading: tagsLoading } = useTags()
  const createItemMutation = useCreateItem()

  // Generate thumbnail when video URL changes (mobile only)
  useEffect(() => {
    // Skip thumbnail generation on web
    if (Platform.OS === "web") {
      return
    }

    let isMounted = true

    const generateThumbnail = async () => {
      if (!newItemVideoUrl) {
        // Clean up previous thumbnail if video is removed
        if (newItemVideoThumbnailUrl) {
          await cleanupThumbnail(newItemVideoThumbnailUrl)
          if (isMounted) {
            setNewItemVideoThumbnailUrl(null)
          }
        }
        return
      }

      setIsGeneratingThumbnail(true)
      try {
        const thumbnailUri = await generateVideoThumbnail(newItemVideoUrl, 1.0)
        console.log("Generated thumbnail URI:", thumbnailUri)
        if (isMounted) {
          // Clean up previous thumbnail before setting new one
          if (newItemVideoThumbnailUrl) {
            await cleanupThumbnail(newItemVideoThumbnailUrl)
          }
          setNewItemVideoThumbnailUrl(thumbnailUri)
          console.log("Thumbnail state updated:", thumbnailUri)
        }
      } catch (error) {
        console.error("Failed to generate video thumbnail:", error)
        if (isMounted) {
          setNewItemVideoThumbnailUrl(null)
        }
      } finally {
        if (isMounted) {
          setIsGeneratingThumbnail(false)
        }
      }
    }

    generateThumbnail()

    return () => {
      isMounted = false
    }
  }, [newItemVideoUrl])

  // Extract tags from the response and format for dropdown
  const tags = tagsData?.data || []
  const tagOptions = tags.map((tag) => ({
    label: tag.name,
    value: tag.id,
  }))

  const createItem = async () => {
    if (!newItemTitle.trim()) {
      Alert.alert("Error", "Title is required")
      return
    }

    try {
      const itemData = {
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        image_url: newItemImageUrl.trim() || undefined,
        video_url: newItemVideoUrl || undefined,
        video_thumbnail_url: newItemVideoThumbnailUrl || undefined,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      }
      console.log("Creating item with data:", { ...itemData, video_thumbnail_url: itemData.video_thumbnail_url ? "present" : "missing" })
      await createItemMutation.mutateAsync({
        body: itemData as any, // video_thumbnail_url may not be in types yet
      })

      resetNewItem()
      // Navigate to items tab after successful creation
      navigation.navigate("items", { screen: "list" })
    } catch (error) {
      Alert.alert("Error", extractErrorMessage(error))
    }
  }

  const resetNewItem = async () => {
    // Clean up thumbnail before resetting
    if (newItemVideoThumbnailUrl) {
      await cleanupThumbnail(newItemVideoThumbnailUrl)
    }
    setNewItemTitle("")
    setNewItemDescription("")
    setNewItemImageUrl("")
    setNewItemVideoUrl(null)
    setNewItemVideoThumbnailUrl(null)
    setSelectedTagIds([])
  }

  return (
    <Screen preset="scroll" contentContainerStyle={themed($contentContainer)}>
      <View style={themed($header)}>
        <Text text="Create New Item" preset="heading" />
      </View>

      <View style={[themed($formSection), { paddingBottom: insets.bottom + 120 }]}>
        <TextField
          label="Title"
          value={newItemTitle}
          onChangeText={setNewItemTitle}
          placeholder="Item title"
          containerStyle={themed($inputField)}
        />
        <TextField
          label="Description"
          value={newItemDescription}
          onChangeText={setNewItemDescription}
          placeholder="Item description (optional)"
          containerStyle={themed($inputField)}
          multiline
        />
        <View style={themed($inputField)}>
          <Text text="Image URL" preset="formLabel" style={themed($label)} />
          <ImageUrlInput
            value={newItemImageUrl}
            onChangeText={setNewItemImageUrl}
            placeholder="Image URL (optional)"
          />
        </View>
        <VideoUploadInput
          label="Video File (optional)"
          value={newItemVideoUrl}
          onChange={setNewItemVideoUrl}
          placeholder="Select a video file or drag and drop"
          containerStyle={themed($inputField)}
        />
        {isGeneratingThumbnail && (
          <Text
            text="Generating thumbnail..."
            preset="formHelper"
            style={themed($helperText)}
          />
        )}
        <DropDown
          label="Tags (optional)"
          items={tagOptions}
          multiple={true}
          value={selectedTagIds}
          setValue={(value: string[] | null) => setSelectedTagIds(value || [])}
          placeholder="Select tags..."
          loading={tagsLoading}
          searchable={true}
          searchPlaceholder="Search tags..."
          closeAfterSelecting={false}
        />

        <View style={themed($formActions)}>
          <Button
            text="Cancel"
            onPress={resetNewItem}
            style={themed($cancelButton)}
            textStyle={themed($cancelButtonText)}
          />
          <Button
            text="Create Item"
            onPress={createItem}
            style={themed($saveButton)}
            textStyle={themed($saveButtonText)}
            disabled={createItemMutation.isPending || !newItemTitle.trim()}
          />
        </View>
      </View>
    </Screen>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing, width, screen }) => ({
  width: screen.lg ? 800 : screen.md ? width - spacing.lg : width - spacing.md,
  margin: "auto",
  flexGrow: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $formSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $inputField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $label: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $helperText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $formActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.lg,
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
