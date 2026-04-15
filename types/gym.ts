export type WorkoutSplit = 'PPL' | 'UpperLower' | 'BroSplit' | 'FullBody' | 'Arnold'

export type Exercise = {
  id: string
  name: string
  muscleGroup: string
  defaultSets: number
  defaultReps: number
}

export type Template = {
  id: string
  name: string
  splitType: WorkoutSplit
  exercises: Exercise[]
}

export type WeekDay = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'

/** Maps each calendar day to a template ID, or null for a rest day. */
export type WeekPlan = Record<WeekDay, string | null>

export type SetLog = {
  exerciseId: string
  /** kg as number, or 'BW' for bodyweight */
  weight: number | 'BW'
  reps: number
  isPR: boolean
}

export type DayLog = {
  /** ISO date string, e.g. "2026-04-14" */
  date: string
  templateId: string
  sets: SetLog[]
}
