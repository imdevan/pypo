import { FC, useCallback, useEffect, useRef, useState } from "react"
import { Platform, View, ViewStyle } from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"

import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"
import {
  getVideoBlobUrl,
  checkVideoFilePermission,
  requestVideoFilePermission,
} from "@/utils/video/fileStorage"

import { Text } from "./Text"

interface VideoPlayerProps {
  videoUri: string
  thumbnailUri?: string | null
  style?: ViewStyle
  autoPlay?: boolean
  controls?: boolean
  contentFit?: "contain" | "cover" | "fill"
  onError?: (error: Error) => void
  onLoad?: () => void
  onRelinkVideo?: () => void
}

export const VideoPlayer: FC<VideoPlayerProps> = ({
  videoUri,
  thumbnailUri: _thumbnailUri,
  style,
  autoPlay = false,
  controls = true,
  contentFit = "contain",
  onError,
  onLoad,
  onRelinkVideo: _onRelinkVideo,
}) => {
  const { themed } = useAppTheme()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [_needsPermission, setNeedsPermission] = useState(false)
  const [_permissionDenied, setPermissionDenied] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  // Create video player for iOS/Android using expo-video
  // Initialize with empty string, will be updated when videoSrc is set
  const player = useVideoPlayer(Platform.OS !== "web" ? videoSrc || "" : "", (player) => {
    player.loop = false
    player.muted = false
  })

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
              "Permission to access the video file is required. Click the button below to grant access.",
            )
            return null
          } else if (permissionState === "denied") {
            // Permission was explicitly denied, cannot request again
            setNeedsPermission(false)
            setPermissionDenied(true)
            setIsLoading(false)
            setErrorMessage(
              "Permission to access the video file was denied. Please re-select the video file to grant access again.",
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
  const _handleRequestPermission = useCallback(async () => {
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
          "Permission was denied. Please re-select the video file to grant access again.",
        )
        setIsLoading(false)
      }
    } catch (error: any) {
      setHasError(true)
      if (error.name === "SecurityError" || error.message?.includes("denied")) {
        setPermissionDenied(true)
        setNeedsPermission(false)
        setErrorMessage(
          "Permission was denied. Please re-select the video file to grant access again.",
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
        setErrorMessage(
          "Unable to play video. The file may be corrupted or in an unsupported format.",
        )
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

  // iOS/Android video playback using expo-video
  useEffect(() => {
    if (Platform.OS !== "web" && videoUri) {
      setIsLoading(true)
      setHasError(false)
      setVideoSrc(videoUri)
    }
  }, [videoUri])

  // Update player source when videoSrc changes
  useEffect(() => {
    if (Platform.OS !== "web" && player && videoSrc) {
      player.replace(videoSrc)
      // Reset aspect ratio when video source changes
      setAspectRatio(null)
    }
  }, [player, videoSrc])

  // Handle video player status updates and auto-play, and get video dimensions
  useEffect(() => {
    if (Platform.OS !== "web" && player) {
      const subscription = player.addListener("statusChange", (status) => {
        if (status.status === "readyToPlay") {
          setIsLoading(false)
          setHasError(false)

          // Get video dimensions to calculate aspect ratio
          // Try multiple ways to get dimensions as API may vary
          try {
            let width: number | undefined
            let height: number | undefined

            // Try direct properties first
            if (player.width && player.height) {
              width = player.width
              height = player.height
            }
            // Try accessing through status if available
            else if ((status as any).naturalSize) {
              width = (status as any).naturalSize.width
              height = (status as any).naturalSize.height
            }
            // Try accessing through player properties
            else if ((player as any).naturalSize) {
              width = (player as any).naturalSize.width
              height = (player as any).naturalSize.height
            }

            if (width && height && width > 0 && height > 0) {
              const calculatedAspectRatio = width / height
              console.log("Video dimensions:", {
                width,
                height,
                aspectRatio: calculatedAspectRatio,
              })
              setAspectRatio(calculatedAspectRatio)
            } else {
              // Fallback to 16:9 if dimensions not available
              console.warn("Could not get video dimensions, using 16:9 fallback")
              setAspectRatio(16 / 9)
            }
          } catch (error) {
            console.error("Error getting video dimensions:", error)
            // Fallback to 16:9 if we can't get dimensions
            setAspectRatio(16 / 9)
          }

          onLoad?.()
          // Auto-play if requested
          if (autoPlay) {
            player.play()
          }
        } else if (status.status === "error") {
          setHasError(true)
          setErrorMessage(
            "Failed to load video. The file may be corrupted or in an unsupported format.",
          )
          setIsLoading(false)
          onError?.(new Error("Video playback error"))
        } else if (status.status === "loading") {
          setIsLoading(true)
        }
      })

      return () => {
        subscription.remove()
      }
    }
  }, [player, onError, onLoad, autoPlay])

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

  // iOS/Android implementation using expo-video
  if (hasError) {
    return (
      <View style={[themed($errorContainer), style]}>
        <Text text="⚠️ Video Error" preset="subheading" style={themed($errorTitle)} />
        <Text
          text={errorMessage || "Failed to load video"}
          preset="formHelper"
          style={themed($errorText)}
        />
      </View>
    )
  }

  return (
    <View
      style={[
        themed($container),
        style,
        aspectRatio ? { aspectRatio } : { aspectRatio: 16 / 9 }, // Apply aspect ratio to container
      ]}
    >
      {videoSrc && player && (
        <View style={themed($videoContainer)}>
          <VideoView
            player={player}
            style={themed($videoPlayer)}
            nativeControls={controls}
            contentFit={contentFit}
            allowsFullscreen
            allowsPictureInPicture
          />
          {isLoading && (
            <View style={themed($loadingContainer)}>
              <Text text="Loading video..." preset="formHelper" style={themed($loadingText)} />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const $videoContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: "100%",
  backgroundColor: "black",
})

const $container: ThemedStyle<ViewStyle> = ({ _colors, spacing }) => ({
  width: "100%",
  backgroundColor: "black", // Use black background to avoid brightness issues
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
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
  padding: spacing.md,
})

const $loadingText: ThemedStyle<ViewStyle> = () => ({
  textAlign: "center",
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
  height: "100%", // Fill the container which has the aspect ratio
  borderRadius: 8,
  backgroundColor: "black", // Ensure black background
})
