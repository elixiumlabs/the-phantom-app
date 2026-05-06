import { adminClient } from './supabase'

export type ActivityAction =
  | 'user_created'
  | 'project_created'
  | 'project_archived'
  | 'project_deleted'
  | 'phase_completed'
  | 'outreach_logged'
  | 'iteration_logged'
  | 'vault_added'
  | 'ready_to_surface'
  | 'generator_run'
  | 'plan_changed'
  | 'export_generated'

export async function logActivity(args: {
  user_id: string
  project_id?: string | null
  action: ActivityAction
  metadata?: Record<string, unknown>
}): Promise<void> {
  const db = adminClient()
  await db.from('activity_log').insert({
    user_id: args.user_id,
    project_id: args.project_id ?? null,
    action: args.action,
    metadata: args.metadata ?? {},
  })
}
