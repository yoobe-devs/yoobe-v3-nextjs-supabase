'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tag, User, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserTag {
  key: string
  value: string
  description?: string
  color?: string
}

interface UserTagsDisplayProps {
  userId?: string
  className?: string
  variant?: 'inline' | 'modal' | 'card'
  showDescription?: boolean
}

export function UserTagsDisplay({ 
  userId,
  className,
  variant = 'inline',
  showDescription = false
}: UserTagsDisplayProps) {
  const [tags, setTags] = useState<UserTag[]>([])
  const [tagsByKey, setTagsByKey] = useState<Record<string, UserTag[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserTags = async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/me/tags')
      const data = await response.json()
      
      if (data.success) {
        setTags(data.data.tags || [])
        setTagsByKey(data.data.tagsByKey || {})
      } else {
        setError(data.error?.message || 'Erro ao carregar tags')
      }
    } catch (err) {
      setError('Erro ao carregar tags do usuário')
      console.error('Erro ao buscar tags:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserTags()
  }, [userId])

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-red-600 text-sm', className)}>
        {error}
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <div className={cn('text-gray-500 text-sm', className)}>
        Nenhuma tag atribuída
      </div>
    )
  }

  const renderInlineTags = () => (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {Object.entries(tagsByKey).map(([key, keyTags]) => (
        <div key={key} className="flex items-center gap-1">
          {keyTags.map((tag, index) => (
            <Badge
              key={`${tag.key}-${tag.value}-${index}`}
              variant="outline"
              className="text-xs"
              style={{ 
                borderColor: tag.color || '#3B82F6',
                color: tag.color || '#3B82F6'
              }}
            >
              {tag.value}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  )

  const renderCardTags = () => (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Minhas Tags
        </CardTitle>
        <CardDescription>
          Tags atribuídas ao seu perfil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(tagsByKey).map(([key, keyTags]) => (
            <div key={key} className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 capitalize">
                {key}
              </h4>
              <div className="flex flex-wrap gap-2">
                {keyTags.map((tag, index) => (
                  <Badge
                    key={`${tag.key}-${tag.value}-${index}`}
                    variant="outline"
                    className="text-xs"
                    style={{ 
                      borderColor: tag.color || '#3B82F6',
                      color: tag.color || '#3B82F6'
                    }}
                  >
                    {tag.value}
                  </Badge>
                ))}
              </div>
              {showDescription && keyTags[0]?.description && (
                <p className="text-xs text-gray-500">
                  {keyTags[0].description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderModalTags = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <Tag className="h-4 w-4" />
          Ver Minhas Tags ({tags.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Minhas Tags
          </DialogTitle>
          <DialogDescription>
            Tags atribuídas ao seu perfil que determinam sua elegibilidade para produtos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(tagsByKey).map(([key, keyTags]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-base capitalize">
                  {key}
                </h4>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {keyTags.map((tag, index) => (
                  <Badge
                    key={`${tag.key}-${tag.value}-${index}`}
                    variant="outline"
                    className="text-sm"
                    style={{ 
                      borderColor: tag.color || '#3B82F6',
                      color: tag.color || '#3B82F6'
                    }}
                  >
                    {tag.value}
                  </Badge>
                ))}
              </div>
              {showDescription && keyTags[0]?.description && (
                <p className="text-sm text-gray-600">
                  {keyTags[0].description}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )

  switch (variant) {
    case 'card':
      return renderCardTags()
    case 'modal':
      return renderModalTags()
    default:
      return renderInlineTags()
  }
}

interface UserTagsSummaryProps {
  className?: string
}

export function UserTagsSummary({ className }: UserTagsSummaryProps) {
  const [tagsCount, setTagsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTagsCount = async () => {
      try {
        const response = await fetch('/api/me/tags')
        const data = await response.json()
        
        if (data.success) {
          setTagsCount(data.data.total || 0)
        }
      } catch (err) {
        console.error('Erro ao buscar contagem de tags:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTagsCount()
  }, [])

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 h-6 w-16 rounded', className)}></div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-600', className)}>
      <Tag className="h-4 w-4" />
      <span>{tagsCount} tags atribuídas</span>
    </div>
  )
}
