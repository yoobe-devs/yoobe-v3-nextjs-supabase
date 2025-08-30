"use client"

import { useState, useEffect } from 'react'

interface SafeImageProps {
  src?: string | null
  alt: string
  fallbackText?: string
  size?: number
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackText, 
  size = 48, 
  className = '',
  width,
  height,
  priority = false
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  useEffect(() => {
    setCurrentSrc(src || null)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  // Gerar placeholder URL
  const getPlaceholderUrl = () => {
    const displayText = fallbackText || alt || 'Image'
    const encodedText = encodeURIComponent(displayText)
    return `https://ui-avatars.com/api/?name=${encodedText}&background=1e40af&color=ffffff&size=${size}&bold=true`
  }

  // Se não há src ou houve erro, usar placeholder
  if (!currentSrc || hasError) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center ${className}`}>
        <img
          src={getPlaceholderUrl()}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ width: width || size, height: height || size }}
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: width || size, height: height || size }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
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
