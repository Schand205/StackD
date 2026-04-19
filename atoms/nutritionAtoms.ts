import { atom } from 'jotai'
import { MOCK_ENTRIES } from '@/constants/mockData'
import type { MealEntry } from '@/types/nutrition'

export const mealEntriesAtom = atom<MealEntry[]>(MOCK_ENTRIES)

function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export const selectedDateAtom = atom<string>(localToday())

export const userGoalAtom = atom({
  kcal:    2100,
  protein: 150,
  carbs:   300,
  fat:     70,
})
