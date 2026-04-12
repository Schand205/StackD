# StackD

Basisprojekt mit Expo + React Native + Expo Router.

## Schnellstart

```bash
npm install
npm start
```

Optional:

```bash
npm run ios
npm run android
npm run web
```

## Projektstruktur (Kurz)

- `app/`
  File-based Routing mit Expo Router. Jeder Screen liegt als Datei in diesem Ordner.
- `app/_layout.tsx`
  Globales Stack-Layout (Root-Navigation).
- `app/(tabs)/_layout.tsx`
  Tab-Navigation für die Hauptscreens.
- `app/(tabs)/index.tsx`
  Home-Screen.
- `app/(tabs)/explore.tsx`
  Zweiter Basis-Screen für Features/Tests.
- `app/modal.tsx`
  Beispiel für einen Modal-Screen.
- `components/`
  Wiederverwendbare UI-Komponenten.
- `constants/`
  Zentrale Konfigurationen und App-Konstanten (z. B. `constants/app.ts`).
- `services/`
  API- und Datenzugriff (z. B. `services/api.ts`).
- `types/`
  Gemeinsame TypeScript-Typen (z. B. `types/api.ts`).
- `hooks/`
  Custom Hooks wie Theme- oder Color-Scheme-Logik.
- `assets/`
  Bilder, Fonts und statische Dateien.

## Nächster Schritt

Als nächstes kannst du echte API-Endpunkte in `constants/app.ts` und erste Feature-Screens in `app/(tabs)/` ergänzen.
