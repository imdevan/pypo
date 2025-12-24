# Video Upload Feature - Design Document

## 1. User Stories & Requirements

### Primary User Stories
1. **As a user**, I want to attach a video file to an item during creation, so that I can reference local video content.
2. **As a user**, I want to click a button to select a video file from my device, so that I can easily attach videos.
3. **As a user** (web), I want to drag and drop video files into a designated area, so that I can quickly attach videos.
4. **As a user**, I want to see a thumbnail preview of my attached video before saving, so that I can verify I selected the correct file.
5. **As a user**, I want to view the attached video inline on the item detail screen, so that I can watch the video without leaving the app.
6. **As a user**, I want to be notified if my video file link is broken, so that I can re-attach the video if needed.

### Functional Requirements
- **FR1**: Support video file attachment via button click (all platforms)
- **FR2**: Support drag-and-drop video attachment (web only)
- **FR3**: Validate video file format via MIME type before attachment
- **FR4**: Store video file URI (local file path) in database as `video_url` field
- **FR5**: Generate video thumbnail on item creation/save
- **FR6**: Store thumbnail in app local directory
- **FR7**: Display video inline on item detail screen with native playback controls
- **FR8**: Display thumbnail preview with play button overlay (Feather icons) on item detail screen
- **FR9**: Show helpful error message if video format is unsupported
- **FR10**: Show helpful error message if video file link is broken
- **FR11**: Provide option to re-link video if file is missing

### Non-Functional Requirements
- **NFR1**: Video attachment should not block UI (async operations)
- **NFR2**: Thumbnail generation should not significantly delay item creation
- **NFR3**: Video playback should work with standard formats including HEVC
- **NFR4**: Component should be reusable and follow existing app patterns
- **NFR5**: Error messages should be user-friendly and actionable

### Platform-Specific Requirements
- **Web**: Drag-and-drop support, file input element
- **iOS**: Document picker integration, file access permissions
- **Android**: Document picker integration, file access permissions

### Implementation Phases
1. **Phase 1**: Web implementation (button + drag-and-drop)
2. **Phase 2**: iOS implementation (button only)
3. **Phase 3**: Android implementation (button only)
4. **Phase 4**: Custom video controls (future enhancement)
5. **Phase 5**: Persistent file copy to app directory (future enhancement)

---

## 2. Data Models / Schema

### Backend Schema Changes (Separate Task)
```json
{
  "ItemCreate": {
    "title": "string (required, 1-255 chars)",
    "description": "string? (optional, max 255 chars)",
    "image_url": "string? (optional, max 2048 chars)",
    "video_url": "string? (optional, max 2048 chars)",
    "tag_ids": "string[]? (optional)"
  },
  "ItemUpdate": {
    "title": "string? (optional, 1-255 chars)",
    "description": "string? (optional, max 255 chars)",
    "image_url": "string? (optional, max 2048 chars)",
    "video_url": "string? (optional, max 2048 chars)",
    "tag_ids": "string[]? (optional)"
  },
  "ItemPublic": {
    "title": "string (required)",
    "description": "string?",
    "image_url": "string?",
    "video_url": "string?",
    "id": "string",
    "owner_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tags": "TagPublic[]?"
  }
}
```

### Frontend State Model
```typescript
// Video attachment state in AddItemScreen
interface VideoAttachmentState {
  videoUri: string | null;           // Local file URI (file:// or blob:)
  videoFile: File | null;            // File object (web) or file reference (mobile)
  thumbnailUri: string | null;        // Generated thumbnail URI
  isGeneratingThumbnail: boolean;     // Thumbnail generation in progress
  error: string | null;               // Error message if any
  isValidating: boolean;               // Format validation in progress
}
```

### Thumbnail Storage Model
```typescript
// Thumbnail metadata (stored in app local directory)
interface ThumbnailMetadata {
  videoUri: string;                   // Original video URI (for reference)
  thumbnailPath: string;               // Local path to thumbnail image
  generatedAt: string;                 // ISO timestamp
  itemId?: string;                     // Associated item ID (if available)
}
```

### File Validation Model
```typescript
// Video format validation result
interface VideoValidationResult {
  isValid: boolean;
  mimeType: string | null;
  errorMessage: string | null;
  fileExtension: string | null;
}
```

---

## 3. Core Interfaces

### Video Upload Component Interface
```typescript
interface VideoUploadInputProps {
  value: string | null;                // Current video URI
  onChange: (uri: string | null) => void;
  onFileSelect?: (file: File | null) => void;  // For thumbnail generation
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  error?: string | null;
}

interface VideoUploadInputState {
  isDragging: boolean;                 // Web: drag state
  previewUri: string | null;           // Thumbnail preview
  isValidating: boolean;
  validationError: string | null;
}
```

### Video Display Component Interface
```typescript
interface VideoPlayerProps {
  videoUri: string;                    // Video file URI
  thumbnailUri?: string | null;        // Optional thumbnail URI
  style?: ViewStyle;
  autoPlay?: boolean;
  controls?: boolean;                   // Native controls (default: true)
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

interface VideoThumbnailProps {
  videoUri: string;
  thumbnailUri?: string | null;
  onPress: () => void;                  // Play video
  style?: ViewStyle;
  showPlayButton?: boolean;             // Default: true
}
```

### Video Utility Functions Interface
```typescript
// Video format validation
function validateVideoFile(file: File | { uri: string; type?: string }): Promise<VideoValidationResult>;

// Thumbnail generation
function generateVideoThumbnail(
  videoUri: string,
  timestamp?: number                    // Frame timestamp (default: 1 second)
): Promise<string>;                    // Returns thumbnail file URI

// File access utilities
function selectVideoFile(): Promise<{ uri: string; file: File | null }>;  // Platform-specific

// File existence check
function checkFileExists(uri: string): Promise<boolean>;

// Error message formatting
function formatVideoError(error: Error | string): string;
```

### Platform-Specific Interfaces

#### Web
```typescript
interface WebVideoSelectResult {
  uri: string;                          // blob: URL or file://
  file: File;
  mimeType: string;
}

function selectVideoFileWeb(): Promise<WebVideoSelectResult>;
function handleDragAndDrop(event: DragEvent): Promise<WebVideoSelectResult | null>;
```

#### iOS
```typescript
interface IOSVideoSelectResult {
  uri: string;                          // file:// URI
  name: string;
  mimeType: string | null;
}

function selectVideoFileIOS(): Promise<IOSVideoSelectResult>;
```

#### Android
```typescript
interface AndroidVideoSelectResult {
  uri: string;                          // content:// or file:// URI
  name: string;
  mimeType: string | null;
}

function selectVideoFileAndroid(): Promise<AndroidVideoSelectResult>;
```

### Thumbnail Storage Interface
```typescript
interface ThumbnailStorage {
  saveThumbnail(thumbnailUri: string, videoUri: string): Promise<string>;  // Returns stored path
  getThumbnail(videoUri: string): Promise<string | null>;
  deleteThumbnail(videoUri: string): Promise<void>;
  clearAllThumbnails(): Promise<void>;
}
```

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Web Implementation

#### Step 1.1: Create Video Upload Component (Web)
- [ ] Create `VideoUploadInput.tsx` component in `app/components/lib/`
- [ ] Implement file input button with `accept="video/*"` attribute
- [ ] Implement drag-and-drop zone with visual feedback
- [ ] Add MIME type validation on file selection
- [ ] Display error message for invalid formats
- [ ] Create blob URL from selected file for preview
- [ ] Match styling patterns from `ImageUrlInput.tsx`

#### Step 1.2: Video Validation Utility
- [ ] Create `app/utils/video/validation.ts`
- [ ] Implement `validateVideoFile()` function
- [ ] Check MIME type starts with `video/`
- [ ] Return structured validation result with error messages
- [ ] Support both File objects and file URIs

#### Step 1.3: Integrate into AddItemScreen
- [ ] Add `video_url` state to `AddItemScreen`
- [ ] Import and add `VideoUploadInput` component
- [ ] Update `createItem` function to include `video_url` in API call
- [ ] Add video URL to form reset logic
- [ ] Handle video URL in form submission

#### Step 1.4: Backend API Integration
- [ ] Update OpenAPI client generation (after backend adds `video_url`)
- [ ] Verify `ItemCreate` and `ItemUpdate` types include `video_url`
- [ ] Test API calls with video URL

#### Step 1.5: Video Display Component (Web)
- [ ] Create `VideoPlayer.tsx` component in `app/components/lib/`
- [ ] Implement HTML5 `<video>` element wrapper
- [ ] Add native browser controls
- [ ] Handle video load errors gracefully
- [ ] Support full-width display on mobile viewports

#### Step 1.6: Video Thumbnail Component
- [ ] Create `VideoThumbnail.tsx` component
- [ ] Display thumbnail image with play button overlay
- [ ] Use Feather icons for play button
- [ ] Handle thumbnail load errors
- [ ] Add press handler to play video

#### Step 1.7: Integrate Video Display in ItemScreen
- [ ] Add video display section to `ItemScreen.tsx`
- [ ] Check if `item.video_url` exists
- [ ] Display `VideoThumbnail` or `VideoPlayer` based on state
- [ ] Handle broken video links with error message
- [ ] Add "Re-link Video" button for broken links

#### Step 1.8: Thumbnail Generation (Web)
- [ ] Create `app/utils/video/thumbnail.ts`
- [ ] Implement `generateVideoThumbnail()` using HTML5 video element
- [ ] Create video element, load file, seek to 1 second
- [ ] Capture frame using canvas
- [ ] Convert canvas to blob URL
- [ ] Store thumbnail in app local directory (web: IndexedDB or localStorage path reference)

#### Step 1.9: Thumbnail Storage (Web)
- [ ] Create `app/utils/video/thumbnailStorage.ts`
- [ ] Implement storage using IndexedDB or localStorage
- [ ] Store thumbnail as base64 or blob reference
- [ ] Implement retrieval and deletion methods
- [ ] Generate new thumbnail on each item creation (no reuse)

#### Step 1.10: Error Handling
- [ ] Create `app/utils/video/errors.ts`
- [ ] Implement `formatVideoError()` function
- [ ] Create user-friendly error messages
- [ ] Handle unsupported format errors
- [ ] Handle file not found errors
- [ ] Handle video playback errors

#### Step 1.11: Testing & Refinement
- [ ] Test video file selection (button)
- [ ] Test drag-and-drop functionality
- [ ] Test format validation (valid and invalid)
- [ ] Test video playback on item screen
- [ ] Test thumbnail generation and display
- [ ] Test error scenarios (broken links, unsupported formats)
- [ ] Test form submission with video URL
- [ ] Verify video URL persistence in database

### Phase 2: iOS Implementation

#### Step 2.1: Install iOS Dependencies
- [ ] Research and select document picker library (e.g., `expo-document-picker`)
- [ ] Install required packages via `bun add`
- [ ] Update `app.json` with required iOS permissions if needed

#### Step 2.2: iOS File Selection
- [ ] Create `app/utils/video/platform/ios.ts`
- [ ] Implement `selectVideoFileIOS()` using document picker
- [ ] Handle file URI conversion
- [ ] Extract MIME type from selected file
- [ ] Return structured result matching interface

#### Step 2.3: Update Video Upload Component for iOS
- [ ] Add platform detection to `VideoUploadInput.tsx`
- [ ] Conditionally render iOS-specific file picker
- [ ] Hide drag-and-drop on iOS
- [ ] Test file selection flow

#### Step 2.4: iOS Thumbnail Generation
- [ ] Research iOS video thumbnail generation (React Native Video or native module)
- [ ] Implement `generateVideoThumbnail()` for iOS
- [ ] Use appropriate iOS APIs for frame extraction
- [ ] Store thumbnail in app documents directory

#### Step 2.5: iOS Thumbnail Storage
- [ ] Implement iOS-specific thumbnail storage
- [ ] Use app documents directory for thumbnails
- [ ] Implement file system operations
- [ ] Generate new thumbnail on each item creation

#### Step 2.6: iOS Video Playback
- [ ] Research React Native video player library (e.g., `react-native-video` or `expo-av`)
- [ ] Implement iOS video player component
- [ ] Test native controls
- [ ] Handle iOS-specific video formats (including HEVC)

#### Step 2.7: iOS Testing
- [ ] Test file selection on iOS device/simulator
- [ ] Test video playback
- [ ] Test thumbnail generation
- [ ] Test error handling
- [ ] Verify file URI persistence

### Phase 3: Android Implementation

#### Step 3.1: Install Android Dependencies
- [ ] Install document picker library for Android
- [ ] Update `app.json` with required Android permissions
- [ ] Verify file access permissions

#### Step 3.2: Android File Selection
- [ ] Create `app/utils/video/platform/android.ts`
- [ ] Implement `selectVideoFileAndroid()` using document picker
- [ ] Handle content:// URI conversion
- [ ] Extract MIME type from selected file
- [ ] Return structured result matching interface

#### Step 3.3: Update Video Upload Component for Android
- [ ] Add Android platform detection
- [ ] Conditionally render Android-specific file picker
- [ ] Hide drag-and-drop on Android
- [ ] Test file selection flow

#### Step 3.4: Android Thumbnail Generation
- [ ] Implement `generateVideoThumbnail()` for Android
- [ ] Use appropriate Android APIs for frame extraction
- [ ] Store thumbnail in app local storage

#### Step 3.5: Android Thumbnail Storage
- [ ] Implement Android-specific thumbnail storage
- [ ] Use app local storage directory
- [ ] Implement file system operations
- [ ] Generate new thumbnail on each item creation

#### Step 3.6: Android Video Playback
- [ ] Implement Android video player component
- [ ] Test native controls
- [ ] Handle Android-specific video formats
- [ ] Test HEVC support

#### Step 3.7: Android Testing
- [ ] Test file selection on Android device/emulator
- [ ] Test video playback
- [ ] Test thumbnail generation
- [ ] Test error handling
- [ ] Verify file URI persistence

### Phase 4: Future Enhancements (Out of Scope for Initial Implementation)

#### Step 4.1: Custom Video Controls
- [ ] Design custom control UI
- [ ] Implement play/pause button
- [ ] Implement seek bar
- [ ] Implement volume control
- [ ] Replace native controls with custom ones

#### Step 4.2: Persistent File Copy
- [ ] Design file copy strategy
- [ ] Implement file copy to app directory on attachment
- [ ] Update file URI references
- [ ] Handle file migration for existing items
- [ ] Add file cleanup on item deletion

---

## 5. Technical Considerations

### File URI Formats
- **Web**:  `file:///path/to/file` 
- **iOS**: `file:///path/to/file` or app-specific URI
- **Android**: `content://...` or `file:///path/to/file`

### Video Format Support
- Primary: MP4 (H.264, H.265/HEVC)
- Secondary: MOV, WebM (web)
- Validation: MIME type check (`video/*`)

### Thumbnail Generation Strategy
- Extract frame at 1 second mark (or first available frame)
- Format: JPEG or PNG
- Size: Optimize for display (e.g., 320x240 or similar)
- Storage: App local directory, new thumbnail each time

### Error Scenarios
1. **Invalid file format**: Show error, prevent attachment
2. **File not found**: Show error on item screen, offer re-link option
3. **Unsupported codec**: Show error during playback
4. **Thumbnail generation failure**: Show placeholder or video element without thumbnail

### Performance Considerations
- Thumbnail generation should be async and not block UI
- Consider lazy loading thumbnails on item list screens
- Video playback should not preload entire file
- File validation should be quick (MIME type check only)

### Security Considerations
- Validate file MIME type to prevent non-video files
- Sanitize file paths before storage
- Handle file access permissions gracefully
- Consider file size limits for thumbnail generation

---

## 6. Dependencies & Libraries

### Required Dependencies (To Be Installed)
- **Web**: None (use native HTML5 video and File API)
- **iOS**: `expo-document-picker` (or similar), video thumbnail library
- **Android**: `expo-document-picker` (or similar), video thumbnail library
- **Cross-platform video player**: `react-native-video` or `expo-av` (for mobile)

### Existing Dependencies (Already Available)
- `@react-native-vector-icons/feather` - For play button icon
- React Native core APIs
- Expo file system APIs (if using Expo)

---

## 7. Open Questions & Decisions Needed

1. **Video Player Library**: Choose between `react-native-video` and `expo-av` for mobile platforms
2. **Thumbnail Library**: Determine best library for iOS/Android thumbnail generation
3. **File Picker Library**: Confirm `expo-document-picker` supports video files and all required platforms
4. **Thumbnail Storage Format**: Confirm storage mechanism (IndexedDB for web, file system for mobile)
5. **Error Recovery**: Define exact UX for "re-link video" flow on broken links

---

## 8. Success Criteria

- [ ] User can attach video file via button click on all platforms
- [ ] User can attach video file via drag-and-drop on web
- [ ] Invalid video formats are rejected with clear error message
- [ ] Video URI is stored in database on item creation
- [ ] Thumbnail is generated and stored on item creation
- [ ] Video displays inline on item detail screen with native controls
- [ ] Thumbnail displays with play button overlay
- [ ] Broken video links show helpful error message
- [ ] User can re-link video if file is missing
- [ ] Implementation follows existing code patterns and styling

---

## 9. Notes for Implementation Team

- Start with web implementation to establish patterns
- Reuse existing component patterns (e.g., `ImageUrlInput.tsx`)
- Follow existing error handling patterns from the codebase
- Ensure all user-facing text is internationalized (i18n)
- Test with various video formats and sizes
- Consider accessibility (screen readers, keyboard navigation)
- Document any platform-specific limitations or workarounds

