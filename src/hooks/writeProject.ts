import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type PhaseDoc = 'ghost_identity' | 'silent_test' | 'iteration_loop' | 'lock_in'

/**
 * Merge-write to a phase subdoc. The Firestore rules allow user writes here;
 * server-only fields (phase_*_completed, ready_to_surface, AI output) live
 * elsewhere and are not affected.
 */
export async function patchPhaseDoc(
  projectId: string,
  phase: PhaseDoc,
  data: DocumentData,
): Promise<void> {
  const ref = doc(db, 'projects', projectId, phase, 'main')
  await setDoc(ref, { ...data, updated_at: serverTimestamp() }, { merge: true })
}

/**
 * Update top-level project fields the client is allowed to set
 * (name, status). Phase flags + ready_to_surface are rejected by rules.
 */
export async function patchProject(projectId: string, data: DocumentData): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), { ...data, updated_at: serverTimestamp() })
}

export async function addOutreachEntry(
  projectId: string,
  entry: {
    date: string
    platform: string
    outreach_type: 'cold_dm' | 'email' | 'community_post' | 'ad' | 'other'
    identifier: string
    responded: boolean | null
    converted: boolean | null
    objection: string
    notes: string
  },
): Promise<string> {
  const ref = await addDoc(collection(db, 'projects', projectId, 'outreach_log'), {
    project_id: projectId,
    ...entry,
    created_at: serverTimestamp(),
  })
  return ref.id
}

export async function updateOutreachEntry(
  projectId: string,
  entryId: string,
  data: DocumentData,
): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId, 'outreach_log', entryId), data)
}

export async function deleteOutreachEntry(projectId: string, entryId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId, 'outreach_log', entryId))
}

export async function addIterationVersion(
  projectId: string,
  data: {
    date: string
    what_changed: string
    single_variable: boolean
    result: string
    new_conversion_rate: number | null
  },
): Promise<string> {
  // version_number is server-stamped by the iterationTriggers function.
  const ref = await addDoc(collection(db, 'projects', projectId, 'iteration_versions'), {
    project_id: projectId,
    ...data,
    created_at: serverTimestamp(),
  })
  return ref.id
}
