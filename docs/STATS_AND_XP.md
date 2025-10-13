# Stats and XP (Compact-Only)

## Compact Stats Used

- phoneNumber (identifier), teamName
- goals, assists
- totalPasses, passingAccuracy (0..1)
- keyPasses
- totalShots, shotAccuracy (0..1)
- tackles, interceptions
- saves

Notes:
- All percentages from backend are decimals (0..1) and shown as 0–100% in UI.
- Legacy fields (dribbling, open-play passing, tackle breakdowns) are ignored for XP and UI.

## UI Data Binding

- Shooting: `detailedStats.shooting.totalShots`, `detailedStats.shooting.shotAccuracy`
- Passing: `detailedStats.passing.overallAccuracy`, `detailedStats.passing.totalKeyPasses`
- Defending: `detailedStats.tackling.totalTackles`, `detailedStats.tackling.interceptions`
- Goalkeeping: `detailedStats.goalkeeping.totalSave`
- Impact: `detailedStats.impact.totalGoals`, `detailedStats.impact.totalAssists`

## Spider Chart Dimensions (4)

- Shooting: accuracy (primary) + volume (secondary)
- Passing: overall passing accuracy
- Tackling (Defending): tackles + interceptions per match
- Impact: goals + assists per match

## XP Calculation (Position-Based)

All XP uses compact stats only and is normalized to 0–100.

### Attack (includes midfield)
- 50% G+A: `(goalsPerMatch + assistsPerMatch) / 2.0 × 100` (cap 100)
- 20% Shooting: `shotAccuracyPct × 0.7 + min(shotsPerMatch × 4, 20) × 0.3` (cap 100)
- 20% Playmaking: `passAccuracyPct × 0.7 + min(keyPassesPerMatch × 10, 30) × 0.3` (cap 100)
- 10% Defensive Actions: `min(tacklesPerMatch × 20, 60) + min(interceptionsPerMatch × 20, 40)` (cap 100)

### Defender
- 50% Defensive Actions: `min(tacklesPerMatch × 20, 60) + min(interceptionsPerMatch × 20, 40)` (cap 100)
- 30% Build-up: `passAccuracyPct` (cap 100)
- 20% Impact: `(goalsPerMatch + assistsPerMatch) / 2.0 × 100` (cap 100)

### Goalkeeper
- 60% Shot-stopping: `min(savesPerMatch × 25, 100)`
- 30% Distribution: `passAccuracyPct` (cap 100)
- 10% Assists: `assistsPerMatch / 1.0 × 100` (cap 100)

## Backend Endpoints

- CSV upload (compact): `POST /match-participant-stats/upload-csv/:matchId`
- Player spider/XP: `GET /match-participant-stats/player/:playerId/spider-chart`

## Migration Notes

- Old stats remain stored for history; they do not affect XP or UI.
- Frontend has removed dribbling/open-play stats from tables/configs.
