import { supabase } from '@/lib/supabase'

export interface OrcamentoItemInput {
  client_product_id: string
  quantity: number
  unit_price: number
  notes?: string
}

export interface OrcamentoAttachmentInput {
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
}

export interface Orcamento {
  id: string
  client_id: string
  gestor_id: string
  title: string
  description?: string
  status: 'novo' | 'em_analise' | 'aprovado' | 'rejeitado' | 'convertido'
  total_amount: number
  admin_notes?: string
  gestor_notes?: string
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
  orcamento_items?: Array<{
    id: string
    client_product_id: string
    quantity: number
    unit_price: number
    total_price: number
    notes?: string
  }>
}

export interface CreateOrcamentoInput {
  client_id: string
  gestor_id: string
  title: string
  description?: string
  gestor_notes?: string
  items: OrcamentoItemInput[]
  attachments?: OrcamentoAttachmentInput[]
}

export async function listOrcamentosByClient(clientId: string) {
  const { data, error } = await supabase
    .from('orcamentos')
    .select(`
      *,
      orcamento_items (*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Orcamento[]
}

export async function listOrcamentosAdmin() {
  const { data, error } = await supabase
    .from('orcamentos')
    .select(`
      *,
      orcamento_items (*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Orcamento[]
}

export async function createOrcamento(input: CreateOrcamentoInput) {
  const total = input.items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0)
  const { data: created, error } = await supabase
    .from('orcamentos')
    .insert({
      client_id: input.client_id,
      gestor_id: input.gestor_id,
      title: input.title,
      description: input.description ?? null,
      gestor_notes: input.gestor_notes ?? null,
      status: 'novo',
      total_amount: Number(total.toFixed(2))
    })
    .select('*')
    .single()
  if (error) throw error

  const items = input.items.map(it => ({
    orcamento_id: created.id,
    client_product_id: it.client_product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    total_price: Number((it.unit_price * it.quantity).toFixed(2)),
    notes: it.notes ?? null
  }))
  const { error: itemsErr } = await supabase.from('orcamento_items').insert(items)
  if (itemsErr) throw itemsErr

  if (input.attachments?.length) {
    const attachments = input.attachments.map(a => ({
      orcamento_id: created.id,
      file_name: a.file_name,
      file_url: a.file_url,
      file_size: a.file_size ?? null,
      mime_type: a.mime_type ?? null,
      uploaded_by: input.gestor_id
    }))
    const { error: attErr } = await supabase.from('orcamento_attachments').insert(attachments)
    if (attErr) throw attErr
  }

  return created as Orcamento
}

export async function approveOrcamento(id: string, adminId: string) {
  const { data: updated, error } = await supabase
    .from('orcamentos')
    .update({ status: 'aprovado', approved_by: adminId, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return updated as Orcamento
}

export async function convertToPurchaseOrder(orcamentoId: string, adminId: string) {
  const { data: orcamento, error: oErr } = await supabase
    .from('orcamentos')
    .select('*, orcamento_items (*)')
    .eq('id', orcamentoId)
    .single()
  if (oErr || !orcamento) throw oErr || new Error('Orçamento não encontrado')

  const orderNumber = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1e6).toString().padStart(6, '0')}`
  const { data: po, error: poErr } = await supabase
    .from('purchase_orders')
    .insert({
      orcamento_id: orcamento.id,
      client_id: orcamento.client_id,
      admin_id: adminId,
      order_number: orderNumber,
      status: 'criado',
      total_amount: orcamento.total_amount,
      supplier_info: {},
      shipping_info: {}
    })
    .select('*')
    .single()
  if (poErr) throw poErr

  const poItems = (orcamento.orcamento_items ?? []).map((it: any) => ({
    purchase_order_id: po.id,
    client_product_id: it.client_product_id,
    quantity: it.quantity,
    unit_price: it.unit_price,
    total_price: it.total_price
  }))
  if (poItems.length) {
    const { error: poiErr } = await supabase.from('purchase_order_items').insert(poItems)
    if (poiErr) throw poiErr
  }

  // Atualizar orçamento como convertido
  await supabase
    .from('orcamentos')
    .update({ status: 'convertido' })
    .eq('id', orcamento.id)

  return po
}


