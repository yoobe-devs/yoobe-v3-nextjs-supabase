import { NextRequest } from 'next/server'
import { addSseClient, removeSseClient } from '@/app/lib/inventory-events'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''
  if (!storeId) {
    return new Response('store_id required', { status: 400 })
  }
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const write = (data: string) => controller.enqueue(encoder.encode(data))
      const close = () => controller.close()
      const id = addSseClient(storeId, write, close)
      // initial event
      write(`event: READY\n` + `data: {"ok":true}\n\n`)
      req.signal.addEventListener('abort', () => removeSseClient(id))
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

