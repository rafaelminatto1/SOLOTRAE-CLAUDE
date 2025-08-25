import { useEffect, useState } from 'react'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import { useAuthStore } from '../stores/authStore'
import type { ExerciseProgress } from '@shared/types'

interface ProgressEntry {
  id: string
  patient_id: string
  exercise_id: string
  treatment_plan_id?: string
  sets_completed: number
  reps_completed: number
  duration_minutes?: number
  difficulty_rating: number
  pain_level: number
  notes?: string
  completed_at: string
  created_at: string
}

interface UseRealtimeProgressOptions {
  patientId?: string
  exerciseId?: string
  treatmentPlanId?: string
  enabled?: boolean
}

export function useRealtimeProgress({
  patientId,
  exerciseId,
  treatmentPlanId,
  enabled = true
}: UseRealtimeProgressOptions = {}) {
  const { user } = useAuthStore()
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [latestEntry, setLatestEntry] = useState<ProgressEntry | null>(null)

  // Build filter based on options and user role
  const buildFilter = () => {
    const filters: string[] = []
    
    // If user is a patient, only show their own progress
    if (user?.role === 'patient') {
      filters.push(`patient_id=eq.${user.id}`)
    } else if (patientId) {
      filters.push(`patient_id=eq.${patientId}`)
    }
    
    if (exerciseId) {
      filters.push(`exercise_id=eq.${exerciseId}`)
    }
    
    if (treatmentPlanId) {
      filters.push(`treatment_plan_id=eq.${treatmentPlanId}`)
    }
    
    return filters.length > 0 ? filters.join(',') : undefined
  }

  // Handle new progress entry
  const handleNewProgress = (payload: any) => {
    const newEntry = payload.new as ProgressEntry
    
    setProgressEntries(prev => [newEntry, ...prev])
    setLatestEntry(newEntry)
    
    console.log('New progress entry:', newEntry)
  }

  // Handle progress update
  const handleProgressUpdate = (payload: any) => {
    const updatedEntry = payload.new as ProgressEntry
    
    setProgressEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    )
    
    // Update latest entry if it's the same one
    setLatestEntry(prev => 
      prev?.id === updatedEntry.id ? updatedEntry : prev
    )
    
    console.log('Progress entry updated:', updatedEntry)
  }

  // Handle progress deletion
  const handleProgressDelete = (payload: any) => {
    const deletedEntry = payload.old as ProgressEntry
    
    setProgressEntries(prev => 
      prev.filter(entry => entry.id !== deletedEntry.id)
    )
    
    // Clear latest entry if it was deleted
    setLatestEntry(prev => 
      prev?.id === deletedEntry.id ? null : prev
    )
    
    console.log('Progress entry deleted:', deletedEntry.id)
  }

  // Subscribe to progress changes
  useRealtimeSubscription({
    table: 'exercise_progress',
    filter: buildFilter(),
    onInsert: handleNewProgress,
    onUpdate: handleProgressUpdate,
    onDelete: handleProgressDelete,
    enabled: enabled && !!user
  })

  // Reset state when dependencies change
  useEffect(() => {
    setProgressEntries([])
    setLatestEntry(null)
  }, [patientId, exerciseId, treatmentPlanId, user?.id])

  return {
    progressEntries,
    latestEntry,
    setProgressEntries,
    setLatestEntry
  }
}