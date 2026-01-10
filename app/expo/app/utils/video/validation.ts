/**
 * Video file validation utilities
 */

export interface VideoValidationResult {
  isValid: boolean
  mimeType: string | null
  errorMessage: string | null
  fileExtension: string | null
}

/**
 * Validates a video file by checking its MIME type
 * @param file - File object (web) or object with uri and optional type (mobile)
 * @returns Promise resolving to validation result
 */
export async function validateVideoFile(
  file: File | { uri: string; type?: string },
): Promise<VideoValidationResult> {
  let mimeType: string | null = null
  let fileExtension: string | null = null

  // Handle File object (web)
  if (file instanceof File) {
    mimeType = file.type
    const fileName = file.name
    const lastDotIndex = fileName.lastIndexOf(".")
    fileExtension = lastDotIndex >= 0 ? fileName.substring(lastDotIndex + 1).toLowerCase() : null
  } else {
    // Handle file URI (mobile)
    mimeType = file.type || null
    const uri = file.uri
    const lastDotIndex = uri.lastIndexOf(".")
    fileExtension = lastDotIndex >= 0 ? uri.substring(lastDotIndex + 1).toLowerCase() : null
  }

  // Validate MIME type
  if (!mimeType) {
    // If no MIME type, check file extension as fallback
    const videoExtensions = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"]
    if (fileExtension && videoExtensions.includes(fileExtension)) {
      return {
        isValid: true,
        mimeType: `video/${fileExtension === "mov" ? "quicktime" : fileExtension}`,
        errorMessage: null,
        fileExtension,
      }
    }
    return {
      isValid: false,
      mimeType: null,
      errorMessage:
        "Unable to determine video file type. Please ensure the file is a valid video format.",
      fileExtension,
    }
  }

  // Check if MIME type starts with 'video/'
  if (!mimeType.startsWith("video/")) {
    return {
      isValid: false,
      mimeType,
      errorMessage: `Invalid file type: ${mimeType}. Please select a video file.`,
      fileExtension,
    }
  }

  return {
    isValid: true,
    mimeType,
    errorMessage: null,
    fileExtension,
  }
}
