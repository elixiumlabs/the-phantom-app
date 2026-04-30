import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type { Project } from './types'

function shape(snap: QueryDocumentSnapshot<DocumentData>): Project {
  const d = snap.data()
  return {
    id: snap.id,
    user_id: d.user_id,
    name: d.name ?? 'Untitled',
    status: d.status ?? 'active',
    current_phase: (d.current_phase ?? 1) as 1 | 2 | 3 | 4,
    phase_1_completed: !!d.phase_1_completed,
    phase_2_completed: !!d.phase_2_completed,
    phase_3_completed: !!d.phase_3_completed,
    phase_4_completed: !!d.phase_4_completed,
    ready_to_surface: !!d.ready_to_surface,
    created_at: d.created_at ?? null,
    updated_at: d.updated_at ?? null,
  }
}

/**
 * Live list of all projects the signed-in user owns.
 * Sorted by updated_at desc on the client (the index for status+updated_at
 * doesn't include user_id, so we filter by user_id and sort locally).
 */
export function useProjects(): { projects: Project[]; loading: boolean; error: Error | null } {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || authLoading) return
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'projects'),
      where('user_id', '==', user.id),
      orderBy('updated_at', 'desc'),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        setProjects(snap.docs.map(shape))
        setLoading(false)
        setError(null)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[phantom] useProjects listener error:', err)
        setError(err)
        setLoading(false)
      },
    )

    return unsub
  }, [user, authLoading])

  return { projects, loading, error }
}
