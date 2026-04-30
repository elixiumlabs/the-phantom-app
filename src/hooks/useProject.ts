import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type {
  GhostIdentity,
  IterationLoop,
  IterationVersion,
  LockIn,
  OutreachEntry,
  Project,
  SilentTest,
} from './types'

interface ProjectBundle {
  project: Project | null
  ghostIdentity: GhostIdentity | null
  silentTest: SilentTest | null
  iterationLoop: IterationLoop | null
  lockIn: LockIn | null
  outreach: OutreachEntry[]
  iterations: IterationVersion[]
  loading: boolean
  notFound: boolean
  error: Error | null
}

const empty: ProjectBundle = {
  project: null,
  ghostIdentity: null,
  silentTest: null,
  iterationLoop: null,
  lockIn: null,
  outreach: [],
  iterations: [],
  loading: true,
  notFound: false,
  error: null,
}

/**
 * Live snapshot of one project + every phase subdoc + outreach + iteration log.
 * Spawns 7 listeners; tears them down on unmount or when projectId changes.
 *
 * Reads are gated by Firestore rules (user_id ownership), so an unauthorized
 * listener fails with permission-denied which we surface as `notFound`.
 */
export function useProject(projectId: string | undefined): ProjectBundle {
  const [bundle, setBundle] = useState<ProjectBundle>(empty)

  useEffect(() => {
    if (!isFirebaseConfigured || !projectId) {
      setBundle({ ...empty, loading: false })
      return
    }

    const unsubs: Unsubscribe[] = []

    let projectLoaded = false
    const markProjectLoaded = () => {
      projectLoaded = true
      setBundle((prev) => ({ ...prev, loading: false }))
    }

    // Project doc
    unsubs.push(
      onSnapshot(
        doc(db, 'projects', projectId),
        (snap) => {
          if (!snap.exists()) {
            setBundle({ ...empty, loading: false, notFound: true })
            return
          }
          const d = snap.data() as DocumentData
          setBundle((prev) => ({
            ...prev,
            project: {
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
            },
            notFound: false,
          }))
          if (!projectLoaded) markProjectLoaded()
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[phantom] project listener error:', err)
          setBundle((prev) => ({ ...prev, error: err, loading: false, notFound: err.code === 'permission-denied' }))
        },
      ),
    )

    // Phase subdocs (each lives at /projects/{id}/{phase}/main)
    const phaseListener = <T,>(coll: string, key: keyof ProjectBundle) => {
      unsubs.push(
        onSnapshot(
          doc(db, 'projects', projectId, coll, 'main'),
          (snap) => {
            setBundle((prev) => ({
              ...prev,
              [key]: snap.exists() ? (snap.data() as T) : null,
            }))
          },
          (err) => {
            // eslint-disable-next-line no-console
            console.error(`[phantom] ${coll} listener error:`, err)
          },
        ),
      )
    }
    phaseListener<GhostIdentity>('ghost_identity', 'ghostIdentity')
    phaseListener<SilentTest>('silent_test', 'silentTest')
    phaseListener<IterationLoop>('iteration_loop', 'iterationLoop')
    phaseListener<LockIn>('lock_in', 'lockIn')

    // Outreach log
    unsubs.push(
      onSnapshot(
        query(collection(db, 'projects', projectId, 'outreach_log'), orderBy('created_at', 'desc')),
        (snap) => {
          setBundle((prev) => ({
            ...prev,
            outreach: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OutreachEntry, 'id'>) })),
          }))
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[phantom] outreach listener error:', err)
        },
      ),
    )

    // Iteration versions
    unsubs.push(
      onSnapshot(
        query(collection(db, 'projects', projectId, 'iteration_versions'), orderBy('version_number', 'desc')),
        (snap) => {
          setBundle((prev) => ({
            ...prev,
            iterations: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<IterationVersion, 'id'>) })),
          }))
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error('[phantom] iterations listener error:', err)
        },
      ),
    )

    return () => unsubs.forEach((u) => u())
  }, [projectId])

  return bundle
}
