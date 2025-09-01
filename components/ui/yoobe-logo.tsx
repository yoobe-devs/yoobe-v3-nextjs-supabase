import React from 'react'

interface YoobeLogoProps {
  size?: number
  className?: string
  showText?: boolean
  variant?: 'default' | 'white' | 'blue'
}

export function YoobeLogo({ 
  size = 32, 
  className = '', 
  showText = true, 
  variant = 'default' 
}: YoobeLogoProps) {
  const colors = {
    default: {
      background: '#1e40af', // blue-800
      symbol: '#ffffff',
      text: '#1f2937' // gray-800
    },
    white: {
      background: '#ffffff',
      symbol: '#1e40af', // blue-800
      text: '#ffffff'
    },
    blue: {
      background: '#1e40af', // blue-800
      symbol: '#ffffff',
      text: '#1e40af' // blue-800
    }
  }

  const currentColors = colors[variant]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Circle */}
      <div 
        className="flex items-center justify-center rounded-full"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: currentColors.background 
        }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Símbolo principal - letra "y" estilizada com rosto */}
          <path
            d="M8 6C8 6 9 5 12 5C15 5 16 6 16 6C16 6 16.5 7 16 8C15.5 9 15 9.5 15 10C15 10.5 15.5 11 16 12C16.5 13 16 14 16 14C16 14 15 15 12 15C9 15 8 14 8 14C8 14 7.5 13 8 12C8.5 11 9 10.5 9 10C9 9.5 8.5 9 8 8C7.5 7 8 6 8 6Z"
            fill={currentColors.symbol}
          />
          
          {/* Olhos */}
          <circle cx="10" cy="8" r="1" fill={currentColors.symbol} />
          <circle cx="14" cy="8" r="1" fill={currentColors.symbol} />
          
          {/* Cauda/traço inferior */}
          <path
            d="M14 12C14 12 15 13 15 14C15 15 14 16 14 16"
            stroke={currentColors.symbol}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Texto "Yoobe" */}
      {showText && (
        <span 
          className="font-bold text-xl"
          style={{ color: currentColors.text }}
        >
          Yoobe
        </span>
      )}
    </div>
  )
}

export default YoobeLogo


