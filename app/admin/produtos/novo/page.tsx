"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GiftProductForm } from '@/components/admin/gift-product-form'
import { createGiftProduct } from '@/lib/queries/gift-products'

export default function NewGiftProductPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Novo produto</h1>
      <GiftProductForm
        submitting={submitting}
        onSubmit={async (data) => {
          setSubmitting(true)
          try {
            await createGiftProduct(data)
            router.push('/admin/produtos')
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </div>
  )
}


