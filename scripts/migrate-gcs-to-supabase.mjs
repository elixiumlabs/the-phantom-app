#!/usr/bin/env node
/**
 * Bulk-copy objects from a public GCS bucket into Supabase Storage.
 *
 * Usage:
 *   node scripts/migrate-gcs-to-supabase.mjs --manifest ./gcs-files.txt
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_BUCKET (default: proof-vault)
 *   GCS_BUCKET (e.g. phantom-app)
 *
 * Manifest format:
 *   One object path per line, relative to the GCS bucket.
 */

const args = process.argv.slice(2)
const manifestFlagIndex = args.indexOf('--manifest')
const dryRun = args.includes('--dry-run')

if (manifestFlagIndex === -1 || !args[manifestFlagIndex + 1]) {
  console.error('Missing --manifest path. Example: --manifest ./gcs-files.txt')
  process.exit(1)
}

const manifestPath = args[manifestFlagIndex + 1]

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET = 'proof-vault',
  GCS_BUCKET,
} = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GCS_BUCKET) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GCS_BUCKET')
  process.exit(1)
}

const readManifest = async (path) => {
  const fs = await import('node:fs/promises')
  const raw = await fs.readFile(path, 'utf8')
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

const supabaseUpload = async (objectPath, bytes, contentType) => {
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURI(objectPath)}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: bytes,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase upload failed (${res.status}) for ${objectPath}: ${text}`)
  }
}

const fetchFromGcs = async (objectPath) => {
  const url = `https://storage.googleapis.com/${GCS_BUCKET}/${encodeURI(objectPath)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`GCS read failed (${res.status}) for ${objectPath}`)
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, contentType }
}

const run = async () => {
  const objectPaths = await readManifest(manifestPath)
  console.log(`Loaded ${objectPaths.length} objects from ${manifestPath}`)

  let success = 0
  let failed = 0

  for (const objectPath of objectPaths) {
    try {
      if (dryRun) {
        console.log(`[dry-run] ${objectPath}`)
        success += 1
        continue
      }

      const { buffer, contentType } = await fetchFromGcs(objectPath)
      await supabaseUpload(objectPath, buffer, contentType)
      success += 1
      console.log(`✓ migrated ${objectPath}`)
    } catch (error) {
      failed += 1
      console.error(`✗ failed ${objectPath}:`, error.message)
    }
  }

  console.log(`Done. success=${success} failed=${failed}`)
  if (failed > 0) process.exit(2)
}

run().catch((error) => {
  console.error('Migration crashed:', error)
  process.exit(1)
})
