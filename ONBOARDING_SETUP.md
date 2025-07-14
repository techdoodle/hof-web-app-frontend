# Onboarding Setup Guide

## New Onboarding Steps

The onboarding flow has been updated to include two new steps after profile setup:

1. **Position Selection** - User selects their playing position (Midfielder, Striker, Defender, Goalkeeper, Casual)
2. **Team Selection** - User selects their favorite football team

## Implementation Details

### Backend Changes

1. **User Entity** - Added `preferredTeam` field to store the user's selected team ID
2. **Football Teams Module** - New module to handle football team data
   - Entity: `FootballTeam`
   - Service: `FootballTeamsService`
   - Controller: `FootballTeamsController`
   - API endpoints:
     - `GET /football-teams/top?limit=9` - Get top teams
     - `GET /football-teams/search?q=query` - Search teams by name

### Frontend Changes

1. **New Components**:
   - `PositionSelectionScreen` - Position selection UI
   - `TeamSelectionScreen` - Team selection UI with search functionality

2. **Updated Types**:
   - Added `POSITION_SELECTION` and `TEAM_SELECTION` to onboarding steps
   - Added `PositionSelection` and `TeamSelection` types
   - Added `FootballTeam` type

3. **API Routes**:
   - `/api/football-teams/top` - Proxy to backend
   - `/api/football-teams/search` - Proxy to backend

## Setup Instructions

### Backend Setup

1. **Database Migration**: The football_teams table should already exist. If not, run:
   ```bash
   cd hof-web-app-backend
   # Run the migration script if needed
   ```

2. **Start Backend Server**:
   ```bash
   cd hof-web-app-backend
   npm run start:dev
   ```

3. **Populate Football Teams Data** (if table is empty):
   ```bash
   cd hof-web-app-backend/src/scripts
   node fetchTeamsfromTopLeagues-enhanced.js
   ```

### Frontend Setup

1. **Environment Variables**: Ensure `BACKEND_URL` is set correctly in your environment:
   ```bash
   BACKEND_URL=http://localhost:3001
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

## Fallback Behavior

If the backend is not running or the API fails, the team selection screen will use mock data with popular teams (Arsenal, Chelsea, Manchester United, Liverpool, etc.) so users can still complete the onboarding flow.

## Testing

1. Complete the onboarding flow up to profile setup
2. You should see the position selection screen
3. Select a position and continue
4. You should see the team selection screen with either:
   - Real team data (if backend is running)
   - Mock team data (if backend is not available)
5. Select a team and complete the flow

## API Endpoints

### GET /football-teams/top?limit=9
Returns top 9 football teams for the grid display.

### GET /football-teams/search?q=query
Returns teams matching the search query for the text list display.

Both endpoints return an array of `FootballTeam` objects with the following structure:
```typescript
{
  id: number;
  apiTeamId: number;
  teamName: string;
  teamCode: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  logoUrl: string | null;
  leagueId: number | null;
  leagueName: string | null;
  leagueCountry: string | null;
  season: number | null;
  createdAt: string;
  updatedAt: string;
}
``` 