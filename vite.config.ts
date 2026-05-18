import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

function localApiPlugin(): Plugin {
  return {
    name: 'phantom-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        if (!req.url) return next()

        try {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            res.end()
            return
          }

          const url = new URL(req.url, 'http://localhost')
          const path = url.pathname.replace(/^\/+|\/+$/g, '')
          const query: Record<string, string | string[]> = { path: path.split('/').filter(Boolean) }

          url.searchParams.forEach((value, key) => {
            const current = query[key]
            if (Array.isArray(current)) query[key] = [...current, value]
            else if (current) query[key] = [current, value]
            else query[key] = value
          })

          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }

          const rawBody = Buffer.concat(chunks).toString('utf8')
          const contentType = req.headers['content-type'] ?? ''
          const body = rawBody && contentType.includes('application/json')
            ? JSON.parse(rawBody)
            : rawBody

          const apiReq = Object.assign(req, { query, body })
          const apiRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return apiRes
            },
            json(payload: unknown) {
              if (!res.headersSent) res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(payload))
              return apiRes
            },
          })

          const { default: handler } = await import('./api/[...path]')
          await handler(apiReq as never, apiRes as never)
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          console.error('[phantom] local API error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
          }
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Local API error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), localApiPlugin()],
    resolve: {
      alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: 5173,
    },
  }
})
