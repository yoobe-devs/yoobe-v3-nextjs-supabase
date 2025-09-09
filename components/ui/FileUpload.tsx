import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Trash2
} from 'lucide-react'

interface FileUploadProps {
  budgetId?: string
  budgetItemId?: string
  fileType?: 'artwork' | 'document' | 'image' | 'other'
  maxFiles?: number
  maxSize?: number // em MB
  acceptedTypes?: string[]
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
  className?: string
}

interface UploadedFile {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  file_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'deleted'
  created_at: string
}

interface FileWithPreview extends File {
  preview?: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
  uploadError?: string
  uploadId?: string
}

const fileTypeIcons = {
  artwork: Image,
  document: FileText,
  image: Image,
  other: File,
}

const fileTypeColors = {
  artwork: 'bg-purple-500',
  document: 'bg-blue-500',
  image: 'bg-green-500',
  other: 'bg-gray-500',
}

const statusColors = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  deleted: 'bg-gray-500',
}

export function FileUpload({
  budgetId,
  budgetItemId,
  fileType = 'artwork',
  maxFiles = 10,
  maxSize = 10, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.ai', '.eps', '.psd'],
  onUploadComplete,
  onUploadError,
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo permitido: ${maxSize}MB`
    }

    // Verificar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })

    if (!isValidType) {
      return `Tipo de arquivo não permitido. Tipos aceitos: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          uploadProgress: 0,
          uploadStatus: 'pending' as const,
        })
        validFiles.push(fileWithPreview)
      }
    })

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setFiles(prev => {
        const combined = [...prev, ...validFiles]
        return combined.slice(0, maxFiles)
      })
    }
  }, [maxFiles, maxSize, acceptedTypes, onUploadError])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const file = newFiles[index]
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFile = async (file: FileWithPreview, index: number) => {
    try {
      // Atualizar status para uploading
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { ...newFiles[index], uploadStatus: 'uploading' }
        return newFiles
      })

      // Upload para Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Criar registro no banco
      const uploadRecord = {
        filename: fileName,
        original_filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        file_type: fileType,
        budget_id: budgetId,
        budget_item_id: budgetItemId,
        metadata: {
          original_size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      }

      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadRecord),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'Erro ao salvar upload')
      }

      // Atualizar status para completed
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { 
          ...newFiles[index], 
          uploadStatus: 'completed',
          uploadId: result.data.upload.id,
        }
        return newFiles
      })

      // Adicionar à lista de arquivos enviados
      setUploadedFiles(prev => [...prev, result.data.upload])

    } catch (error) {
      console.error('Erro no upload:', error)
      
      // Atualizar status para error
      setFiles(prev => {
        const newFiles = [...prev]
        newFiles[index] = { 
          ...newFiles[index], 
          uploadStatus: 'error',
          uploadError: error instanceof Error ? error.message : 'Erro desconhecido',
        }
        return newFiles
      })

      onUploadError?.(error instanceof Error ? error.message : 'Erro no upload')
    }
  }

  const uploadAllFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    
    try {
      const uploadPromises = files
        .filter(file => file.uploadStatus === 'pending')
        .map((file, index) => uploadFile(file, index))

      await Promise.all(uploadPromises)
      
      const completedFiles = files.filter(file => file.uploadStatus === 'completed')
      if (completedFiles.length > 0) {
        onUploadComplete?.(uploadedFiles)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const deleteUploadedFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/uploads/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      onUploadError?.('Erro ao deletar arquivo')
    }
  }

  const getFileIcon = (file: FileWithPreview) => {
    const Icon = fileTypeIcons[fileType]
    return <Icon className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload de Arquivos
          <Badge className={fileTypeColors[fileType]}>
            {fileType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Máximo {maxFiles} arquivos, {maxSize}MB cada
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Selecionar Arquivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Lista de arquivos para upload */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos Selecionados ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  {file.uploadStatus === 'uploading' && (
                    <Progress value={file.uploadProgress || 0} className="mt-2" />
                  )}
                  {file.uploadError && (
                    <p className="text-sm text-red-500 mt-1">{file.uploadError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(file.uploadStatus || 'pending')}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(index)}
                    disabled={file.uploadStatus === 'uploading'}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              onClick={uploadAllFiles}
              disabled={isUploading || files.every(f => f.uploadStatus === 'completed')}
              className="w-full"
            >
              {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
            </Button>
          </div>
        )}

        {/* Lista de arquivos enviados */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos Enviados ({uploadedFiles.length})</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getFileIcon({} as FileWithPreview)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.original_filename}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[file.status]}>
                    {file.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteUploadedFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

