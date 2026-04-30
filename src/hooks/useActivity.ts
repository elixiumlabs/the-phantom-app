import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where, type DocumentData } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type { Timestamp } from 'firebase/firestore'

export interface ActivityEntry {
  id: string
  user_id: string
  project_id: string | null
  action: string
  metadata: Record<string, unknown>
  created_at: Timestamp | null
}

interface ActivityResult {
  entries: ActivityEntry[]
  loading: boolean
  error: Error | null
}

/**
 * Live activity feed for the signed-in user, newest first, capped.
 */
export function useActivity(max = 20): ActivityResult {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || authLoading) return
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'activity_log'),
      where('user_id', '==', user.id),
      orderBy('created_at', 'desc'),
      limit(max),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(
          snap.docs.map((d) => {
            const data = d.data() as DocumentData
            return {
              id: d.id,
              user_id: data.user_id,
              project_id: data.project_id ?? null,
              action: data.action,
              metadata: data.metadata ?? {},
              created_at: data.created_at ?? null,
            }
          }),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[phantom] useActivity listener error:', err)
        setError(err)
        setLoading(false)
      },
    )

    return unsub
  }, [user, authLoading, max])

  return { entries, loading, error }
}
