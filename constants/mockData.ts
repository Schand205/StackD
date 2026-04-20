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

export const mockStats = {
  gym: {
    lastDay: 'Push-Tag · Do.',
    exercises: 4,
    weekDone: 2,
    weekGoal: 4,
    nextDay: 'Pull-Tag',
    restDay: true,
  },
  kalorien: {
    current: 1840,
    goal: 2400,
    protein: { current: 142, goal: 180 },
    carbs:   { current: 198, goal: 300 },
    fat:     { current: 48,  goal: 80  },
  },
  zielCheck: {
    name: 'Lean Bulk',
    items: [
      { label: 'Körpergewicht',    value: '+0,6 kg · on track', status: 'ok'   },
      { label: 'Lift-Gewicht',     value: 'Squat +5 kg',        status: 'ok'   },
      { label: 'Kalorien-Schnitt', value: '1.980 · zu wenig',   status: 'warn' },
    ],
  },
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
  week: [
    { pct: 98,  isToday: false },  // Mo — grün
    { pct: 72,  isToday: false },  // Di — lila
    { pct: 102, isToday: false },  // Mi — grün
    { pct: 115, isToday: false },  // Do — amber
    { pct: 60,  isToday: true  },  // Fr — heute, lila
    { pct: 0,   isToday: false },  // Sa — leer
    { pct: 0,   isToday: false },  // So — leer
  ],
} as const;
