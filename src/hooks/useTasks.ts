import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchTasks()
  }, [userId])

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setTasks(data ?? [])
    setLoading(false)
  }

  const addTask = async (task: Omit<TaskInsert, 'user_id'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: userId })
      .select()
      .single()

    if (error) throw error
    setTasks(prev => [data, ...prev])
    return data
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask, refetch: fetchTasks }
}
