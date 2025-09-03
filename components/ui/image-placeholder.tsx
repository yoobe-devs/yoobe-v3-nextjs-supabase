import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Package, Image as ImageIcon } from 'lucide-react'

interface ImagePlaceholderProps {
  src?: string | null
  alt: string
  className?: string
  fallbackIcon?: React.ReactNode
  placeholderText?: string
  onError?: () => void
  onLoad?: () => void
}

export function ImagePlaceholder({
  src,
  alt,
  className,
  fallbackIcon,
  placeholderText,
  onError,
  onLoad
}: ImagePlaceholderProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleError = () => {
    setImageError(true)
    setImageLoading(false)
    onError?.()
  }

  const handleLoad = () => {
    setImageLoading(false)
    onLoad?.()
  }

  // If no src or image failed to load, show placeholder
  if (!src || imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-400",
        className
      )}>
        {fallbackIcon || <Package className="h-8 w-8" />}
        {placeholderText && (
          <span className="text-xs text-center mt-2">{placeholderText}</span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          imageLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

// Product image component with specific styling
export function ProductImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImagePlaceholderProps, 'fallbackIcon' | 'placeholderText'>) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      className={cn("aspect-square", className)}
      fallbackIcon={<Package className="h-12 w-12" />}
      placeholderText="Imagem do produto"
      {...props}
    />
  )
}

// Logo image component
export function LogoImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImagePlaceholderProps, 'fallbackIcon' | 'placeholderText'>) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      className={cn("rounded-full", className)}
      fallbackIcon={<ImageIcon className="h-6 w-6" />}
      {...props}
    />
  )
}

// Avatar image component
export function AvatarImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImagePlaceholderProps, 'fallbackIcon' | 'placeholderText'>) {
  return (
    <ImagePlaceholder
      src={src}
      alt={alt}
      className={cn("rounded-full", className)}
      fallbackIcon={<ImageIcon className="h-8 w-8" />}
      {...props}
    />
  )
}
