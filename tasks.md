# Dance Partner - Task Breakdown

This document breaks down the plan.md into specific, actionable tasks organized by feature area.

## Database & Models

### Core Models Setup
- [ ] Create Recap model with fields: id, title, date, dance_style_id, series_id, pinned, last_viewed_at, last_playback_position, video_url, start_time, end_time, note_body
- [ ] Create Marker model with fields: id, recap_id, timestamp, tag_id, label
- [ ] Create Series model with fields: id, name, description, studio_id
- [ ] Create SeriesInstructor junction table with fields: series_id, instructor_id
- [ ] Create Instructor model with fields: id, name, owner_id
- [ ] Create Tag model with fields: id, name, is_global, owner_id, applies_to_all_styles
- [ ] Create TagDanceStyle junction table with fields: tag_id, dance_style_id
- [ ] Create DanceStyle model for seed data
- [ ] Create Studio model with basic fields

### Database Migration
- [ ] Generate Alembic migration for all core models
- [ ] Apply migration to create tables

### Seed Data
- [ ] Create seed script for Dance Styles: Zouk, West Coast Swing, Bachata, Salsa, Kizomba, Tango, Hip Hop, Contemporary
- [ ] Create seed script for global tags (all styles): Musicality, Timing, Connection, Frame, Flow
- [ ] Create seed script for style-specific global tags:
  - [ ] Zouk: Elasticity, Head Movement
  - [ ] WCS: Anchor Step, Slot Awareness
  - [ ] Bachata: Body Roll, Hip Motion

## Backend API

### Recap Endpoints
- [ ] GET /recaps - List recaps with filtering and sorting
- [ ] POST /recaps - Create new recap
- [ ] GET /recaps/{id} - Get single recap
- [ ] PUT /recaps/{id} - Update recap
- [ ] DELETE /recaps/{id} - Delete recap
- [ ] PUT /recaps/{id}/pin - Pin/unpin recap
- [ ] PUT /recaps/{id}/playback-position - Update playback position

### Series Endpoints
- [ ] GET /series - List series
- [ ] POST /series - Create new series
- [ ] GET /series/{id} - Get single series
- [ ] PUT /series/{id} - Update series
- [ ] DELETE /series/{id} - Delete series

### Instructor Endpoints
- [ ] GET /instructors - List instructors with fuzzy search
- [ ] POST /instructors - Create new instructor
- [ ] GET /instructors/search?q={query} - Fuzzy search instructors

### Tag Endpoints
- [ ] GET /tags - List tags (filtered by dance style if provided)
- [ ] POST /tags - Create new user tag
- [ ] GET /tags/for-style/{dance_style_id} - Get valid tags for dance style

### Marker Endpoints
- [ ] GET /recaps/{recap_id}/markers - List markers for recap
- [ ] POST /recaps/{recap_id}/markers - Create marker
- [ ] PUT /markers/{id} - Update marker
- [ ] DELETE /markers/{id} - Delete marker

### Reference Data Endpoints
- [ ] GET /dance-styles - List all dance styles
- [ ] GET /studios - List studios

## Frontend - Core Navigation & Screens

### Navigation Setup
- [ ] Create RecapLibraryScreen as main screen
- [ ] Create AddRecapScreen
- [ ] Create RecapDetailScreen (for viewing/editing)
- [ ] Create VideoViewerScreen
- [ ] Add navigation between screens

### Recap Library Screen
- [ ] Create RecapLibraryScreen component
- [ ] Implement recap list with FlatList/FlashList
- [ ] Add dance style filter dropdown (default: All)
- [ ] Add series filter dropdown (optional)
- [ ] Implement sorting: pinned first, then last viewed, then recap date
- [ ] Show recap cards with: title, date, series badge, pinned state
- [ ] Add pin/unpin functionality
- [ ] Add pull-to-refresh
- [ ] Add empty state when no recaps

### Add Recap Screen
- [ ] Create AddRecapScreen form
- [ ] Add date picker (default: today)
- [ ] Add title field (default: formatted date)
- [ ] Add dance style dropdown
- [ ] Add series dropdown with "Create New" option
- [ ] Add recap type toggle (Video/Note)
- [ ] For Video type:
  - [ ] Add video URL/path input
  - [ ] Add start_time input (optional)
  - [ ] Add end_time input (optional)
- [ ] For Note type:
  - [ ] Add text body input
- [ ] Add tag selection with existing tags
- [ ] Add inline tag creation (optional)
- [ ] Implement form validation
- [ ] Handle form submission

## Frontend - Video Features

### Video Viewer Screen
- [ ] Create VideoViewerScreen component
- [ ] Implement video playback controls
- [ ] Add speed control (0.25x → 2x)
- [ ] Add fullscreen support
- [ ] Add landscape orientation support
- [ ] Implement practice range visualization (start/end highlighting)
- [ ] Auto-start playback at start_time
- [ ] Auto-stop playback at end_time
- [ ] Save playback position on pause/exit
- [ ] Resume playback from saved position
- [ ] Add scrubbing controls

### Marker Management
- [ ] Add "Add Marker" button in video viewer
- [ ] Create AddMarkerModal component
- [ ] Capture current playback time for new markers
- [ ] Add tag selection for markers
- [ ] Add label input for markers
- [ ] Validate marker has tag or label
- [ ] Display markers timeline in video viewer
- [ ] Implement tap-to-jump functionality
- [ ] Add marker list view
- [ ] Add edit/delete marker functionality (optional)

## Frontend - Series Management

### Series Creation
- [ ] Create CreateSeriesModal component
- [ ] Add series name input
- [ ] Add description input (optional)
- [ ] Add instructor search/selection with fuzzy matching
- [ ] Allow multiple instructor selection
- [ ] Add studio input (optional)
- [ ] Handle series creation

### Series Display
- [ ] Create series badge component for recap cards
- [ ] Add series filter to library screen
- [ ] Create series detail screen (optional)
- [ ] Show series info in recap detail

## Frontend - Tag System

### Tag Management
- [ ] Create tag selection component
- [ ] Filter tags by selected dance style
- [ ] Display global vs user tags differently
- [ ] Implement tag search/filter
- [ ] Add create new tag functionality
- [ ] Validate tag applies to selected dance style

## Business Logic & Rules

### Title Defaulting
- [ ] Implement title default to formatted date when empty
- [ ] Format date as YYYY-MM-DD (e.g., "2026-01-18")

### Instructor Fuzzy Matching
- [ ] Implement fuzzy search algorithm for instructor names
- [ ] Allow creation of new instructor when no match found
- [ ] No automatic merging for MVP

### Tag Validation
- [ ] Ensure recap can only use tags valid for its dance style
- [ ] Ensure markers can only use tags valid for recap's dance style
- [ ] Validate tag creation with dance style constraints

### Playback Rules
- [ ] Implement practice range behavior (start/end times)
- [ ] Allow free scrubbing always
- [ ] Start playback at start_time if set
- [ ] Stop playback at end_time if set
- [ ] Save and restore playback position

## Data Integration

### API Client Generation
- [ ] Generate OpenAPI client from backend schema
- [ ] Set up TanStack Query hooks for all endpoints
- [ ] Implement error handling for API calls
- [ ] Add loading states for all operations

### State Management
- [ ] Set up Zustand stores for:
  - [ ] Current recap being viewed
  - [ ] Video playback state
  - [ ] Filter/sort preferences
- [ ] Use TanStack Query for server state
- [ ] Use MMKV for persistent storage of user preferences

## Testing & Quality

### Backend Tests
- [ ] Write tests for recap CRUD operations
- [ ] Write tests for series management
- [ ] Write tests for tag filtering logic
- [ ] Write tests for instructor fuzzy matching
- [ ] Write tests for marker operations

### Frontend Tests
- [ ] Write tests for RecapLibraryScreen
- [ ] Write tests for AddRecapScreen form validation
- [ ] Write tests for video playback controls
- [ ] Write tests for marker functionality
- [ ] Write tests for tag selection logic

## Polish & UX

### UI Components
- [ ] Create consistent card components for recaps
- [ ] Design and implement series badges
- [ ] Create loading states for all screens
- [ ] Add error states and retry mechanisms
- [ ] Implement proper form validation feedback

### Performance
- [ ] Optimize recap list rendering with proper keys
- [ ] Implement lazy loading for large recap lists
- [ ] Optimize video loading and playback
- [ ] Add proper image/video caching

### Accessibility
- [ ] Add proper accessibility labels
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Add proper focus management

## Definition of Done Checklist

For each task, ensure:
- [ ] Feature is implemented end-to-end
- [ ] No hidden TODOs are added to codebase
- [ ] Basic error handling is in place
- [ ] Feature works on both platforms (iOS/Android)
- [ ] Code follows project style guidelines
- [ ] Related tests are written and passing