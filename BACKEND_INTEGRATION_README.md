# StackD Backend Integration - Dokumentations-Übersicht

> **Du startest hier!** 👇 Diese Datei ist dein Navigations-Hub.

---

## 📚 DOKUMENTATIONS-STRUKTUR

Wir haben 4 umfassende Dokumente für dich erstellt. Abhängig von dem, was du gerade brauchst:

### **1. 🚀 [QUICKSTART_CHECKLIST.md](./QUICKSTART_CHECKLIST.md)** - START HIER!
**→ Für**: Direkt anfangen, ohne viel Hintergrund  
**→ Inhalt**: Schritt-für-Schritt Anleitung (30 Minuten, fertig!)
- Supabase Setup (Konto, Keys, DB-Schema)
- Frontend Dependencies installieren
- Erste Services erstellen
- Validation testen

**👉 Mach das ZUERST, dann weiter zu den anderen Docs!**

---

### **2. 📋 [SUPABASE_INTEGRATION_GUIDE.md](./SUPABASE_INTEGRATION_GUIDE.md)** - Das grosse Gesamtbild
**→ Für**: Verstehen, WAS Supabase ist & WARUM wir es brauchen  
**→ Inhalt**: Umfassender Leitfaden
- Was ist Supabase? (5 Min Video für Brain)
- Deine aktuellen Frontend-Schnittstellen (Exercise, Template, etc.)
- Komplettes Datenbank-Schema mit SQL
- Implementierungs-Code für jede Phase
- Fehlerbehandlung & häufige Fehler

**👉 Lesen wenn du verstehen willst, was unter der Haube passiert**

---

### **3. 🏗️ [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** - Visuelles Big Picture
**→ Für**: Grafische Darstellung aller Verbindungen  
**→ Inhalt**: Diagrams & Flowcharts
- Gesamtarchitektur (Frontend ↔ Supabase)
- Datenbankschema mit Relationen
- Authentifizierungs-Flow
- Trainings-Logging Datenfluss
- End-to-End Beispiel

**👉 Guck die Bilder an wenn du sehen magst wie alles zusammenhängt**

---

### **4. 🗺️ [COMPONENT_API_MAP.md](./COMPONENT_API_MAP.md)** - Komponenten-zur-API Mapping
**→ Für**: Sehen, welche Component welche API ruft  
**→ Inhalt**: Genaue Integrationsanleitung pro Component
- Component Tree mit API Calls markiert
- Wo ist Mock Data aktuell?
- Wie wird es zu Supabase API?
- Integrationsschritte für jede Component
- Was noch TODO ist

**👉 Benutze das wenn du eine bestimmte Component integrieren willst**

---

## 🎯 DEIN 4-WOCHEN PLAN

### **WOCHE 1: Foundation** ✅ 
**Ziele**: Supabase Setup + Basic Backend Stack  
**Docs**: QUICKSTART_CHECKLIST.md → SUPABASE_INTEGRATION_GUIDE.md  
**Zeit**: 4-6 Stunden
- [ ] Supabase Konto + Projekt erstellen
- [ ] Datenbank-Schema einrichten
- [ ] Environment Variables konfigurieren
- [ ] Dependencies installieren
- [ ] Basis Services (`supabase.ts`, `auth.ts`, `gym.ts`)
- [ ] Authentifizierung testen

### **WOCHE 2: Gym Integration** 
**Ziele**: Trainings-Logging funktioniert mit Supabase  
**Docs**: COMPONENT_API_MAP.md  
**Zeit**: 4-6 Stunden
- [ ] DayAssignSheet integrieren (`getUserTemplates()`)
- [ ] SetEntrySheet integrieren (`saveDayLog()`)
- [ ] SplitSelectSheet integrieren (`createTemplate()`)
- [ ] Loading States + Error Handling
- [ ] Testing: Trainings-Logging end-to-end

### **WOCHE 3: Feed & Statistiken** 
**Ziele**: Feed-Screen zeigt echte Trainings-Daten  
**Docs**: COMPONENT_API_MAP.md  
**Zeit**: 3-4 Stunden
- [ ] `services/feed.ts` erstellen
- [ ] ActivityCard integrieren (getRecentActivities)
- [ ] ProgressCard integrieren (getUserStats)
- [ ] Testing: Feed-Screen mit echten Daten

### **WOCHE 4: Polishing** 
**Ziele**: App ist produktionsreif  
**Docs**: SUPABASE_INTEGRATION_GUIDE.md  
**Zeit**: 2-3 Stunden
- [ ] Error Handling verbessern
- [ ] Loading States UX optimieren
- [ ] Real-time Updates (optional)
- [ ] Performance tunnen
- [ ] Final Testing

---

## 💡 QUICK FACTS ÜBER DEIN PROJEKT

### Was ist StackD?
Eine **Fitness-Tracking App** für Trainings-Logging mit 3 Screens:
- **Feed**: Aktivitäten, Freunde, Statistiken
- **Gym**: Trainings-Logging (Hauptfunktion!)
- **Explore**: Konfiguration

### Aktuelle Situation
✅ **Frontend**: Vollständig mit UI  
✅ **Mock Data**: 100% da  
❌ **Backend**: Existiert nicht  
❌ **Authentifizierung**: Nicht vorhanden  

### Die 5 KEY DATA TYPES
```
1. Exercise - Einzelne Trainingsübung (Bench Press, etc.)
2. Template - Trainings-Plan mit Übungen (Push Day, Pull Day)
3. WeekPlan - Wochenplan (welches Template an welchem Tag)
4. DayLog - Tägliches Trainingslog (was ich heute trainiert habe)
5. SetLog - Einzelne Set (100kg x 8 Reps)
```

---

## 🔌 DIE 5 WICHTIGSTEN API FUNCTIONS

| Function | Was macht | Component |
|----------|-----------|-----------|
| `getUserTemplates()` | Alle deine Trainings-Pläne laden | DayAssignSheet |
| `saveDayLog(date, template, sets)` | Training speichern | SetEntrySheet |
| `getRecentActivities()` | Letzte Trainings-Events | ActivityCard |
| `getUserStats()` | PRs, Volume, Streak | ProgressCard |
| `signUp()` / `signIn()` | Authentifizierung | Login Screen |

---

## 📊 SCHNITTSTELLEN IM CODE

### Component-zu-Data Mapping

```
Gym-Screen
├── DayAssignSheet
│   └─→ API: getUserTemplates()
│       └─→ Supabase: SELECT * FROM templates WHERE user_id = ?
│           └─→ Frontend zeigt: Liste von Templates
│
├── SetEntrySheet
│   └─→ Input: weight, reps, isPR
│   └─→ API: saveDayLog(date, templateId, sets[])
│       └─→ Supabase: INSERT INTO day_logs + set_logs
│           └─→ Response: dayLog ID
│
└── SplitSelectSheet
    └─→ API: createTemplate(name, exercises[])
        └─→ Supabase: INSERT INTO templates

Feed-Screen
├── ActivityCard
│   └─→ API: getRecentActivities()
│       └─→ Supabase: SELECT * FROM day_logs ORDER BY date DESC LIMIT 10
│           └─→ Frontend zeigt: "Gerade trainiert: Push Day"
│
└── ProgressCard
    └─→ API: getUserStats()
        └─→ Supabase: Berechne PRs, Volume, Consistency
            └─→ Frontend zeigt: "+120kg deadlift PR!"
```

---

## 📁 DATEIEN DIE WIR FÜR DICH ERSTELLT HABEN

### Dokumentation
```
QUICKSTART_CHECKLIST.md            ← START HIER!
SUPABASE_INTEGRATION_GUIDE.md      ← Detaillierter Leitfaden
ARCHITECTURE_OVERVIEW.md            ← Visuelle Diagramme
COMPONENT_API_MAP.md                ← Component ↔ API Mapping
BACKEND_INTEGRATION_README.md       ← Diese Datei
```

### Frontend Code (du musst erstellen)
```
services/
├── supabase.ts      ← Basis Client (Code in QUICKSTART)
├── auth.ts          ← Authentication (Code in QUICKSTART)
└── gym.ts           ← Gym API (Code in QUICKSTART)

(.env.local)        ← Umgebungsvariablen (nicht in Git!)
```

---

## ⚠️ WICHTIGE PUNKTE

### 1. Environment Variables
```bash
# Erstelle .env.local im Root
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```
**Wichtig**: `EXPO_PUBLIC_` prefix ist ERFORDERLICH!

### 2. RLS (Row Level Security)
```sql
-- Benutzer sehen nur ihre eigenen Daten
CREATE POLICY "Users can view own data" ON templates 
  FOR SELECT USING (auth.uid() = user_id);
```
**Bedeutung**: Ohne RLS können Benutzer Daten von anderen sehen!

### 3. Mock Data ist noch vorhanden
```js
// Aktuell wird das noch benutzt:
import { mockTemplates, mockDayLogs } from '@/data/mockGymData'

// Nach Integration → echte API Calls
import { getUserTemplates, getDayLog } from '@/services/gym'
```

---

## 🚀 NÄCHSTE SCHRITTE

### JA
✅ Öffne **QUICKSTART_CHECKLIST.md**  
✅ Mach den 30-Minuten Quick Start  
✅ Komm zurück, wenn Fragen auftauchen  

### NEIN (Nicht jetzt)
❌ Alle anderen Dokumente lesen (YET!)  
❌ Backend komplext strukturen  
❌ Datenbank-Performance optimieren  

---

## 📞 FAQ - HÄUFIGE FRAGEN

**F: Brauche ich einen Backend-Server?**  
A: Nein! Supabase IS dein Backend. PostgreSQL + Auth + REST API.

**F: Wann sollte ich meine App online geben?**  
A: Nach Woche 2-3, wenn Gym-Screen mit Supabase funktioniert.

**F: Wie lade ich Test-Daten ein?**  
A: SQL INSERT Statements im Supabase SQL Editor (siehe QUICKSTART).

**F: Können User einander sehen / Freunde hinzufügen?**  
A: Später (Phase 4). Jetzt: Nur eigene Daten.

**F: Wie handle ich Offline-Modus?**  
A: Optional. Supabase hat `realtime` Support, aber nicht necessary.

**F: Sind die Keys sicher?**  
A: `ANON_KEY` ist für Frontend OK. `SERVICE_ROLE_KEY` muss secret bleiben!

---

## 📖 LESESREIHENFOLGE EMPFEHLUNGEN

### **Option A: Ich will sofort anfangen** ⚡
1. QUICKSTART_CHECKLIST.md (30 Min)
2. Supabase aufsetzen
3. Services erstellen
4. App testen

### **Option B: Ich will erst verstehen** 🧠
1. ARCHITECTURE_OVERVIEW.md (15 Min - Bilder)
2. SUPABASE_INTEGRATION_GUIDE.md (30 Min - Text)
3. Dann Option A...

### **Option C: Ich will meine Components integrieren** 🔧
1. COMPONENT_API_MAP.md (20 Min)
2. Schaue welche Component dich interessiert
3. Folge der Integration-Anleitung
4. Referenziere QUICKSTART für Code-Snippets

---

## 🎓 LEARNING RESOURCES

**Supabase**:
- Docs: https://supabase.com/docs
- JS Ref: https://supabase.com/docs/reference/javascript

**PostgreSQL**:
- Basics: https://www.postgresql.org/docs/current/
- Cheatsheet: https://www.postgresqltutorial.com/

**React Native / Expo**:
- Docs: https://docs.expo.dev/
- ENV Vars: https://docs.expo.dev/build-reference/variables/

---

## ✅ VALIDATION CHECKLIST

Nach dem Setup sollte folgendes funktionieren:

- [ ] `.env.local` existiert mit Supabase URL + Key
- [ ] `npm install @supabase/supabase-js` erfolgreich
- [ ] `services/supabase.ts` kann erstellt werden
- [ ] `services/auth.ts` compiles ohne Fehler
- [ ] `services/gym.ts` compiles ohne Fehler
- [ ] In Supabase sind 8 Tabellen vorhanden
- [ ] 14 Test-Exercises in DB
- [ ] `getExercises()` gibt Daten zurück

---

## 🎯 DAS ZIEL

### Nach Woche 1: ✅ Foundation
- ✅ Backend existiert (Supabase)
- ✅ Authentifizierung funktioniert
- ✅ Datenbank ist eingerichtet
- ✅ Frontend kann gegen echte API sprechen

### Nach Woche 2: ✅ Gym funktioniert
- ✅ Trainings-Logging speichert zu Supabase
- ✅ Templates werden aus Supabase geladen
- ✅ Trainings-Daten sind persistent

### Nach Woche 3: ✅ Feed funktioniert
- ✅ Feed zeigt echte Trainings-Events
- ✅ Statistiken werden vom Backend berechnet
- ✅ Kein Mock-Data mehr!

### Nach Woche 4: ✅ Production Ready
- ✅ Error Handling
- ✅ Loading States
- ✅ Performance optimiert
- ✅ Ready to release! 🚀

---

## 💬 LET'S GO! 🚀

Du hast alles was du brauchst. Zeit, Supabase zu starten!

👉 **Öffne jetzt: [QUICKSTART_CHECKLIST.md](./QUICKSTART_CHECKLIST.md)**

---

*Last Updated: 2026-04-16*  
*Für: StackD Fitness Tracking App*  
*Version: 1.0 - Initial Setup Guide*
