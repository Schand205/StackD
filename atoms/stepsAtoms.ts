import { atom } from 'jotai'
import { mockStats } from '@/constants/mockData'

export const stepsGoalAtom = atom(mockStats.steps.goal)
