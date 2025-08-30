import React from 'react'

interface YoobeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function YoobeLogo({ size = 'md', className = '' }: YoobeLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Círculo de fundo azul */}
        <circle cx="32" cy="32" r="32" fill="#1e40af" />
        
        {/* Letra "y" estilizada em branco */}
        <path
          d="M20 16 L28 16 L28 24 L36 24 L36 16 L44 16 L44 32 L36 32 L36 28 L28 28 L28 32 L20 32 Z"
          fill="white"
        />
        
        {/* "Olhos" - dois pontos brancos */}
        <circle cx="26" cy="20" r="2" fill="white" />
        <circle cx="38" cy="20" r="2" fill="white" />
        
        {/* "Sorriso" - curva inferior */}
        <path
          d="M24 36 Q32 44 40 36"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

export function YoobeLogoWithText({ size = 'md', className = '' }: YoobeLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <YoobeLogo size={size} />
      <span className="font-bold text-2xl text-gray-900">Yoobe</span>
    </div>
  )
}


