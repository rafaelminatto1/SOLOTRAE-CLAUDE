import { useEffect, useState } from 'react'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'
// TreatmentPlan interface is defined locally below

interface TreatmentPlan {
  id: string
  patient_id: string
  physiotherapist_id: string
  title: string
  description?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

interface UseRealtimeTreatmentPlansOptions {
  patientId?: string
  physiotherapistId?: string
  enabled?: boolean
}

export function useRealtimeTreatmentPlans({
  patientId,
  physiotherapistId,
  enabled = true
}: UseRealtimeTreatmentPlansOptions = {}) {
  const { user } = useAuthStore()
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
  const [activePlans, setActivePlans] = useState<TreatmentPlan[]>([])

  // Build filter based on options and user role
  const buildFilter = () => {
    const filters: string[] = []
    
    // Filter based on user role
    if (user?.role === 'patient') {
      filters.push(`patient_id=eq.${user.id}`)
    } else if (user?.role === 'physiotherapist') {
      filters.push(`physiotherapist_id=eq.${user.id}`)
    } else {
      // Admin can see all, but apply specific filters if provided
      if (patientId) {
        filters.push(`patient_id=eq.${patientId}`)
      }
      if (physiotherapistId) {
        filters.push(`physiotherapist_id=eq.${physiotherapistId}`)
      }
    }
    
    return filters.length > 0 ? filters.join(',') : undefined
  }

  // Handle new treatment plan
  const handleNewTreatmentPlan = (payload: any) => {
    const newPlan = payload.new as TreatmentPlan
    
    setTreatmentPlans(prev => [newPlan, ...prev])
    
    if (newPlan.status === 'active') {
      setActivePlans(prev => [newPlan, ...prev])
    }
    
    // Show notification for relevant users
    if (user?.role === 'patient' && newPlan.patient_id === user.id) {
      toast.success('Novo Plano de Tratamento', {
        description: `Um novo plano "${newPlan.title}" foi criado para você.`,
        duration: 5000,
      })
    } else if (user?.role === 'physiotherapist' && newPlan.physiotherapist_id === user.id) {
      toast.info('Plano Criado', {
        description: `Plano "${newPlan.title}" foi criado com sucesso.`,
        duration: 3000,
      })
    }
    
    console.log('New treatment plan:', newPlan)
  }

  // Handle treatment plan update
  const handleTreatmentPlanUpdate = (payload: any) => {
    const updatedPlan = payload.new as TreatmentPlan
    const oldPlan = payload.old as TreatmentPlan
    
    setTreatmentPlans(prev => 
      prev.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    )
    
    // Update active plans list
    setActivePlans(prev => {
      const filtered = prev.filter(plan => plan.id !== updatedPlan.id)
      return updatedPlan.status === 'active' 
        ? [updatedPlan, ...filtered]
        : filtered
    })
    
    // Show notification for status changes
    if (oldPlan.status !== updatedPlan.status) {
      const statusMessages = {
        active: 'ativado',
        completed: 'concluído',
        paused: 'pausado',
        cancelled: 'cancelado'
      }
      
      if (user?.role === 'patient' && updatedPlan.patient_id === user.id) {
        toast.info('Status do Plano Atualizado', {
          description: `Seu plano "${updatedPlan.title}" foi ${statusMessages[updatedPlan.status]}.`,
          duration: 4000,
        })
      }
    }
    
    console.log('Treatment plan updated:', updatedPlan)
  }

  // Handle treatment plan deletion
  const handleTreatmentPlanDelete = (payload: any) => {
    const deletedPlan = payload.old as TreatmentPlan
    
    setTreatmentPlans(prev => 
      prev.filter(plan => plan.id !== deletedPlan.id)
    )
    
    setActivePlans(prev => 
      prev.filter(plan => plan.id !== deletedPlan.id)
    )
    
    // Show notification
    if (user?.role === 'patient' && deletedPlan.patient_id === user.id) {
      toast.warning('Plano Removido', {
        description: `O plano "${deletedPlan.title}" foi removido.`,
        duration: 4000,
      })
    }
    
    console.log('Treatment plan deleted:', deletedPlan.id)
  }

  // Subscribe to treatment plan changes
  useRealtimeSubscription({
    table: 'treatment_plans',
    filter: buildFilter(),
    onInsert: handleNewTreatmentPlan,
    onUpdate: handleTreatmentPlanUpdate,
    onDelete: handleTreatmentPlanDelete,
    enabled: enabled && !!user
  })

  // Reset state when dependencies change
  useEffect(() => {
    setTreatmentPlans([])
    setActivePlans([])
  }, [patientId, physiotherapistId, user?.id])

  return {
    treatmentPlans,
    activePlans,
    setTreatmentPlans,
    setActivePlans
  }
}