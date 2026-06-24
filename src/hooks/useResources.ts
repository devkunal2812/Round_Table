import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Resource = Database['public']['Tables']['resources']['Row']
type ResourceInsert = Database['public']['Tables']['resources']['Insert']

export function useResources(userId: string | undefined) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('resources')
      .select('*, profiles(full_name, username)')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setResources((data as any) ?? [])
    setLoading(false)
  }

  const addResource = async (resource: Omit<ResourceInsert, 'user_id'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('resources')
      .insert({ ...resource, user_id: userId })
      .select()
      .single()

    if (error) throw error
    setResources(prev => [data, ...prev])
    return data
  }

  const likeResource = async (id: string, currentLikes: number) => {
    const { data, error } = await supabase
      .from('resources')
      .update({ likes: currentLikes + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setResources(prev => prev.map(r => r.id === id ? data : r))
  }

  const deleteResource = async (id: string) => {
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) throw error
    setResources(prev => prev.filter(r => r.id !== id))
  }

  return { resources, loading, error, addResource, likeResource, deleteResource, refetch: fetchResources }
}
