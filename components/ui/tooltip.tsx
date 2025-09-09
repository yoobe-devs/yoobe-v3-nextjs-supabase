'use client'

import React, { useState, useRef, useEffect } from 'react'

type TooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function Tooltip({ content, children, side = 'top', align = 'center', className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pos: React.CSSProperties = {}
  if (side === 'top') pos.bottom = '100%'
  if (side === 'bottom') pos.top = '100%'
  if (side === 'left') pos.right = '100%'
  if (side === 'right') pos.left = '100%'

  const alignStyle: React.CSSProperties = {}
  if (side === 'top' || side === 'bottom') {
    if (align === 'start') alignStyle.left = 0
    if (align === 'center') alignStyle.left = '50%'
    if (align === 'end') alignStyle.right = 0
  } else {
    if (align === 'start') alignStyle.top = 0
    if (align === 'center') alignStyle.top = '50%'
    if (align === 'end') alignStyle.bottom = 0
  }

  return (
    <div ref={ref} className={`relative inline-flex ${className || ''}`} 
         onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
         onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && (
        <div className="pointer-events-none absolute z-50 px-2 py-1 text-xs rounded bg-gray-900 text-white shadow border border-gray-800"
             style={{ ...pos, ...alignStyle, transform: align==='center' ? 'translateX(-50%)' : undefined }}>
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip

