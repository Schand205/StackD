import type { DayLog, SetLog } from '@/types/gym'

/**
 * Returns the SetLog[] for a given exercise from the most recent DayLog
 * that (a) is before `today`, (b) matches `templateId`, and (c) contains
 * at least one set for that exercise.
 */
export function getLastSessionSets(
  exerciseId: string,
  templateId: string,
  allLogs: DayLog[],
  today: string,
): SetLog[] {
  const previous = allLogs
    .filter(log =>
      log.date < today &&
      log.templateId === templateId &&
      log.exercises.some(e => e.exerciseId === exerciseId)
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!previous) return []

  return previous.exercises
    .find(e => e.exerciseId === exerciseId)?.sets ?? []
}
