import type { VercelRequest, VercelResponse } from '@vercel/node'

type Handler = (req: VercelRequest, res: VercelResponse) => unknown | Promise<unknown>

const routes: Record<string, () => Promise<{ default: Handler }>> = {
  'admin/onboarding-responses': () => import('../server/api/admin/onboarding-responses'),
  'automations/admin-grant': () => import('../server/api/automations/admin-grant'),
  'automations/bootstrap-user': () => import('../server/api/automations/bootstrap-user'),
  'automations/complete-onboarding': () => import('../server/api/automations/complete-onboarding'),
  'automations/complete-phase': () => import('../server/api/automations/complete-phase'),
  'automations/create-project': () => import('../server/api/automations/create-project'),
  'automations/delete-account': () => import('../server/api/automations/delete-account'),
  'automations/delete-project': () => import('../server/api/automations/delete-project'),
  'automations/generate-webhook-key': () => import('../server/api/automations/generate-webhook-key'),
  'automations/skip-onboarding': () => import('../server/api/automations/skip-onboarding'),
  'billing/create-checkout': () => import('../server/api/billing/create-checkout'),
  'billing/create-portal': () => import('../server/api/billing/create-portal'),
  'billing/stripe-webhook': () => import('../server/api/billing/stripe-webhook'),
  'generators/build-minimum-offer': () => import('../server/api/generators/build-minimum-offer'),
  'generators/build-objection-library': () => import('../server/api/generators/build-objection-library'),
  'generators/extract-audience-language': () => import('../server/api/generators/extract-audience-language'),
  'generators/extract-unfair-advantages': () => import('../server/api/generators/extract-unfair-advantages'),
  'generators/find-where-to-test': () => import('../server/api/generators/find-where-to-test'),
  'generators/generate-outreach': () => import('../server/api/generators/generate-outreach'),
  'generators/refine-problem-statement': () => import('../server/api/generators/refine-problem-statement'),
  'generators/synthesize-positioning': () => import('../server/api/generators/synthesize-positioning'),
  'integrations/auth-url': () => import('../server/api/integrations/auth-url'),
  'integrations/disconnect': () => import('../server/api/integrations/disconnect'),
  'integrations/list': () => import('../server/api/integrations/list'),
  'storage/proof-finalize': () => import('../server/api/storage/proof-finalize'),
  'storage/proof-upload-url': () => import('../server/api/storage/proof-upload-url'),
  'webhooks/proof': () => import('../server/api/webhooks/proof'),
}

function routeKey(req: VercelRequest): string {
  const rawPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path
  if (rawPath) return rawPath.replace(/^\/+|\/+$/g, '')

  const url = new URL(req.url ?? '/', 'https://local.invalid')
  return url.pathname.replace(/^\/api\/?/, '').replace(/^\/+|\/+$/g, '')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = routeKey(req)
  const load = routes[key]

  if (!load) {
    return res.status(404).json({ error: `API route not found: ${key}` })
  }

  const mod = await load()
  return mod.default(req, res)
}
