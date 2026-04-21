import { mockProfil } from '@/constants/mockData'

type GoalKind = 'bulk' | 'cut' | 'maintain'

function resolveGoalKind(goalType: string): GoalKind {
  const lower = goalType.toLowerCase()
  if (lower.includes('cut'))      return 'cut'
  if (lower.includes('bulk'))     return 'bulk'
  return 'maintain'
}

export const getGoalContext = () => {
  const kind = resolveGoalKind(mockProfil.goal.type)

  return {
    weightDirection: kind === 'cut' ? 'down' : 'up' as 'up' | 'down',

    isPositive: (change: number): boolean => {
      if (kind === 'cut')  return change < 0
      if (kind === 'bulk') return change > 0
      return Math.abs(change) < 0.2
    },

    goalLabel: kind === 'cut' ? 'Cut' : kind === 'bulk' ? 'Lean Bulk' : 'Maintain',

    goalSlope: (kind === 'cut' ? 'down' : 'up') as 'up' | 'down',
  }
}
