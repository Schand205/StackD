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

// ─── Initial exercise data (keyed by templateId) ──────────────────────────────

const INITIAL_EXERCISES: Record<string, ExerciseState[]> = {
  tmpl_push: [
    { id: 'p1', name: 'Bankdrücken',      lastWeight: 80,   lastSets: 5, lastReps: 5,  sets: [{ weight: 82.5, reps: 5 }, { weight: 82.5, reps: 5 }, { weight: 82.5, reps: 4 }], pr: true  },
    { id: 'p2', name: 'Schulterdrücken',  lastWeight: 55,   lastSets: 4, lastReps: 8,  sets: [{ weight: 57.5, reps: 8 }, { weight: 57.5, reps: 7 }], pr: false },
    { id: 'p3', name: 'Trizeps Pushdown', lastWeight: 30,   lastSets: 3, lastReps: 12, sets: [], pr: false },
  ],
  tmpl_pull: [
    { id: 'pu1', name: 'Klimmzüge',        lastWeight: 0,    lastSets: 4, lastReps: 6,  sets: [], pr: false },
    { id: 'pu2', name: 'Langhantelrudern', lastWeight: 75,   lastSets: 4, lastReps: 8,  sets: [], pr: false },
    { id: 'pu3', name: 'Bizeps Curl',      lastWeight: 22.5, lastSets: 3, lastReps: 10, sets: [], pr: false },
  ],
  tmpl_legs: [
    { id: 'b1', name: 'Kniebeuge',  lastWeight: 100, lastSets: 5, lastReps: 5,  sets: [], pr: false },
    { id: 'b2', name: 'Beinpresse', lastWeight: 160, lastSets: 4, lastReps: 10, sets: [], pr: false },
    { id: 'b3', name: 'Wadenheben', lastWeight: 80,  lastSets: 4, lastReps: 15, sets: [], pr: false },
  ],
}

// ─── Atoms ────────────────────────────────────────────────────────────────────

export const exerciseDataAtom = atom<Record<string, ExerciseState[]>>(INITIAL_EXERCISES)
export const weekPlanAtom     = atom<WeekPlan>({ ...mockWeekPlan })
