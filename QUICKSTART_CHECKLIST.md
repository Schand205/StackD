# StackD - Quick Start Checklist

## 🚀 SUPABASE SETUP (30 MINUTEN)

### Phase 1: Supabase Konto (5 Min)
- [ ] Gehe zu https://supabase.com/
- [ ] Klick "Start your project"
- [ ] Registriere dich mit Email
- [ ] Email verifizieren
- [ ] Neues Projekt erstellen:
  - Name: `stackd-fitness`
  - Database Password: **sicheres Passwort notieren!**
  - Region: `Europe (Switzerland)` oder nah bei dir
- [ ] Warte auf Projekt-Erstellung (~2 Minuten)

### Phase 2: Keys Notieren (2 Min)
Im Supabase Dashboard oben Links → Project Settings → API
Kopiere folgende **zwei Werte**:

```
SUPABASE_URL: https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
```

**WICHTIG**: Speichere diese auf einem sicheren Ort (Notiz/TextEdit)

### Phase 3: Datenbank Schema erstellen (10 Min)
1. Gehe zu "SQL Editor" (linkes Menu in Supabase)
2. Klick "+ New query"
3. Gib folgende SQL ein (KOMPLETTE Datei):

```sql
-- ============================================================
-- STACKD DATENBANK SCHEMA
-- ============================================================

-- TABLE: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- TABLE: exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT now()
);

-- TABLE: templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  split_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- TABLE: template_exercises
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- TABLE: week_plans
CREATE TABLE week_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, active)
);

-- TABLE: week_plan_days
CREATE TABLE week_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_plan_id UUID NOT NULL REFERENCES week_plans(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  UNIQUE(week_plan_id, day)
);

-- TABLE: day_logs
CREATE TABLE day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  template_id UUID NOT NULL REFERENCES templates(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date)
);

-- TABLE: set_logs
CREATE TABLE set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_log_id UUID NOT NULL REFERENCES day_logs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  weight FLOAT,
  weight_unit TEXT DEFAULT 'kg',
  reps INTEGER NOT NULL,
  is_pr BOOLEAN DEFAULT false,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_day_logs_user_id_date ON day_logs(user_id, date);
CREATE INDEX idx_set_logs_day_log_id ON set_logs(day_log_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own data" ON users 
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can view own templates" ON templates 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own templates" ON templates 
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view own week plans" ON week_plans 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can view own day logs" ON day_logs 
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can insert own day logs" ON day_logs 
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Exercises are readable by all" ON exercises 
  FOR SELECT USING (true);
```

4. Klick **RUN** (unten rechts)
5. Du solltest sehen: `Query executed successfully` ✅

### Phase 4: Test-Übungen hinzufügen (5 Min)
1. Im SQL Editor, neue Query klick "+ New query"
2. Copy-paste:

```sql
-- Test-Daten für Exercises
INSERT INTO exercises (name, muscle_group, default_sets, default_reps) VALUES
  ('Bench Press', 'Chest', 4, 8),
  ('Incline Dumbbell Press', 'Chest', 3, 10),
  ('Cable Flyes', 'Chest', 3, 12),
  ('Barbell Rows', 'Back', 4, 6),
  ('Pull-ups', 'Back', 3, 8),
  ('Lat Pulldown', 'Back', 3, 10),
  ('Squats', 'Legs', 4, 6),
  ('Leg Press', 'Legs', 3, 8),
  ('Leg Curls', 'Legs', 3, 12),
  ('Shoulder Press', 'Shoulders', 3, 8),
  ('Lateral Raises', 'Shoulders', 3, 12),
  ('Barbell Curls', 'Arms', 3, 8),
  ('Tricep Dips', 'Arms', 3, 10),
  ('Deadlifts', 'Back', 3, 5);
```

3. Klick **RUN**

---

## 💻 FRONTEND SETUP (20 MINUTEN)

### Step 1: `.env.local` erstellen
1. Öffne Projekt-Root im VS Code
2. Erstelle neue Datei: `.env.local`
3. Füge ein:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
```

(Ersetze mit deinen Werten von Phase 2!)

4. **SPEICHERN** (Cmd+S)

### Step 2: Dependencies installieren
```bash
cd /Users/maxihildebrand/Git/StackD
npm install @supabase/supabase-js
```

### Step 3: Supabase Service erstellen
Erstelle neue Datei `services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### Step 4: Auth Service erstellen
Erstelle neue Datei `services/auth.ts`:

```typescript
import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user: data.user, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
```

### Step 5: Gym Service erstellen
Erstelle neue Datei `services/gym.ts`:

```typescript
import { supabase } from './supabase'
import type { Exercise, Template } from '@/types/gym'
import type { ApiResult } from '@/types/api'

export async function getExercises(): Promise<ApiResult<Exercise[]>> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
    
    if (error) throw error
    
    const exercises: Exercise[] = (data || []).map(e => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscle_group,
      defaultSets: e.default_sets,
      defaultReps: e.default_reps,
    }))
    
    return { data: exercises, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getUserTemplates(): Promise<ApiResult<Template[]>> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw userError
    if (!userData.user?.id) throw new Error('Not authenticated')
    
    // Get user ID from users table
    const { data: userRecord, error: userRecordError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userData.user.id)
      .single()
    
    if (userRecordError) throw userRecordError
    if (!userRecord) throw new Error('User record not found')

    const { data, error } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        split_type,
        template_exercises (
          order_num,
          exercises (*)
        )
      `)
      .eq('user_id', userRecord.id)
    
    if (error) throw error
    
    const templates: Template[] = (data || []).map(t => ({
      id: t.id,
      name: t.name,
      splitType: t.split_type as any,
      exercises: t.template_exercises
        .sort((a, b) => a.order_num - b.order_num)
        .map(te => ({
          id: te.exercises.id,
          name: te.exercises.name,
          muscleGroup: te.exercises.muscle_group,
          defaultSets: te.exercises.default_sets,
          defaultReps: te.exercises.default_reps,
        }))
    }))
    
    return { data: templates, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
```

---

## ✅ VALIDATION (5 MINUTEN)

### Test 1: Environment Variables
Im Terminal:
```bash
cd /Users/maxihildebrand/Git/StackD
echo $EXPO_PUBLIC_SUPABASE_URL
```

Wenn leer: `.env.local` nicht gefunden!

### Test 2: Supabase Connection
Erstelle `test-supabase.ts`:

```typescript
import { supabase } from './services/supabase'

async function test() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Connection failed:', error)
  } else {
    console.log('✅ Connected to Supabase!')
    console.log('Exercises:', data)
  }
}

test()
```

### Test 3: Exercises laden
In der Gym-Component test:
```typescript
import { getExercises } from '@/services/gym'

const { data, error } = await getExercises()
console.log(data) // Sollte deine 14 Übungen zeigen!
```

---

## 🎯 NÄCHSTE PHASEN

### Phase 1 (DIESE WOCHE): ✅ Das oben!

### Phase 2 (NÄCHSTE WOCHE): 
- [ ] Auth Screen implementieren (SignUp/SignIn)
- [ ] getUserTemplates() in DayAssignSheet integrieren
- [ ] saveDayLog() implementieren

### Phase 3 (WOCHE 3):
- [ ] Feed-Aktivitäten von Supabase laden
- [ ] Statistiken berechnen

### Phase 4 (WOCHE 4):
- [ ] Error Handling verbessern
- [ ] Loading States
- [ ] Offline Support (optional)

---

## 🚨 TROUBLESHOOTING

### Problem: "Cannot find module '@supabase/supabase-js'"
**Lösung**: `npm install @supabase/supabase-js` nochmal ausführen, dann App neu starten

### Problem: "Invalid API key"
**Lösung**: Überprüfe `.env.local`:
- Richtige Values aus Supabase?
- `EXPO_PUBLIC_` prefix vorhanden?
- Kein Leerzeichen um `=`?

### Problem: "Projects timed out"
**Lösung**: Supabase Server ist manchmal slow. Warte 30s und versuche nochmal.

### Problem: RLS Policy Error
**Lösung**: Dies bedeutet, dass dein User nicht in der `users` Tabelle existiert. 
Nach Signup muss ein Record in `users` erstellt werden! (Wird in Phase 2 implementiert)

---

## 📞 FRAGEN?

Wenn was nicht funktioniert:
1. Überprüfe `.env.local` ist vorhanden + richtig
2. Überprüfe Package.json - ist `@supabase/supabase-js` dort?
3. Überprüfe Supabase Dashboard - Tables existieren?
4. Schreib error message

---

Viel Erfolg! 🚀
