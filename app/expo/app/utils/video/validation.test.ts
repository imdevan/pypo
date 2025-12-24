import { validateVideoFile, VideoValidationResult } from "./validation"

describe("validateVideoFile", () => {
  describe("Web File objects", () => {
    it("should validate a valid MP4 video file", async () => {
      const file = new File(["test"], "test.mp4", { type: "video/mp4" })
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: "mp4",
      })
    })

    it("should validate a valid MOV video file", async () => {
      const file = new File(["test"], "test.mov", { type: "video/quicktime" })
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/quicktime",
        errorMessage: null,
        fileExtension: "mov",
      })
    })

    it("should validate a valid WebM video file", async () => {
      const file = new File(["test"], "test.webm", { type: "video/webm" })
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/webm",
        errorMessage: null,
        fileExtension: "webm",
      })
    })

    it("should reject a non-video file", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" })
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: false,
        mimeType: "image/jpeg",
        errorMessage: "Invalid file type: image/jpeg. Please select a video file.",
        fileExtension: "jpg",
      })
    })

    it("should reject a file with invalid MIME type", async () => {
      const file = new File(["test"], "test.txt", { type: "text/plain" })
      const result = await validateVideoFile(file)

      expect(result.isValid).toBe(false)
      expect(result.mimeType).toContain("text/plain")
      expect(result.errorMessage).toContain("Invalid file type")
      expect(result.errorMessage).toContain("Please select a video file")
      expect(result.fileExtension).toBe("txt")
    })

    it("should handle file without extension", async () => {
      const file = new File(["test"], "test", { type: "video/mp4" })
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: null,
      })
    })
  })

  describe("Mobile file URIs", () => {
    it("should validate a valid video file with MIME type", async () => {
      const file = { uri: "file:///path/to/video.mp4", type: "video/mp4" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: "mp4",
      })
    })

    it("should validate a valid video file without MIME type but with valid extension", async () => {
      const file = { uri: "file:///path/to/video.mp4" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: "mp4",
      })
    })

    it("should validate MOV file without MIME type", async () => {
      const file = { uri: "file:///path/to/video.mov" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/quicktime",
        errorMessage: null,
        fileExtension: "mov",
      })
    })

    it("should reject a non-video file with MIME type", async () => {
      const file = { uri: "file:///path/to/image.jpg", type: "image/jpeg" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: false,
        mimeType: "image/jpeg",
        errorMessage: "Invalid file type: image/jpeg. Please select a video file.",
        fileExtension: "jpg",
      })
    })

    it("should reject a file without MIME type and invalid extension", async () => {
      const file = { uri: "file:///path/to/document.pdf" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: false,
        mimeType: null,
        errorMessage: "Unable to determine video file type. Please ensure the file is a valid video format.",
        fileExtension: "pdf",
      })
    })

    it("should handle URI without extension", async () => {
      const file = { uri: "file:///path/to/video", type: "video/mp4" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: null,
      })
    })

    it("should handle content:// URI (Android)", async () => {
      const file = { uri: "content://media/external/video/media/123", type: "video/mp4" }
      const result = await validateVideoFile(file)

      expect(result).toEqual({
        isValid: true,
        mimeType: "video/mp4",
        errorMessage: null,
        fileExtension: null,
      })
    })
  })

  describe("Edge cases", () => {
    it("should handle file with uppercase extension", async () => {
      const file = new File(["test"], "test.MP4", { type: "video/mp4" })
      const result = await validateVideoFile(file)

      expect(result.fileExtension).toBe("mp4")
    })

    it("should handle file with multiple dots in name", async () => {
      const file = new File(["test"], "my.video.file.mp4", { type: "video/mp4" })
      const result = await validateVideoFile(file)

      expect(result.fileExtension).toBe("mp4")
    })

    it("should validate various video extensions without MIME type", async () => {
      const extensions = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "3gp"]

      for (const ext of extensions) {
        const file = { uri: `file:///path/to/video.${ext}` }
        const result = await validateVideoFile(file)

        expect(result.isValid).toBe(true)
        expect(result.fileExtension).toBe(ext)
      }
    })
  })
})

