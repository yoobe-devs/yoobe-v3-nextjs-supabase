'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  File,
  Image,
  FileText,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ArtworkFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  artworkId?: string
}

interface ArtworkUploaderProps {
  companyId: string
  budgetId?: string
  budgetItemId?: string
  onUploadComplete?: (artworkId: string, file: File) => void
  onUploadError?: (file: File, error: string) => void
  maxFiles?: number
  className?: string
}

const ALLOWED_TYPES = {
  'image/jpeg': { icon: Image, label: 'JPEG' },
  'image/png': { icon: Image, label: 'PNG' },
  'image/svg+xml': { icon: Image, label: 'SVG' },
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/postscript': { icon: File, label: 'EPS' },
  'application/illustrator': { icon: File, label: 'AI' },
  'application/zip': { icon: Archive, label: 'ZIP' },
  'application/x-zip-compressed': { icon: Archive, label: 'ZIP' },
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function ArtworkUploader({
  companyId,
  budgetId,
  budgetItemId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  className = '',
}: ArtworkUploaderProps) {
  const [files, setFiles] = useState<ArtworkFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: ArtworkFile[] = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        progress: 0,
        status: 'pending',
      }))

      setFiles(prev => {
        const updated = [...prev, ...newFiles]
        if (updated.length > maxFiles) {
          toast.error(`Máximo de ${maxFiles} arquivos permitidos`)
          return prev
        }
        return updated
      })
    },
    [maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(ALLOWED_TYPES).reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading,
  })

  const uploadFile = async (artworkFile: ArtworkFile) => {
    try {
      // 1. Criar registro de upload
      const createResponse = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          budget_id: budgetId,
          budget_item_id: budgetItemId,
          filename: artworkFile.file.name,
          mime_type: artworkFile.file.type,
          size_bytes: artworkFile.file.size,
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Erro ao criar registro de upload')
      }

      const { data } = await createResponse.json()
      const { artwork_id, signed_url } = data

      // 2. Upload do arquivo
      const uploadResponse = await fetch(signed_url, {
        method: 'PUT',
        body: artworkFile.file,
        signal: abortControllerRef.current?.signal,
      })

      if (!uploadResponse.ok) {
        throw new Error('Erro no upload do arquivo')
      }

      // 3. Finalizar upload
      await fetch(`/api/artworks/${artwork_id}/finalize`, {
        method: 'POST',
      })

      // Atualizar status do arquivo
      setFiles(prev =>
        prev.map(f =>
          f.id === artworkFile.id
            ? {
                ...f,
                status: 'completed',
                progress: 100,
                artworkId: artwork_id,
              }
            : f
        )
      )

      onUploadComplete?.(artwork_id, artworkFile.file)
      toast.success(`${artworkFile.file.name} enviado com sucesso`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido'

      setFiles(prev =>
        prev.map(f =>
          f.id === artworkFile.id
            ? { ...f, status: 'error', error: errorMessage }
            : f
        )
      )

      onUploadError?.(artworkFile.file, errorMessage)
      toast.error(`Erro ao enviar ${artworkFile.file.name}: ${errorMessage}`)
    }
  }

  const startUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    abortControllerRef.current = new AbortController()

    const pendingFiles = files.filter(f => f.status === 'pending')

    for (const file of pendingFiles) {
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, status: 'uploading' } : f))
      )

      await uploadFile(file)
    }

    setIsUploading(false)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const getFileIcon = (mimeType: string) => {
    const type = ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES]
    return type ? type.icon : File
  }

  const getFileLabel = (mimeType: string) => {
    const type = ALLOWED_TYPES[mimeType as keyof typeof ALLOWED_TYPES]
    return type ? type.label : 'Arquivo'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Artes
          </CardTitle>
          <CardDescription>
            Arraste arquivos ou clique para selecionar. Formatos aceitos: JPEG,
            PNG, SVG, PDF, AI, EPS, ZIP (máx. 50MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25'
              }
              ${
                isUploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-primary hover:bg-primary/5'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Máximo {maxFiles} arquivos, {formatFileSize(MAX_FILE_SIZE)}{' '}
                  cada
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Arquivos Selecionados ({files.length})</CardTitle>
              <Button
                onClick={startUpload}
                disabled={
                  isUploading || files.every(f => f.status !== 'pending')
                }
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Enviar Todos
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map(artworkFile => {
              const Icon = getFileIcon(artworkFile.file.type)
              const label = getFileLabel(artworkFile.file.type)

              return (
                <div
                  key={artworkFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {/* Preview/Icon */}
                  <div className="flex-shrink-0">
                    {artworkFile.preview ? (
                      <img
                        src={artworkFile.preview}
                        alt={artworkFile.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {artworkFile.file.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(artworkFile.file.size)}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    {artworkFile.status === 'uploading' && (
                      <Progress value={artworkFile.progress} className="h-2" />
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 mt-1">
                      {artworkFile.status === 'pending' && (
                        <Badge variant="outline" className="text-xs">
                          Aguardando
                        </Badge>
                      )}
                      {artworkFile.status === 'uploading' && (
                        <Badge variant="default" className="text-xs">
                          Enviando...
                        </Badge>
                      )}
                      {artworkFile.status === 'completed' && (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-500"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enviado
                        </Badge>
                      )}
                      {artworkFile.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                    </div>

                    {/* Error message */}
                    {artworkFile.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {artworkFile.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Remove button */}
                  {artworkFile.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(artworkFile.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

