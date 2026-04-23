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

export type SetType = 'working' | 'warmup'

export interface SetLog {
  id: string
  type: SetType
  weight: number | null  // null = Körpergewicht (BW)
  weightLabel: string    // e.g. "BW", "BW+5", "82,5 kg"
  reps: number
  done: boolean
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
}

export interface DayLog {
  date: string
  templateId: string
  exercises: ExerciseLog[]
}
