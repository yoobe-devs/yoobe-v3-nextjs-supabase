'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface SmartLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function SmartLink({
  href,
  children,
  className,
  onClick,
}: SmartLinkProps) {
  const router = useRouter()

  // Verificar se é um link externo
  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  // Verificar se é um link que pode causar problemas de navegação
  const isProblematicLink =
    href.includes('vusercontent.net') || href.includes('lite.vusercontent.net')

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }

    if (isExternal || isProblematicLink) {
      e.preventDefault()

      // Para links externos problemáticos, usar window.open com target="_blank"
      if (isProblematicLink) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        // Para outros links externos, usar window.location
        window.location.href = href
      }
    }
  }

  if (isExternal || isProblematicLink) {
    return (
      <a
        href={href}
        className={className}
        onClick={handleClick}
        target={isProblematicLink ? '_blank' : undefined}
        rel={isProblematicLink ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
