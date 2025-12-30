import { FC, useState } from "react"
import { Alert, View } from "react-native"
import type { ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/lib/Button"
import { DropDown } from "@/components/lib/DropDown"
import { ImageUrlInput } from "@/components/lib/ImageUrlInput"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { TextField } from "@/components/lib/TextField"
import { VideoUploadInput } from "@/components/lib/VideoUploadInput"
import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useCreateItem } from "@/services/api/hooks"
import { useTags } from "@/services/api/hooks/useTags"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { type ThemedStyle } from "@/theme/types"

interface AddItemScreenProps { }

export const AddItemScreen: FC<AddItemScreenProps> = () => {
  const { themed } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<ItemsStackParamList>>()
  const insets = useSafeAreaInsets()

  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemImageUrl, setNewItemImageUrl] = useState("")
  const [newItemVideoUrl, setNewItemVideoUrl] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  const { data: tagsData, isLoading: tagsLoading } = useTags()
  const createItemMutation = useCreateItem()

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
      await createItemMutation.mutateAsync({
        body: {
          title: newItemTitle.trim(),
          description: newItemDescription.trim() || undefined,
          image_url: newItemImageUrl.trim() || undefined,
          video_url: newItemVideoUrl || undefined,
          tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        },
      })

      resetNewItem()
      // Navigate to items screen after successful creation
      navigation.navigate("items")
    } catch (error) {
      Alert.alert("Error", extractErrorMessage(error))
    }
  }

  const resetNewItem = () => {
    setNewItemTitle("")
    setNewItemDescription("")
    setNewItemImageUrl("")
    setNewItemVideoUrl(null)
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
        <ImageUrlInput
          label="Image URL"
          value={newItemImageUrl}
          onChangeText={setNewItemImageUrl}
          placeholder="Image URL (optional)"
          containerStyle={themed($inputField)}
        />
        <VideoUploadInput
          label="Video File (optional)"
          value={newItemVideoUrl}
          onChange={setNewItemVideoUrl}
          placeholder="Select a video file or drag and drop"
          containerStyle={themed($inputField)}
        />
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
