/**
 * Type definitions for File System Access API
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */

type FileSystemPermissionMode = "read" | "readwrite"

interface FileSystemPermissionStatus {
  state: "granted" | "denied" | "prompt"
}

interface FileSystemFileHandle {
  kind: "file"
  name: string
  getFile(): Promise<File>
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>
  queryPermission(options?: {
    mode?: FileSystemPermissionMode
  }): Promise<FileSystemPermissionStatus>
  requestPermission(options?: {
    mode?: FileSystemPermissionMode
  }): Promise<FileSystemPermissionStatus>
}

interface FileSystemDirectoryHandle {
  kind: "directory"
  name: string
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemDirectoryHandle>
}

interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}

interface FilePickerOptions {
  types?: FilePickerAcceptType[]
  excludeAcceptAllOption?: boolean
  multiple?: boolean
}

interface Window {
  showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
  showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
  showDirectoryPicker?(options?: {
    mode?: "read" | "readwrite"
  }): Promise<FileSystemDirectoryHandle>
}
