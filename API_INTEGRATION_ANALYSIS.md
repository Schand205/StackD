# StackD API Integration Analysis

## Executive Summary
StackD is a React Native fitness tracking application (Expo) currently **using mock data exclusively**. The API infrastructure is scaffolded but not actively integrated. All data flows are currently client-side state management or hardcoded mock data.

---

## 1. API Service Architecture

### Current Implementation: `services/api.ts`
```typescript
// Generic fetch-based API client
async function getJson<T>(path: string): Promise<ApiResult<T>>
```

**Characteristics:**
- Uses native `fetch` API (no axios/external HTTP library)
- Generic type parameter for flexible response typing
- Error handling wrapper returning `ApiResult<T>` type
- Base URL: `https://api.example.com` (placeholder in `constants/app.ts`)

**Error Handling Pattern:**
- Returns `{ data: null, error: string }` on failure
- Discriminated union type: `ApiSuccess<T> | ApiFailure`

### API Result Types: `types/api.ts`
```typescript
export type ApiSuccess<T> = { data: T; error: null }
export type ApiFailure = { data: null; error: string }
export type ApiResult<T> = ApiSuccess<T> | ApiFailure
```

**Usage Pattern:**
```typescript
const result = await getJson<Exercise[]>('/exercises')
if (result.error) {
  // Handle error
} else {
  // Use result.data
}
```

---

## 2. Data Models & Type Definitions

### Gym-Related Types: `types/gym.ts`

#### Exercise
```typescript
type Exercise = {
  id: string                    // Unique identifier
  name: string                  // Exercise name (German)
  muscleGroup: string           // Target muscle group (e.g., 'Brust', 'Rücken')
  defaultSets: number           // Recommended sets
  defaultReps: number           // Recommended reps
}
```

#### Template (Workout Template)
```typescript
type Template = {
  id: string                    // e.g., 'tmpl_push'
  name: string                  // e.g., 'Push'
  splitType: WorkoutSplit       // PPL | UpperLower | BroSplit | FullBody | Arnold
  exercises: Exercise[]         // List of exercises in this template
}
```

#### WeekPlan
```typescript
type WeekPlan = Record<WeekDay, string | null>
// Maps: 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So' → templateId or null (rest day)
// Example: { Mo: 'tmpl_push', Di: 'tmpl_pull', Mi: null, ... }
```

#### DayLog
```typescript
type DayLog = {
  date: string                  // ISO date string (e.g., "2026-04-14")
  templateId: string            // Which template was used
  sets: SetLog[]                // Individual set logs
}
```

#### SetLog
```typescript
type SetLog = {
  exerciseId: string            // Reference to Exercise
  weight: number | 'BW'         // kg value or 'BW' for bodyweight
  reps: number                  // Repetitions performed
  isPR: boolean                 // Personal record flag
}
```

#### WorkoutSplit
```typescript
type WorkoutSplit = 'PPL' | 'UpperLower' | 'BroSplit' | 'FullBody' | 'Arnold'
```

---

## 3. Current API Endpoints (NOT YET IMPLEMENTED)

Based on the data types and component structure, the following endpoints would logically be needed:

### Likely Endpoint Structure
```
GET    /exercises              → Exercise[]
GET    /exercises/:id          → Exercise
GET    /templates              → Template[]
GET    /templates/:id          → Template
GET    /templates/split/:type  → Template[] (by WorkoutSplit)
GET    /week-plan              → WeekPlan (user's current plan)
POST   /week-plan              → { weekPlan: WeekPlan } (update plan)
GET    /day-logs               → DayLog[]
GET    /day-logs/:date         → DayLog (specific day)
POST   /day-logs               → { dayLog: DayLog } (create/update)
POST   /sets                   → { setLog: SetLog } (log a set)

GET    /activities             → Activity[] (feed data)
GET    /users/friends          → Friend[]
GET    /stats                  → UserStats
GET    /stats/today            → TodayStats
```

**Status:** ⚠️ Endpoints are undefined. `API_BASE_URL` still points to `https://api.example.com`

---

## 4. Components Using API Data

### Feed Screen: `app/(tabs)/index.tsx`
**Data Used:** Mock only
- `mockFriends` from `constants/mockData.ts`
- `mockActivities` from `constants/mockData.ts`
- `mockStats` from `constants/mockData.ts`

**Components:**
- `<ProgressCard>` — Displays gym, calorie, and goal stats
- `<FriendChip>` — Friend list with status badges
- `<ActivityCard>` — Social feed of recent activities
- `<QuickLogSheet>` — Quick log modal (no API integration yet)

### Gym Screen: `app/(tabs)/gym.tsx`
**Data Used:** 
- `mockWeekPlan` from `data/mockGymData.ts`
- `defaultTemplatesPerSplit` from `data/mockGymData.ts`
- Local state for current session

**Components:**
- `<SetEntrySheet>` — Log individual sets (uses local state + mock data for prefill)
- `<DayAssignSheet>` — Assign workout template to day
- `<SplitSelectSheet>` — Choose workout split (PPL, Upper/Lower, etc.)

**Data Flow:**
1. User selects a workout split
2. Templates loaded from `defaultTemplatesPerSplit`
3. Templates assigned to week using `<DayAssignSheet>`
4. On session day, exercises from template rendered
5. User enters sets via `<SetEntrySheet>`
6. No persistence (state resets on app close)

### Explore Screen: `app/(tabs)/explore.tsx`
**Data Used:** 
- `API_BASE_URL` display only (placeholder)
- `APP_VERSION` display only

---

## 5. Mock Data Structure

### Feed Data: `constants/mockData.ts`

#### Friends Array
```typescript
mockFriends: {
  id, initials, name, status, active (bool), ring (color or null)
}
```
**Sample:**
```typescript
{ id: '1', initials: 'AS', name: 'Anna', status: 'Ziel erreicht', active: true, ring: 'teal' }
```

#### Activities Array
```typescript
mockActivities: {
  id, user (initials/name/color), time, type ('gym'|'kalorien'),
  title, pr (bool), pills (string[]), likes (number)
}
```
**Sample:**
```typescript
{
  id: '1',
  user: { initials: 'MK', name: 'Max K.', color: 'purple' },
  time: 'vor 23 Min.',
  type: 'gym',
  title: 'Bankdrücken',
  pr: true,
  pills: ['82,5 kg', '5 × 5', 'Brust-Tag'],
  likes: 3
}
```

#### Stats Object
```typescript
mockStats: {
  gym: { lastDay, exercises, weekDone, weekGoal, nextDay, restDay },
  kalorien: { current, goal, protein, carbs, fat (each with current/goal) },
  zielCheck: { name, items[] (label/value/status) },
  week: [Mo-So percentages]
}
```

### Gym Data: `data/mockGymData.ts`

#### Exercises (Sample)
```typescript
const bankdruecken = {
  id: 'e_bench',
  name: 'Bankdrücken',
  muscleGroup: 'Brust',
  defaultSets: 4,
  defaultReps: 8
}
```

#### Templates (Predefined Splits)
- **PPL**: Push, Pull, Legs
- **UpperLower**: Upper, Lower
- **BroSplit**: Chest, Back, Shoulders, Arms, Legs
- **FullBody**: Full Body A, Full Body B
- **Arnold**: Chest+Back, Shoulders+Arms, Legs

#### Day Logs (Historical Data)
```typescript
logMonday: {
  date: '2026-04-13',
  templateId: 'tmpl_push',
  sets: [
    { exerciseId: 'e_bench', weight: 80, reps: 8, isPR: false },
    { exerciseId: 'e_bench', weight: 80, reps: 8, isPR: false },
    // ... more sets
  ]
}
```

#### Lookup Helpers
- `findTemplate(id)` — Find template by ID
- `findExercise(id)` — Find exercise globally
- `getPreviousBest(exerciseId)` — Highest weight ever logged
- `getLastSet(exerciseId)` → SetLog — For prefilling set entry

---

## 6. Current Authentication & Configuration

### Configuration: `constants/app.ts`
```typescript
export const APP_NAME = "StackD"
export const APP_VERSION = "0.1.0"
export const API_BASE_URL = "https://api.example.com"  // ⚠️ Placeholder
```

**Authentication Status:**
- ❌ No auth implementation
- ❌ No token management
- ❌ No login/signup screens
- ❌ No user session handling

### Recommended Auth Pattern (TODO)
```typescript
// services/auth.ts (to be created)
type AuthToken = { access: string; refresh: string }
type User = { id: string; email: string; name: string }

async function login(email, password): Promise<ApiResult<AuthToken>>
async function register(email, password): Promise<ApiResult<AuthToken>>
async function refreshToken(): Promise<ApiResult<AuthToken>>
async function logout(): Promise<ApiResult<void>>
```

---

## 7. Dependencies & HTTP Layer

### Package.json Analysis
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.5",
    "expo": "~54.0.33",
    "expo-router": "~6.0.23",
    // No axios, superagent, or other HTTP client
    // Uses native fetch API
  }
}
```

**HTTP Strategy:**
- ✅ Using native `fetch` (standard, no dependency)
- ⚠️ Small app size benefit
- ⚠️ Limited to basic JSON fetching (no request/response interceptors)

**Recommendation:** Consider upgrading to `axios` or similar if you need:
- Request/response interceptors (auth token injection)
- Request retries
- Timeout handling
- Progress tracking for uploads

---

## 8. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        StackD App                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Feed Screen                  Gym Screen          Explore       │
│  ├─ ProgressCard             ├─ SetEntrySheet     └─ Config    │
│  ├─ FriendChip               ├─ DayAssignSheet                 │
│  ├─ ActivityCard             └─ SplitSelectSheet               │
│  └─ QuickLogSheet                                              │
│         │                           │                          │
│         ▼                           ▼                          │
│  ┌─────────────────────────────────────────┐                  │
│  │     Mock Data (Local Import)            │                  │
│  │                                         │                  │
│  │  constants/mockData.ts                 │                  │
│  │  ├─ mockFriends[]                      │                  │
│  │  ├─ mockActivities[]                   │                  │
│  │  └─ mockStats                          │                  │
│  │                                         │                  │
│  │  data/mockGymData.ts                   │                  │
│  │  ├─ mockTemplates[]                    │                  │
│  │  ├─ mockWeekPlan                       │                  │
│  │  └─ mockDayLogs[]                      │                  │
│  └─────────────────────────────────────────┘                  │
│                                                                   │
│  ┌─────────────────────────────────────────┐      UNUSED       │
│  │   services/api.ts (Generic Client)      │      (Prepared)   │
│  │                                         │                  │
│  │  export async getJson<T>()              │                  │
│  │    → ApiResult<T>                       │                  │
│  └─────────────────────────────────────────┘                  │
│                │                                               │
│                ▼                                               │
│       https://api.example.com  ⚠️ Not implemented             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Summary Table

| Aspect | Status | Details |
|--------|--------|---------|
| **API Service** | ✅ Prepared | `services/api.ts` with generic `getJson<T>()` |
| **Type Definitions** | ✅ Complete | Gym types, API result types defined |
| **HTTP Library** | ⚠️ Basic | Native `fetch`, no interceptors |
| **Authentication** | ❌ None | No auth implementation |
| **Backend Integration** | ❌ None | No real API calls made |
| **Mock Data** | ✅ Comprehensive | Feed, gym, stats data available |
| **Components Ready** | ✅ Yes | UI built, connected to local state |
| **Environment Config** | ⚠️ Placeholder | `API_BASE_URL = "https://api.example.com"` |
| **Error Handling** | ✅ Defined | Discriminated union types for errors |
| **Data Persistence** | ❌ None | All data lost on app close |

---

## 10. Next Steps for Backend Integration

1. **Update API_BASE_URL** in `constants/app.ts` to actual backend
2. **Implement auth** (login, token refresh, logout)
3. **Replace mock data calls** with `getJson()` API calls
4. **Add loading & error states** to components
5. **Implement data caching** (optional but recommended)
6. **Add request interceptors** for auth token injection
7. **Implement offline support** (optional)

---

## File References
- [services/api.ts](services/api.ts)
- [types/api.ts](types/api.ts)
- [types/gym.ts](types/gym.ts)
- [constants/app.ts](constants/app.ts)
- [constants/mockData.ts](constants/mockData.ts)
- [data/mockGymData.ts](data/mockGymData.ts)
- [app/(tabs)/index.tsx](app/%28tabs%29/index.tsx) — Feed Screen
- [app/(tabs)/gym.tsx](app/%28tabs%29/gym.tsx) — Gym Screen
