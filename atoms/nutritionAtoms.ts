import { atom } from 'jotai'
import { MOCK_ENTRIES } from '@/constants/mockData'
import type { MealEntry } from '@/types/nutrition'

export const mealEntriesAtom = atom<MealEntry[]>(MOCK_ENTRIES)

export const selectedDateAtom = atom<string>(
  new Date().toISOString().split('T')[0],
)

export const userGoalAtom = atom({
  kcal:    2100,
  protein: 150,
  carbs:   300,
  fat:     70,
})
