import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type Space = Database['public']['Tables']['spaces']['Row']
type SpaceInsert = Database['public']['Tables']['spaces']['Insert']

export function useSpaces(userId: string | undefined) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchSpaces()
  }, [userId])

  const fetchSpaces = async () => {
    setLoading(true)
    // Get spaces where user is owner or member
    const { data, error } = await supabase
      .from('spaces')
      .select(`
        *,
        space_members!inner(user_id)
      `)
      .eq('space_members.user_id', userId!)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setSpaces(data ?? [])
    setLoading(false)
  }

  const createSpace = async (space: Omit<SpaceInsert, 'owner_id' | 'invite_code'>) => {
    if (!userId) return
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from('spaces')
      .insert({ ...space, owner_id: userId, invite_code: inviteCode })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    await supabase.from('space_members').insert({
      space_id: data.id,
      user_id: userId,
      role: 'admin',
    })

    setSpaces(prev => [data, ...prev])
    return data
  }

  const joinSpace = async (inviteCode: string) => {
    if (!userId) return
    const { data: space, error: findError } = await supabase
      .from('spaces')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (findError || !space) throw new Error('Space not found. Check your invite code.')

    const { error } = await supabase.from('space_members').insert({
      space_id: space.id,
      user_id: userId,
      role: 'member',
    })

    if (error) {
      if (error.code === '23505') throw new Error('You are already a member of this space.')
      throw error
    }

    setSpaces(prev => [space, ...prev])
    return space
  }

  return { spaces, loading, error, createSpace, joinSpace, refetch: fetchSpaces }
}
