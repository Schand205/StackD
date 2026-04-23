import type { Exercise, Template, WeekPlan, DayLog, ExerciseLog, SetLog, WorkoutSplit } from '@/types/gym'

// ─── Exercises ────────────────────────────────────────────────────────────────

// Push / Chest
const bankdruecken:    Exercise = { id: 'e_bench',        name: 'Bankdrücken',         muscleGroup: 'Brust',     defaultSets: 4, defaultReps: 8  }
const ohp:             Exercise = { id: 'e_ohp',          name: 'OHP',                 muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 8  }
const dips:            Exercise = { id: 'e_dips',         name: 'Dips',                muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 }
const trizepsPushdown: Exercise = { id: 'e_tpush',        name: 'Trizeps Pushdown',    muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 }
const seitheben:       Exercise = { id: 'e_lateral',      name: 'Seitheben',           muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 }
const schraegbank:     Exercise = { id: 'e_incline',      name: 'Schrägbankdrücken',   muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 10 }
const kabelfliegend:   Exercise = { id: 'e_cable_fly',    name: 'Kabelfliegend',       muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 12 }

// Pull / Back
const klimmzuege:      Exercise = { id: 'e_pullup',       name: 'Klimmzüge',           muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 8  }
const rudernLH:        Exercise = { id: 'e_row',          name: 'Rudern LH',           muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 8  }
const facePull:        Exercise = { id: 'e_facepull',     name: 'Face Pull',           muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 }
const bizepsCurl:      Exercise = { id: 'e_bicurl',       name: 'Bizeps Curl',         muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 }
const hammerCurl:      Exercise = { id: 'e_hammer',       name: 'Hammer Curl',         muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 }
const latziehen:       Exercise = { id: 'e_lat_pull',     name: 'Latziehen',           muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 10 }
const frontheben:      Exercise = { id: 'e_front_raise',  name: 'Frontheben',          muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 }
const reverseFlyes:    Exercise = { id: 'e_rev_fly',      name: 'Reverse Flyes',       muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 15 }
const skullCrusher:    Exercise = { id: 'e_skull',        name: 'Skull Crusher',       muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 }

// Legs
const kniebeuge:       Exercise = { id: 'e_squat',        name: 'Kniebeuge',           muscleGroup: 'Beine',     defaultSets: 5, defaultReps: 5  }
const legPress:        Exercise = { id: 'e_legpress',     name: 'Leg Press',           muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 10 }
const romanianDL:      Exercise = { id: 'e_rdl',          name: 'Romanian Deadlift',   muscleGroup: 'Gesäß',     defaultSets: 3, defaultReps: 10 }
const legCurl:         Exercise = { id: 'e_legcurl',      name: 'Leg Curl',            muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 }
const wadenheben:      Exercise = { id: 'e_calf',         name: 'Wadenheben',          muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 15 }
const deadlift:        Exercise = { id: 'e_deadlift',     name: 'Deadlift',            muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 5  }

// ─── PPL Templates ────────────────────────────────────────────────────────────

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

// ─── Default Templates Per Split ─────────────────────────────────────────────

export const defaultTemplatesPerSplit: Record<WorkoutSplit, Template[]> = {

  PPL: [templatePush, templatePull, templateLegs],

  UpperLower: [
    {
      id: 'tmpl_upper',
      name: 'Upper',
      splitType: 'UpperLower',
      exercises: [bankdruecken, ohp, rudernLH, klimmzuege, bizepsCurl, trizepsPushdown],
    },
    {
      id: 'tmpl_lower',
      name: 'Lower',
      splitType: 'UpperLower',
      exercises: [kniebeuge, romanianDL, legPress, legCurl, wadenheben],
    },
  ],

  BroSplit: [
    {
      id: 'tmpl_chest',
      name: 'Chest',
      splitType: 'BroSplit',
      exercises: [bankdruecken, schraegbank, kabelfliegend, dips],
    },
    {
      id: 'tmpl_back',
      name: 'Back',
      splitType: 'BroSplit',
      exercises: [klimmzuege, rudernLH, latziehen, facePull],
    },
    {
      id: 'tmpl_shoulders',
      name: 'Shoulders',
      splitType: 'BroSplit',
      exercises: [ohp, seitheben, frontheben, reverseFlyes],
    },
    {
      id: 'tmpl_arms',
      name: 'Arms',
      splitType: 'BroSplit',
      exercises: [bizepsCurl, hammerCurl, trizepsPushdown, skullCrusher],
    },
    {
      id: 'tmpl_bro_legs',
      name: 'Legs',
      splitType: 'BroSplit',
      exercises: [kniebeuge, legPress, romanianDL, legCurl],
    },
  ],

  FullBody: [
    {
      id: 'tmpl_full_a',
      name: 'Full Body A',
      splitType: 'FullBody',
      exercises: [kniebeuge, bankdruecken, rudernLH, ohp, bizepsCurl],
    },
    {
      id: 'tmpl_full_b',
      name: 'Full Body B',
      splitType: 'FullBody',
      exercises: [deadlift, schraegbank, klimmzuege, seitheben, trizepsPushdown],
    },
  ],

  Arnold: [
    {
      id: 'tmpl_chest_back',
      name: 'Chest + Back',
      splitType: 'Arnold',
      exercises: [bankdruecken, schraegbank, klimmzuege, rudernLH],
    },
    {
      id: 'tmpl_shoulders_arms',
      name: 'Shoulders + Arms',
      splitType: 'Arnold',
      exercises: [ohp, seitheben, bizepsCurl, trizepsPushdown],
    },
    {
      id: 'tmpl_arnold_legs',
      name: 'Legs',
      splitType: 'Arnold',
      exercises: [kniebeuge, legPress, romanianDL, legCurl],
    },
  ],
}

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
  exercises: [
    {
      exerciseId: 'e_bench',
      sets: [
        { id: 'mo_bench_s1', type: 'working', weight: 80, weightLabel: '80 kg', reps: 8, done: true },
        { id: 'mo_bench_s2', type: 'working', weight: 80, weightLabel: '80 kg', reps: 8, done: true },
        { id: 'mo_bench_s3', type: 'working', weight: 80, weightLabel: '80 kg', reps: 7, done: true },
        { id: 'mo_bench_s4', type: 'working', weight: 80, weightLabel: '80 kg', reps: 7, done: true },
      ],
    },
    {
      exerciseId: 'e_ohp',
      sets: [
        { id: 'mo_ohp_s1', type: 'working', weight: 55, weightLabel: '55 kg', reps: 8, done: true },
        { id: 'mo_ohp_s2', type: 'working', weight: 55, weightLabel: '55 kg', reps: 8, done: true },
        { id: 'mo_ohp_s3', type: 'working', weight: 55, weightLabel: '55 kg', reps: 7, done: true },
      ],
    },
    {
      exerciseId: 'e_dips',
      sets: [
        { id: 'mo_dips_s1', type: 'working', weight: null, weightLabel: 'BW', reps: 12, done: true },
        { id: 'mo_dips_s2', type: 'working', weight: null, weightLabel: 'BW', reps: 11, done: true },
        { id: 'mo_dips_s3', type: 'working', weight: null, weightLabel: 'BW', reps: 10, done: true },
      ],
    },
    {
      exerciseId: 'e_tpush',
      sets: [
        { id: 'mo_tpush_s1', type: 'working', weight: 30, weightLabel: '30 kg', reps: 12, done: true },
        { id: 'mo_tpush_s2', type: 'working', weight: 30, weightLabel: '30 kg', reps: 12, done: true },
        { id: 'mo_tpush_s3', type: 'working', weight: 30, weightLabel: '30 kg', reps: 11, done: true },
      ],
    },
    {
      exerciseId: 'e_lateral',
      sets: [
        { id: 'mo_lat_s1', type: 'working', weight: 10, weightLabel: '10 kg', reps: 12, done: true },
        { id: 'mo_lat_s2', type: 'working', weight: 10, weightLabel: '10 kg', reps: 12, done: true },
        { id: 'mo_lat_s3', type: 'working', weight: 10, weightLabel: '10 kg', reps: 11, done: true },
      ],
    },
  ],
}

// Tuesday — Pull session
const logTuesday: DayLog = {
  date: '2026-04-14',
  templateId: 'tmpl_pull',
  exercises: [
    {
      exerciseId: 'e_pullup',
      sets: [
        { id: 'tu_pullup_w1', type: 'warmup',  weight: null, weightLabel: 'BW',   reps: 8, done: true },
        { id: 'tu_pullup_s1', type: 'working', weight: 5,    weightLabel: 'BW+5', reps: 8, done: true },
        { id: 'tu_pullup_s2', type: 'working', weight: 5,    weightLabel: 'BW+5', reps: 7, done: true },
        { id: 'tu_pullup_s3', type: 'working', weight: 5,    weightLabel: 'BW+5', reps: 6, done: true },
      ],
    },
    {
      exerciseId: 'e_row',
      sets: [
        { id: 'tu_row_s1', type: 'working', weight: 82.5, weightLabel: '82,5 kg', reps: 8, done: true },
        { id: 'tu_row_s2', type: 'working', weight: 82.5, weightLabel: '82,5 kg', reps: 8, done: true },
        { id: 'tu_row_s3', type: 'working', weight: 82.5, weightLabel: '82,5 kg', reps: 7, done: true },
      ],
    },
    {
      exerciseId: 'e_facepull',
      sets: [
        { id: 'tu_fp_s1', type: 'working', weight: 20, weightLabel: '20 kg', reps: 12, done: true },
        { id: 'tu_fp_s2', type: 'working', weight: 20, weightLabel: '20 kg', reps: 12, done: true },
        { id: 'tu_fp_s3', type: 'working', weight: 20, weightLabel: '20 kg', reps: 11, done: true },
      ],
    },
    {
      exerciseId: 'e_bicurl',
      sets: [
        { id: 'tu_bic_s1', type: 'working', weight: 22.5, weightLabel: '22,5 kg', reps: 10, done: true },
        { id: 'tu_bic_s2', type: 'working', weight: 22.5, weightLabel: '22,5 kg', reps: 10, done: true },
        { id: 'tu_bic_s3', type: 'working', weight: 22.5, weightLabel: '22,5 kg', reps:  9, done: true },
      ],
    },
    {
      exerciseId: 'e_hammer',
      sets: [
        { id: 'tu_ham_s1', type: 'working', weight: 20, weightLabel: '20 kg', reps: 10, done: true },
        { id: 'tu_ham_s2', type: 'working', weight: 20, weightLabel: '20 kg', reps: 10, done: true },
        { id: 'tu_ham_s3', type: 'working', weight: 20, weightLabel: '20 kg', reps:  9, done: true },
      ],
    },
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
 * BW sets (weight === null) are excluded.
 */
export function getPreviousBest(exerciseId: string): number | undefined {
  const weights = mockDayLogs
    .flatMap(d => d.exercises)
    .filter(e => e.exerciseId === exerciseId)
    .flatMap(e => e.sets)
    .filter(s => s.weight !== null)
    .map(s => s.weight as number)
  return weights.length > 0 ? Math.max(...weights) : undefined
}

/**
 * Last logged set for an exercise — used as prefill in SetEntrySheet.
 */
export function getLastSet(exerciseId: string): SetLog | undefined {
  for (let i = mockDayLogs.length - 1; i >= 0; i--) {
    const exLog = mockDayLogs[i].exercises.find(e => e.exerciseId === exerciseId)
    if (!exLog || exLog.sets.length === 0) continue
    return exLog.sets[exLog.sets.length - 1]
  }
  return undefined
}
