"use client"

import { useState } from 'react'

interface AvatarProps {
  src?: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ src, alt, className = '', size = 'md' }: AvatarProps) {
  const [hasError, setHasError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ]
    
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (!src || hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center text-white font-semibold ${getRandomColor(alt)}`}>
        {generateInitials(alt)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
      onError={() => setHasError(true)}
    />
  )
}
