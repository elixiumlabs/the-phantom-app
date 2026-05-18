const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

function readEnv(path) {
  return Object.fromEntries(
    fs.readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')]
      }),
  )
}

async function main() {
  const uid = process.argv[2]
  if (!uid) throw new Error('Usage: node scripts/ensure-user-profile.cjs <uid>')

  const env = readEnv('.env.local')
  const db = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: authData, error: authError } = await db.auth.admin.getUserById(uid)
  if (authError || !authData.user) throw authError ?? new Error('Auth user not found')

  const email = authData.user.email ?? ''
  const meta = authData.user.user_metadata ?? {}
  const isFounder = email.toLowerCase() === 'brandsbyempress@gmail.com'
  const now = new Date().toISOString()

  const payload = {
    id: uid,
    email,
    full_name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? null,
    plan: isFounder ? 'phantom_pro' : 'free',
    is_admin: isFounder,
    lifetime: isFounder,
    subscription_status: isFounder ? 'lifetime' : null,
    onboarding_completed: false,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: authData.user.created_at ?? now,
    updated_at: now,
  }

  const { data, error } = await db
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) throw error
  console.log(JSON.stringify({ ok: true, id: data.id, email: data.email, onboarding_completed: data.onboarding_completed }))
}

main().catch((error) => {
  console.error(error.message || String(error))
  process.exit(1)
})
