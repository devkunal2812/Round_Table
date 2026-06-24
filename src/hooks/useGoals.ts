import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Goal = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']

export function useGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchGoals()
  }, [userId])

  const fetchGoals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setGoals(data ?? [])
    setLoading(false)
  }

  const addGoal = async (goal: Omit<GoalInsert, 'user_id'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: userId })
      .select()
      .single()

    if (error) throw error
    setGoals(prev => [data, ...prev])
    return data
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setGoals(prev => prev.map(g => g.id === id ? data : g))
    return data
  }

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, loading, error, addGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}
