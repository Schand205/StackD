import React, { createContext, useContext, useState } from 'react'
import { defaultTemplatesPerSplit } from '@/data/mockGymData'
import type { Template, Exercise, WorkoutSplit } from '@/types/gym'

// ─── Context Type ─────────────────────────────────────────────────────────────

type GymContextValue = {
  /** Templates for the currently selected split, editable by the user. */
  userTemplates: Template[]
  /** Replace the entire template list (e.g. when switching splits). */
  setUserTemplates: React.Dispatch<React.SetStateAction<Template[]>>
  /** Update the exercise list of a single template (auto-save from editor). */
  updateTemplateExercises: (templateId: string, exercises: Exercise[]) => void
  /** Currently active split — kept here so the editor can read the label. */
  currentSplit: WorkoutSplit
  setCurrentSplit: React.Dispatch<React.SetStateAction<WorkoutSplit>>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GymContext = createContext<GymContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [currentSplit, setCurrentSplit] = useState<WorkoutSplit>('PPL')
  const [userTemplates, setUserTemplates] = useState<Template[]>(
    defaultTemplatesPerSplit['PPL']
  )

  function updateTemplateExercises(templateId: string, exercises: Exercise[]) {
    setUserTemplates(prev =>
      prev.map(t => (t.id === templateId ? { ...t, exercises } : t))
    )
  }

  return (
    <GymContext.Provider
      value={{ userTemplates, setUserTemplates, updateTemplateExercises, currentSplit, setCurrentSplit }}
    >
      {children}
    </GymContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGymContext(): GymContextValue {
  const ctx = useContext(GymContext)
  if (!ctx) throw new Error('useGymContext must be used within GymProvider')
  return ctx
}
