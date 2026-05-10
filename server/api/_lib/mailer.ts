const FROM_EMAIL = 'Phantom <noreply@phantom.app>'

export type TemplateName =
  | 'welcome'
  | 'phase_complete'
  | 'ready_to_surface'
  | 'vault_milestone'
  | 'inactivity_nudge'
  | 'export_ready'

const SHELL = (title: string, body: string) => `<!doctype html>
<html><body style="margin:0;background:#000;color:#fff;font-family:'IBM Plex Mono',ui-monospace,monospace;padding:48px 24px;">
<div style="max-width:560px;margin:0 auto;">
<div style="font-family:'Syne',sans-serif;font-weight:800;font-size:20px;letter-spacing:0.04em;">PHANTOM_</div>
<div style="height:1px;background:#1A1A1A;margin:24px 0;"></div>
<h1 style="font-family:'Syne',sans-serif;font-weight:700;font-size:28px;line-height:1.2;margin:0 0 16px;color:#fff;">${title}</h1>
<div style="font-size:14px;line-height:1.7;color:#cfcfcf;">${body}</div>
<div style="height:1px;background:#1A1A1A;margin:32px 0;"></div>
<div style="font-size:12px;color:#666;">Build it invisible. Launch it inevitable.</div>
</div></body></html>`

interface RenderArgs {
  template: TemplateName
  data: Record<string, unknown>
}

function render({ template, data }: RenderArgs): { subject: string; html: string } {
  switch (template) {
    case 'welcome':
      return {
        subject: 'PHANTOM — your private operating system is live',
        html: SHELL(
          'You are in the phantom phase.',
          `<p>Build it invisible. Test the offer until the proof is undeniable. Then go visible.</p>
           <p>Your first phantom project is ready when you are.</p>`,
        ),
      }
    case 'phase_complete': {
      const phase = String(data.phase ?? '?')
      const next = String(data.next ?? '')
      return {
        subject: `Phase 0${phase} complete`,
        html: SHELL(
          `Phase 0${phase} marked complete.`,
          `<p>${next ? `Next: ${next}` : 'Continue to the next phase when you are ready.'}</p>`,
        ),
      }
    }
    case 'ready_to_surface':
      return {
        subject: 'PHANTOM PHASE COMPLETE — you have proof',
        html: SHELL(
          'You have proof. Now you go visible.',
          `<p>The lock-in checklist is satisfied. Export your Brand Lock-In Guide and prepare to surface.</p>`,
        ),
      }
    case 'vault_milestone': {
      const count = String(data.count ?? '')
      return {
        subject: `Proof vault milestone — ${count} items`,
        html: SHELL(`${count} pieces of proof.`, `<p>Stack quietly. Surface only when the proof is undeniable.</p>`),
      }
    }
    case 'inactivity_nudge': {
      const project = String(data.project_name ?? 'your project')
      return {
        subject: `${project} has been quiet for 7 days`,
        html: SHELL(
          'The phantom does not stall.',
          `<p>"${project}" has not been updated in a week. Pick the smallest next test and run it.</p>`,
        ),
      }
    }
    case 'export_ready':
      return {
        subject: 'Your Brand Lock-In Guide is ready',
        html: SHELL(
          'Brand Lock-In Guide ready.',
          `<p>Your validated positioning, offer, proof, and identity decisions in a single PDF.</p>
           <p><a href="${String(data.url ?? '#')}" style="color:#FF00B8;">Download the guide</a></p>`,
        ),
      }
  }
}

export async function sendMail(to: string, args: RenderArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY not set, skipping email', { to, template: args.template })
    return
  }
  const { subject, html } = render(args)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('Resend send failed', { status: res.status, body: text.slice(0, 400) })
  }
}
