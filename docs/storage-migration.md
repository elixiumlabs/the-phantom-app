# GCS → Supabase Storage Migration

Yes — you can migrate images from your Google Cloud Storage bucket into Supabase Storage.

## Prerequisites

- A Supabase bucket already created (for this app, `proof-vault` is already documented).
- Service-role key for Supabase (server-side only).
- Publicly readable GCS objects, or pre-generated signed URLs.

## 1) Build a manifest of files

Create a text file listing one object path per line (relative to your GCS bucket):

```txt
blogs/4K_cinematic_editorial_thumbnail_on_202605031302.jpeg
proofvault.png
signaltracker.png
```

## 2) Run the migration script

```bash
SUPABASE_URL="https://<project-ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
SUPABASE_BUCKET="proof-vault" \
GCS_BUCKET="phantom-app" \
node scripts/migrate-gcs-to-supabase.mjs --manifest ./gcs-files.txt
```

Dry-run mode:

```bash
node scripts/migrate-gcs-to-supabase.mjs --manifest ./gcs-files.txt --dry-run
```

## 3) Update file references

After migration, update hardcoded `storage.googleapis.com/...` URLs in the app to Supabase public URLs (or signed URLs if private).

## Notes

- The script uses upsert semantics (`x-upsert: true`) so reruns are safe.
- It preserves path + content type.
- For private GCS objects, swap read logic to signed URLs (or use Google SDK auth).
