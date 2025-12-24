import { Platform } from "react-native"

/**
 * Video file storage using File System Access API
 * Stores file handles (not file data) for persistent access
 */

const DB_NAME = "video-storage"
const STORE_NAME = "file-handles"
const DB_VERSION = 1

// File System Access API types are defined in types/file-system-access.d.ts

// Initialize IndexedDB for storing file handles
let db: IDBDatabase | null = null

async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    if (Platform.OS !== "web") {
      reject(new Error("IndexedDB is only available on web"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        // Store file handles with keyPath for easy lookup
        const store = database.createObjectStore(STORE_NAME, { keyPath: "key" })
        store.createIndex("fileName", "fileName", { unique: false })
      }
    }
  })
}

/**
 * Checks if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  if (Platform.OS !== "web") return false
  return "showOpenFilePicker" in window
}

/**
 * Opens a file picker using File System Access API
 * @param options - File picker options
 * @returns File handle and reference key
 */
export async function pickVideoFile(options?: {
  multiple?: boolean
  accept?: Record<string, string[]>
}): Promise<{ handle: FileSystemFileHandle; key: string } | null> {
  if (Platform.OS !== "web") {
    throw new Error("File System Access API is only available on web")
  }

  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API is not supported in this browser")
  }

  try {
    const fileHandles = await (window as any).showOpenFilePicker({
      types: [
        {
          description: "Video files",
          accept: {
            "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"],
          },
        },
      ],
      multiple: false,
      ...options,
    })

    if (fileHandles.length === 0) {
      return null
    }

    const handle = fileHandles[0]
    
    // Verify we have permission to access this file
    let permissionStatus = await handle.queryPermission({ mode: "read" })
    if (permissionStatus.state !== "granted") {
      // Request permission if not granted
      permissionStatus = await handle.requestPermission({ mode: "read" })
    }
    
    if (permissionStatus.state !== "granted") {
      throw new Error("Permission to access the file was denied")
    }
    
    // Generate a unique key based on file name and timestamp
    const timestamp = Date.now()
    const fileName = handle.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const key = `video_${timestamp}_${fileName}`

    // Store the file handle in IndexedDB
    await storeFileHandle(key, handle, handle.name)

    return { handle, key }
  } catch (error: any) {
    // User cancelled the picker
    if (error.name === "AbortError") {
      return null
    }
    throw error
  }
}

/**
 * Stores a file handle in IndexedDB
 * @param key - Unique key to store the handle
 * @param handle - File handle from File System Access API
 * @param fileName - Original file name
 */
async function storeFileHandle(
  key: string,
  handle: FileSystemFileHandle,
  fileName: string,
): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({ key, handle, fileName })

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to store file handle"))
    }
  })
}

/**
 * Retrieves a file handle from IndexedDB
 * @param key - The reference key stored in the database
 * @returns The file handle, or null if not found
 */
export async function getFileHandle(key: string): Promise<FileSystemFileHandle | null> {
  if (Platform.OS !== "web") {
    return null
  }

  try {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (result && result.handle) {
          resolve(result.handle)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(new Error("Failed to retrieve file handle"))
      }
    })
  } catch (error) {
    console.error("Error retrieving file handle:", error)
    return null
  }
}

/**
 * Checks permission status for a stored file handle
 * @param key - The reference key stored in the database
 * @returns Permission status, or null if handle not found
 */
export async function checkVideoFilePermission(key: string): Promise<"granted" | "denied" | "prompt" | null> {
  const handle = await getFileHandle(key)
  if (!handle) return null

  try {
    const permissionStatus = await handle.queryPermission({ mode: "read" })
    return permissionStatus.state
  } catch (error) {
    console.error("Error checking file permission:", error)
    return null
  }
}

/**
 * Requests permission to access a stored file handle
 * Must be called in response to a user gesture (e.g., button click)
 * @param key - The reference key stored in the database
 * @returns The File object if permission granted, or null
 */
export async function requestVideoFilePermission(key: string): Promise<File | null> {
  const handle = await getFileHandle(key)
  if (!handle) return null

  try {
    const permissionStatus = await handle.requestPermission({ mode: "read" })
    
    if (permissionStatus.state === "granted") {
      return await handle.getFile()
    }
    
    return null
  } catch (error: any) {
    console.error("Error requesting file permission:", error)
    return null
  }
}

/**
 * Gets a File object from a stored file handle
 * Only works if permission is already granted
 * @param key - The reference key stored in the database
 * @returns The File object, or null if not found or permission denied
 */
export async function getVideoFile(key: string): Promise<File | null> {
  const handle = await getFileHandle(key)
  if (!handle) return null

  try {
    // Check permission status first
    const permissionStatus = await handle.queryPermission({ mode: "read" })
    
    // Only try to get file if permission is granted
    if (permissionStatus.state !== "granted") {
      return null
    }

    // Now we can safely get the file
    return await handle.getFile()
  } catch (error: any) {
    // If it's a permission error, return null (don't try to request automatically)
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return null
    }
    console.error("Error getting file from handle:", error)
    return null
  }
}

/**
 * Gets a blob URL for a video file using the stored file handle
 * @param key - The reference key stored in the database
 * @returns A blob URL for the video, or null if not found
 */
export async function getVideoBlobUrl(key: string): Promise<string | null> {
  const file = await getVideoFile(key)
  if (!file) return null

  return URL.createObjectURL(file)
}

/**
 * Deletes a file handle from storage
 * @param key - The reference key to delete
 */
export async function deleteVideoFile(key: string): Promise<void> {
  if (Platform.OS !== "web") {
    return
  }

  try {
    const database = await initDB()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Failed to delete file handle"))
      }
    })
  } catch (error) {
    console.error("Error deleting file handle:", error)
  }
}

/**
 * Checks if a file handle exists in storage
 * @param key - The reference key to check
 * @returns True if the handle exists, false otherwise
 */
export async function videoFileExists(key: string): Promise<boolean> {
  const handle = await getFileHandle(key)
  return handle !== null
}

