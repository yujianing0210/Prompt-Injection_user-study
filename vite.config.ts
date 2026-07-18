import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MAX_RESULT_BYTES = 10 * 1024 * 1024

function safePathPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function resultSaver(): import('vite').Plugin {
  const middleware: Connect.NextHandleFunction = (request, response, next) => {
    if (request.url !== '/api/results' || request.method !== 'POST') {
      next()
      return
    }

    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      body += chunk
      if (Buffer.byteLength(body) > MAX_RESULT_BYTES) request.destroy()
    })
    request.on('end', async () => {
      try {
        const payload = JSON.parse(body) as {
          participantId?: unknown
          sessionId?: unknown
          json?: unknown
          csv?: unknown
        }
        if (
          typeof payload.participantId !== 'string' ||
          typeof payload.sessionId !== 'string' ||
          typeof payload.json !== 'string' ||
          typeof payload.csv !== 'string'
        ) {
          throw new Error('Invalid result payload')
        }

        const participantId = safePathPart(payload.participantId)
        const sessionId = safePathPart(payload.sessionId)
        if (!participantId || !sessionId) throw new Error('Invalid result identifiers')

        const relativeDirectory = path.join('results', participantId)
        const directory = path.resolve(process.cwd(), relativeDirectory)
        const basename = `llm-prompt-review_${participantId}_${sessionId}`
        await mkdir(directory, { recursive: true })
        await Promise.all([
          writeFile(path.join(directory, `${basename}.json`), payload.json, 'utf8'),
          writeFile(path.join(directory, `${basename}.csv`), payload.csv, 'utf8'),
        ])

        response.statusCode = 201
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ directory: relativeDirectory }))
      } catch (error) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to save results' }))
      }
    })
  }

  return {
    name: 'local-result-saver',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), resultSaver()],
})
