import { atom } from 'jotai'
import { mockWeekPlan } from '@/data/mockGymData'
import type { WeekDay, WeekPlan } from '@/types/gym'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type SetEntry = { weight: number; reps: number }

export type ExerciseState = {
  id: string
  name: string
  lastWeight: number
  lastSets: number
  lastReps: number
  sets: SetEntry[]
  pr: boolean
}

// ─── Demo constants ───────────────────────────────────────────────────────────

export const WEEK_KEYS: WeekDay[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
export const TODAY_IDX = 1  // Demo: Tuesday

// ─── Initial exercise data (keyed by WeekDay) ────────────────────────────────
// Each day gets its own log so the same template can be used on multiple days.

const INITIAL_EXERCISES: Record<string, ExerciseState[]> = {
  // Monday — Push session (already done, demo history)
  Mo: [
    { id: 'e_bench',   name: 'Bankdrücken',      lastWeight: 77.5, lastSets: 4, lastReps: 8,  sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 8 }, { weight: 80, reps: 7 }, { weight: 80, reps: 7 }], pr: true  },
    { id: 'e_ohp',     name: 'OHP',              lastWeight: 52.5, lastSets: 3, lastReps: 8,  sets: [{ weight: 55, reps: 8 }, { weight: 55, reps: 8 }, { weight: 55, reps: 7 }], pr: false },
    { id: 'e_dips',    name: 'Dips',             lastWeight: 0,    lastSets: 3, lastReps: 10, sets: [], pr: false },
    { id: 'e_tpush',   name: 'Trizeps Pushdown', lastWeight: 30,   lastSets: 3, lastReps: 12, sets: [], pr: false },
    { id: 'e_lateral', name: 'Seitheben',        lastWeight: 10,   lastSets: 3, lastReps: 12, sets: [], pr: false },
  ],
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

export const exerciseDataAtom = atom<Record<string, ExerciseState[]>>(INITIAL_EXERCISES)
export const weekPlanAtom     = atom<WeekPlan>({ ...mockWeekPlan })
