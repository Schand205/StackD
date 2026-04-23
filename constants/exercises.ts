import type { Exercise } from '@/types/gym'

// ─── Canonical exercise registry ─────────────────────────────────────────────
// Single source of truth for IDs and display names.
// IDs are simple lowercase slugs — no prefix, readable by name.
// data/exerciseDatabase.ts (db_ prefix) is kept for the gym exercise browser.
// data/mockGymData.ts (e_ prefix) is kept for template definitions.
// History / analytics code should reference IDs from THIS file.

export const EXERCISES: Exercise[] = [

  // ── Brust ──────────────────────────────────────────────────────────────────
  { id: 'bankdruecken',       name: 'Bankdrücken',           muscleGroup: 'Brust',     defaultSets: 4, defaultReps: 8  },
  { id: 'schraegbank',        name: 'Schrägbankdrücken',     muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 10 },
  { id: 'dips',               name: 'Dips',                  muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 10 },
  { id: 'kabelfliegend',      name: 'Kabelfliegend',         muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 12 },
  { id: 'liegestuetz',        name: 'Liegestütz',            muscleGroup: 'Brust',     defaultSets: 3, defaultReps: 15 },

  // ── Rücken ─────────────────────────────────────────────────────────────────
  { id: 'klimmzuege',         name: 'Klimmzüge',             muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 8  },
  { id: 'rudern_lh',          name: 'Rudern LH',             muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 8  },
  { id: 'latziehen',          name: 'Latziehen',             muscleGroup: 'Rücken',    defaultSets: 4, defaultReps: 10 },
  { id: 'cable_row',          name: 'Cable Row',             muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 10 },
  { id: 'einarmiges_rudern',  name: 'Einarmiges Rudern',     muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 10 },
  { id: 'face_pull',          name: 'Face Pull',             muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 15 },
  { id: 'deadlift',           name: 'Deadlift',              muscleGroup: 'Rücken',    defaultSets: 3, defaultReps: 5  },

  // ── Schultern ──────────────────────────────────────────────────────────────
  { id: 'ohp',                name: 'OHP',                   muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 8  },
  { id: 'seitheben',          name: 'Seitheben',             muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 },
  { id: 'frontheben',         name: 'Frontheben',            muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 12 },
  { id: 'reverse_flyes',      name: 'Reverse Flyes',         muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 15 },
  { id: 'arnold_press',       name: 'Arnold Press',          muscleGroup: 'Schultern', defaultSets: 3, defaultReps: 10 },

  // ── Bizeps ─────────────────────────────────────────────────────────────────
  { id: 'bizeps_curl',        name: 'Bizeps Curl',           muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 },
  { id: 'hammer_curl',        name: 'Hammer Curl',           muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 10 },
  { id: 'konzentrations_curl',name: 'Konzentrations Curl',   muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 12 },
  { id: 'cable_curl',         name: 'Cable Curl',            muscleGroup: 'Bizeps',    defaultSets: 3, defaultReps: 12 },

  // ── Trizeps ────────────────────────────────────────────────────────────────
  { id: 'trizeps_pushdown',   name: 'Trizeps Pushdown',      muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 },
  { id: 'skull_crusher',      name: 'Skull Crusher',         muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 },
  { id: 'dips_trizeps',       name: 'Dips (Trizeps)',        muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 10 },
  { id: 'overhead_extension', name: 'Overhead Extension',    muscleGroup: 'Trizeps',   defaultSets: 3, defaultReps: 12 },

  // ── Beine ──────────────────────────────────────────────────────────────────
  { id: 'kniebeuge',          name: 'Kniebeuge',             muscleGroup: 'Beine',     defaultSets: 5, defaultReps: 5  },
  { id: 'leg_press',          name: 'Leg Press',             muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 10 },
  { id: 'romanian_deadlift',  name: 'Romanian Deadlift',     muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 10 },
  { id: 'leg_curl',           name: 'Leg Curl',              muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },
  { id: 'leg_extension',      name: 'Leg Extension',         muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },
  { id: 'wadenheben',         name: 'Wadenheben',            muscleGroup: 'Beine',     defaultSets: 4, defaultReps: 15 },
  { id: 'bulgarian_split',    name: 'Bulgarian Split Squat', muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 10 },
  { id: 'ausfallschritte',    name: 'Ausfallschritte',       muscleGroup: 'Beine',     defaultSets: 3, defaultReps: 12 },

  // ── Core ───────────────────────────────────────────────────────────────────
  { id: 'plank',              name: 'Plank',                 muscleGroup: 'Core',      defaultSets: 3, defaultReps: 60 },
  { id: 'crunches',           name: 'Crunches',              muscleGroup: 'Core',      defaultSets: 3, defaultReps: 20 },
  { id: 'russian_twist',      name: 'Russian Twist',         muscleGroup: 'Core',      defaultSets: 3, defaultReps: 20 },
  { id: 'beinheben',          name: 'Hängendes Beinheben',   muscleGroup: 'Core',      defaultSets: 3, defaultReps: 12 },
]

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id)
}

export function exerciseByName(name: string): Exercise | undefined {
  return EXERCISES.find(e => e.name === name)
}

export function exerciseName(id: string): string {
  return exerciseById(id)?.name ?? id
}

// ─── Muscle group list ────────────────────────────────────────────────────────

export const MUSCLE_GROUPS = [
  'Alle', 'Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Core',
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]
