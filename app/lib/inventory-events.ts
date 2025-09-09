type Client = { id: number; storeId: string; write: (data: string) => void; close: () => void }

let nextId = 1
const clients = new Map<number, Client>()

export function addSseClient(storeId: string, write: (data: string) => void, close: () => void) {
  const id = nextId++
  clients.set(id, { id, storeId, write, close })
  return id
}

export function removeSseClient(id: number) {
  const c = clients.get(id)
  if (c) {
    try { c.close() } catch {}
    clients.delete(id)
  }
}

export function emitInventoryUpdate(payload: any) {
  const data = `event: INVENTORY_UPDATED\n` + `data: ${JSON.stringify(payload)}\n\n`
  const targetStore = String(payload?.store_id || payload?.storeId || '')
  clients.forEach(c => {
    if (!targetStore || c.storeId === targetStore) {
      try { c.write(data) } catch {}
    }
  })
}

