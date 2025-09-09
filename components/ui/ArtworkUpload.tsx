import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, File, Image, X, CheckCircle, AlertCircle } from 'lucide-react'

interface ArtworkUploadProps {
  onUploadComplete?: (artwork: any) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxSize?: number // em bytes
  acceptedTypes?: string[]
  budgetId?: string
  budgetItemId?: string
}

export function ArtworkUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSize = 200 * 1024 * 1024, // 200MB
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'application/pdf',
    'application/postscript',
    'application/illustrator',
    'application/x-illustrator',
    'application/zip',
    'application/x-zip-compressed',
  ],
  budgetId,
  budgetItemId,
}: ArtworkUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setError(null)
      setUploading(true)
      setUploadProgress(0)

      try {
        const uploadPromises = acceptedFiles.map(async file => {
          // 1. Criar registro de upload
          const createUploadResponse = await fetch('/api/artworks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              company_id: '550e8400-e29b-41d4-a716-446655440001', // TODO: Pegar do contexto
              budget_id: budgetId,
              budget_item_id: budgetItemId,
              filename: file.name,
              mime_type: file.type,
              size_bytes: file.size,
            }),
          })

          if (!createUploadResponse.ok) {
            throw new Error('Erro ao criar registro de upload')
          }

          const { data: uploadData } = await createUploadResponse.json()

          // 2. Fazer upload do arquivo
          const uploadResponse = await fetch(uploadData.signed_url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          })

          if (!uploadResponse.ok) {
            throw new Error('Erro no upload do arquivo')
          }

          // 3. Finalizar upload
          const finalizeResponse = await fetch(
            `/api/artworks/${uploadData.artwork_id}/finalize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                hash_sha256: '', // TODO: Calcular hash se necessário
              }),
            }
          )

          if (!finalizeResponse.ok) {
            throw new Error('Erro ao finalizar upload')
          }

          const { data: artwork } = await finalizeResponse.json()
          return artwork
        })

        // Aguardar todos os uploads
        const results = await Promise.all(uploadPromises)
        setUploadedFiles(prev => [...prev, ...results])
        onUploadComplete?.(results)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro no upload'
        setError(errorMessage)
        onUploadError?.(errorMessage)
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [budgetId, budgetItemId, onUploadComplete, onUploadError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles,
    disabled: uploading,
  })

  const removeFile = (artworkId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== artworkId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">
                Solte os arquivos aqui...
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Formatos aceitos: JPG, PNG, SVG, PDF, AI, EPS, ZIP
                </p>
                <p className="text-xs text-gray-400">
                  Tamanho máximo: {formatFileSize(maxSize)} • Máximo {maxFiles}{' '}
                  arquivos
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Enviando arquivos...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Arquivos enviados */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Arquivos enviados:</h4>
          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mime_type)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size_bytes)}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.mime_type}
                        </Badge>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

