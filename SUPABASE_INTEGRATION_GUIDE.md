# StackD - Supabase Integrationsleitfaden

## 📋 Inhaltsübersicht
1. [Projektübersicht](#projektübersicht)
2. [Aktuelle Frontend-Schnittstellen](#aktuelle-frontend-schnittstellen)
3. [Supabase-Grundlagen](#supabase-grundlagen)
4. [Schritt-für-Schritt Anleitung](#schritt-für-schritt-anleitung)
5. [Datenbankschema](#datenbankschema)
6. [Implementierung](#implementierung)

---

## 📊 Projektübersicht

### Dein Projekt
**StackD** ist eine Fitness-Tracking App mit 3 Hauptscreens:
- **Feed**: Zeigt Aktivitäten, Freunde, Fortschritt
- **Gym** (Hauptscreen): Workout-Logging mit Templates
- **Explore**: Konfiguration

### Aktuelle Situation
✅ **Frontend**: Vollständig mit Mock-Daten  
❌ **Backend**: Nicht vorhanden  
❌ **Authentifizierung**: Nicht vorhanden  
⚠️ **Schnittstelle**: Bereits vorbereitet in `services/api.ts`

---

## 🔌 Aktuelle Frontend-Schnittstellen

Dein Frontend erwartet folgende Datenstrukturen:

### 1. **Exercise** (Trainingsübung)
```typescript
// Wo definiert: types/gym.ts
{
  id: string              // Eindeutige ID
  name: string            // z.B. "Bench Press"
  muscleGroup: string     // z.B. "Chest"
  defaultSets: number     // z.B. 4
  defaultReps: number     // z.B. 8-12
}
```
**Verwendet in**: Gym-Screen beim Trainings-Logging

### 2. **Template** (Trainingsplan-Schablone)
```typescript
// z.B. "Push Day", "Pull Day"
{
  id: string              // z.B. "push-day-1"
  name: string            // z.B. "Push Day"
  splitType: string       // "PPL" | "UpperLower" | etc.
  exercises: Exercise[]   // Array von Übungen
}
```
**Verwendet in**: DayAssignSheet, SetEntrySheet (zum Auswählen des Workouts)

### 3. **WeekPlan** (Wochenplan)
```typescript
// Ordnet jedem Wochentag ein Template zu
{
  "Mo": "push-day-1",    // Montag: Push-Training
  "Di": "pull-day-1",    // Dienstag: Pull-Training
  "Mi": null,            // Mittwoch: Ruhetag
  ...
}
```
**Verwendet in**: Gym-Screen zur Anzeige des heutigen Trainingsplans

### 4. **SetLog** (Einzelne Trainingsset-Eintrag)
```typescript
{
  exerciseId: string      // Welche Übung
  weight: number | "BW"   // kg oder "BW" für Körpergewicht
  reps: number            // z.B. 10
  isPR: boolean           // Persönlicher Rekord?
}
```
**Verwendet in**: SetEntrySheet (beim Trainings-Logging)

### 5. **DayLog** (Tägliches Trainingsprotokoll)
```typescript
{
  date: string            // ISO-Format: "2026-04-14"
  templateId: string      // Welches Template wurde trainiert
  sets: SetLog[]          // Array der trainierten Sets
}
```
**Verwendet in**: Feed-Screen (zeigt letzte Aktivitäten)

---

## 🚀 Supabase-Grundlagen

### Was ist Supabase?
Supabase ist eine **Backend-as-a-Service (BaaS)** Plattform, die folgendes bietet:
- **PostgreSQL Datenbank** (kostenlos)
- **Authentifizierung** (Email/Password, OAuth)
- **Real-time Updates**
- **API-Zugriff** (via REST oder JavaScript SDK)
- **Storage** für Dateien

### Was brauchst du?
1. **Supabase Account** (supabase.com, kostenlos)
2. **Neues Projekt** erstellen
3. **Datenbank Schema** entwerfen
4. **API-Schlüssel** in deine App eintragen
5. **Supabase JS SDK** installieren

---

## 🛠️ Schritt-für-Schritt Anleitung

### **SCHRITT 1: Supabase-Konto und Projekt erstellen**

1. Gehe zu https://supabase.com/auth/sign-up
2. Registriere dich mit Email
3. Klick "New Project"
4. **Wichtige Einstellungen**:
   - **Project Name**: z.B. "stackd-fitness"
   - **Password**: Sicheres Passwort für Datenbankadmin
   - **Region**: Wähle Region nah bei dir (z.B. "Europe - Switzerland")
5. Warte auf Projekt-Erstellung (~2 Min)

**Nach Erstellung notieren:**
- **Project URL**: z.B. `https://xxxx.supabase.co`
- **Anon Key**: Public key (für Frontend)
- **Service Role Key**: Secret key (nur für Backend/Admin)

### **SCHRITT 2: Umgebungsvariablen einrichten**

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```bash
# .env.local (NICHT in Git committen!)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxxx
```

**Wichtig**: Bei Expo müssen Variablen mit `EXPO_PUBLIC_` prefixed sein!

### **SCHRITT 3: Datenbankschema erstellen**

Gehe in Supabase Dashboard:
1. **SQL Editor** öffnen (linkes Menu)
2. Klick → "New Query"
3. Kopiere den SQL-Code aus [Datenbankschema Section](#datenbankschema) unten
4. Klick **RUN**

Dies erstellt folgende Tabellen automatisch:
- `users` (Benutzer-Profile)
- `exercises` (Trainingsübungen-Bibliothek)
- `templates` (Trainingsplan-Schablonen)
- `templates_exercises` (Welche Übungen in welchem Template)
- `week_plans` (Benutzer-Wochenpläne)
- `day_logs` (Trainings-Protokolle)

### **SCHRITT 4: Supabase SDK installieren**

```bash
npm install @supabase/supabase-js
```

### **SCHRITT 5: API-Service updaten**

Ersetze `services/api.ts` mit Supabase-Integration:
```typescript
// services/api.ts
import { createClient } from '@supabase/supabase-js'
import type { ApiResult } from '@/types/api'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Beispiel: Alle Exercises laden
export async function getExercises(): Promise<ApiResult<Exercise[]>> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { data: null, error: message }
  }
}
```

---

## 💾 Datenbankschema

Kopiere diesen SQL-Code in Supabase SQL Editor:

```sql
-- 1. BENUTZER PROFIL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. TRAININGSÜBUNGEN BIBLIOTHEK
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. TRAININGSPLAN SCHABLONEN
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  split_type TEXT NOT NULL, -- 'PPL', 'UpperLower', 'BroSplit', etc.
  created_at TIMESTAMP DEFAULT now()
);

-- 4. VERKNÜPFUNG: WELCHE ÜBUNGEN IN WELCHEM TEMPLATE
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. WOCHENPLAN (WELCHES TEMPLATE AN WELCHEM TAG)
CREATE TABLE week_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, active) -- Nur 1 aktiver Plan pro User
);

-- 6. WEEK_PLAN TAGE ZUORDNUNG
CREATE TABLE week_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_plan_id UUID NOT NULL REFERENCES week_plans(id) ON DELETE CASCADE,
  day TEXT NOT NULL, -- 'Mo', 'Di', 'Mi', etc.
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL, -- null = Ruhetag
  UNIQUE(week_plan_id, day)
);

-- 7. TÄGLICHE TRAININGS-PROTOKOLLE
CREATE TABLE day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  template_id UUID NOT NULL REFERENCES templates(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date) -- Ein Log pro Tag pro User
);

-- 8. SETS IN EINEM DAY_LOG
CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_log_id UUID NOT NULL REFERENCES day_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  weight FLOAT, -- kg oder null wenn BW
  weight_unit TEXT DEFAULT 'kg', -- 'kg' oder 'BW'
  reps INTEGER NOT NULL,
  is_pr BOOLEAN DEFAULT false,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- INDEXES für schnellere Abfragen
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_day_logs_user_id_date ON day_logs(user_id, date);
CREATE INDEX idx_set_logs_day_log_id ON set_logs(day_log_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Benutzer dürfen nur ihre eigenen Daten sehen
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can view own templates" ON templates 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view own week plans" ON week_plans 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view own day logs" ON day_logs 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Exercises are readable by all" ON exercises 
  FOR SELECT USING (true);
```

---

## 🔧 Implementierung

### **Phase 1: Authentifizierung** (Priorität: HOCH)

Erstelle `services/auth.ts`:
```typescript
import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { data: null, error: error.message }
  return { data: data?.user, error: null }
}
```

### **Phase 2: Exercises laden** (Priorität: HOCH)

Erstelle `services/gym.ts`:
```typescript
import { supabase } from './supabase'
import type { Exercise, Template, WeekPlan } from '@/types/gym'
import type { ApiResult } from '@/types/api'

// Alle Übungen laden
export async function getExercises(): Promise<ApiResult<Exercise[]>> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
  
  if (error) return { data: null, error: error.message }
  
  // Map Supabase columns to Frontend type
  const exercises: Exercise[] = (data || []).map(e => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscle_group,
    defaultSets: e.default_sets,
    defaultReps: e.default_reps,
  }))
  
  return { data: exercises, error: null }
}

// Benutzer-Templates laden
export async function getUserTemplates(): Promise<ApiResult<Template[]>> {
  const user = await supabase.auth.getUser()
  if (!user.data?.user?.id) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('templates')
    .select(`
      id,
      name,
      split_type,
      template_exercises (
        order,
        exercises (*)
      )
    `)
    .eq('user_id', user.data.user.id)
  
  if (error) return { data: null, error: error.message }
  
  // Map to frontend type
  const templates: Template[] = (data || []).map(t => ({
    id: t.id,
    name: t.name,
    splitType: t.split_type as any,
    exercises: t.template_exercises.map(te => ({
      id: te.exercises.id,
      name: te.exercises.name,
      muscleGroup: te.exercises.muscle_group,
      defaultSets: te.exercises.default_sets,
      defaultReps: te.exercises.default_reps,
    }))
  }))
  
  return { data: templates, error: null }
}
```

### **Phase 3: Trainingslog speichern** (Priorität: MITTEL)

```typescript
// Tägliches Training speichern
export async function saveDayLog(
  date: string,
  templateId: string,
  sets: SetLog[]
): Promise<ApiResult<string>> {
  const user = await supabase.auth.getUser()
  if (!user.data?.user?.id) {
    return { data: null, error: 'Not authenticated' }
  }

  // 1. Day Log erstellen
  const { data: dayLog, error: dayLogError } = await supabase
    .from('day_logs')
    .insert({
      user_id: user.data.user.id,
      date,
      template_id: templateId,
    })
    .select()
    .single()

  if (dayLogError) return { data: null, error: dayLogError.message }

  // 2. Set Logs eintragen
  const setLogData = sets.map(s => ({
    day_log_id: dayLog.id,
    exercise_id: s.exerciseId,
    weight: typeof s.weight === 'number' ? s.weight : null,
    weight_unit: typeof s.weight === 'number' ? 'kg' : 'BW',
    reps: s.reps,
    is_pr: s.isPR,
  }))

  const { error: setLogError } = await supabase
    .from('set_logs')
    .insert(setLogData)

  if (setLogError) return { data: null, error: setLogError.message }

  return { data: dayLog.id, error: null }
}
```

---

## 📍 SCHNITTSTELLEN IM FRONTEND

### Wo werden API-Daten verwendet?

| Komponente | Datei | Schnittstelle | Benötigte API |
|-----------|-------|--------------|---------------|
| **SetEntrySheet** | `components/gym/SetEntrySheet.tsx` | Speichert Trainings-Sets | `saveDayLog()`, getSetHistory() |
| **DayAssignSheet** | `components/gym/DayAssignSheet.tsx` | Wählt Template für Tag | `getUserTemplates()` |
| **SplitSelectSheet** | `components/gym/SplitSelectSheet.tsx` | Erstellt neues Template | `createTemplate()` |
| **ActivityCard** | `components/feed/ActivityCard.tsx` | Zeigt letzte Trainings | `getRecentDayLogs()` |
| **ProgressCard** | `components/feed/ProgressCard.tsx` | Zeigt Fortschritt | `getUserStats()` |
| **Gym Screen** | `app/(tabs)/gym.tsx` | Hauptscreen | `getTodayWorkout()`, `getDayLog()` |
| **Feed Screen** | `app/(tabs)/index.tsx` | Feed-Übersicht | `getRecentActivities()` |

---

## ✅ ROLLOUT-PLAN

### **Woche 1: Foundation**
- [ ] Supabase-Konto erstellen
- [ ] Datenbankschema einrichten
- [ ] Umgebungsvariablen konfigurieren
- [ ] Supabase SDK installieren
- [ ] Auth-Service implementieren

### **Woche 2: Gym-Funktionalität**
- [ ] Exercises laden
- [ ] Templates laden/erstellen
- [ ] DayLog speichern
- [ ] SetEntrySheet integrieren

### **Woche 3: Feed & Statistiken**
- [ ] Letzte Trainings laden
- [ ] Statistiken berechnen
- [ ] ActivityCard mit echten Daten
- [ ] ProgressCard mit echten Daten

### **Woche 4: Optimierung**
- [ ] Error Handling
- [ ] Loading States
- [ ] Offline Support (Optional)
- [ ] Performance-Optimierung

---

## 🚨 HÄUFIGE FEHLER

1. **`EXPO_PUBLIC_` prefix vergessen** → Variablen werden nicht geladen
2. **RLS zu restriktiv** → Keine Datenzugriff, auch für den Benutzer selbst
3. **Falsche URL/Key** → 404 oder 401 Fehler
4. **Keine Migrations durchgeführt** → Tabellen existieren nicht

---

## ❓ HILFREICHE RESSOURCEN

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS SDK**: https://supabase.com/docs/reference/javascript/introduction
- **Expo Env Variables**: https://docs.expo.dev/build-reference/variables/
- **PostgreSQL Basics**: https://www.postgresql.org/docs/

---

## 🎯 Nächste Schritte

1. **Lesen** du dies vollständig durch (15 Min)
2. **Erstelle** ein Supabase Konto (5 Min)
3. **Kopiere** das SQL-Schema in Supabase (5 Min)
4. **Notiere** deine Project URL und Anon Key
5. **Erstelle** `.env.local` mit den Variablen (2 Min)
6. **Installiere** Supabase SDK (3 Min)
7. **Starten** mit Phase 1: Authentifizierung

**Geschätzte Zeit bis erste funktionale Integration: 2-3 Stunden**

---

Hast du Fragen zu einem bestimmten Teil? 🚀
