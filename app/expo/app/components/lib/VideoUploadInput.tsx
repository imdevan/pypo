import { FC, useCallback, useState } from "react"
import { Platform, View, ViewStyle, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import { validateVideoFile } from "@/utils/video/validation"

import { Button } from "./Button"
import { Text } from "./Text"

interface VideoUploadInputProps {
  value: string | null
  onChange: (uri: string | null) => void
  onFileSelect?: (file: File | null) => void
  label?: string
  placeholder?: string
  containerStyle?: ViewStyle
  disabled?: boolean
  error?: string | null
}

export const VideoUploadInput: FC<VideoUploadInputProps> = ({
  value,
  onChange,
  onFileSelect,
  label,
  placeholder: _placeholder = "Select a video file",
  containerStyle,
  disabled = false,
  error: externalError,
}) => {
  const { themed } = useAppTheme()
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const error = externalError || validationError

  const handleClear = useCallback(() => {
    onChange(null)
    onFileSelect?.(null)
    setValidationError(null)
  }, [onChange, onFileSelect])

  // iOS/Android video picker from photo library
  const handleMobileFilePick = useCallback(async () => {
    setIsValidating(true)
    setValidationError(null)

    try {
      // Request permissions for photo library access
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library to select videos.",
        )
        setIsValidating(false)
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
        setIsValidating(false)
        return
      }

      const asset = result.assets[0]

      if (!asset) {
        setIsValidating(false)
        return
      }

      // Validate the video
      const validationResult = await validateVideoFile({
        uri: asset.uri,
        type: asset.mimeType || undefined,
      })

      if (!validationResult.isValid) {
        setValidationError(validationResult.errorMessage || "Invalid video file")
        onChange(null)
        onFileSelect?.(null)
        return
      }

      // Store the file URI directly (iOS/Android use file:// or asset URIs)
      onChange(asset.uri)
      // Create a File-like object for onFileSelect callback
      const fileObj = {
        uri: asset.uri,
        name: asset.fileName || `video_${Date.now()}.mp4`,
        type: asset.mimeType || "video/*",
        size: asset.fileSize || 0,
      } as any
      onFileSelect?.(fileObj)
      setValidationError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to select video file"
      setValidationError(errorMessage)
      onChange(null)
      onFileSelect?.(null)
    } finally {
      setIsValidating(false)
    }
  }, [onChange, onFileSelect])

  const handleButtonClickMobile = useCallback(() => {
    handleMobileFilePick()
  }, [handleMobileFilePick])

  // Web placeholder - show message that video is not supported on web
  if (Platform.OS === "web") {
    return (
      <View style={containerStyle}>
        {label && <Text text={label} preset="formLabel" style={themed($label)} />}
        <Text
          text="Video upload is not available on web. Please use the iOS app to upload videos."
          preset="formHelper"
          style={themed($helperText)}
        />
      </View>
    )
  }

  // iOS/Android implementation
  return (
    <View style={containerStyle}>
      {label && <Text text={label} preset="formLabel" style={themed($label)} />}

      {/* Action buttons */}
      <View style={themed($buttonContainer)}>
        <Button
          text="Select Video from Library"
          onPress={handleButtonClickMobile}
          disabled={disabled || isValidating}
          style={themed($selectButton)}
        />
        {value && (
          <Button
            text="Clear"
            onPress={handleClear}
            disabled={disabled || isValidating}
            style={themed($clearButton)}
            textStyle={themed($clearButtonText)}
          />
        )}
      </View>

      {/* Selected file info */}
      {value && !isValidating && (
        <View style={themed($fileInfo)}>
          <Text text="✓ Video file selected" preset="formHelper" style={themed($successText)} />
        </View>
      )}

      {/* Processing indicator */}
      {isValidating && (
        <View style={themed($fileInfo)}>
          <Text text="Processing video file..." preset="formHelper" style={themed($helperText)} />
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={themed($errorContainer)}>
          <Text text={`⚠️ ${error}`} preset="formHelper" style={themed($errorText)} />
        </View>
      )}
    </View>
  )
}

const $label: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $buttonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.xs,
})

const $selectButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $clearButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral400,
  minWidth: 80,
})

const $clearButtonText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.background,
})

const $fileInfo: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $successText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.tint,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $errorText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.error,
})

const $helperText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})
