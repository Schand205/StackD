# StackD - Komponenten & API Schnittstellen

## 🗺️ Component Tree mit API Calls

```
app/
├── (tabs)/_layout.tsx ──────────────────────────────────────────────┐
│   │                                                                 │
│   ├── index.tsx ◄─────────────────────────────────────────────┐    │
│   │   FEED SCREEN                                              │    │
│   │   Zeigt Aktivitäten, Freunde, Statistiken                │    │
│   │   ┌─────────────────────────────────────┐                │    │
│   │   │ State: mockData (aktuell hardcoded)  │                │    │
│   │   └─────────────────────────────────────┘                │    │
│   │         ↓ SPÄTER: API Calls ↓                            │    │
│   │   ┌─────────────────────────────────────┐                │    │
│   │   │ API: getRecentActivities()          │                │    │
│   │   │ API: getUserStats()                 │                │    │
│   │   │ API: getFriendsStatus()             │                │    │
│   │   └─────────────────────────────────────┘                │    │
│   │         ↓                                                │    │
│   │   ┌──────────────────────────────────────────────────┐   │    │
│   │   │ components/feed/                                  │   │    │
│   │   ├─ ActivityCard.tsx                              │   │    │
│   │   │  • Zeigt einzelnes Trainings-Event              │   │    │
│   │   │  • Daten: DayLog                                │   │    │
│   │   │  • Später: API getRecentDayLogs()              │   │    │
│   │   │                                                 │   │    │
│   │   ├─ ProgressCard.tsx                              │   │    │
│   │   │  • Zeigt Gesamtfortschritt                      │   │    │
│   │   │  • Daten: Stats (PRs, Volume, etc.)            │   │    │
│   │   │  • Später: API getUserStats()                  │   │    │
│   │   │                                                 │   │    │
│   │   └─ FriendChip.tsx                                │   │    │
│   │      • Zeigt Freund mit Status-Ring                │   │    │
│   │      • Daten: friends[]                            │   │    │
│   │      • Später: API getFriendsWorkout()             │   │    │
│   │   └──────────────────────────────────────────────────┘   │    │
│   │                                                            │    │
│   │                                                            │    │
│   ├── gym.tsx ◄─────────────────────────────────────────────┤    │
│   │   GYM SCREEN (HAUPTSCREEN)                              │    │
│   │   Zeigt Trainingsplan & Logging-Interface              │    │
│   │                                                            │    │
│   │   ┌─────────────────────────────────────┐                │    │
│   │   │ State:                              │                │    │
│   │   │ • todayTemplate                    │                │    │
│   │   │ • todayLog                         │                │    │
│   │   │ • currentExercise                  │                │    │
│   │   └─────────────────────────────────────┘                │    │
│   │         ↓ JETZT: Mock Data              │                │    │
│   │   ┌─────────────────────────────────────┐                │    │
│   │   │ getTodayTemplate() von weekPlan     │                │    │
│   │   │ getTodayLog() von dayLogs           │                │    │
│   │   └─────────────────────────────────────┘                │    │
│   │         ↓ SPÄTER: API Calls ↓          │                │    │
│   │   ┌─────────────────────────────────────┐                │    │
│   │   │ API: getTodayWorkout()              │                │    │
│   │   │ API: getDayLog(today)               │                │    │
│   │   └─────────────────────────────────────┘                │    │
│   │         ↓                                │                │    │
│   │   ┌──────────────────────────────────────────────────┐   │    │
│   │   │ components/gym/                                  │   │    │
│   │   ├─ SetEntrySheet.tsx                            │   │    │
│   │   │  ┌────────────────────────────────────┐        │   │    │
│   │   │  │ User trägt hier jeden Set ein:    │        │   │    │
│   │   │  │ • Weight (kg oder BW)             │        │   │    │
│   │   │  │ • Reps                            │        │   │    │
│   │   │  │ • isPR?                           │        │   │    │
│   │   │  │                                    │        │   │    │
│   │   │  │ Button: "SAVE"                    │        │   │    │
│   │   │  └────────────────────────────────────┘        │   │    │
│   │   │  SPÄTER: API saveDayLog(sets[])                │   │    │
│   │   │                                                 │   │    │
│   │   ├─ DayAssignSheet.tsx                           │   │    │
│   │   │  ┌────────────────────────────────────┐        │   │    │
│   │   │  │ User wählt Template für heute:    │        │   │    │
│   │   │  │ • "Push Day"                      │        │   │    │
│   │   │  │ • "Pull Day"                      │        │   │    │
│   │   │  │ • "Rest Day"                      │        │   │    │
│   │   │  │                                    │        │   │    │
│   │   │  │ Button: "ASSIGN"                  │        │   │    │
│   │   │  └────────────────────────────────────┘        │   │    │
│   │   │  JETZT: Mock Templates                        │   │    │
│   │   │  SPÄTER: API getUserTemplates()               │   │    │
│   │   │                                                 │   │    │
│   │   └─ SplitSelectSheet.tsx                         │   │    │
│   │      ┌────────────────────────────────────┐        │   │    │
│   │      │ User erstellt neuen Trainingsplan:│        │   │    │
│   │      │ • Wählt Split Type (PPL, etc.)   │        │   │    │
│   │      │ • Wählt Exercises                 │        │   │    │
│   │      │                                    │        │   │    │
│   │      │ Button: "CREATE"                  │        │   │    │
│   │      └────────────────────────────────────┘        │   │    │
│   │      SPÄTER: API createTemplate(exercises)        │   │    │
│   │                                                     │   │    │
│   │   └──────────────────────────────────────────────────┘   │    │
│   │                                                            │    │
│   │                                                            │    │
│   └── explore.tsx ◄────────────────────────────────────────┤    │
│       EXPLORE SCREEN                                      │    │
│       Zeigt Konfiguration                                │    │
│       • API_BASE_URL: https://api.example.com           │    │
│       • Später: User Profile, Einstellungen             │    │
│       KEINE kritischen API Calls                        │    │
│                                                            │    │
└───────────────────────────────────────────────────────────┘
```

---

## 📍 API CALL ORTE - WORAUF ZU ACHTEN IST

### **GYM SCREEN** (`app/(tabs)/gym.tsx`)
**Status**: 🟢 Mock Data (bereit für Backend)

```typescript
// AKTUELL - Mock Data
const todayTemplate = mockTemplates[0]        // ← ERSETZEN
const todayLog = mockDayLogs[0]               // ← ERSETZEN

// SPÄTER - Supabase API
import { getTodayWorkout, getDayLog } from '@/services/gym'

const todayTemplate = await getTodayWorkout() // Tag vom week_plan
const todayLog = await getDayLog(today)       // Log für heute
```

**Zu ändernde Komponenten:**
1. DayAssignSheet.tsx - `getUserTemplates()`
2. SetEntrySheet.tsx - `saveDayLog()`
3. SplitSelectSheet.tsx - `createTemplate()`

---

### **FEED SCREEN** (`app/(tabs)/index.tsx`)
**Status**: 🟢 Mock Data (bereit für Backend)

```typescript
// AKTUELL - Mock Data
const activities = mockActivities          // ← ERSETZEN
const stats = mockStats                    // ← ERSETZEN
const friends = mockFriends                // ← ERSETZEN

// SPÄTER - Supabase API
import { getRecentActivities, getUserStats, getFriendsStatus } from '@/services/feed'

const activities = await getRecentActivities()
const stats = await getUserStats()
const friends = await getFriendsStatus()
```

**Zu ändernde Komponenten:**
1. ActivityCard.tsx - zeigt Trainings-Events (DayLog)
2. ProgressCard.tsx - zeigt Statistiken
3. FriendChip.tsx - zeigt Freund-Status

---

### **EXPLORE SCREEN** (`app/(tabs)/explore.tsx`)
**Status**: 🟡 Config nur (später für User Settings)

```typescript
// AKTUELL
const API_BASE_URL = "https://api.example.com"

// SPÄTER - wird durch echte Supabase URL ersetzt
import { supabase } from '@/services/supabase'
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
```

---

## 🔌 ALLE GEPLANTEN API FUNCTIONS

### **Authentication** (`services/auth.ts`)
```
✅ signUp(email, password)
✅ signIn(email, password)
✅ signOut()
✅ getCurrentUser()
```

### **Gym** (`services/gym.ts`)
```
✅ getExercises()              → Alle Übungen
✅ getUserTemplates()          → Templates eines Users
⏳ getTodayWorkout()           → Heute zugewiesenes Template
⏳ saveDayLog(date, template, sets)  → Training speichern
⏳ getDayLog(date)             → Spezifisches Trainingslog
⏳ createTemplate(name, exercises)   → Neues Template
⏳ getLastSet(exerciseId)      → Besten letzten Set (für Reference)
```

### **Feed** (`services/feed.ts` - NOCH NICHT ERSTELLT)
```
⏳ getRecentActivities()       → Letzte Trainings-Events
⏳ getUserStats()              → PRs, Volume, Consistency
⏳ getFriendsStatus()          → Was Freunde trainieren
⏳ getAchievements()           → Badges/Trophäen
```

### **Social** (`services/social.ts` - LATER PHASE)
```
⏳ addFriend(userId)
⏳ removeFriend(userId)
⏳ getFriendsList()
⏳ shareDayLog(dayLogId, friendId)
```

---

## 🎯 INTEGRATIONSSCHRITTE FÜR JEDE KOMPONENTE

### 1️⃣ **DayAssignSheet.tsx** - Wähle Template

**Was es macht**: User clickt Button, öffnet Sheet mit Liste von Templates

**Aktueller Code**:
```typescript
// Wahrscheinlich so:
const templates = mockTemplates
```

**Zu ändern**:
```typescript
import { getUserTemplates } from '@/services/gym'

useEffect(() => {
  fillTemplates()
}, [])

async function fillTemplates() {
  const { data, error } = await getUserTemplates()
  if (error) {
    showAlert("Error loading templates: " + error)
  } else {
    setTemplates(data || [])
  }
}
```

---

### 2️⃣ **SetEntrySheet.tsx** - Trainings-Logging

**Was es macht**: User trägt Weight/Reps/PRs ein, clickt Save

**Aktueller Code**:
```typescript
// Wahrscheinlich so:
setMockDayLogs([...mockDayLogs, newLog])
```

**Zu ändern**:
```typescript
import { saveDayLog } from '@/services/gym'

async function handleSave() {
  const { data, error } = await saveDayLog(
    today,
    templateId,
    setLogs
  )
  
  if (error) {
    showAlert("Failed to save: " + error)
  } else {
    showAlert("✅ Training saved!")
    closeSheet()
  }
}
```

---

### 3️⃣ **ActivityCard.tsx** - Zeige Trainings-Events

**Was es macht**: Zeige einzelne Trainings-Card mit Info

**Aktueller Code**:
```typescript
// Bekommt wahrscheinlich mock data
function ActivityCard({ activity }) {
  return (
    <View>
      <Text>{ activity.type }</Text>
      <Text>{ activity.details }</Text>
    </View>
  )
}
```

**Zu ändern**: GLEICH! Component braucht nur die Datenstruktur zu ändern.

Aktuell erwartet: `{ type: "Workout", details: "..." }`

Später erwartet: `DayLog` Structure
```typescript
{
  id: "uuid",
  date: "2026-04-16",
  templateId: "xxx",
  sets: SetLog[]
}
```

---

### 4️⃣ **ProgressCard.tsx** - Zeige Statistiken

**Was es macht**: Zeige PRs, Volume, Consistency

**Aktueller Code**:
```typescript
// Wahrscheinlich:
const stats = mockStats
```

**Zu ändern**:
```typescript
import { getUserStats } from '@/services/feed'

useEffect(() => {
  loadStats()
}, [])

async function loadStats() {
  const { data, error } = await getUserStats()
  if (!error) setStats(data)
}
```

**Backend muss berechnen**:
```typescript
{
  totalPRs: 15,
  totalVolume: 45000,  // kg
  weekConsistency: 0.85,  // 85% Tage trainiert
  bestEx: "Bench Press - 120kg",
  streak: 12  // Tage
}
```

---

## 🗂️ ORDNUNG: Wo wirft man was hin?

```
services/
├── supabase.ts          ← Basis-Client (ERSTELLT)
├── auth.ts              ← Auth-API (ERSTELLT)
├── api.ts               ← Generic fetch (ALT, nicht mehr nötig)
├── gym.ts               ← Gym-API (ERSTELLT)
└── feed.ts              ← Feed-API (TODO)

types/
├── api.ts               ← ApiResult<T> Typ ✅
└── gym.ts               ← Exercise, Template, etc. ✅

components/
├── feed/
│   ├── ActivityCard.tsx ← Nutzt DayLog
│   ├── ProgressCard.tsx ← Nutzt Stats
│   └── FriendChip.tsx   ← Nutzt Friend
├── gym/
│   ├── DayAssignSheet.tsx ← API: getUserTemplates()
│   ├── SetEntrySheet.tsx  ← API: saveDayLog()
│   └── SplitSelectSheet.tsx ← API: createTemplate()
└── ...
```

---

## 📌 QUICK REFERENCE: Was API gibt es schon?

### ✅ ALREADY PROVIDED
- `types/api.ts` - `ApiResult<T>` Type
- `types/gym.ts` - Alle Data Types (Exercise, Template, etc.)
- `services/supabase.ts` - Basis Supabase Client
- `services/auth.ts` - Authentifizierung
- `services/gym.ts` - Basis Gym Functions

### ⏳ TODO
- `services/feed.ts` - Feed Statistiken
- Mock Data → API Calls in Components
- Loading States + Error UI
- Real-time Updates (optional)

---

## 🚀 AUSFÜHRUNGSREIHENFOLGE

1. **Phase 1 - Foundation** ✅ (Das was oben in QUICKSTART_CHECKLIST.md)
   - Supabase Setup
   - Environment Variables
   - Basis Services

2. **Phase 2 - Gym Integration** (2-3 Stunden)
   - `getUserTemplates()` in DayAssignSheet
   - `saveDayLog()` in SetEntrySheet
   - Loading/Error States

3. **Phase 3 - Feed Integration** (2-3 Stunden)
   - `services/feed.ts` erstellen
   - API Calls in ActivityCard + ProgressCard
   - Stats berechnung

4. **Phase 4 - Polishing** (1-2 Stunden)
   - Real-time Updates
   - Better Error Handling
   - Performance Optimierung

---

Fragen zu einer bestimmten Komponente? 🎯
