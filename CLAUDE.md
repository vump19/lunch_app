# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a location-based restaurant recommendation application with React/TypeScript frontend and Go backend. The app allows users to discover nearby restaurants, save personal favorites, track visit history, and view locations on Kakao Maps.

## Key Architecture

### Project Structure (IMPORTANT)
- **Frontend Integration**: Frontend is NOT a Git submodule - it's integrated directly into the main repository
- **Repository Structure**: Single repository containing both frontend and backend code
- **Deployment Compatibility**: This structure ensures compatibility with Render.com and other deployment platforms
- **Version Control**: All frontend changes are tracked in the main repository's Git history

### Frontend Architecture (React + TypeScript)
- **Main App Structure**: Tab-based navigation with 4 main sections (Recommend, Map, My Restaurants, Visit History)
- **State Management**: React Query for server state, local useState for UI state
- **Component Structure**: Main tabs are separate components, shared UI components in `/components`
- **External APIs**: Kakao Maps API for location services and map display
- **Styling**: Tailwind CSS with custom design system
- **Location**: `/frontend` directory in main repository (NOT a submodule)

### Backend Architecture (Go + Gin + GORM)
- **Database**: SQLite with auto-migration (no manual DB setup required)
- **Models**: Restaurant and Visit entities with soft deletes
- **API Structure**: RESTful endpoints under `/api` prefix
- **Key Business Logic**: Visit records are preserved even when restaurants are deleted (shows as "deleted restaurant")
- **Location**: `/backend` directory in main repository

### Data Flow
- Frontend uses React Query to fetch/cache API data
- Restaurant deletion sets foreign key to NULL in visit records (preserves history)
- Map integration allows direct restaurant registration from search results

## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm start           # Start development server (http://localhost:3000)
npm run build       # Build for production
npm test            # Run tests
```

### Backend Development
```bash
cd backend
go mod download     # Install dependencies
go run cmd/api/main.go  # Start server (http://localhost:8080)
go build -o main cmd/api/main.go  # Build binary
```

### Full Stack Development
```bash
# From project root - runs frontend build script
npm run build       # Installs frontend deps and builds
```

## Environment Configuration

### Frontend (.env)
```
REACT_APP_KAKAO_MAP_APP_KEY=your_kakao_map_api_key
REACT_APP_API_BASE_URL=http://localhost:8080  # Optional, defaults to proxy
```

### Backend (.env)
```
# Note: Currently uses SQLite, MySQL env vars are legacy
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=lunch_app
```

## Important Implementation Details

### Database Schema
- **Restaurant**: Standard CRUD with soft deletes
- **Visit**: References Restaurant with `ON DELETE SET NULL` - critical for preserving visit history when restaurants are deleted
- **Auto-migration**: Database schema is automatically created/updated on startup

### API Endpoints
- `GET /api/restaurants/` - List all restaurants
- `POST /api/restaurants/` - Create restaurant
- `DELETE /api/restaurants/{id}` - Soft delete restaurant
- `GET /api/visits/` - List visit history (includes deleted restaurant handling)
- `POST /api/visits/` - Record restaurant visit
- `DELETE /api/visits/{id}` - Delete visit record

### Frontend Patterns
- **Tab Navigation**: Uses Headless UI Tab component with controlled state
- **Map Integration**: KakaoMap component handles place search and restaurant registration
- **Data Fetching**: React Query with invalidation after mutations
- **Error Handling**: Component-level error boundaries and user feedback

### Code Quality Standards (from project-policy.md)
- Remove unused useState variables immediately
- Include all external variables in useEffect dependency arrays
- Keep components under 300 lines (split if larger)
- Use explicit TypeScript types for all props and state
- Handle API errors with try-catch and user-friendly messages
- Clean up event listeners and timers in useEffect cleanup

## Testing and Quality

### Frontend
- Uses React Testing Library setup
- No specific test commands beyond `npm test`

### Backend  
- No specific test framework configured
- Manual testing via API endpoints

## Common Development Patterns

### Adding New API Endpoints
1. Add route in `internal/routes/routes.go`
2. Create handler in `internal/handlers/`
3. Update models if needed in `internal/models/`
4. Frontend: Add API call in `src/api.ts`
5. Frontend: Use React Query for data fetching

### Adding New Frontend Features
1. Create component in `src/components/`
2. Add to tab navigation if main feature
3. Integrate with React Query for data management
4. Follow Tailwind CSS patterns for styling
5. Ensure TypeScript types are properly defined

### Map Integration
- Kakao Maps API requires valid API key in environment
- Place search results can be directly converted to restaurant records
- Map component handles geolocation and place search functionality

## Database Notes
- SQLite database (`lunch_app.db`) is created automatically in backend directory
- Test data is inserted on first run if database is empty
- No manual database setup required for development
- GORM handles all migrations automatically

## CRITICAL DEVELOPMENT POLICIES

### ⚠️ Frontend Repository Structure (NEVER CHANGE)
**IMPORTANT**: The frontend directory is integrated directly into the main repository and must NEVER be converted to a Git submodule.

#### Why No Submodules:
1. **Deployment Issues**: Render.com and many deployment platforms don't properly handle Git submodules
2. **Build Failures**: Submodules cause empty directory issues during deployment builds
3. **Complexity**: Submodules add unnecessary complexity for a monorepo structure
4. **Version Control**: Direct integration provides better change tracking and history

#### Current Structure (MAINTAIN THIS):
```
lunch_app/
├── frontend/           # React app - directly tracked in main repo
├── backend/           # Go app - directly tracked in main repo
├── package.json       # Root build configuration
├── render-build.sh    # Deployment script
└── README.md         # Documentation
```

#### If Frontend Changes Are Needed:
1. Work directly in `/frontend` directory
2. Commit changes to main repository
3. NEVER run `git submodule add` or similar commands
4. NEVER create separate `.git` directory in frontend

#### Historical Context:
- Previously frontend was a submodule, causing deployment failures
- Converted to direct integration on 2024-06-20
- This resolved all Render.com deployment issues
- All future development must maintain this structure