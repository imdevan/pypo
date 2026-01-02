import { Platform } from "react-native"
import * as FileSystem from "expo-file-system/legacy"

/**
 * Generates a thumbnail from a video URI
 * @param videoUri - URI to the video file (file://, content://, or blob URL)
 * @param timePosition - Time position in seconds to capture the thumbnail (default: 1 second)
 * @returns Promise resolving to the thumbnail URI, or null if generation failed
 */
export async function generateVideoThumbnail(
  videoUri: string,
  timePosition: number = 1.0,
): Promise<string | null> {
  try {
    // Web should not handle video thumbnails
    if (Platform.OS === "web") {
      console.warn("Video thumbnail generation is not supported on web")
      return null
    }
    // Mobile: generate and save to persistent storage
    return await generateThumbnailMobile(videoUri, timePosition)
  } catch (error) {
    console.error("Error generating video thumbnail:", error)
    return null
  }
}


/**
 * Generate thumbnail for mobile platforms (iOS/Android) using expo-video-thumbnails
 * Saves thumbnail to persistent app directory
 */
async function generateThumbnailMobile(
  videoUri: string,
  timePosition: number,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    // Lazy import to avoid loading during EAS build
    const VideoThumbnails = await import("expo-video-thumbnails")

    // Check if the native module is available
    if (!VideoThumbnails || !VideoThumbnails.getThumbnailAsync) {
      console.error(
        "expo-video-thumbnails native module not found. Please rebuild your development build:",
        "npx expo prebuild --clean && npx expo run:ios (or run:android)"
      )
      return null
    }

    // Use expo-video-thumbnails to get thumbnail (saves to temp location first)
    const { uri: tempUri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timePosition * 1000, // Convert to milliseconds
      quality: 0.85,
    })

    if (!tempUri) {
      return null
    }


    console.log('tempUri:', tempUri);


    // Create persistent directory for thumbnails if it doesn't exist
    const thumbnailsDir = `${FileSystem.documentDirectory}thumbnails/`
    const dirInfo = await FileSystem.getInfoAsync(thumbnailsDir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(thumbnailsDir, { intermediates: true })
    }

    // Generate a unique filename based on video URI and timestamp
    const videoHash = videoUri.split("/").pop() || "video"
    const timestamp = Date.now()
    const filename = `thumb_${timestamp}_${videoHash.replace(/[^a-zA-Z0-9.-]/g, "_")}.jpg`
    const persistentUri = `${thumbnailsDir}${filename}`

    // Copy thumbnail from temp location to persistent directory
    await FileSystem.copyAsync({
      from: tempUri,
      to: persistentUri,
    })

    // Clean up temporary file
    try {
      await FileSystem.deleteAsync(tempUri, { idempotent: true })
    } catch (cleanupError) {
      // Ignore cleanup errors
      console.warn("Failed to cleanup temp thumbnail:", cleanupError)
    }

    return persistentUri
  } catch (error: any) {
    // Check if it's a native module error
    if (error?.message?.includes("native module") || error?.message?.includes("ExpoVideoThumbnails")) {
      console.error(
        "expo-video-thumbnails native module not found. Please rebuild your development build:",
        "npx expo prebuild --clean && npx expo run:ios (or run:android)",
        "error:",
        error
      )
    } else {
      console.error("Error generating thumbnail on mobile:", error)
    }
    return null
  }
}

/**
 * Clean up a thumbnail URI
 * @param thumbnailUri - URI of the thumbnail to clean up
 */
export async function cleanupThumbnail(thumbnailUri: string | null): Promise<void> {
  if (!thumbnailUri) return

  if (Platform.OS === "web") {
    // Web doesn't generate thumbnails, nothing to clean up
    return
  }

  // On mobile, delete the persistent thumbnail file
  try {
    if (thumbnailUri.startsWith(FileSystem.documentDirectory || "")) {
      await FileSystem.deleteAsync(thumbnailUri, { idempotent: true })
    }
  } catch (error) {
    console.warn("Failed to cleanup thumbnail:", error)
  }
}

