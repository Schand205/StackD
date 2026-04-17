import { useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { mealEntriesAtom, userGoalAtom } from '@/atoms/nutritionAtoms'
import type { MealEntry } from '@/types/nutrition'

export function useDayLog(date: string) {
  const [entries] = useAtom(mealEntriesAtom)

  const dayEntries = useMemo(
    () => entries.filter(e => e.date === date),
    [entries, date],
  )

  const grouped = useMemo(() => ({
    breakfast: dayEntries.filter(e => e.mealType === 'breakfast'),
    lunch:     dayEntries.filter(e => e.mealType === 'lunch'),
    dinner:    dayEntries.filter(e => e.mealType === 'dinner'),
    snacks:    dayEntries.filter(e => e.mealType === 'snacks'),
  }), [dayEntries])

  const totals = useMemo(() => ({
    kcal:    dayEntries.reduce((s, e) => s + e.kcal,    0),
    protein: dayEntries.reduce((s, e) => s + e.protein, 0),
    carbs:   dayEntries.reduce((s, e) => s + e.carbs,   0),
    fat:     dayEntries.reduce((s, e) => s + e.fat,     0),
  }), [dayEntries])

  return { grouped, totals, isLoading: false, isError: false }
}

export function useAddMealEntry() {
  const setEntries = useSetAtom(mealEntriesAtom)

  return {
    mutate: (entry: Omit<MealEntry, 'id'>) => {
      setEntries(prev => [...prev, { ...entry, id: Date.now().toString() }])
    },
    isLoading: false,
  }
}

export function useDeleteMealEntry() {
  const setEntries = useSetAtom(mealEntriesAtom)

  return {
    mutate: (id: string) => {
      setEntries(prev => prev.filter(e => e.id !== id))
    },
    isLoading: false,
  }
}

export function useRecentMeals(limit = 10) {
  const [entries] = useAtom(mealEntriesAtom)

  const recent = useMemo(() => {
    const seen = new Map<string, MealEntry & { count: number }>()
    entries.forEach(e => {
      const key = e.barcode ?? e.name
      if (seen.has(key)) {
        seen.get(key)!.count++
      } else {
        seen.set(key, { ...e, count: 1 })
      }
    })
    return [...seen.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }, [entries, limit])

  return { data: recent, isLoading: false }
}

export function useUserGoal() {
  const [goal] = useAtom(userGoalAtom)
  return { goal, isLoading: false }
}
