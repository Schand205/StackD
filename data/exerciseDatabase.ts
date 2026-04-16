import type { Exercise } from '@/types/gym'

// ─── Exercise Database ────────────────────────────────────────────────────────
// ~40 exercises across 7 muscle groups.
// IDs use the 'db_' prefix to distinguish from template-specific exercise IDs.

export const EXERCISE_DB: Exercise[] = [
  // ── Brust ──
  { id: 'db_bench',       name: 'Bankdrücken',          muscleGroup: 'Brust',     defaultSets: 4, defaultReps: 8  },
  { id: 'db_incline',     name: 'Schrägbankdrücken',    muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 10 },
  { id: 'db_dips_chest',  name: 'Dips',                 muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 10 },
  { id: 'db_cable_fly',   name: 'Kabelfliegend',        muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 12 },
  { id: 'db_pushup',      name: 'Liegestütz',           muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 15 },

  // ── Rücken ──
  { id: 'db_pullup',      name: 'Klimmzüge',            muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 8  },
  { id: 'db_row_bb',      name: 'Rudern LH',            muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 8  },
  { id: 'db_lat_pull',    name: 'Latziehen',            muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 10 },
  { id: 'db_cable_row',   name: 'Cable Row',            muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 10 },
  { id: 'db_single_row',  name: 'Einarmiges Rudern',    muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 10 },
  { id: 'db_face_pull',   name: 'Face Pull',            muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 15 },
  { id: 'db_deadlift',    name: 'Kreuzheben',           muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 5  },

  // ── Schultern ──
  { id: 'db_ohp',         name: 'OHP',                  muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 8  },
  { id: 'db_lateral',     name: 'Seitheben',            muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 },
  { id: 'db_front_raise', name: 'Frontheben',           muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 },
  { id: 'db_rev_fly',     name: 'Reverse Flyes',        muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 15 },
  { id: 'db_arnold',      name: 'Arnold Press',         muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 10 },

  // ── Bizeps ──
  { id: 'db_bicurl',      name: 'Bizeps Curl',          muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 },
  { id: 'db_hammer',      name: 'Hammer Curl',          muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 },
  { id: 'db_conc_curl',   name: 'Konzentrations Curl',  muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 12 },
  { id: 'db_cable_curl',  name: 'Cable Curl',           muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 12 },

  // ── Trizeps ──
  { id: 'db_tpush',       name: 'Trizeps Pushdown',     muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 },
  { id: 'db_skull',       name: 'Skull Crusher',        muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 },
  { id: 'db_dips_tri',    name: 'Dips (Trizeps)',       muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 },
  { id: 'db_tri_ext',     name: 'Overhead Extension',   muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 },

  // ── Beine ──
  { id: 'db_squat',       name: 'Kniebeuge',            muscleGroup: 'Beine',     defaultSets: 5, defaultReps: 5  },
  { id: 'db_legpress',    name: 'Leg Press',            muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 10 },
  { id: 'db_rdl',         name: 'Romanian Deadlift',    muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 10 },
  { id: 'db_legcurl',     name: 'Leg Curl',             muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },
  { id: 'db_legext',      name: 'Leg Extension',        muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },
  { id: 'db_calf',        name: 'Wadenheben',           muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 15 },
  { id: 'db_bss',         name: 'Bulgarian Split Squat', muscleGroup: 'Beine',    defaultSets: 3, defaultReps: 10 },
  { id: 'db_lunges',      name: 'Ausfallschritte',      muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },

  // ── Core ──
  { id: 'db_plank',       name: 'Plank',                muscleGroup: 'Core',      defaultSets: 3, defaultReps: 60 },
  { id: 'db_crunches',    name: 'Crunches',             muscleGroup: 'Core',      defaultSets: 3, defaultReps: 20 },
  { id: 'db_russian',     name: 'Russian Twist',        muscleGroup: 'Core',      defaultSets: 3, defaultReps: 20 },
  { id: 'db_leg_raise',   name: 'Hängendes Beinheben',  muscleGroup: 'Core',      defaultSets: 3, defaultReps: 12 },
]

// ─── Muscle Group Filter ──────────────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  'Alle', 'Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Core',
] as const

export type MuscleGroupFilter = typeof MUSCLE_GROUPS[number]
