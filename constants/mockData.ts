export const mockFriends = [
  { id: '1', initials: 'AS', name: 'Anna',  status: 'Ziel erreicht', active: true,  ring: 'teal'   },
  { id: '2', initials: 'MK', name: 'Max',   status: 'PR heute',      active: true,  ring: 'purple' },
  { id: '3', initials: 'LB', name: 'Lukas', status: 'noch nichts',   active: false, ring: null     },
] as const;

export const mockActivities = [
  {
    id: '1',
    user: { initials: 'MK', name: 'Max K.', color: 'purple' },
    time: 'vor 23 Min.',
    type: 'gym',
    title: 'Bankdrücken',
    pr: true,
    pills: ['82,5 kg', '5 × 5', 'Brust-Tag'],
    likes: 3,
  },
  {
    id: '2',
    user: { initials: 'AS', name: 'Anna S.', color: 'teal' },
    time: 'vor 1 Std.',
    type: 'kalorien',
    title: 'Tagesziel erreicht',
    pr: false,
    pills: ['2.200 kcal', '168 g Protein'],
    likes: 5,
  },
  {
    id: '3',
    user: { initials: 'LB', name: 'Lukas B.', color: 'amber' },
    time: 'vor 2 Std.',
    type: 'gym',
    title: 'Push-Tag abgeschlossen',
    pr: false,
    pills: ['4 Übungen', '58 Min.'],
    likes: 2,
  },
] as const;

import type { MealEntry } from '@/types/nutrition'

const _d = new Date()
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`

export const MOCK_ENTRIES: MealEntry[] = [
  { id: 'e1', date: TODAY, mealType: 'breakfast', name: 'Haferflocken',     kcal: 320, protein: 12, carbs: 54, fat: 6,  source: 'manual' },
  { id: 'e2', date: TODAY, mealType: 'breakfast', name: 'Kaffee',           kcal: 100, protein: 0,  carbs: 5,  fat: 3,  source: 'manual' },
  { id: 'e3', date: TODAY, mealType: 'lunch',     name: 'Hähnchenbrust',    kcal: 265, protein: 50, carbs: 0,  fat: 6,  source: 'manual' },
  { id: 'e4', date: TODAY, mealType: 'lunch',     name: 'Basmati Reis',     kcal: 295, protein: 6,  carbs: 65, fat: 1,  source: 'manual' },
  { id: 'e5', date: TODAY, mealType: 'snacks',    name: 'Milka Schokolade', kcal: 360, protein: 5,  carbs: 42, fat: 20, source: 'openfoodfacts' },
]

/** @deprecated use MOCK_ENTRIES */
export const mockNutritionEntries = MOCK_ENTRIES

export const mockMacroGoals = {
  protein: { goal: 150 },
  carbs:   { goal: 300 },
  fat:     { goal: 70  },
}

export const mockProfil = {
  name:         'Max Hildebrand',
  initials:     'MH',
  memberSince:  'März 2024',
  weight:       82.5,   // kg
  height:       181,    // cm
  age:          24,
  gender:       'Männlich',
  goal: {
    type:          'Lean Bulk',
    kcal:          2600,
    weightGoalKg:  85,
    protein:       160,
    kcalRatio:     0.72,
    weightRatio:   0.35,
    proteinRatio:  0.58,
  },
  trainingDays:          ['Mo', 'Mi', 'Do', 'Sa'] as string[],
  weekGoal:              4,
  appleHealthConnected:  true,
  friendCount:           4,
} as const

// Used by: einstellungen/kalorienberechnung, ProgressCard (legacy)
export const calorieMode: {
  mode: 'average' | 'live';
  isPremium: boolean;
} = {
  mode:      'average',
  isPremium: false,
}

// Used by: TodayCard (kalorien col), GoalCheckCard (via goalCheck), calories.tsx (steps)
export const mockStats = {
  // Used by: TodayCard gym column
  gym: {
    lastDay:   'Push-Tag · Do.',
    exercises: 4,
    duration:  58,
    weekDone:  2,
    weekGoal:  4,
    nextDay:   'Pull-Tag',
    isRestDay: true,
  },
  // Used by: TodayCard kalorien column (as fallback; live data preferred in feed screen)
  kalorien: {
    current:   1840,
    goal:      2400,
    protein: { current: 142, goal: 180 },
    carbs:   { current: 198, goal: 300 },
    fat:     { current: 48,  goal: 80  },
  },
  // Used by: calories.tsx, StepsGoalBottomSheet, TodayCard steps row
  steps: (() => {
    const today         = 6240
    const goal          = 8000
    const avgLast4Weeks = 7340
    const suggestedGoal = 7500
    const diff          = Math.abs(avgLast4Weeks - goal) / goal
    return {
      today,
      goal,
      avgLast4Weeks,
      history: [
        { week: 'KW 13', avg: 6800 },
        { week: 'KW 14', avg: 7200 },
        { week: 'KW 15', avg: 7600 },
        { week: 'KW 16', avg: 7340 },
      ],
      suggestionPending: diff > 0.15,
      suggestedGoal,
    }
  })(),
  // Used by: TodayCard gym column weekDots
  week: [
    { pct: 98,  isToday: false },  // Mo
    { pct: 72,  isToday: false },  // Di
    { pct: 102, isToday: false },  // Mi
    { pct: 115, isToday: false },  // Do
    { pct: 60,  isToday: true  },  // Fr — heute
    { pct: 0,   isToday: false },  // Sa
    { pct: 0,   isToday: false },  // So
  ],
} as const;

export type GoalStatus = 'ok' | 'warn' | 'bad'

// Used by: GoalCheckCard — IDs reference constants/exercises.ts
export const keyLiftIds = ['kniebeuge', 'bankdruecken', 'ohp'] as const
export type KeyLiftId = typeof keyLiftIds[number]

export const goalCheck: {
  weight:   { change: number; status: GoalStatus }
  calories: { weekAvg: number; status: GoalStatus }
  lifts:    { keyLiftIds: string[]; improved: number; total: number; status: GoalStatus }
} = {
  weight:   { change: 0.6,   status: 'ok'   },
  calories: { weekAvg: 1980, status: 'warn' },
  lifts:    { keyLiftIds: ['kniebeuge', 'bankdruecken', 'ohp'], improved: 2, total: 3, status: 'ok' },
}

// Used by: profil.tsx Verlauf tab, WeightBottomSheet mini-chart
export const weightHistory = [
  { date: '2026-01-05', weight: 80.4 },
  { date: '2026-01-12', weight: 80.8 },
  { date: '2026-01-19', weight: 81.0 },
  { date: '2026-01-26', weight: 81.2 },
  { date: '2026-02-02', weight: 81.5 },
  { date: '2026-02-09', weight: 81.5 },
  { date: '2026-02-16', weight: 81.8 },
  { date: '2026-02-23', weight: 82.0 },
  { date: '2026-03-02', weight: 82.0 },
  { date: '2026-03-09', weight: 82.2 },
  { date: '2026-03-16', weight: 82.3 },
  { date: '2026-03-23', weight: 82.1 },
  { date: '2026-03-30', weight: 82.4 },
  { date: '2026-04-07', weight: 82.4 },
  { date: '2026-04-14', weight: 82.6 },
  { date: '2026-04-21', weight: 82.4 },
] as const;

// Used by: gym.tsx Verlauf tab, uebungsverlauf.tsx
// id references constants/exercises.ts EXERCISES; name kept for UI display
export const exerciseHistory = [
  {
    id: 'kniebeuge',
    name: 'Kniebeuge',
    color: '#7F77DD',
    data: [
      { date: '2026-01-06', weight: 90 },
      { date: '2026-01-13', weight: 92.5 },
      { date: '2026-01-20', weight: 95 },
      { date: '2026-01-27', weight: 95 },
      { date: '2026-02-03', weight: 97.5 },
      { date: '2026-02-10', weight: 100 },
      { date: '2026-02-17', weight: 100 },
      { date: '2026-02-24', weight: 102.5 },
      { date: '2026-03-03', weight: 105 },
      { date: '2026-03-10', weight: 105 },
      { date: '2026-03-17', weight: 107.5 },
      { date: '2026-03-24', weight: 110 },
      { date: '2026-03-31', weight: 110 },
      { date: '2026-04-07', weight: 112.5 },
      { date: '2026-04-14', weight: 115 },
    ],
  },
  {
    id: 'bankdruecken',
    name: 'Bankdrücken',
    color: '#1D9E75',
    data: [
      { date: '2026-01-06', weight: 80 },
      { date: '2026-01-13', weight: 80 },
      { date: '2026-01-20', weight: 82.5 },
      { date: '2026-01-27', weight: 82.5 },
      { date: '2026-02-03', weight: 85 },
      { date: '2026-02-10', weight: 85 },
      { date: '2026-02-17', weight: 87.5 },
      { date: '2026-02-24', weight: 87.5 },
      { date: '2026-03-03', weight: 90 },
      { date: '2026-03-10', weight: 90 },
      { date: '2026-03-17', weight: 90 },
      { date: '2026-03-24', weight: 92.5 },
      { date: '2026-03-31', weight: 92.5 },
      { date: '2026-04-07', weight: 95 },
      { date: '2026-04-14', weight: 95 },
    ],
  },
  {
    id: 'ohp',
    name: 'OHP',
    color: '#EF9F27',
    data: [
      { date: '2026-01-06', weight: 52.5 },
      { date: '2026-01-13', weight: 55 },
      { date: '2026-01-20', weight: 55 },
      { date: '2026-01-27', weight: 57.5 },
      { date: '2026-02-03', weight: 57.5 },
      { date: '2026-02-10', weight: 60 },
      { date: '2026-02-17', weight: 60 },
      { date: '2026-02-24', weight: 60 },
      { date: '2026-03-03', weight: 62.5 },
      { date: '2026-03-10', weight: 62.5 },
      { date: '2026-03-17', weight: 65 },
      { date: '2026-03-24', weight: 65 },
      { date: '2026-03-31', weight: 65 },
      { date: '2026-04-07', weight: 67.5 },
      { date: '2026-04-14', weight: 67.5 },
    ],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    color: '#D85A30',
    data: [
      { date: '2026-01-06', weight: 140 },
      { date: '2026-01-13', weight: 145 },
      { date: '2026-01-20', weight: 147.5 },
      { date: '2026-01-27', weight: 150 },
      { date: '2026-02-03', weight: 152.5 },
      { date: '2026-02-10', weight: 155 },
      { date: '2026-02-17', weight: 155 },
      { date: '2026-02-24', weight: 157.5 },
      { date: '2026-03-03', weight: 160 },
      { date: '2026-03-10', weight: 162.5 },
      { date: '2026-03-17', weight: 162.5 },
      { date: '2026-03-24', weight: 165 },
      { date: '2026-03-31', weight: 167.5 },
      { date: '2026-04-07', weight: 170 },
      { date: '2026-04-14', weight: 172.5 },
    ],
  },
  {
    id: 'rudern_lh',
    name: 'Rudern LH',
    color: '#888780',
    data: [
      { date: '2026-01-06', weight: 70 },
      { date: '2026-01-13', weight: 72.5 },
      { date: '2026-01-20', weight: 72.5 },
      { date: '2026-01-27', weight: 75 },
      { date: '2026-02-03', weight: 75 },
      { date: '2026-02-10', weight: 77.5 },
      { date: '2026-02-17', weight: 77.5 },
      { date: '2026-02-24', weight: 80 },
      { date: '2026-03-03', weight: 80 },
      { date: '2026-03-10', weight: 80 },
      { date: '2026-03-17', weight: 82.5 },
      { date: '2026-03-24', weight: 82.5 },
      { date: '2026-03-31', weight: 85 },
      { date: '2026-04-07', weight: 85 },
      { date: '2026-04-14', weight: 87.5 },
    ],
  },
  {
    id: 'klimmzuege',
    name: 'Klimmzüge',
    color: '#3B82F6',
    data: [
      { date: '2026-01-06', weight: 10 },
      { date: '2026-01-13', weight: 12.5 },
      { date: '2026-01-20', weight: 12.5 },
      { date: '2026-01-27', weight: 15 },
      { date: '2026-02-03', weight: 15 },
      { date: '2026-02-10', weight: 17.5 },
      { date: '2026-02-17', weight: 17.5 },
      { date: '2026-02-24', weight: 20 },
      { date: '2026-03-03', weight: 20 },
      { date: '2026-03-10', weight: 22.5 },
      { date: '2026-03-17', weight: 22.5 },
      { date: '2026-03-24', weight: 25 },
      { date: '2026-03-31', weight: 25 },
      { date: '2026-04-07', weight: 27.5 },
      { date: '2026-04-14', weight: 27.5 },
    ],
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    color: '#EC4899',
    data: [
      { date: '2026-01-06', weight: 160 },
      { date: '2026-01-13', weight: 165 },
      { date: '2026-01-20', weight: 170 },
      { date: '2026-01-27', weight: 170 },
      { date: '2026-02-03', weight: 175 },
      { date: '2026-02-10', weight: 180 },
      { date: '2026-02-17', weight: 180 },
      { date: '2026-02-24', weight: 185 },
      { date: '2026-03-03', weight: 185 },
      { date: '2026-03-10', weight: 190 },
      { date: '2026-03-17', weight: 190 },
      { date: '2026-03-24', weight: 195 },
      { date: '2026-03-31', weight: 200 },
      { date: '2026-04-07', weight: 200 },
      { date: '2026-04-14', weight: 205 },
    ],
  },
  {
    id: 'bizeps_curl',
    name: 'Bizeps Curl',
    color: '#F97316',
    data: [
      { date: '2026-01-06', weight: 14 },
      { date: '2026-01-13', weight: 14 },
      { date: '2026-01-20', weight: 16 },
      { date: '2026-01-27', weight: 16 },
      { date: '2026-02-03', weight: 16 },
      { date: '2026-02-10', weight: 18 },
      { date: '2026-02-17', weight: 18 },
      { date: '2026-02-24', weight: 18 },
      { date: '2026-03-03', weight: 20 },
      { date: '2026-03-10', weight: 20 },
      { date: '2026-03-17', weight: 20 },
      { date: '2026-03-24', weight: 22 },
      { date: '2026-03-31', weight: 22 },
      { date: '2026-04-07', weight: 22 },
      { date: '2026-04-14', weight: 24 },
    ],
  },
] as const;
