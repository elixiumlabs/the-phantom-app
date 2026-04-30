export { useProjects } from './useProjects'
export { useProject } from './useProject'
export { useVault } from './useVault'
export { useActivity } from './useActivity'
export {
  patchPhaseDoc,
  patchProject,
  addOutreachEntry,
  updateOutreachEntry,
  deleteOutreachEntry,
  addIterationVersion,
} from './writeProject'
export type {
  Project,
  GhostIdentity,
  SilentTest,
  IterationLoop,
  LockIn,
  OutreachEntry,
  IterationVersion,
  ProofVaultItem,
  ActivityEntry,
} from './types'
