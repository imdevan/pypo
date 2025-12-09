import { FC, useState } from "react"
import { View, Image, ActivityIndicator } from "react-native"
import type { ViewStyle, ImageStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

import { Text } from "./Text"
import { TextField } from "./TextField"

interface ImageUrlInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  containerStyle?: ViewStyle
}

export const ImageUrlInput: FC<ImageUrlInputProps> = ({
  value,
  onChangeText,
  placeholder = "Image URL (optional)",
  containerStyle,
}) => {
  const { themed } = useAppTheme()
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleTextChange = (text: string) => {
    onChangeText(text)
    if (text.trim()) {
      setImageLoading(true)
      setImageError(false)
    } else {
      setImageLoading(false)
      setImageError(false)
    }
  }

  const isValidUrl = value.trim().length > 0

  return (
    <View style={containerStyle}>
      <TextField
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isValidUrl && (
        <View style={themed($previewContainer)}>
          {imageLoading && (
            <View style={themed($loadingContainer)}>
              <ActivityIndicator size="small" />
              <Text text="Loading preview..." preset="formHelper" style={themed($helperText)} />
            </View>
          )}
          {!imageLoading && imageError && (
            <View style={themed($errorContainer)}>
              <Text text="⚠️ Unable to load image" preset="formHelper" style={themed($errorText)} />
            </View>
          )}
          {!imageLoading && !imageError && (
            <Image
              source={{ uri: value }}
              style={themed($previewImage)}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </View>
      )}
    </View>
  )
}

const $previewContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
  alignItems: "center",
})

const $previewImage: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: 120,
  height: 120,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.md,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.md,
})

const $helperText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $errorText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.error,
})
