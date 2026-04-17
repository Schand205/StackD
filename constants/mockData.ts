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

const TODAY = new Date().toISOString().split('T')[0]

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
  week: [100, 85, 60, 90, 40, 0, 0], // Mo–So, % gefüllt
} as const;
