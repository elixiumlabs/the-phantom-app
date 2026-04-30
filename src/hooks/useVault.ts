import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type { ProofVaultItem } from './types'

interface VaultResult {
  items: ProofVaultItem[]
  loading: boolean
  error: Error | null
}

/**
 * Live proof vault items. If projectId is given, scope to that project.
 * Otherwise return everything the user owns.
 */
export function useVault(projectId?: string | null): VaultResult {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<ProofVaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured || authLoading) return
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    const base = collection(db, 'proof_vault')
    const q = projectId
      ? query(base, where('user_id', '==', user.id), where('project_id', '==', projectId), orderBy('created_at', 'desc'))
      : query(base, where('user_id', '==', user.id), orderBy('created_at', 'desc'))

    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => {
            const data = d.data() as DocumentData
            return {
              id: d.id,
              user_id: data.user_id,
              project_id: data.project_id ?? null,
              proof_type: data.proof_type,
              title: data.title ?? '',
              content: data.content ?? '',
              file_url: data.file_url,
              storage_path: data.storage_path,
              amount: data.amount,
              source: data.source,
              date: data.date,
              tags: data.tags ?? [],
              created_at: data.created_at ?? null,
            }
          }),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('[phantom] useVault listener error:', err)
        setError(err)
        setLoading(false)
      },
    )

    return unsub
  }, [user, authLoading, projectId])

  return { items, loading, error }
}
