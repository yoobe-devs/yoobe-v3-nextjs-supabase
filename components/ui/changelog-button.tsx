'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  GitBranch, 
  Star, 
  Wrench, 
  Shield, 
  Zap,
  Calendar,
  Tag
} from 'lucide-react'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
}

interface ChangelogResponse {
  changelog: ChangelogEntry[]
  total: number
  latest_version: string
}

const typeIcons = {
  feature: GitBranch,
  improvement: Star,
  fix: Wrench,
  security: Shield,
  performance: Zap
}

const typeColors = {
  feature: 'bg-blue-100 text-blue-800',
  improvement: 'bg-green-100 text-green-800',
  fix: 'bg-yellow-100 text-yellow-800',
  security: 'bg-red-100 text-red-800',
  performance: 'bg-purple-100 text-purple-800'
}

export function ChangelogButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [latestVersion, setLatestVersion] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadChangelog()
    }
  }, [isOpen])

  const loadChangelog = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/changelog?limit=5')
      if (response.ok) {
        const data: ChangelogResponse = await response.json()
        setChangelog(data.changelog)
        setLatestVersion(data.latest_version)
      }
    } catch (error) {
      console.error('Erro ao carregar changelog:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <GitBranch className="h-4 w-4 mr-2" />
        Changelog
        {latestVersion && (
          <Badge variant="secondary" className="ml-2 text-xs">
            v{latestVersion}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Changelog da Plataforma
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {changelog.map((entry, index) => {
                  const TypeIcon = typeIcons[entry.type]
                  return (
                    <div key={entry.version} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5" />
                            <Badge className={typeColors[entry.type]}>
                              {entry.type}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {entry.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Tag className="h-3 w-3" />
                              <span>v{entry.version}</span>
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(entry.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {entry.description}
                      </p>

                      <ul className="space-y-2">
                        {entry.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Total de {changelog.length} versões mostradas
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/docs/changelog', '_blank')}
            >
              Ver Changelog Completo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
