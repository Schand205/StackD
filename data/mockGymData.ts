import type { Exercise, Template, WeekPlan, DayLog } from '@/types/gym'

// ─── Exercises ────────────────────────────────────────────────────────────────

// Push
const bankdruecken:    Exercise = { id: 'e_bench',    name: 'Bankdrücken',       muscleGroup: 'Brust',     defaultSets: 4, defaultReps: 8  }
const ohp:             Exercise = { id: 'e_ohp',      name: 'OHP',               muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 8  }
const dips:            Exercise = { id: 'e_dips',     name: 'Dips',              muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 }
const trizepsPushdown: Exercise = { id: 'e_tpush',    name: 'Trizeps Pushdown',  muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 }
const seitheben:       Exercise = { id: 'e_lateral',  name: 'Seitheben',         muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 }

// Pull
const klimmzuege:      Exercise = { id: 'e_pullup',   name: 'Klimmzüge',         muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 8  }
const rudernLH:        Exercise = { id: 'e_row',      name: 'Rudern LH',         muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 8  }
const facePull:        Exercise = { id: 'e_facepull', name: 'Face Pull',         muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 }
const bizepsCurl:      Exercise = { id: 'e_bicurl',   name: 'Bizeps Curl',       muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 }
const hammerCurl:      Exercise = { id: 'e_hammer',   name: 'Hammer Curl',       muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 }

// Legs
const kniebeuge:       Exercise = { id: 'e_squat',    name: 'Kniebeuge',         muscleGroup: 'Beine',     defaultSets: 5, defaultReps: 5  }
const legPress:        Exercise = { id: 'e_legpress', name: 'Leg Press',         muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 10 }
const romanianDL:      Exercise = { id: 'e_rdl',      name: 'Romanian Deadlift', muscleGroup: 'Gesäß',     defaultSets: 3, defaultReps: 10 }
const legCurl:         Exercise = { id: 'e_legcurl',  name: 'Leg Curl',          muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 }

// ─── Templates ────────────────────────────────────────────────────────────────

export const templatePush: Template = {
  id: 'tmpl_push',
  name: 'Push',
  splitType: 'PPL',
  exercises: [bankdruecken, ohp, dips, trizepsPushdown, seitheben],
}

export const templatePull: Template = {
  id: 'tmpl_pull',
  name: 'Pull',
  splitType: 'PPL',
  exercises: [klimmzuege, rudernLH, facePull, bizepsCurl, hammerCurl],
}

export const templateLegs: Template = {
  id: 'tmpl_legs',
  name: 'Legs',
  splitType: 'PPL',
  exercises: [kniebeuge, legPress, romanianDL, legCurl],
}

export const mockTemplates: Template[] = [templatePush, templatePull, templateLegs]

// ─── Week Plan ────────────────────────────────────────────────────────────────

export const mockWeekPlan: WeekPlan = {
  Mo: 'tmpl_push',
  Di: 'tmpl_pull',
  Mi: null,
  Do: 'tmpl_legs',
  Fr: 'tmpl_push',
  Sa: null,
  So: null,
}

// ─── Day Logs ─────────────────────────────────────────────────────────────────

// Monday — Push session
const logMonday: DayLog = {
  date: '2026-04-13',
  templateId: 'tmpl_push',
  sets: [
    // Bankdrücken 4×8
    { exerciseId: 'e_bench',   weight: 80,   reps: 8,  isPR: false },
    { exerciseId: 'e_bench',   weight: 80,   reps: 8,  isPR: false },
    { exerciseId: 'e_bench',   weight: 80,   reps: 7,  isPR: false },
    { exerciseId: 'e_bench',   weight: 80,   reps: 7,  isPR: false },
    // OHP 3×8
    { exerciseId: 'e_ohp',     weight: 55,   reps: 8,  isPR: false },
    { exerciseId: 'e_ohp',     weight: 55,   reps: 8,  isPR: false },
    { exerciseId: 'e_ohp',     weight: 55,   reps: 7,  isPR: false },
    // Dips 3×10 — bodyweight
    { exerciseId: 'e_dips',    weight: 'BW', reps: 12, isPR: false },
    { exerciseId: 'e_dips',    weight: 'BW', reps: 11, isPR: false },
    { exerciseId: 'e_dips',    weight: 'BW', reps: 10, isPR: false },
    // Trizeps Pushdown 3×12
    { exerciseId: 'e_tpush',   weight: 30,   reps: 12, isPR: false },
    { exerciseId: 'e_tpush',   weight: 30,   reps: 12, isPR: false },
    { exerciseId: 'e_tpush',   weight: 30,   reps: 11, isPR: false },
    // Seitheben 3×12
    { exerciseId: 'e_lateral', weight: 10,   reps: 12, isPR: false },
    { exerciseId: 'e_lateral', weight: 10,   reps: 12, isPR: false },
    { exerciseId: 'e_lateral', weight: 10,   reps: 11, isPR: false },
  ],
}

// Tuesday — Pull session, PR on Rudern LH
const logTuesday: DayLog = {
  date: '2026-04-14',
  templateId: 'tmpl_pull',
  sets: [
    // Klimmzüge 4×8 — bodyweight
    { exerciseId: 'e_pullup',   weight: 'BW', reps: 8,  isPR: false },
    { exerciseId: 'e_pullup',   weight: 'BW', reps: 8,  isPR: false },
    { exerciseId: 'e_pullup',   weight: 'BW', reps: 7,  isPR: false },
    { exerciseId: 'e_pullup',   weight: 'BW', reps: 7,  isPR: false },
    // Rudern LH 3×8 — PR bei 82.5 kg (vorher 80 kg)
    { exerciseId: 'e_row',      weight: 82.5, reps: 8,  isPR: true  },
    { exerciseId: 'e_row',      weight: 82.5, reps: 8,  isPR: true  },
    { exerciseId: 'e_row',      weight: 82.5, reps: 7,  isPR: false },
    // Face Pull 3×12
    { exerciseId: 'e_facepull', weight: 20,   reps: 12, isPR: false },
    { exerciseId: 'e_facepull', weight: 20,   reps: 12, isPR: false },
    { exerciseId: 'e_facepull', weight: 20,   reps: 11, isPR: false },
    // Bizeps Curl 3×10
    { exerciseId: 'e_bicurl',   weight: 22.5, reps: 10, isPR: false },
    { exerciseId: 'e_bicurl',   weight: 22.5, reps: 10, isPR: false },
    { exerciseId: 'e_bicurl',   weight: 22.5, reps: 9,  isPR: false },
    // Hammer Curl 3×10
    { exerciseId: 'e_hammer',   weight: 20,   reps: 10, isPR: false },
    { exerciseId: 'e_hammer',   weight: 20,   reps: 10, isPR: false },
    { exerciseId: 'e_hammer',   weight: 20,   reps: 9,  isPR: false },
  ],
}

export const mockDayLogs: DayLog[] = [logMonday, logTuesday]

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Find a template by ID. */
export function findTemplate(id: string): Template | undefined {
  return mockTemplates.find(t => t.id === id)
}

/** Find an exercise by ID across all templates. */
export function findExercise(id: string): Exercise | undefined {
  for (const t of mockTemplates) {
    const ex = t.exercises.find(e => e.id === id)
    if (ex) return ex
  }
  return undefined
}

/**
 * Highest numeric weight ever logged for an exercise.
 * BW sets are excluded from the comparison.
 * Returns undefined if no numeric sets have been logged.
 */
export function getPreviousBest(exerciseId: string): number | undefined {
  const weights = mockDayLogs
    .flatMap(d => d.sets)
    .filter(s => s.exerciseId === exerciseId && typeof s.weight === 'number')
    .map(s => s.weight as number)
  return weights.length > 0 ? Math.max(...weights) : undefined
}

/**
 * Last logged set for an exercise — used as prefill in SetEntrySheet.
 * Returns undefined if never logged.
 */
export function getLastSet(exerciseId: string): SetLog | undefined {
  for (let i = mockDayLogs.length - 1; i >= 0; i--) {
    const sets = mockDayLogs[i].sets.filter(s => s.exerciseId === exerciseId)
    if (sets.length > 0) return sets[sets.length - 1]
  }
  return undefined
}
