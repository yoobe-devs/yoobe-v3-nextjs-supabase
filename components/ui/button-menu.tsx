'use client'

import React, { useEffect, useRef, useState } from 'react'

type MenuItem = {
  label: string
  onClick: () => void | Promise<void>
}

type ButtonMenuProps = {
  trigger: React.ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
  className?: string
}

export default function ButtonMenu({ trigger, items, align = 'right', className }: ButtonMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const sideClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={ref} className={`relative inline-flex ${className || ''}`}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <div className={`absolute ${sideClass} mt-2 w-56 rounded-md border bg-white shadow z-50`}>
          {items.map((it, idx) => (
            <button
              key={idx}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={async () => { await it.onClick(); setOpen(false) }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

