import { FC, useCallback, useState } from "react"
import { Platform, View } from "react-native"
import type { TextStyle, ViewStyle } from "react-native"
import * as ImagePicker from "expo-image-picker"
import Alert from "@blazejkustra/react-native-alert"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { Button } from "@/components/lib/Button"
import { MotiView } from "@/components/lib/MotiView"
import { Screen } from "@/components/lib/Screen"
import { Text } from "@/components/lib/Text"
import { VideoPlayer } from "@/components/lib/VideoPlayer"
import { ItemsStackParamList } from "@/navigators/ItemsStackNavigator"
import { extractErrorMessage } from "@/services/api/errorHandling"
import { useItem, useDeleteItem, useUpdateItem } from "@/services/api/hooks"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import { useMountLog } from "@/utils/useMountLog"
import { generateVideoThumbnail } from "@/utils/video/thumbnail"
import { validateVideoFile } from "@/utils/video/validation"

type ItemScreenProps = NativeStackScreenProps<ItemsStackParamList, "item">

export const ItemScreen: FC<ItemScreenProps> = ({ route, navigation }) => {
  const { themed } = useAppTheme()
  const { itemId } = route.params

  // Screen mount verification - temporary debug logs
  useMountLog("Item")

  const { data: itemData, isLoading } = useItem(itemId)
  const deleteItemMutation = useDeleteItem()
  const updateItemMutation = useUpdateItem()
  const item = itemData

  // Video display state
  const [videoError, setVideoError] = useState<string | null>(null)
  const [_isRelinkingVideo, setIsRelinkingVideo] = useState(false)

  // Access video_url and video_thumbnail_url from item
  const videoUrl = item?.video_url || null
  const videoThumbnailUrl = item?.video_thumbnail_url || null

  const handleVideoError = useCallback((error: Error) => {
    setVideoError(error.message)
  }, [])

  const handleVideoLoad = useCallback(() => {
    setVideoError(null)
  }, [])

  const handleRelinkVideo = useCallback(async () => {
    setIsRelinkingVideo(true)

    try {
      let newVideoUrl: string | null = null

      if (Platform.OS === "web") {
        // Web is not supported - show message
        Alert.alert(
          "Not Available",
          "Video relinking is not available on web. Please use the iOS app.",
        )
        setIsRelinkingVideo(false)
        return
      } else {
        // iOS/Android - use image picker for photo library
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant permission to access your photo library to select videos.",
          )
          setIsRelinkingVideo(false)
          return
        }

        // Launch image picker for videos
        // Note: MediaTypeOptions is deprecated but still works
        // The new MediaType API may not be available in all versions
        const result = await ImagePicker.launchImageLibraryAsync({
          // @ts-expect-error - MediaTypeOptions is deprecated but MediaType may not be available
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: false,
          quality: 1,
        })

        if (result.canceled) {
          setIsRelinkingVideo(false)
          return
        }

        const asset = result.assets[0]

        if (!asset) {
          setIsRelinkingVideo(false)
          return
        }

        // Validate the video
        const validationResult = await validateVideoFile({
          uri: asset.uri,
          type: asset.mimeType || undefined,
        })

        if (!validationResult.isValid) {
          Alert.alert(
            "Invalid File",
            validationResult.errorMessage || "Please select a valid video file.",
          )
          setIsRelinkingVideo(false)
          return
        }

        newVideoUrl = asset.uri
      }

      // Generate thumbnail for the new video (mobile only)
      let newThumbnailUrl: string | null = null
      if (newVideoUrl && Platform.OS !== "web") {
        newThumbnailUrl = await generateVideoThumbnail(newVideoUrl, 1.0)
      }

      // Update the item with the new video URI and thumbnail
      await updateItemMutation.mutateAsync({
        path: { id: itemId },
        body: {
          video_url: newVideoUrl || undefined,
          video_thumbnail_url: newThumbnailUrl || undefined,
        } as any, // video_url and video_thumbnail_url are in backend but types may not be regenerated yet
      })

      Alert.alert("Success", "Video file has been re-linked successfully.")
      setVideoError(null)
    } catch (error) {
      Alert.alert("Error", extractErrorMessage(error))
    } finally {
      setIsRelinkingVideo(false)
    }
  }, [itemId, updateItemMutation])

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItemMutation.mutateAsync({
              path: { id: itemId },
            })
            navigation.goBack()
          } catch (error) {
            Alert.alert("Error", extractErrorMessage(error))
          }
        },
      },
    ])
  }, [itemId, navigation, deleteItemMutation])

  return (
    <Screen preset="scroll" contentContainerStyle={themed($scrollContentContainer)}>
      {isLoading ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <Text text="Loading item..." preset="default" />
        </MotiView>
      ) : item ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          style={themed($content)}
        >
          {/* Video Display Section - First Element, Almost Full Width */}
          {videoUrl && (
            <View style={themed($videoSection)}>
              {videoError ? (
                <View style={themed($videoErrorContainer)}>
                  <Text
                    text="⚠️ Video file not found or cannot be played"
                    preset="formHelper"
                    style={themed($videoErrorText)}
                  />
                  <Button
                    text="Re-link Video"
                    onPress={handleRelinkVideo}
                    style={themed($relinkButton)}
                    preset="outline"
                  />
                </View>
              ) : (
                <View style={themed($videoPlayerContainer)}>
                  <VideoPlayer
                    videoUri={videoUrl}
                    thumbnailUri={videoThumbnailUrl}
                    onError={handleVideoError}
                    onLoad={handleVideoLoad}
                    onRelinkVideo={handleRelinkVideo}
                    contentFit="cover"
                    style={themed($videoPlayer)}
                  />
                </View>
              )}
            </View>
          )}

          <Text text={item.title} preset="heading" style={themed($title)} />

          {item.description && (
            <Text text={item.description} preset="default" style={themed($description)} />
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={themed($section)}>
              <Text text="Tags" preset="subheading" style={themed($sectionTitle)} />
              <View style={themed($tagsContainer)}>
                {item.tags.map((tag) => (
                  <View key={tag.id} style={themed($tagChip)}>
                    <Text text={tag.name} preset="default" style={themed($tagText)} />
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={themed($deleteButtonContainer)}>
            <Button
              text="Delete Item"
              preset="default"
              onPress={handleDelete}
              style={themed($deleteButton)}
              disabled={deleteItemMutation.isPending}
            />
          </View>
        </MotiView>
      ) : (
        <Text text="Item not found" preset="default" />
      )}
    </Screen>
  )
}
// Enable why-did-you-render tracking for ItemsScreen
if (__DEV__ && process.env.__WDYR__) {
  ItemScreen.whyDidYouRender = true
}

const $scrollContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $content: ThemedStyle<ViewStyle> = () => ({})

const $videoSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  alignItems: "center",
  width: "100%",
})

const $videoPlayerContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  aspectRatio: 3 / 5,
  overflow: "hidden",
})

const $videoPlayer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  maxHeight: "100%",
  marginVertical: 0,
})

const $title: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  paddingHorizontal: spacing.lg,
})

const $description: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
})

const $sectionTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $tagsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $tagChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $tagText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
})

const $deleteButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
  minHeight: 400,
})

const $deleteButton: ThemedStyle<ViewStyle> = () => ({})

const $videoErrorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.sm,
  width: "100%",
})

const $videoErrorText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: spacing.xs,
})

const $relinkButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})
