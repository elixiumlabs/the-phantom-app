import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface ActivityEntry {
  id: string
  user_id: string
  project_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: string | null
}

interface ActivityResult {
  entries: ActivityEntry[]
  loading: boolean
  error: Error | null
}

export function useActivity(max = 20): ActivityResult {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || authLoading) return
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    // Initial fetch
    supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(max)
      .then(({ data, error: err }) => {
        if (err) {
          setError(new Error(err.message))
        } else {
          setEntries((data ?? []) as ActivityEntry[])
        }
        setLoading(false)
      })

    // Realtime subscription for new entries
    const channel = supabase
      .channel(`activity-log-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setEntries((prev) => [payload.new as ActivityEntry, ...prev].slice(0, max))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, authLoading, max])

  return { entries, loading, error }
}
