"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  bucket?: string
  folder?: string
  className?: string
}

export function ImageUpload({ 
  onImageUpload, 
  currentImage, 
  bucket = 'products',
  folder = '',
  className = '' 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB')
      return
    }

    // Criar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Fazer upload
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucket)
      if (folder) {
        formData.append('folder', folder)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload')
      }

      onImageUpload(data.url)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      await handleFileSelect({ target: { files } } as any)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          previewUrl 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2"
              onClick={removeImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Enviando imagem...</span>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    Clique para fazer upload ou arraste uma imagem
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP até 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {!previewUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Selecionar Imagem
        </Button>
      )}
    </div>
  )
}
