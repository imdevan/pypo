import { FC, useState } from "react"
import { Image, Platform, Pressable, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

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

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // If no thumbnail, try to use video URI as fallback (for blob URLs)
  const imageSource = thumbnailUri || videoUri

  return (
    <Pressable onPress={onPress} style={[themed($container), style]}>
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

      {!imageLoading && !imageError && (
        <>
          <Image
            source={{ uri: imageSource }}
            style={themed($thumbnailImage)}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          {showPlayButton && (
            <View style={themed($playButtonOverlay)}>
              <View style={themed($playButton)}>
                <Icon name="play" size={32} color={themed(({ colors }) => colors.background).color} />
              </View>
            </View>
          )}
        </>
      )}
    </Pressable>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  aspectRatio: 16 / 9,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  overflow: "hidden",
  marginVertical: spacing.sm,
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

const $playButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
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

