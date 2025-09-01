"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (file: File) => Promise<void>
  placeholder?: string
  className?: string
}

export function ImageUpload({ 
  currentImage, 
  onImageUpload, 
  placeholder = "Clique para fazer upload da imagem",
  className = ""
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    try {
      setUploading(true)
      await onImageUpload(file)
      setImageUrl(URL.createObjectURL(file))
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input */}
      <div className="space-y-2">
        <Input
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {placeholder}
            </>
          )}
        </Button>

        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border"
            onError={() => {
              // Se a imagem falhar ao carregar, mostrar placeholder
              setImageUrl('')
            }}
          />
        </div>
      )}
    </div>
  )
}
