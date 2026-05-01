import { createCheckoutSession, createBillingPortalSession } from '@/lib/functions'

export type Cadence = 'monthly' | 'annual'
export type Tier = 'phantom' | 'phantom_pro'

interface PriceMap {
  phantom: { monthly: string; annual: string }
  phantom_pro: { monthly: string; annual: string }
}

const PRICE_IDS: PriceMap = {
  phantom: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PHANTOM_MONTHLY ?? '',
    annual: import.meta.env.VITE_STRIPE_PRICE_PHANTOM_ANNUAL ?? '',
  },
  phantom_pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY ?? '',
    annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL ?? '',
  },
}

export function getPriceId(tier: Tier, cadence: Cadence): string | null {
  return PRICE_IDS[tier][cadence] || null
}

export async function startCheckout(tier: Tier, cadence: Cadence): Promise<void> {
  const priceId = getPriceId(tier, cadence)
  if (!priceId) {
    throw new Error(
      'Stripe price IDs are not configured. Set VITE_STRIPE_PRICE_* in .env.local and restart.',
    )
  }
  const { url } = await createCheckoutSession({ price_id: priceId })
  if (!url) throw new Error('Stripe did not return a checkout URL.')
  window.location.assign(url)
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await createBillingPortalSession({})
  if (!url) throw new Error('Stripe did not return a billing portal URL.')
  window.location.assign(url)
}
