import { FC, useCallback, useEffect, useRef, useState } from "react"
import { Platform, View, ViewStyle } from "react-native"
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import {
  getVideoBlobUrl,
  checkVideoFilePermission,
  requestVideoFilePermission,
} from "@/utils/video/fileStorage"

import { Button } from "./Button"
import { Text } from "./Text"

interface VideoPlayerProps {
  videoUri: string
  thumbnailUri?: string | null
  style?: ViewStyle
  autoPlay?: boolean
  controls?: boolean
  onError?: (error: Error) => void
  onLoad?: () => void
  onRelinkVideo?: () => void
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  videoUri,
  thumbnailUri,
  style,
  autoPlay = false,
  controls = true,
  onError,
  onLoad,
  onRelinkVideo,
}) => {
  const { themed } = useAppTheme()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoPlayerRef = useRef<Video | null>(null)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  // Check if videoUri is a file reference key (starts with "video_") - web only
  const isFileReference = Platform.OS === "web" && videoUri.startsWith("video_")

  // Check permission and load video from file handle if it's a reference key
  useEffect(() => {
    if (Platform.OS === "web" && isFileReference) {
      setIsLoading(true)
      setHasError(false)
      setNeedsPermission(false)

      // First check permission status
      checkVideoFilePermission(videoUri)
        .then((permissionState) => {
          if (permissionState === "granted") {
            // Permission is granted, try to load the video
            return getVideoBlobUrl(videoUri)
          } else if (permissionState === "prompt") {
            // Permission can be requested, show button
            setNeedsPermission(true)
            setPermissionDenied(false)
            setIsLoading(false)
            setErrorMessage(
              "Permission to access the video file is required. Click the button below to grant access."
            )
            return null
          } else if (permissionState === "denied") {
            // Permission was explicitly denied, cannot request again
            setNeedsPermission(false)
            setPermissionDenied(true)
            setIsLoading(false)
            setErrorMessage(
              "Permission to access the video file was denied. Please re-select the video file to grant access again."
            )
            return null
          } else {
            // Handle not found
            setHasError(true)
            setPermissionDenied(false)
            setErrorMessage("Video file not found. Please re-select the video file.")
            setIsLoading(false)
            return null
          }
        })
        .then((blobUrl) => {
          if (blobUrl) {
            setVideoSrc(blobUrl)
            setIsLoading(false)
          }
        })
        .catch((error) => {
          setHasError(true)
          const errorMsg = error.message || "Failed to load video file"
          setErrorMessage(errorMsg)
          setIsLoading(false)
        })
    } else {
      // Use the URI directly (for data URLs or regular URLs)
      setVideoSrc(videoUri)
      setIsLoading(false)
    }
  }, [videoUri, isFileReference])

  // Handle permission request button click
  const handleRequestPermission = useCallback(async () => {
    if (!isFileReference) return

    setIsLoading(true)
    setHasError(false)
    setNeedsPermission(false)
    setPermissionDenied(false)

    try {
      const file = await requestVideoFilePermission(videoUri)
      if (file) {
        const blobUrl = URL.createObjectURL(file)
        setVideoSrc(blobUrl)
        setIsLoading(false)
      } else {
        // Permission was denied
        setHasError(true)
        setPermissionDenied(true)
        setNeedsPermission(false)
        setErrorMessage(
          "Permission was denied. Please re-select the video file to grant access again."
        )
        setIsLoading(false)
      }
    } catch (error: any) {
      setHasError(true)
      if (error.name === "SecurityError" || error.message?.includes("denied")) {
        setPermissionDenied(true)
        setNeedsPermission(false)
        setErrorMessage(
          "Permission was denied. Please re-select the video file to grant access again."
        )
      } else {
        setErrorMessage(error.message || "Failed to request permission")
      }
      setIsLoading(false)
    }
  }, [videoUri, isFileReference])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc)
      }
    }
  }, [videoSrc])

  useEffect(() => {
    if (Platform.OS === "web" && videoRef.current && videoSrc) {
      const video = videoRef.current

      const handleError = () => {
        const error = new Error("Failed to load video")
        setHasError(true)
        setErrorMessage("Unable to play video. The file may be corrupted or in an unsupported format.")
        setIsLoading(false)
        onError?.(error)
      }

      const handleLoadedData = () => {
        setIsLoading(false)
        onLoad?.()
      }

      const handleLoadStart = () => {
        setIsLoading(true)
        setHasError(false)
        setErrorMessage(null)
      }

      video.addEventListener("error", handleError)
      video.addEventListener("loadeddata", handleLoadedData)
      video.addEventListener("loadstart", handleLoadStart)

      return () => {
        video.removeEventListener("error", handleError)
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("loadstart", handleLoadStart)
      }
    }
  }, [videoSrc, onError, onLoad])

  // iOS/Android video playback using expo-av
  useEffect(() => {
    if (Platform.OS !== "web" && videoUri) {
      setIsLoading(true)
      setHasError(false)
      setVideoSrc(videoUri)
      setIsLoading(false)
    }
  }, [videoUri])

  // Handle video playback status for iOS/Android
  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          setHasError(true)
          setErrorMessage("Failed to load video. The file may be corrupted or in an unsupported format.")
          setIsLoading(false)
          onError?.(new Error(status.error))
        }
        return
      }

      setIsLoading(false)
      if (status.didJustFinish) {
        // Video finished playing
      }
    },
    [onError],
  )

  // Web placeholder - video not supported on web
  if (Platform.OS === "web") {
    return (
      <View style={[themed($container), style]}>
        <View style={themed($placeholderContainer)}>
          <Text text="📹 Video" preset="subheading" style={themed($placeholderTitle)} />
          <Text
            text="Video playback is not available on web. Please use the iOS app to view videos."
            preset="formHelper"
            style={themed($placeholderText)}
          />
        </View>
      </View>
    )
  }

  // iOS/Android implementation using expo-av
  if (hasError) {
    return (
      <View style={[themed($errorContainer), style]}>
        <Text text="⚠️ Video Error" preset="subheading" style={themed($errorTitle)} />
        <Text text={errorMessage || "Failed to load video"} preset="formHelper" style={themed($errorText)} />
      </View>
    )
  }

  return (
    <View style={[themed($container), style]}>
      {isLoading && (
        <View style={themed($loadingContainer)}>
          <Text text="Loading video..." preset="formHelper" style={themed($loadingText)} />
        </View>
      )}
      {videoSrc && (
        <Video
          ref={videoPlayerRef}
          source={{ uri: videoSrc }}
          style={themed($videoPlayer)}
          useNativeControls={controls}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={autoPlay}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={(error) => {
            setHasError(true)
            setErrorMessage("Unable to play video. The file may be corrupted or in an unsupported format.")
            setIsLoading(false)
            onError?.(error)
          }}
        />
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  overflow: "hidden",
  marginVertical: spacing.sm,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.error,
  marginVertical: spacing.sm,
})

const $errorTitle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.xs,
})

const $errorText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.error,
  textAlign: "center",
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  alignItems: "center",
})

const $loadingText: ThemedStyle<ViewStyle> = () => ({
  textAlign: "center",
})

const $helperText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  textAlign: "center",
})

const $permissionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $placeholderContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 200,
  borderWidth: 1,
  borderColor: colors.border,
  borderStyle: "dashed",
})

const $placeholderTitle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.sm,
  color: colors.textDim,
})

const $placeholderText: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

const $videoPlayer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 300,
  borderRadius: 8,
})

