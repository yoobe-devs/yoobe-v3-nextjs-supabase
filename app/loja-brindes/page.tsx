import React from 'react'

const LOJA_URL = process.env.NEXT_PUBLIC_LOJA_BRINDES_BASE_URL || ''

export default function LojaBrindesHome() {
  const src = LOJA_URL ? `${LOJA_URL.replace(/\/$/, '')}/loja-brindes` : ''
  return (
    <div className="w-full h-[calc(100vh-4rem)] p-4">
      {src ? (
        <iframe
          src={src}
          className="w-full h-full rounded-md border"
          title="Loja de Brindes"
        />
      ) : (
        <div className="text-red-600">
          Defina NEXT_PUBLIC_LOJA_BRINDES_BASE_URL no .env.local para exibir a loja de brindes.
        </div>
      )}
    </div>
  )
}


