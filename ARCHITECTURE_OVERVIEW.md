# StackD - Architektur & Datenfl

## 🏗️ Gesamtarchitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACKD FIREBASE APP                           │
│              (Expo React Native - iOS/Android)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │   Feed Screen    │  │   Gym Screen     │  │ Explore      │   │
│  │ (index.tsx)      │  │ (gym.tsx)        │  │              │   │
│  │                  │  │                  │  │              │   │
│  │ • Recent Activity│  │ • Today Workout  │  │ • API Config │   │
│  │ • Friends       │  │ • Logging UI     │  │              │   │
│  │ • Stats         │  │ • Templates      │  │              │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
│                              ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          FRONTEND LAYER                                    │   │
│  │  • services/auth.ts (Authentifizierung)                  │   │
│  │  • services/gym.ts (Trainings-API)                       │   │
│  │  • services/feed.ts (Feed-API)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   @supabase/supabase-js (SDK)                             │   │
│  │   • REST API Aufrufe                                      │   │
│  │   • Authentifizierung                                    │   │
│  │   • Real-time Updates                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓ HTTPS/TCP                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
         ┌────────────────────────────────────────┐
         │     SUPABASE (Backend-Dienst)          │
         ├────────────────────────────────────────┤
         │                                        │
         │  ┌──────────────────────────────────┐ │
         │  │  PostgreSQL Datenbank             │ │
         │  │  /SUPABASE_INTEGRATION_GUIDE.md  │ │
         │  │ - users                          │ │
         │  │ - exercises                      │ │
         │  │ - templates                      │ │
         │  │ - day_logs                       │ │
         │  │ - set_logs                       │ │
         │  │ + mehr...                        │ │
         │  └──────────────────────────────────┘ │
         │                                        │
         │  ┌──────────────────────────────────┐ │
         │  │  Auth (Email/Password)           │ │
         │  │  JWT Tokens                      │ │
         │  │  Sessions                        │ │
         │  └──────────────────────────────────┘ │
         │                                        │
         └────────────────────────────────────────┘
```

---

## 📊 Datenbankschema (Relationen)

```
┌─────────────────┐
│     users       │  ← Authentifizierte Benutzer
├─────────────────┤
│ id (UUID)       │
│ auth_id         │───→ Supabase Auth
│ username        │
│ email           │
│ created_at      │
└────────┬────────┘
         │
         ├─────────────────────────┬──────────────────────┬─────────┐
         │                         │                      │         │
         ↓                         ↓                      ↓         ↓
  ┌──────────────┐     ┌────────────────┐    ┌──────────────┐  ┌──────────────┐
  │  templates   │     │   week_plans   │    │   day_logs   │  │ favorite...  │
  ├──────────────┤     ├────────────────┤    ├──────────────┤  └──────────────┘
  │ id (FK)      │←────→│ id             │    │ id           │
  │ user_id      │     │ user_id        │    │ user_id      │
  │ name         │     │ active         │    │ date         │
  │ split_type   │     │ created_at     │    │ template_id  │
  │ created_at   │     └────────┬────────┘    │ created_at   │
  └──────┬───────┘              │             └──────┬───────┘
         │                      │                    │
         └──────────────┬───────┘                    │
                        │                            │
              ┌─────────▼──────────┐      ┌──────────▼───────┐
              │  week_plan_days    │      │   set_logs       │
              ├────────────────────┤      ├──────────────────┤
              │ id                 │      │ id               │
              │ week_plan_id       │      │ day_log_id       │
              │ day (Mo-So)        │      │ exercise_id      │
              │ template_id (FK)   │→→→→→→│ weight           │
              └────────────────────┘      │ reps             │
                                          │ is_pr            │
                      ┌──────────────────→└──────────────────┘
                      │
         ┌────────────▼─────────┐
         │    exercises         │
         ├──────────────────────┤
         │ id                   │
         │ name                 │
         │ muscle_group         │
         │ default_sets         │
         │ default_reps         │
         │ created_at           │
         └──────────────────────┘
         
         ┌────────────────────────────┐
         │  template_exercises        │
         │  (Junction Table)          │
         ├────────────────────────────┤
         │ id                         │
         │ template_id (FK)           │
         │ exercise_id (FK)           │
         │ order                      │
         │ created_at                 │
         └────────────────────────────┘
```

---

## 🔄 DATENFLUSS: Trainings-Logging

```
BENUTZER INTERAKTION
        ↓
  [Gym-Screen]
  "Heute trainiere ich Push"
        ↓
  [DayAssignSheet]
  Benutzer wählt Template
        ↓
  API: getUserTemplates()
        ↓
  [SetEntrySheet]
  "Bench Press: 4 Sets à 100kg x 8 Reps"
        ↓
  SetLog[] wird zusammengestellt:
  [
    { exerciseId: "ex1", weight: 100, reps: 8, isPR: false },
    { exerciseId: "ex1", weight: 100, reps: 8, isPR: false },
    ...
  ]
        ↓
  Button "Speichern" klick
        ↓
  API: saveDayLog(
    date: "2026-04-16",
    templateId: "push-day-1",
    sets: SetLog[]
  )
        ↓
  [SUPABASE]
  1. day_logs INSERT
  2. set_logs INSERT (loop für jeden Set)
        ↓
  [Feed-Screen]
  "Gerade trainiert"
  ActivityCard zeigt:
  "Today • Push Day • 12 Sets • +3kg PR 🎉"
```

---

## 🔐 AUTHENTIFIZIERUNG FLOW

```
1. SIGNUP/LOGIN Screen
   ├─ Email: user@example.com
   └─ Password: ****
           ↓
2. API: signUp() oder signIn()
           ↓
3. SUPABASE AUTH verarbeitet
           ├─ Benutzer validieren/erstellen
           ├─ JWT Token generieren
           └─ Refresh Token speichern
           ↓
4. Frontend speichert JWT Token lokal
   (Supabase SDK macht automatisch)
           ↓
5. Alle zukünftigen API-Aufrufe inkludieren Token
           ↓
6. SUPABASE RLS (Row Level Security) prüft:
   "Darf dieser Benutzer diese Daten lesen?"
           ↓
7. Nur Benutzer-eigene Daten werden zurückgegeben
```

---

## 📡 API ENDPOINTS (Übersicht)

### AUTHENTIFIZIERUNG
```typescript
// services/auth.ts
signUp(email, password)         // Registrierung
signIn(email, password)         // Login
signOut()                       // Logout
getCurrentUser()                // Aktuelle Session
```

### TRAININGSPLAN VERWALTUNG
```typescript
// services/gym.ts
getExercises()                  // Alle Übungen laden
getUserTemplates()              // Templates eines Benutzers
createTemplate(name, exercises) // Neues Template
getTodayWorkout()              // Heutiges Workout
```

### TRAININGS-LOGGING
```typescript
saveDayLog(date, templateId, sets)     // Training speichern
getDayLog(date)                        // Training abrufen
getRecentDayLogs(days: number)         // Letzte X Tage
```

### STATISTIKEN/FEED
```typescript
getUserStats()                  // PRs, Gesamtvolumen, etc.
getRecentActivities()          // Für Feed-Screen
```

---

## 🛑 WICHTIGE POINTS

### 1. **RLS (Row Level Security)**
```sql
-- Benutzer können NUR ihre eigenen Daten sehen
CREATE POLICY "Users can view own data" ON templates 
  FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```
**Bedeutung**: Dein Trainingslog ist sicher vor anderen Nutzern!

### 2. **Foreign Keys**
```
day_logs.user_id → users.id
day_logs.template_id → templates.id
set_logs.exercise_id → exercises.id
```
**Bedeutung**: Datenbank garantiert Konsistenz!

### 3. **JWT Token Flow**
```
Frontend → sendet Token mit jedem Request → Supabase prüft Token → Erlaubt/Verweigert
```
**Bedeutung**: Keine Passwörter in jedem Request!

---

## 🎯 NÄCHSTER SCHRITT: ENVIRONMENT SETUP

Erstelle `.env.local` im Projekt-Root:

```bash
# Diese Werte findest du in https://app.supabase.com
# Project Settings → API

EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ WICHTIG**:
- `.env.local` gehört NICHT in Git (bereits in `.gitignore`)
- Mit `EXPO_PUBLIC_` prefix funktioniert es in Expo
- Keys sind für **Frontend** public (daher "_ANON_")

---

## 🔗 FLOW-BEISPIEL: Kompletter Trainingstag

```
Monday 9am
├─ User öffnet Gym-Screen
│  └─ getTodayWorkout() → "Push Day" (aus week_plan)
│
├─ User sieht SetEntrySheet
│  └─ getLastSet("Bench Press") → 100kg x 8
│
├─ User trainiert:
│  ├─ Set 1: 100kg x 8
│  ├─ Set 2: 100kg x 8
│  ├─ Set 3: 110kg x 6 ⭐ (isPR: true)
│  └─ Set 4: 100kg x 8
│
├─ User klick "Save"
│  └─ saveDayLog() → Speichert in Supabase
│
└─ Feed-Screen aktualisiert
   ├─ ActivityCard zeigt: "Push Day • 110kg PR 🎉"
   └─ ProgressCard zeigt: "+280kg Gesamtvolumen heute"
```

---

Fragen? Schreib mich an! 🚀
