'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  File,
  Image,
  FileText,
  Archive,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Artwork {
  id: string
  name: string
  file_url: string
  mime_type: string
  size_bytes: number
  preview_url?: string
  notes?: string
  created_at: string
  companies: {
    id: string
    name: string
  }
}

interface ArtworkListProps {
  budgetId?: string
  itemId?: string
  onSelect?: (artwork: Artwork) => void
  onDelete?: (artworkId: string) => void
  showActions?: boolean
  className?: string
}

const MIME_TYPE_ICONS = {
  'image/jpeg': Image,
  'image/png': Image,
  'image/svg+xml': Image,
  'application/pdf': FileText,
  'application/postscript': File,
  'application/illustrator': File,
  'application/zip': Archive,
  'application/x-zip-compressed': Archive,
}

const MIME_TYPE_LABELS = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/svg+xml': 'SVG',
  'application/pdf': 'PDF',
  'application/postscript': 'EPS',
  'application/illustrator': 'AI',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
}

export function ArtworkList({
  budgetId,
  itemId,
  onSelect,
  onDelete,
  showActions = true,
  className = '',
}: ArtworkListProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(
    new Set()
  )

  useEffect(() => {
    fetchArtworks()
  }, [budgetId, itemId])

  const fetchArtworks = async () => {
    try {
      setIsLoading(true)

      let url = '/api/artworks'
      if (budgetId) {
        url = `/api/budgets/${budgetId}/artworks`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao carregar artes')
      }

      const { data } = await response.json()

      if (budgetId) {
        // Para orçamentos, extrair as artes dos vínculos
        const linkedArtworks =
          data.artworks?.map((link: any) => ({
            ...link.artworks,
            placement: link.placement,
            color_refs: link.color_refs,
            link_notes: link.notes,
          })) || []
        setArtworks(linkedArtworks)
      } else {
        setArtworks(data.artworks || [])
      }
    } catch (error) {
      console.error('Erro ao carregar artes:', error)
      setError('Erro ao carregar artes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (artwork: Artwork) => {
    try {
      const response = await fetch(`/api/artworks/${artwork.id}`)

      if (!response.ok) {
        throw new Error('Erro ao gerar link de download')
      }

      const { data } = await response.json()

      // Abrir link de download em nova aba
      window.open(data.download_url, '_blank')
    } catch (error) {
      console.error('Erro ao baixar arte:', error)
      toast.error('Erro ao baixar arquivo')
    }
  }

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta arte?')) {
      return
    }

    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar arte')
      }

      setArtworks(prev => prev.filter(a => a.id !== artworkId))
      onDelete?.(artworkId)
      toast.success('Arte deletada com sucesso')
    } catch (error) {
      console.error('Erro ao deletar arte:', error)
      toast.error('Erro ao deletar arte')
    }
  }

  const handleSelect = (artwork: Artwork) => {
    if (selectedArtworks.has(artwork.id)) {
      setSelectedArtworks(prev => {
        const newSet = new Set(prev)
        newSet.delete(artwork.id)
        return newSet
      })
    } else {
      setSelectedArtworks(prev => new Set(prev).add(artwork.id))
    }
    onSelect?.(artwork)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM 'de' yyyy", {
        locale: ptBR,
      })
    } catch {
      return dateString
    }
  }

  const getFileIcon = (mimeType: string) => {
    return MIME_TYPE_ICONS[mimeType as keyof typeof MIME_TYPE_ICONS] || File
  }

  const getFileLabel = (mimeType: string) => {
    return (
      MIME_TYPE_LABELS[mimeType as keyof typeof MIME_TYPE_LABELS] || 'Arquivo'
    )
  }

  const filteredArtworks = artworks.filter(
    artwork =>
      artwork.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Artes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-muted rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Artes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchArtworks} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Artes
            </CardTitle>
            <CardDescription>
              {artworks.length} {artworks.length === 1 ? 'arte' : 'artes'}{' '}
              encontrada{artworks.length === 1 ? '' : 's'}
            </CardDescription>
          </div>
          {showActions && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de artes */}
        {filteredArtworks.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Nenhuma arte encontrada'
                : 'Nenhuma arte disponível'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArtworks.map(artwork => {
              const Icon = getFileIcon(artwork.mime_type)
              const label = getFileLabel(artwork.mime_type)
              const isSelected = selectedArtworks.has(artwork.id)

              return (
                <div
                  key={artwork.id}
                  className={`
                    flex gap-4 p-4 border rounded-lg transition-colors cursor-pointer
                    ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }
                  `}
                  onClick={() => handleSelect(artwork)}
                >
                  {/* Preview/Icon */}
                  <div className="flex-shrink-0">
                    {artwork.preview_url ? (
                      <img
                        src={artwork.preview_url}
                        alt={artwork.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium truncate">{artwork.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(artwork.size_bytes)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {artwork.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {artwork.notes}
                      </p>
                    )}

                    {/* Placement info (for budget artworks) */}
                    {(artwork as any).placement && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Posição: {(artwork as any).placement}
                        </Badge>
                        {(artwork as any).color_refs &&
                          (artwork as any).color_refs.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Cores: {(artwork as any).color_refs.join(', ')}
                            </Badge>
                          )}
                      </div>
                    )}

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      Enviado em {formatDate(artwork.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          handleDownload(artwork)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          handleDelete(artwork.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

