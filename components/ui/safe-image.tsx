"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'

interface SafeImageProps {
  src?: string | null
  alt: string
  className?: string
  fallback?: React.ReactNode
  onError?: () => void
  size?: number
  width?: number
  height?: number
}

export function SafeImage({ 
  src, 
  alt, 
  className = "", 
  fallback,
  onError,
  size,
  width,
  height
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (!src || hasError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        <Package className="h-8 w-8" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "transition-opacity duration-200",
        isLoading ? "opacity-0" : "opacity-100",
        className
      )}
      width={width ?? size}
      height={height ?? size}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true)
        setIsLoading(false)
        onError?.()
      }}
    />
  )
}

// Componente específico para avatares
export function Avatar({ 
  src, 
  alt, 
  size = 48, 
  className = '' 
}: {
  src?: string | null
  alt: string
  size?: number
  className?: string
}) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      size={size}
      className={`rounded-full ${className}`}
      width={size}
      height={size}
    />
  )
}

// Componente específico para logos
export function Logo({ 
  src, 
  alt, 
  size = 48, 
  className = '' 
}: {
  src?: string | null
  alt: string
  size?: number
  className?: string
}) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      size={size}
      className={`rounded-lg ${className}`}
      width={size}
      height={size}
    />
  )
}

// Componente específico para imagens de produtos
export function ProductImage({ 
  src, 
  alt, 
  size = 120, 
  className = '' 
}: {
  src?: string | null
  alt: string
  size?: number
  className?: string
}) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      size={size}
      className={`rounded-lg shadow-sm ${className}`}
      width={size}
      height={size}
    />
  )
}
