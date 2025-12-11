# Requirements Document

## Introduction

Dance Partner is a mobile application designed to help dancers organize, annotate, and practice from their dance class recap videos. The application enables users to take notes and organize content by dance style. The MVP targets a 3-week development timeline, focusing on core video organization and tagging functionality.

### MVP Scope Decisions

- **Platform Priority:** iOS-first for MVP; web functionality maintained for development purposes without initial web deployment
- **Video Storage:** Reference via `expo-media-library` asset IDs; no video copying
- **Authentication:** Google sign-in via Clerk for MVP (`@clerk/clerk-expo` for mobile, FastAPI validates Clerk JWTs)
- **Online Strategy:** Online-first architecture with heavy local caching for performance; requires network connectivity for data operations
- **Database Topology:** FastAPI backend with PostgreSQL/SQLite as primary data store; mobile app uses local cache with API synchronization
- **Schema Management:** Python models (SQLAlchemy/SQLModel) in existing FastAPI backend are source of truth; mobile receives data via REST API
- **Backend Role:** Extend existing FastAPI backend (`app/backend/`) to serve all data (user recaps, notes, tags, dance styles) via REST API with Clerk JWT validation
- **Development vs Production:** FastAPI uses PostgreSQL (existing setup); mobile communicates exclusively through FastAPI REST endpoints
- **Multi-Device Support:** Store device ID with exports to enable cross-device library import
- **User Sharing:** Single-user only for MVP; sharing features deferred
- **Voice Notes:** Deferred post-MVP
- **Text Recaps:** Deferred post-MVP (video recaps only)
- **Note Formatting:** Deferred post-MVP (plain text only)

## Glossary

- **Dance Partner**: The mobile application system being specified in this document
- **Recap**: A video captured from a dance class, containing title, description, and optional annotations (text recaps deferred post-MVP)
- **Dance Style**: A dance style classification (e.g., Zouk, WCS, Bachata, Salsa) that serves as the top-level organizational unit for recaps
- **Tag**: A user-defined or global label with title, slug, and description that can be applied to recaps
- **Video Library**: The collection of all recap videos linked from the device's existing video storage
- **Global Tag**: A tag available to all users, fetched from the backend API and cached locally
- **User Tag**: A tag created by and visible only to the creating user
- **Asset ID**: A stable reference to a video in the iOS Photos library via `expo-media-library` that survives app restarts
- **Re-link Prompt**: A user interface element that allows users to reconnect a recap to a moved or deleted video file
- **Local Cache**: A client-side data cache that stores frequently accessed data from the API to improve performance and reduce network requests
- **Device ID**: A unique identifier for each device, used to track the source of exported library data for multi-device scenarios

## Requirements

### Requirement 1: User Authentication

**User Story:** As a dancer, I want to securely sign into the app, so that my recap library and notes are protected and accessible only to me.

#### Acceptance Criteria

1. WHEN a user opens Dance Partner for the first time THEN Dance Partner SHALL display Google sign-in authentication via Clerk
2. WHEN a user successfully authenticates via Clerk THEN Dance Partner SHALL create a new user account or retrieve the existing user account and navigate to the main application screen
3. WHEN a user's authentication session expires THEN Dance Partner SHALL display a re-authentication prompt before allowing access to protected features
4. WHEN a user initiates sign-out THEN Dance Partner SHALL clear local session data and navigate to the authentication screen

### Requirement 2: Dance Style Management

**User Story:** As a dancer, I want to organize my recaps by dance style, so that I can easily find material for the style I'm currently practicing.

#### Acceptance Criteria

1. WHEN a user with zero dance styles opens the main screen THEN Dance Partner SHALL display a dance style selection prompt with options to choose from a global list or create a custom style
2. WHEN a user selects a dance style from the global list THEN Dance Partner SHALL add that dance style to the user's collection
3. WHEN a user creates a custom dance style THEN Dance Partner SHALL store the dance style with a user-provided name and optional description
4. WHEN a user opens the side menu THEN Dance Partner SHALL display all dance styles in the user's collection with the ability to switch between them
5. WHEN a user selects a dance style from the side menu THEN Dance Partner SHALL filter the recap list to display only recaps belonging to that dance style
6. WHEN a user edits a dance style THEN Dance Partner SHALL update the dance style name and description
7. WHEN a user initiates dance style deletion THEN Dance Partner SHALL display a confirmation dialog with options to reassign associated recaps to another dance style or delete the recaps
8. WHEN a user opens the app with multiple dance styles THEN Dance Partner SHALL display the last viewed dance style by default

### Requirement 3: Recap Creation and Management

**User Story:** As a dancer, I want to add recaps from my dance classes, so that I can build a searchable library of my learning material.

#### Acceptance Criteria

1. WHEN a user creates a video recap on iOS THEN Dance Partner SHALL store the `expo-media-library` asset ID reference to the selected video without copying the video data
2. *(Post-MVP)* WHEN a user creates a text recap THEN Dance Partner SHALL store the recap with title, description, and text content
3. WHEN a user views a recap THEN Dance Partner SHALL display the recap title, description, content, and all associated tags
4. WHEN a user edits a recap THEN Dance Partner SHALL update the recap title, description, and dance style assignment
5. WHEN a user deletes a recap THEN Dance Partner SHALL remove the recap metadata from the database while preserving the original video file on the device
6. WHEN a user attempts to play a video and the referenced asset is unavailable THEN Dance Partner SHALL display a re-link prompt allowing the user to select a new video from the library
7. WHEN a user creates a video recap THEN Dance Partner SHALL generate and cache a thumbnail image locally from the video

### Requirement 4: Tag System

**User Story:** As a dancer, I want to tag my recaps with moves and fundamentals, so that I can quickly find all content related to a specific technique.

#### Acceptance Criteria

1. WHEN a user creates a tag THEN Dance Partner SHALL store the tag with a title, auto-generated slug, and optional description
2. WHEN a user applies a tag to a recap THEN Dance Partner SHALL create an association between the tag and that recap
3. WHEN a user views the tag list THEN Dance Partner SHALL display user-created tags and global tags (fetched from backend API and cached) in separate sections
4. WHEN a user searches recaps by tag THEN Dance Partner SHALL return all recaps that have that tag associated
5. WHEN a user deletes a user-created tag THEN Dance Partner SHALL remove the tag and remove all associations between that tag and recaps

### Requirement 5: Notes on Recaps

**User Story:** As a dancer, I want to add notes to my recaps, so that I can capture insights and reminders about the material.

#### Acceptance Criteria

1. WHEN a user adds a note to a recap THEN Dance Partner SHALL store the note content as plain text associated with that recap
2. *(Post-MVP)* WHEN a user formats note text THEN Dance Partner SHALL apply bold, italic, or list formatting to the selected text
3. WHEN a user views a recap THEN Dance Partner SHALL display all notes associated with that recap in creation order
4. WHEN a user edits a note THEN Dance Partner SHALL update the note content while preserving the note's association with the recap
5. WHEN a user deletes a note THEN Dance Partner SHALL remove the note from the recap

### Requirement 6: Video Library View

**User Story:** As a dancer, I want to browse all my recap videos in one place, so that I can get an overview of my entire collection.

#### Acceptance Criteria

1. WHEN a user opens the video library THEN Dance Partner SHALL display all video recaps as a grid with cached thumbnail images
2. WHEN a user views the video library without filters THEN Dance Partner SHALL display all video recaps across all dance styles
3. WHEN a user filters the library by dance style THEN Dance Partner SHALL display only video recaps belonging to the selected dance style
4. WHEN a user filters the library by tag THEN Dance Partner SHALL display only video recaps that have the selected tag associated
5. WHEN a user enters text in the library search field THEN Dance Partner SHALL display video recaps where the title, description, associated note content, or tag names contain the search text

### Requirement 7: Data Export and Import

**User Story:** As a dancer, I want to export and import my library data, so that I can transfer my organization across devices or create backups.

#### Acceptance Criteria

1. WHEN a user initiates library export THEN Dance Partner SHALL generate a JSON file containing all recaps, tags, notes, and dance styles with their relationships, including the source device ID
2. WHEN a user initiates library import THEN Dance Partner SHALL display options to merge with existing data or replace existing data
3. WHEN an import encounters recaps referencing unavailable video files THEN Dance Partner SHALL create the recap metadata and flag those recaps for re-linking
4. WHEN export completes THEN Dance Partner SHALL present the iOS share sheet and the option to save directly to the Files app
5. WHEN a user initiates import THEN Dance Partner SHALL display the iOS Files app picker to select the JSON or ZIP file
6. WHEN Dance Partner serializes library data to JSON THEN Dance Partner SHALL produce valid JSON that deserializes back to equivalent objects
7. WHEN Dance Partner deserializes library JSON THEN Dance Partner SHALL reconstruct all metadata relationships including recap-to-tag, recap-to-note, and recap-to-dance-style associations
8. WHEN a user initiates full export with videos THEN Dance Partner SHALL generate a ZIP archive containing the JSON metadata file and all referenced video files
9. WHEN a user imports a ZIP archive THEN Dance Partner SHALL extract video files to the app's document directory and update recap asset references to point to the extracted files
10. WHEN exporting videos THEN Dance Partner SHALL display progress indication and allow cancellation for large exports
11. WHEN a user views available imports THEN Dance Partner SHALL display a list of exports from the user's other devices (identified by device ID and device name)

### Requirement 8: Multi-Device Synchronization (Optional)

**User Story:** As a dancer, I want my library data to be automatically synchronized across all my devices, so that I can access my recaps and notes from any device without manual export/import.

#### Acceptance Criteria

1. WHEN a user signs in on a new device THEN Dance Partner SHALL automatically sync all user data from the backend
2. WHEN a user creates or modifies data on one device THEN Dance Partner SHALL sync the changes to the backend immediately when online
3. WHEN a user opens the app on another device THEN Dance Partner SHALL display the most recent data from the backend
4. WHEN a user's device is offline THEN Dance Partner SHALL display cached data and show an offline indicator
5. WHEN a user's device comes back online THEN Dance Partner SHALL automatically sync any pending changes to the backend
6. WHEN a recap references a video file that doesn't exist on the current device THEN Dance Partner SHALL flag the recap as requiring re-linking and show a re-link prompt

## Testing Strategy

The following testing approaches SHALL be implemented during development:

### Unit Testing
- Authentication flow happy path
- Dance style CRUD operations
- Recap CRUD operations
- Tag association logic
- Note CRUD operations (plain text)
- API request/response validation
- JSON serialization/deserialization round-trip

### Integration Testing
- Clerk authentication integration
- FastAPI REST endpoint integration
- expo-media-library asset ID persistence
- Thumbnail generation and caching
- Export/import data integrity with device ID tracking
- React Query cache management and background refresh
- Multi-device data synchronization (optional)
