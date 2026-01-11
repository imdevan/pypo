import { FC, useEffect, useRef, useState } from "react"
import { Image, Platform, Pressable, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import { generateVideoThumbnail } from "@/utils/video/thumbnail"

import { Icon } from "./Icon"
import { Text } from "./Text"

interface VideoThumbnailProps {
  videoUri: string
  thumbnailUri?: string | null
  onPress: () => void
  style?: ViewStyle
  showPlayButton?: boolean
}

export const VideoThumbnail: FC<VideoThumbnailProps> = ({
  videoUri,
  thumbnailUri,
  onPress,
  style,
  showPlayButton = true,
}) => {
  const { themed } = useAppTheme()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(!!thumbnailUri)
  const [fileExists, setFileExists] = useState<boolean | null>(null)
  const [regeneratedThumbnailUri, setRegeneratedThumbnailUri] = useState<string | null>(null)
  const regeneratingRef = useRef(false)

  // Reset regenerated thumbnail when thumbnailUri prop changes
  useEffect(() => {
    setRegeneratedThumbnailUri(null)
    regeneratingRef.current = false
  }, [thumbnailUri])

  // Check if file exists on mobile (for file:// URIs) and regenerate if missing
  useEffect(() => {
    if (!thumbnailUri || Platform.OS === "web") {
      setFileExists(thumbnailUri ? true : null)
      return
    }

    // Only check file:// URIs
    if (thumbnailUri.startsWith("file://")) {
      const checkFileExists = async () => {
        setImageLoading(true)
        setImageError(false)

        try {
          const FileSystem = await import("expo-file-system/legacy")
          const fileInfo = await FileSystem.getInfoAsync(thumbnailUri)

          if (fileInfo.exists) {
            setFileExists(true)
            // File exists, Image will load it
          } else {
            console.warn("Thumbnail file does not exist, attempting to regenerate:", thumbnailUri)
            setFileExists(false)

            // Regenerate thumbnail from video if file doesn't exist
            if (!regeneratingRef.current && videoUri) {
              regeneratingRef.current = true

              try {
                const newThumbnailUri = await generateVideoThumbnail(videoUri, 1.0)
                if (newThumbnailUri) {
                  console.log("Successfully regenerated thumbnail:", newThumbnailUri)
                  setRegeneratedThumbnailUri(newThumbnailUri)
                  setFileExists(true)
                  setImageLoading(true)
                  setImageError(false)
                  // Image will load the regenerated thumbnail
                } else {
                  console.warn("Failed to regenerate thumbnail")
                  setImageError(true)
                  setImageLoading(false)
                }
              } catch (error) {
                console.error("Error regenerating thumbnail:", error)
                setImageError(true)
                setImageLoading(false)
              } finally {
                regeneratingRef.current = false
              }
            } else {
              setImageError(true)
              setImageLoading(false)
            }
          }
        } catch (error) {
          console.error("Error checking thumbnail file existence:", error)
          setFileExists(false)
          setImageError(true)
          setImageLoading(false)
        }
      }
      checkFileExists()
    } else {
      // For other URI types (http, content://, etc.), assume they exist
      setFileExists(true)
    }
  }, [thumbnailUri, videoUri])

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = (error: any) => {
    console.error("Error loading thumbnail image:", {
      uri: thumbnailUri,
      error,
      fileExists,
    })
    setImageLoading(false)
    setImageError(true)
  }

  // If no thumbnail URI is provided, show placeholder
  const hasThumbnail = !!thumbnailUri

  // Determine which URI to use - prefer regenerated, fallback to original
  const imageUri = regeneratedThumbnailUri || thumbnailUri
  const shouldShowImage = hasThumbnail && fileExists === true && !imageError

  return (
    <Pressable onPress={onPress} style={[themed($container), style]}>
      {hasThumbnail ? (
        <>
          {shouldShowImage && imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={themed($thumbnailImage)}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          {imageLoading && (
            <View style={themed($loadingContainer)}>
              <Text text="Loading thumbnail..." preset="formHelper" style={themed($loadingText)} />
            </View>
          )}
          {!imageLoading && imageError && (
            <View style={themed($errorContainer)}>
              <Icon name="video" size={32} color={themed(({ colors }) => colors.textDim).color} />
              <Text text="Thumbnail unavailable" preset="formHelper" style={themed($errorText)} />
            </View>
          )}
          {!imageLoading && !imageError && shouldShowImage && showPlayButton && (
            <View style={themed($playButtonOverlay)}>
              <View style={themed($playButton)}>
                <Icon
                  name="play"
                  size={32}
                  color={themed(({ colors }) => colors.background).color}
                />
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={themed($placeholderContainer)}>
          <Icon name="video" size={48} color={themed(({ colors }) => colors.textDim).color} />
          <Text text="Video" preset="formHelper" style={themed($placeholderText)} />
        </View>
      )}
    </Pressable>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  aspectRatio: 3 / 5,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  overflow: "hidden",
  position: "relative",
})

const $thumbnailImage: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $playButtonOverlay: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
})

const $playButton: ThemedStyle<ViewStyle> = ({ colors, _spacing }) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 3,
  borderColor: colors.background,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.md,
})

const $loadingText: ThemedStyle<ViewStyle> = () => ({
  textAlign: "center",
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.md,
})

const $errorText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
  textAlign: "center",
})

const $placeholderContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  padding: spacing.md,
})

const $placeholderText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
  textAlign: "center",
})
