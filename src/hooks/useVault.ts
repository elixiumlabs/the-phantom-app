import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { ProofVaultItem } from '@/contexts/ProjectContext'

interface VaultResult {
  items: ProofVaultItem[]
  loading: boolean
  error: Error | null
}

export function useVault(projectId?: string | null): VaultResult {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<ProofVaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || authLoading) return
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    const channelKey = projectId ? `vault-project-${projectId}` : `vault-user-${user.id}`

    // Initial fetch
    const query = supabase
      .from('proof_vault')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (projectId) query.eq('project_id', projectId)

    query.then(({ data, error: err }) => {
      if (err) {
        setError(new Error(err.message))
      } else {
        setItems((data ?? []) as ProofVaultItem[])
      }
      setLoading(false)
    })

    // Realtime: watch inserts, updates, deletes for this user's vault
    const filter = projectId
      ? `user_id=eq.${user.id},project_id=eq.${projectId}`
      : `user_id=eq.${user.id}`

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'proof_vault', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const item = payload.new as ProofVaultItem
          if (projectId && item.project_id !== projectId) return
          setItems((prev) => [item, ...prev])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'proof_vault', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as ProofVaultItem
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'proof_vault', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => prev.filter((i) => i.id !== (payload.old as { id: string }).id))
        },
      )
      .subscribe()

    void filter // used conceptually above; suppress unused warning

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, authLoading, projectId])

  return { items, loading, error }
}
