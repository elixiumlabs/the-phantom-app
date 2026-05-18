import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function adminClient() {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured. Set SUPABASE_URL or VITE_SUPABASE_URL for server API routes.')
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Server API routes need a service role key.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type Plan = 'free' | 'phantom' | 'phantom_pro'
