// One-shot: grant allUsers the run.invoker role on every callable Cloud Run
// service in the project. Uses Firebase CLI's stored OAuth tokens.
//
// Usage: node scripts/grantAllUsersInvoker.cjs
//
// This re-applies the IAM binding that Firebase Functions v2 onCall requires
// for browser preflight requests to succeed (CORS).

const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')

const PROJECT = 'the-phantom-app-io'
const REGION = 'us-central1'

// Functions that the browser calls directly via Firebase callable SDK.
// (Background triggers + scheduled jobs aren't called from the browser.)
const CALLABLES = [
  'completeOnboarding', 'skipOnboarding', 'createProject', 'deleteProject',
  'completePhase', 'adminGrantPro',
  'refineProblemStatement', 'extractUnfairAdvantages', 'synthesizePositioning',
  'extractAudienceLanguage', 'findWhereToTest', 'buildMinimumOffer',
  'generateOutreach', 'buildObjectionLibrary', 'diagnoseOffer', 'suggestIteration',
  'competitiveGapAnalysis', 'positioningFromData', 'recommendBrandIdentity',
  'buildNotFor', 'structureTestimonial', 'curateProofPackage', 'exportLockInPdf',
  'requestProofUploadUrl',
  'createCheckoutSession', 'createBillingPortalSession',
]

function getRefreshToken() {
  const p = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json')
  const json = JSON.parse(fs.readFileSync(p, 'utf8'))
  const t = json?.tokens?.refresh_token
  if (!t) throw new Error(`No refresh_token in ${p}. Run: firebase login`)
  return t
}

function postForm(host, pathname, formBody) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { method: 'POST', host, path: pathname, headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formBody),
        } },
      (res) => {
        let body = ''
        res.on('data', (c) => (body += c))
        res.on('end', () => resolve({ status: res.statusCode, body }))
      },
    )
    req.on('error', reject)
    req.write(formBody)
    req.end()
  })
}

function request({ method, host, pathname, headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { method, host, path: pathname, headers: { ...headers, 'User-Agent': 'phantom-iam-fix/1.0' } },
      (res) => {
        let buf = ''
        res.on('data', (c) => (buf += c))
        res.on('end', () => resolve({ status: res.statusCode, body: buf }))
      },
    )
    req.on('error', reject)
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body))
    req.end()
  })
}

async function getAccessToken() {
  const refresh = getRefreshToken()
  // Firebase CLI's official OAuth client.
  const clientId = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com'
  const clientSecret = 'j9iVZfS8kkCEFUPaAeJV0sAi'
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refresh,
    grant_type: 'refresh_token',
  }).toString()
  const r = await postForm('oauth2.googleapis.com', '/token', form)
  if (r.status !== 200) throw new Error(`token exchange failed ${r.status}: ${r.body}`)
  const j = JSON.parse(r.body)
  if (!j.access_token) throw new Error(`no access_token in: ${r.body}`)
  return j.access_token
}

async function grantInvoker(token, fnName) {
  const host = `${REGION}-run.googleapis.com`
  const svcPath = `/v2/projects/${PROJECT}/locations/${REGION}/services/${fnName.toLowerCase()}`

  // 1) get current IAM policy
  const getRes = await request({
    method: 'POST',
    host,
    pathname: `${svcPath}:getIamPolicy`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: {},
  })
  if (getRes.status === 404) return { fnName, status: 'NOT_FOUND' }
  if (getRes.status !== 200) return { fnName, status: 'GET_FAIL', detail: `${getRes.status}: ${getRes.body.slice(0, 200)}` }

  const policy = JSON.parse(getRes.body)
  policy.bindings = policy.bindings || []
  let binding = policy.bindings.find((b) => b.role === 'roles/run.invoker')
  if (!binding) {
    binding = { role: 'roles/run.invoker', members: [] }
    policy.bindings.push(binding)
  }
  if (binding.members.includes('allUsers')) return { fnName, status: 'ALREADY_OK' }
  binding.members.push('allUsers')

  // 2) set the updated policy
  const setRes = await request({
    method: 'POST',
    host,
    pathname: `${svcPath}:setIamPolicy`,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: { policy },
  })
  if (setRes.status !== 200) return { fnName, status: 'SET_FAIL', detail: `${setRes.status}: ${setRes.body.slice(0, 200)}` }
  return { fnName, status: 'GRANTED' }
}

async function main() {
  const token = await getAccessToken()
  console.log('Got access token. Granting allUsers run.invoker on', CALLABLES.length, 'services...')
  const results = []
  for (const fn of CALLABLES) {
    try {
      results.push(await grantInvoker(token, fn))
    } catch (err) {
      results.push({ fnName: fn, status: 'ERROR', detail: err.message })
    }
  }
  for (const r of results) {
    console.log(`  ${r.status.padEnd(12)} ${r.fnName}${r.detail ? ' — ' + r.detail : ''}`)
  }
  const granted = results.filter((r) => r.status === 'GRANTED').length
  const ok = results.filter((r) => r.status === 'ALREADY_OK').length
  const fail = results.filter((r) => !['GRANTED', 'ALREADY_OK'].includes(r.status)).length
  console.log(`\nGranted: ${granted} | Already OK: ${ok} | Failed: ${fail}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
