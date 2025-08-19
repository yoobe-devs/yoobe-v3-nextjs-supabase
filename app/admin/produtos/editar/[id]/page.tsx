"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GiftProductForm } from '@/components/admin/gift-product-form'
import { getGiftProduct, updateGiftProduct, deleteGiftProduct } from '@/lib/queries/gift-products'
import { Button } from '@/components/ui/button'

export default function EditGiftProductPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    const run = async () => {
      try {
        setLoading(true)
        const res = await getGiftProduct(id)
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  if (loading) return <div className="p-6">Carregando...</div>
  if (!data) return <div className="p-6">Não encontrado</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar produto</h1>
        <Button
          variant="destructive"
          onClick={async () => {
            setSubmitting(true)
            try {
              await deleteGiftProduct(id)
              router.push('/admin/produtos')
            } finally {
              setSubmitting(false)
            }
          }}
        >Excluir</Button>
      </div>
      <GiftProductForm
        initial={data}
        submitting={submitting}
        onSubmit={async (form) => {
          setSubmitting(true)
          try {
            await updateGiftProduct({ id, ...form })
            router.push('/admin/produtos')
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </div>
  )
}


