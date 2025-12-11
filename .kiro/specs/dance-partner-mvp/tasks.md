# Implementation Plan

## Phase 1: Backend Foundation

- [ ] 1. Extend existing FastAPI backend with Dance Partner models
  - [-] 1.1 Configure database for Dance Partner tables
    - Use existing Turso db connection for production
    - Configure SQLite for development
    - Add database connection configuration
    - _Requirements: MVP Scope - Database Topology, Dev/Prod Split_
  - [ ] 1.2 Add Dance Partner models to existing `app/backend/app/models.py`
    - Extend existing User model with last_viewed_style_id field
    - Define DanceStyle model with user_id, name, description, is_global
    - Define Recap model with user_id, dance_style_id, title, description, asset_id, thumbnail_uri, video_available, source_device_id
    - Define DanceTag model with user_id, title, slug, description, is_global (separate from existing Tag)
    - Define Note model with recap_id, content
    - Define RecapDanceTag junction model
    - _Requirements: All data models from design_
  - [ ]* 1.3 Write property test for model serialization round-trip
    - **Property 27: Serialization round-trip preserves data**
    - **Validates: Requirements 7.6, 7.7**
  - [ ] 1.4 Create Alembic migration for Dance Partner tables
    - Generate migration from new models
    - Test migration on PostgreSQL (existing setup)
    - _Requirements: MVP Scope - Schema Management_

- [ ] 2. Implement Clerk authentication integration
  - [ ] 2.1 Configure Clerk JWT validation in FastAPI
    - Install Clerk Python SDK or use PyJWT with Clerk JWKS
    - Add Clerk publishable key and secret to config
    - Implement JWT validation middleware for protected endpoints
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ] 2.2 Create user sync endpoint
    - POST /users/sync - create or retrieve user from Clerk user ID
    - Map Clerk user data to local User record
    - _Requirements: 1.2_
  - [ ]* 2.3 Write unit tests for Clerk auth flow
    - Test JWT validation success/failure
    - Test user creation on first auth
    - Test user retrieval on subsequent auth
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Implement all Dance Partner API endpoints
  - [ ] 3.1 Create dance style endpoints
    - GET /dance-styles/global - return list of global dance styles
    - GET /dance-styles/user - return user's dance styles
    - POST /dance-styles - create new dance style
    - PUT /dance-styles/{styleId} - update dance style
    - DELETE /dance-styles/{styleId} - delete dance style with reassignment option
    - Seed initial global dance styles (Zouk, WCS, Bachata, Salsa, etc.)
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_
  - [ ] 3.2 Create recap endpoints
    - GET /recaps - return user's recaps with optional filtering
    - GET /recaps/{recapId} - return specific recap
    - POST /recaps - create new recap
    - PUT /recaps/{recapId} - update recap
    - DELETE /recaps/{recapId} - delete recap
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [ ] 3.3 Create tag endpoints
    - GET /tags/global - return list of global tags
    - GET /tags/user - return user's tags
    - POST /tags - create new tag
    - DELETE /tags/{tagId} - delete tag
    - POST /recaps/{recapId}/tags/{tagId} - apply tag to recap
    - DELETE /recaps/{recapId}/tags/{tagId} - remove tag from recap
    - Seed initial global tags for common dance moves/concepts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ] 3.4 Create note endpoints
    - GET /recaps/{recapId}/notes - return notes for recap
    - POST /recaps/{recapId}/notes - create new note
    - PUT /notes/{noteId} - update note
    - DELETE /notes/{noteId} - delete note
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [ ]* 3.5 Write unit tests for all API endpoints
    - Test all CRUD operations
    - Test filtering and search functionality
    - Test error handling and validation
    - _Requirements: All API endpoints_

- [ ] 4. Generate OpenAPI client for mobile
  - [ ] 4.1 Configure OpenAPI spec generation
    - Set up FastAPI to export OpenAPI JSON
    - Configure openapi-typescript for client generation
    - Generate TypeScript types, React Query hooks, Zod schemas
    - _Requirements: MVP Scope - Schema Management_

- [ ] 5. Checkpoint - Backend foundation complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Mobile App Foundation

- [ ] 6. Set up Expo project and React Query for API state management
  - [ ] 6.1 Initialize Expo project in app/expo or extend existing
    - Set up Expo with TypeScript template
    - Configure for iOS development
    - Add @tanstack/react-query for API state management
    - Configure React Query client with cache settings
    - Set up query invalidation and background refresh
    - _Requirements: MVP Scope - Online Strategy_
  - [ ] 6.2 Create TypeScript API client and hooks
    - Generate TypeScript client from OpenAPI spec
    - Create React Query hooks for all endpoints
    - Implement optimistic updates for mutations
    - Configure cache keys and invalidation strategies
    - _Requirements: All CRUD operations_
  - [ ]* 6.3 Write property test for tag slug generation
    - **Property 12: Tag creation generates correct slug**
    - **Validates: Requirements 4.1**

- [ ] 7. Implement Clerk authentication on mobile
  - [ ] 7.1 Set up Clerk Expo SDK
    - Install @clerk/clerk-expo
    - Configure Clerk with Google OAuth provider
    - Implement sign-in flow with ClerkProvider
    - _Requirements: 1.1, 1.2_
  - [ ] 7.2 Create auth state management
    - Use Clerk's useAuth and useUser hooks
    - Sync Clerk user to backend on first sign-in
    - Implement sign-out with local data clearing
    - _Requirements: 1.3, 1.4_
  - [ ]* 7.3 Write property test for sign-out clears session
    - **Property 1: Sign-out clears session**
    - **Validates: Requirements 1.4**
  - [ ]* 7.4 Write unit tests for auth state management
    - Test sign-in state transitions
    - Test session expiry handling
    - Test sign-out clears all data
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 8. Set up cache management
  - [ ] 8.1 Implement CacheService
    - Configure React Query cache settings
    - Implement cache invalidation strategies
    - Add offline detection and handling
    - Create cache status monitoring
    - _Requirements: 7.4, 7.5_

- [ ] 9. Checkpoint - Mobile foundation complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Dance Style Management

- [ ] 10. Implement dance style service
  - [ ] 10.1 Create DanceStyleService with CRUD operations
    - Implement getGlobalStyles() - fetch from API, cache locally
    - Implement getUserStyles() - query local Turso
    - Implement addStyleToUser() - copy global style to user collection
    - Implement createCustomStyle() - create user-owned style
    - Implement updateStyle() and deleteStyle()
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_
  - [ ]* 10.2 Write property test for adding global style
    - **Property 2: Adding global style to user collection**
    - **Validates: Requirements 2.2**
  - [ ]* 10.3 Write property test for custom style creation
    - **Property 3: Custom style creation stores all fields**
    - **Validates: Requirements 2.3**
  - [ ] 10.4 Implement last viewed style tracking
    - Store last_viewed_style_id in user record
    - Retrieve on app open
    - _Requirements: 2.8_
  - [ ]* 10.5 Write property test for last viewed style
    - **Property 6: Last viewed style is remembered**
    - **Validates: Requirements 2.8**

- [ ] 11. Build dance style UI components
  - [ ] 11.1 Create dance style selection prompt
    - Show when user has zero styles
    - Display global styles list with add button
    - Include "Create custom" option
    - _Requirements: 2.1_
  - [ ] 11.2 Create side menu with dance style switcher
    - List all user dance styles
    - Highlight currently selected style
    - Handle style switching
    - _Requirements: 2.4, 2.5_
  - [ ] 11.3 Create dance style edit/delete screens
    - Edit form for name and description
    - Delete confirmation with reassign/delete options
    - _Requirements: 2.6, 2.7_

- [ ] 12. Checkpoint - Dance style management complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Recap Management

- [ ] 13. Implement video picker and asset ID persistence
  - [ ] 13.1 Create video picker using expo-media-library
    - Request Photos library permissions
    - Return asset ID for selected video
    - Store current device ID with recap
    - Handle permission denied gracefully
    - _Requirements: 3.1_
  - [ ] 13.2 Implement thumbnail generation service
    - Generate thumbnail from asset ID using expo-video-thumbnails
    - Cache thumbnail to local file system
    - Return cached thumbnail path
    - _Requirements: 3.7_
  - [ ]* 13.3 Write property test for thumbnail generation
    - **Property 11: Thumbnail generated on recap creation**
    - **Validates: Requirements 3.7**

- [ ] 14. Implement recap service
  - [ ] 14.1 Create RecapService with CRUD operations
    - Implement createVideoRecap() - store asset ID, generate thumbnail, set source_device_id
    - Implement getRecap(), getRecapsByStyle(), getAllRecaps()
    - Implement updateRecap() and deleteRecap()
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  - [ ]* 14.2 Write property test for recap view shows complete data
    - **Property 8: Recap view shows complete data**
    - **Validates: Requirements 3.3**
  - [ ]* 14.3 Write property test for recap update
    - **Property 9: Recap update persists changes**
    - **Validates: Requirements 3.4**
  - [ ] 14.4 Implement video availability check and re-link
    - Check asset ID validity via expo-media-library
    - Detect if asset is from different device (source_device_id mismatch)
    - Show re-link prompt if unavailable
    - Update asset ID after re-link
    - _Requirements: 3.6_

- [ ] 15. Build recap UI components
  - [ ] 15.1 Create recap creation flow
    - expo-media-library picker trigger
    - Title and description form
    - Dance style selector
    - Tag selector
    - _Requirements: 3.1_
  - [ ] 15.2 Create recap detail view
    - Display title, description, video player
    - Show associated tags
    - Show associated notes
    - Edit and delete actions
    - _Requirements: 3.3, 3.4, 3.5_
  - [ ] 15.3 Create re-link prompt component
    - Show when video unavailable or from different device
    - Trigger expo-media-library picker for new selection
    - Update recap with new asset ID
    - _Requirements: 3.6_

- [ ] 16. Checkpoint - Recap management complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Tag System

- [ ] 17. Implement tag service
  - [ ] 17.1 Create DanceTagService with CRUD operations
    - Implement getGlobalTags() - fetch from API, cache locally
    - Implement getUserTags() - query local Turso
    - Implement createTag() - auto-generate slug from title
    - Implement deleteTag() - cascade to recap_dance_tags
    - _Requirements: 4.1, 4.3, 4.5_
  - [ ] 17.2 Implement tag-recap association
    - Implement applyTagToRecap() and removeTagFromRecap()
    - Implement getRecapsByTag()
    - _Requirements: 4.2, 4.4_
  - [ ]* 17.3 Write property test for tag application
    - **Property 13: Tag application creates association**
    - **Validates: Requirements 4.2**
  - [ ]* 17.4 Write property test for tag search
    - **Property 15: Tag search returns all associated recaps**
    - **Validates: Requirements 4.4**
  - [ ]* 17.5 Write property test for tag deletion
    - **Property 16: Tag deletion removes all associations**
    - **Validates: Requirements 4.5**

- [ ] 18. Build tag UI components
  - [ ] 18.1 Create tag list view
    - Separate sections for user tags and global tags
    - Create new tag button
    - Delete tag action (user tags only)
    - _Requirements: 4.3_
  - [ ] 18.2 Create tag selector for recaps
    - Multi-select tag picker
    - Show applied tags with remove option
    - Quick-create new tag inline
    - _Requirements: 4.2_

- [ ] 19. Checkpoint - Tag system complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Notes System

- [ ] 20. Implement note service
  - [ ] 20.1 Create NoteService with CRUD operations
    - Implement createNote() - plain text content
    - Implement getNotesByRecap() - ordered by creation time
    - Implement updateNote() and deleteNote()
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  - [ ]* 20.2 Write property test for notes in creation order
    - **Property 18: Notes displayed in creation order**
    - **Validates: Requirements 5.3**
  - [ ]* 20.3 Write property test for note update preserves association
    - **Property 19: Note update preserves association**
    - **Validates: Requirements 5.4**

- [ ] 21. Build note UI components
  - [ ] 21.1 Create note list in recap detail view
    - Display notes in creation order
    - Add note button
    - Edit and delete actions per note
    - _Requirements: 5.3_
  - [ ] 21.2 Create note editor
    - Plain text input (formatting deferred post-MVP)
    - Save and cancel actions
    - _Requirements: 5.1, 5.4_

- [ ] 22. Checkpoint - Notes system complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Video Library

- [ ] 23. Implement video library service
  - [ ] 23.1 Create VideoLibraryService
    - Implement getAllVideos() - all user recaps with thumbnails
    - Implement getVideosByStyle() and getVideosByTag()
    - Implement searchVideos() - search title, description, notes, tags
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 23.2 Write property test for style filtering
    - **Property 22: Style filter shows only matching recaps**
    - **Validates: Requirements 6.3**
  - [ ]* 23.3 Write property test for tag filtering
    - **Property 23: Tag filter shows only tagged recaps**
    - **Validates: Requirements 6.4**
  - [ ]* 23.4 Write property test for search matching
    - **Property 24: Search matches across all fields**
    - **Validates: Requirements 6.5**

- [ ] 24. Build video library UI
  - [ ] 24.1 Create video library grid view
    - Display thumbnails in grid layout
    - Handle missing thumbnails with placeholder
    - Tap to open recap detail
    - _Requirements: 6.1_
  - [ ] 24.2 Create filter controls
    - Dance style filter dropdown
    - Tag filter dropdown
    - "All" option to clear filters
    - _Requirements: 6.2, 6.3, 6.4_
  - [ ] 24.3 Create search bar
    - Text input with search icon
    - Real-time filtering as user types
    - Clear search button
    - _Requirements: 6.5_

- [ ] 25. Checkpoint - Video library complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Export/Import

- [ ] 26. Implement export/import service
  - [ ] 26.1 Create ExportImportService
    - Implement exportLibrary() - gather all user data with relationships, include device ID/name
    - Implement serializeToJson() - convert to JSON string with sourceDeviceId and sourceDeviceName
    - Implement deserializeFromJson() - parse and validate JSON
    - Implement importLibrary() - merge or replace mode
    - _Requirements: 7.1, 7.2, 7.6, 7.7_
  - [ ]* 26.2 Write property test for export includes all data
    - **Property 25: Export includes all user data**
    - **Validates: Requirements 7.1**
  - [ ]* 26.3 Write property test for import flags unavailable videos
    - **Property 26: Import with unavailable videos flags recaps**
    - **Validates: Requirements 7.3**
  - [ ] 26.4 Handle unavailable video assets during import
    - Check each asset ID availability via expo-media-library
    - Detect cross-device imports (source_device_id != current device)
    - Set video_available=false for unavailable/cross-device assets
    - Return list of flagged recap IDs
    - _Requirements: 7.3_

- [ ] 27. Build export/import UI
  - [ ] 27.1 Create export flow
    - Export button in settings
    - Generate JSON file with device metadata
    - Present iOS share sheet and Files save option
    - _Requirements: 7.4_
  - [ ] 27.2 Create import flow
    - Import button in settings
    - iOS Files picker for JSON selection
    - Show source device info from export
    - Merge/replace mode selection dialog
    - Progress indicator and result summary with re-link count
    - _Requirements: 7.2, 7.5, 7.11_

- [ ] 28. Checkpoint - Export/import complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: Multi-Device Sync (Optional)

- [ ]* 29. Implement multi-device sync service
  - [ ]* 29.1 Create SyncService
    - Implement automatic data sync on app open
    - Handle sync conflicts (server wins strategy)
    - Implement background sync when app becomes active
    - Queue mutations when offline for later sync
    - _Requirements: 8.1, 8.2, 8.5_
  - [ ]* 29.2 Write property test for cross-device consistency
    - **Property 28: Cross-device data consistency**
    - **Validates: Requirements 8.1, 8.3**
  - [ ]* 29.3 Write property test for offline cache behavior
    - **Property 29: Offline cache preserves data**
    - **Validates: Requirements 8.4**
  - [ ]* 29.4 Handle video asset availability across devices
    - Check each asset ID availability via expo-media-library
    - Detect when videos don't exist on current device
    - Set video_available=false for unavailable assets
    - Show re-link prompts for unavailable videos
    - _Requirements: 8.6_

- [ ]* 30. Build sync status UI
  - [ ]* 30.1 Create sync status indicators
    - Online/offline status indicator
    - Sync progress indicator
    - Last sync timestamp display
    - _Requirements: 8.4, 8.5_
  - [ ]* 30.2 Create video re-link flow
    - Detect videos unavailable on current device
    - Show re-link prompt with expo-media-library picker
    - Update recap with new asset ID via API
    - _Requirements: 8.6_

- [ ]* 31. Checkpoint - Multi-device sync complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 10: Integration and Polish

- [ ] 32. Wire up navigation and app shell
  - [ ] 32.1 Implement main navigation structure
    - Auth flow (Clerk sign-in screen → main app)
    - Drawer navigation with dance style switcher
    - Tab navigation (Library, Recaps by Style, Tags, Settings)
    - _Requirements: 1.1, 2.4_
  - [ ] 32.2 Implement Clerk auth callback handling
    - ClerkProvider handles OAuth redirect automatically
    - Navigate to appropriate screen after auth
    - Sync user to backend on first sign-in
    - _Requirements: 1.2_

- [ ] 33. Integration testing
  - [ ]* 33.1 Write integration tests for full user flows
    - Auth → create style → create recap → add tags → add notes
    - Export from device A → import on device B → verify re-link prompts
    - Multi-device sync → verify data consistency across devices (optional)
    - Video re-linking → verify asset ID updates via API
    - _Requirements: All_

- [ ] 34. Final Checkpoint - All tests passing
  - Ensure all tests pass, ask the user if questions arise.
