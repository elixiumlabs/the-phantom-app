import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { defineSecret } from 'firebase-functions/params'
import { gate, requirePlan, validate, meterUsage } from '../lib/guards'
import { loadOwnedProject } from '../lib/projectAccess'
import { logActivity } from '../lib/activity'
import { sendMail, RESEND_API_KEY } from '../lib/mailer'

export const PUPPETEER_EXEC_PATH = defineSecret('PUPPETEER_EXEC_PATH')

const Input = z.object({ project_id: z.string().min(1) })

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderHtml(args: {
  project: FirebaseFirestore.DocumentData
  ghost: FirebaseFirestore.DocumentData
  silent: FirebaseFirestore.DocumentData
  iteration: FirebaseFirestore.DocumentData
  lock: FirebaseFirestore.DocumentData
  versions: FirebaseFirestore.DocumentData[]
  proof: FirebaseFirestore.DocumentData[]
}): string {
  const { project, ghost, silent, iteration, lock, versions, proof } = args
  const date = new Date().toISOString().slice(0, 10)
  const objections = (silent.summary?.top_objection as string | undefined) ?? '—'

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
@page { size: Letter; margin: 24mm 18mm; }
body { background: #000; color: #fff; font-family: 'IBM Plex Mono', monospace; font-size: 11px; line-height: 1.7; }
h1, h2, h3 { font-family: 'Syne', sans-serif; font-weight: 700; color: #fff; }
h1 { font-size: 38px; letter-spacing: -0.02em; margin: 0 0 8px; }
h2 { font-size: 22px; margin: 32px 0 12px; color: #FF00B8; }
h3 { font-size: 14px; margin: 20px 0 6px; color: #fff; }
.cover { padding: 30vh 0; text-align: left; page-break-after: always; }
.tag { font-size: 10px; letter-spacing: 0.2em; color: #FF00B8; text-transform: uppercase; }
.muted { color: #888; }
.section { page-break-inside: avoid; margin-bottom: 28px; }
.box { border: 1px solid #1A1A1A; padding: 16px; background: #0A0A0A; }
ul { padding-left: 16px; margin: 6px 0; }
.foot { position: fixed; bottom: 8mm; left: 18mm; right: 18mm; font-size: 9px; color: #444; display: flex; justify-content: space-between; }
.brand { font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: 0.04em; }
</style></head>
<body>
<div class="cover">
  <div class="tag">PHANTOM BRAND LOCK-IN GUIDE</div>
  <h1>${escapeHtml(lock.final_brand_name || project.name)}</h1>
  <div class="muted">${escapeHtml(date)}</div>
</div>

<div class="section">
  <h2>Validated Positioning</h2>
  <div class="box">${escapeHtml(lock.generated_positioning || ghost.positioning_statement || '')}</div>
</div>

<div class="section">
  <h2>The Problem (Buyer Language)</h2>
  <p>${escapeHtml(lock.buyer_problem_language || ghost.problem_statement || '')}</p>
</div>

<div class="section">
  <h2>Minimum Offer (Final)</h2>
  <h3>${escapeHtml(silent.offer_name || '—')}</h3>
  <p class="muted">${escapeHtml(silent.offer_type || '')} · ${escapeHtml(silent.delivery_method || '')}</p>
  <p>${escapeHtml(silent.offer_outcome || '')}</p>
  <ul>${(silent.offer_includes ?? []).map((i: string) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
  <p><strong>Price:</strong> ${escapeHtml(String(silent.offer_price ?? '—'))} ${escapeHtml(silent.offer_currency ?? '')}</p>
</div>

<div class="section">
  <h2>Proof Summary</h2>
  ${proof.length === 0 ? '<p class="muted">No proof attached to this project.</p>' : proof
    .map(
      (p) => `<div class="box" style="margin-bottom:10px;">
        <div class="tag">${escapeHtml(p.proof_type)}</div>
        <h3 style="margin-top:6px;">${escapeHtml(p.title || '')}</h3>
        <p>${escapeHtml((p.content || '').slice(0, 600))}</p>
        ${p.amount ? `<p class="muted">Amount: ${escapeHtml(String(p.amount))}</p>` : ''}
      </div>`,
    )
    .join('')}
</div>

<div class="section">
  <h2>Brand Identity</h2>
  <p><strong>Name:</strong> ${escapeHtml(lock.final_brand_name || '—')}</p>
  <p><strong>Visual direction:</strong> ${escapeHtml(lock.visual_direction || '—')}</p>
  <p><strong>Voice:</strong> ${(lock.final_voice_adjectives ?? []).map((v: string) => escapeHtml(v)).join(' · ')}</p>
</div>

<div class="section">
  <h2>Iteration History</h2>
  ${versions.length === 0 ? '<p class="muted">No iterations logged.</p>' : versions
    .sort((a, b) => (a.version_number ?? 0) - (b.version_number ?? 0))
    .map(
      (v) => `<div style="margin-bottom:10px;">
        <h3>v${escapeHtml(String(v.version_number ?? '?'))} · ${escapeHtml(v.date ?? '')}</h3>
        <p><strong>Changed:</strong> ${escapeHtml(v.what_changed ?? '')}</p>
        <p><strong>Result:</strong> ${escapeHtml(v.result ?? '')}</p>
        <p class="muted">Conversion after change: ${escapeHtml(String(v.new_conversion_rate ?? '—'))}</p>
      </div>`,
    )
    .join('')}
</div>

<div class="section">
  <h2>Objections Map</h2>
  <p>Most common objection: ${escapeHtml(objections)}</p>
  <p>${escapeHtml(iteration.private_notes ?? '')}</p>
</div>

<div class="section">
  <h2>Who This Is NOT For</h2>
  <p>${escapeHtml(lock.not_for ?? '')}</p>
</div>

<div class="section">
  <h2>Lock-In Checklist</h2>
  <ul>${Object.entries(lock.checklist ?? {})
    .map(([k, v]) => `<li>[${v ? 'x' : ' '}] ${escapeHtml(k)}</li>`)
    .join('')}</ul>
</div>

<div class="foot"><span class="brand">PHANTOM_</span><span>${escapeHtml(date)}</span></div>
</body></html>`
}

/**
 * Render the Brand Lock-In Guide PDF and upload to Storage.
 * Returns a signed URL valid for 7 days. Best-effort emails the user too.
 *
 * Requires `puppeteer` (with Chromium) at runtime. The function bumps memory
 * to 1GiB. If launching Chromium fails, fall back to returning the HTML so
 * the client can render-to-PDF browser-side.
 */
export const exportLockInPdf = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 120,
    secrets: [PUPPETEER_EXEC_PATH, RESEND_API_KEY],
    cors: [
      /localhost:\d+$/,
      'https://the-phantom-app-io.web.app',
      'https://the-phantom-app-io.firebaseapp.com',
      'https://the-phantom-app.vercel.app'
    ]
  },
  async (req): Promise<{ url: string; storage_path: string } | { html: string; fallback: true }> => {
    const uid = await gate(req)
    await requirePlan(uid, ['phantom', 'phantom_pro']) // PRD §05: paid tier
    await meterUsage(uid, 'exportLockInPdf', 5)
    const { project_id } = validate(Input, req.data)
    const { ref, data: project } = await loadOwnedProject(uid, project_id)

    if (!project.phase_4_completed && !project.ready_to_surface) {
      throw new HttpsError(
        'failed-precondition',
        'Lock-In guide can only be exported after phase 4 is complete or the project is ready to surface',
      )
    }

    const [ghostS, silentS, iterS, lockS, versionsS, proofS] = await Promise.all([
      ref.collection('ghost_identity').doc('main').get(),
      ref.collection('silent_test').doc('main').get(),
      ref.collection('iteration_loop').doc('main').get(),
      ref.collection('lock_in').doc('main').get(),
      ref.collection('iteration_versions').get(),
      admin.firestore().collection('proof_vault').where('project_id', '==', project_id).get(),
    ])

    const html = renderHtml({
      project,
      ghost: ghostS.data() ?? {},
      silent: silentS.data() ?? {},
      iteration: iterS.data() ?? {},
      lock: lockS.data() ?? {},
      versions: versionsS.docs.map((d) => d.data()).filter((v) => v.version_number),
      proof: proofS.docs.map((d) => ({ id: d.id, ...d.data() })),
    })

    let pdfBuffer: Buffer | null = null
    try {
      // Lazy-require so cold-start doesn't pay for Chromium when other paths run.
      const puppeteer = (await import('puppeteer')).default as typeof import('puppeteer').default
      const launchOpts: Record<string, unknown> = {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true,
      }
      const exec = PUPPETEER_EXEC_PATH.value()
      if (exec) launchOpts.executablePath = exec
      const browser = await puppeteer.launch(launchOpts)
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const buf = await page.pdf({ format: 'Letter', printBackground: true })
      pdfBuffer = Buffer.from(buf)
      await browser.close()
    } catch {
      // Chromium not available — fall back to HTML so the client can print.
      return { html, fallback: true as const }
    }

    const path = `users/${uid}/exports/${project_id}-${Date.now()}.pdf`
    const file = admin.storage().bucket().file(path)
    await file.save(pdfBuffer, { contentType: 'application/pdf', resumable: false })
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    await logActivity({ user_id: uid, project_id, action: 'export_generated', metadata: { path } })

    const userSnap = await admin.firestore().doc(`users/${uid}`).get()
    const email = userSnap.data()?.email as string | undefined
    if (email) await sendMail(email, { template: 'export_ready', data: { url } })

    return { url, storage_path: path }
  },
)
