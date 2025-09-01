'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  FileText, 
  ExternalLink, 
  Copy, 
  Download,
  BookOpen,
  Database,
  Globe,
  Zap,
  Shield,
  Settings,
  Layers,
  GitBranch
} from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  title?: string
  lastUpdated?: string
  version?: string
}

export function MarkdownRenderer({ content, title, lastUpdated, version }: MarkdownRendererProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Documentação Yoobe'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-tomorrow.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-typescript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-bash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-json.min.js"></script>
</head>
<body class="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    <div class="container mx-auto px-6 py-8">
        ${processMarkdownToHTML(content)}
    </div>
</body>
</html>`
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title?.replace(/\s+/g, '_') || 'documentation'}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const processMarkdownToHTML = (markdown: string): string => {
    let html = markdown
    
    // Headers com gradientes
    html = html.replace(/^# (.*$)/gm, '<div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6 shadow-lg"><h1 class="text-4xl font-bold">$1</h1></div>')
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8 border-l-4 border-blue-500 pl-4">$1</h2>')
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-700 mb-3 mt-6">$1</h3>')
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto"><pre class="text-green-400 text-sm"><code class="language-$1">$2</code></pre></div>')
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">$1</code>')
    
    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(cell => cell.trim() !== '')
      const cellsHtml = cells.map(cell => `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`).join('')
      return `<tr class="hover:bg-gray-50">${cellsHtml}</tr>`
    })
    
    // Wrap tables
    html = html.replace(/(<tr.*?<\/tr>\s*)+/g, '<div class="overflow-x-auto mb-6"><table class="min-w-full bg-white rounded-lg shadow-md">$&</table></div>')
    
    // Lists
    html = html.replace(/^- (.*$)/gm, '<li class="flex items-start gap-2 mb-2"><span class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span><span>$1</span></li>')
    html = html.replace(/(<li.*?<\/li>\s*)+/g, '<ul class="space-y-1 mb-4">$&</ul>')
    
    // Badges/Tags
    html = html.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-600">$1</span>')
    html = html.replace(/✅/g, '<span class="text-green-500">✅</span>')
    html = html.replace(/❌/g, '<span class="text-red-500">❌</span>')
    html = html.replace(/🔧/g, '<span class="text-yellow-500">🔧</span>')
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')
    
    // Paragraphs
    html = html.replace(/\n\n([^<\n].*?)(?=\n\n|$)/g, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>')
    
    return html
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">{title || 'Documentação'}</CardTitle>
                  <p className="text-blue-100 mt-2">Documentação técnica da Yoobe Platform</p>
                </div>
              </div>
              <div className="text-right">
                {version && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                    {version}
                  </Badge>
                )}
                {lastUpdated && (
                  <div className="text-sm text-blue-100">
                    Atualizado em: {lastUpdated}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex gap-4 justify-end">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(content)}
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copiado!' : 'Copiar MD'}
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadAsHTML}
                className="border-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-code:text-red-600 prose-code:bg-gray-100 prose-pre:bg-gray-900 prose-pre:text-green-400"
              dangerouslySetInnerHTML={{ 
                __html: processMarkdownToHTML(content) 
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
