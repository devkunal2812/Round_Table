import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Project = Database['public']['Tables']['showcase_projects']['Row']
type ProjectInsert = Database['public']['Tables']['showcase_projects']['Insert']

export function useShowcase() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('showcase_projects')
      .select('*, profiles(full_name, username, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setProjects((data as any) ?? [])
    setLoading(false)
  }

  const addProject = async (project: Omit<ProjectInsert, 'user_id'>, userId: string) => {
    const { data, error } = await supabase
      .from('showcase_projects')
      .insert({ ...project, user_id: userId })
      .select()
      .single()

    if (error) throw error
    setProjects(prev => [data, ...prev])
    return data
  }

  const likeProject = async (id: string, currentLikes: number) => {
    const { data, error } = await supabase
      .from('showcase_projects')
      .update({ likes: currentLikes + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setProjects(prev => prev.map(p => p.id === id ? data : p))
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('showcase_projects').delete().eq('id', id)
    if (error) throw error
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return { projects, loading, error, addProject, likeProject, deleteProject, refetch: fetchProjects }
}
