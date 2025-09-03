"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Download, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

export default function ImportarCatalogoPage() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [importHistory, setImportHistory] = useState<any[]>([])
  const [category, setCategory] = useState<string>('')
  const [sheetUploading, setSheetUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [duplicates, setDuplicates] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleImport = async (page: number = 1) => {
    try {
      setImporting(true)
      setProgress(0)
      setResult(null)

      // Verificar se o usuário está logado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        throw new Error('Usuário não autenticado')
      }

      // Verificar se é admin
      const userRole = session.user.user_metadata?.role
      if (userRole !== 'admin') {
        throw new Error('Apenas administradores podem importar catálogos')
      }

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      console.log(`🚀 Iniciando importação da página ${page}...`)

      const response = await fetch('/api/scraping/import-catalog', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          page,
          limit: 50,
          category: category || undefined
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setCurrentPage(page)
        
        // Adicionar ao histórico
        setImportHistory(prev => [...prev, {
          page,
          timestamp: new Date().toISOString(),
          success: data.imported,
          errors: data.errors,
          total: data.totalScraped
        }])

        toast.success(`Página ${page} importada com sucesso! ${data.imported} produtos importados`)
        
        // Se há próxima página, perguntar se quer continuar
        if (data.nextPage && data.imported > 0) {
          setTotalPages(data.nextPage)
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao importar produtos')
    } finally {
      setImporting(false)
    }
  }

  const handleImportNextPage = () => {
    if (result?.nextPage) {
      handleImport(result.nextPage)
    }
  }

  const handlePreview = async () => {
    try {
      setImporting(true)
      setProgress(0)
      const url = `/api/scraping/preview?page=${currentPage}${category ? `&category=${encodeURIComponent(category)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha no preview')
      setPreview(data.products || [])
      setSelected(new Set())
      setSelectAll(false)
      // detectar duplicados por SKU
      try {
        const existingRes = await fetch('/api/base-products')
        const existing = await existingRes.json().catch(() => [])
        const set = new Set<string>()
        ;(Array.isArray(existing) ? existing : []).forEach((bp: any) => {
          const sku = (bp?.specifications?.sku || '').toString()
          if (sku) set.add(sku)
        })
        const dup = new Set<string>()
        ;(data.products || []).forEach((p: any) => {
          if (p?.sku && set.has(p.sku)) dup.add(p.sku)
        })
        setDuplicates(dup)
      } catch {}
      toast.success(`Pré-visualização: ${data.products?.length || 0} produtos`)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro no preview')
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  const handleImportSelected = async () => {
    try {
      if (selected.size === 0) {
        toast.error('Selecione ao menos um produto')
        return
      }
      setImporting(true)
      const products = Array.from(selected).map(idx => preview[idx]).filter(Boolean)
      const res = await fetch('/api/scraping/import-selected', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha na importação selecionada')
      toast.success(`Importados: ${data.imported || 0}`)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao importar selecionados')
    } finally {
      setImporting(false)
    }
  }

  const handleImportAllPages = async () => {
    let currentPage = 1
    let hasMorePages = true
    
    while (hasMorePages) {
      try {
        setImporting(true)
        setProgress(0)
        
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) break

        const response = await fetch('/api/scraping/import-catalog', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            page: currentPage,
            limit: 50
          })
        })

        const data = await response.json()
        
        if (response.ok && data.imported > 0) {
          setImportHistory(prev => [...prev, {
            page: currentPage,
            timestamp: new Date().toISOString(),
            success: data.imported,
            errors: data.errors,
            total: data.totalScraped
          }])
          
          toast.success(`Página ${currentPage}: ${data.imported} produtos importados`)
          
          if (data.nextPage) {
            currentPage = data.nextPage
            setProgress((currentPage / 10) * 100) // Assumindo 10 páginas máximo
          } else {
            hasMorePages = false
          }
        } else {
          hasMorePages = false
        }
      } catch (error) {
        console.error(`Erro na página ${currentPage}:`, error)
        hasMorePages = false
      }
    }
    
    setImporting(false)
    setProgress(100)
    toast.success('Importação em lote concluída!')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Importar Catálogo Externo</h1>
          <p className="text-muted-foreground">
            Importe produtos do catálogo externo para o catálogo base
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Catálogo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Catálogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium">URL do Catálogo</Label>
              <p className="text-sm text-muted-foreground">
                https://catalogo.yoobe.co/product
              </p>
            </div>
            
            <div>
              <Label className="font-medium">Produtos por Página</Label>
              <p className="text-sm text-muted-foreground">
                50 produtos por importação
              </p>
            </div>
            
            <div>
              <Label className="font-medium">Informações Coletadas</Label>
              <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                <li>• Nome e descrição do produto</li>
                <li>• Preço base e pontos</li>
                <li>• Categoria automática</li>
                <li>• SKU e NCM</li>
                <li>• Especificações técnicas</li>
                <li>• URL da imagem (se disponível)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Controles de Importação */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Importação</CardTitle>
            <CardDescription>
              Escolha como deseja importar os produtos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="page">Página para Importar</Label>
              <Input
                id="page"
                type="number"
                min="1"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
                disabled={importing}
              />
            </div>
            <div>
              <Button
                onClick={handlePreview}
                disabled={importing}
                variant="outline"
                className="w-full"
              >
                Pré-visualizar Página {currentPage}
              </Button>
            </div>
            <div>
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: 24 (ID da categoria)"
                disabled={importing}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleImport(currentPage)}
                disabled={importing}
                className="flex-1"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Importar Página {currentPage}
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleImportAllPages}
                disabled={importing}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Importar Todas
              </Button>
            </div>
            <div>
              <Button
                onClick={handlePreview}
                disabled={importing}
                variant="outline"
                className="w-full"
              >
                Pré-visualizar Página {currentPage}
              </Button>
            </div>
            
            {result?.nextPage && (
              <Button
                onClick={handleImportNextPage}
                disabled={importing}
                variant="secondary"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar Próxima Página ({result.nextPage})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização ({preview.length})</CardTitle>
            <CardDescription>Selecione os produtos a importar desta página/categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectAll} onChange={(e) => {
                  const checked = e.target.checked
                  setSelectAll(checked)
                  if (checked) {
                    setSelected(new Set(preview.map((_, idx) => idx)))
                  } else {
                    setSelected(new Set())
                  }
                }} />
                Selecionar todos desta página
              </label>
              <div className="text-sm text-gray-600">Duplicados detectados: {Array.from(duplicates).length}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preview.map((p, idx) => (
                <div key={idx} className="border rounded p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={selected.has(idx)} onChange={(e) => {
                      const next = new Set(selected); if (e.target.checked) next.add(idx); else next.delete(idx); setSelected(next)
                    }} />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>SKU: {p.sku}</span>
                        {p.sku && duplicates.has(p.sku) && (
                          <span className="inline-flex items-center rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[10px]">Duplicado</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover rounded" />
                  )}
                  <div className="text-xs text-gray-600 line-clamp-2">{p.description}</div>
                  <div className="text-sm">R$ {Number(p.price_unit || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Selecionados: {selected.size}</div>
              <Button onClick={handleImportSelected} disabled={importing || selected.size === 0}>Importar Selecionados</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização ({preview.length})</CardTitle>
            <CardDescription>Selecione os produtos a importar desta página/categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preview.map((p, idx) => (
                <div key={idx} className="border rounded p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={selected.has(idx)} onChange={(e) => {
                      const next = new Set(selected); if (e.target.checked) next.add(idx); else next.delete(idx); setSelected(next)
                    }} />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500">SKU: {p.sku}</div>
                    </div>
                  </div>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover rounded" />
                  )}
                  <div className="text-xs text-gray-600 line-clamp-2">{p.description}</div>
                  <div className="text-sm">R$ {Number(p.price_unit || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Selecionados: {selected.size}</div>
              <Button onClick={handleImportSelected} disabled={importing || selected.size === 0}>Importar Selecionados</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importação por Planilha */}
      <Card>
        <CardHeader>
          <CardTitle>Importar por Planilha (CSV)</CardTitle>
          <CardDescription>Colunas: name,description,category_id,base_price,image_url,sku,ncm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="/api/admin/produtos/import-sheet/template">Baixar Template</a>
            </Button>
            <input type="file" accept=".csv,text/csv" onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setSheetUploading(true)
              try {
                const text = await file.text()
                const lines = text.split(/\r?\n/).filter(l => l.trim())
                const headers = lines[0].split(',').map(h => h.trim())
                const rows = lines.slice(1).map(line => {
                  const cols = line.split(',')
                  const row: any = {}
                  headers.forEach((h, i) => { row[h] = (cols[i] || '').trim() })
                  return row
                }).filter(r => r.name)
                const res = await fetch('/api/admin/produtos/import-sheet', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows })
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data?.error || 'Falha no import CSV')
                toast.success(`Importados: ${data.inserted}`)
              } catch (err) {
                console.error(err)
                toast.error(err instanceof Error ? err.message : 'Erro no CSV')
              } finally {
                setSheetUploading(false)
              }
            }} />
            {sheetUploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      {importing && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Importando produtos da página {currentPage}...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Produtos Importados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.errors}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalScraped}</div>
                <div className="text-sm text-muted-foreground">Total Encontrado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.page}</div>
                <div className="text-sm text-muted-foreground">Página</div>
              </div>
            </div>
            
            {result.details && result.details.length > 0 && (
              <div className="mt-4">
                <Label className="font-medium">Detalhes:</Label>
                <div className="max-h-40 overflow-y-auto mt-2 space-y-1">
                  {result.details.map((detail: string, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Importações */}
      {importHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importHistory.slice().reverse().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Página {item.page}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{item.success} importados</div>
                    {item.errors > 0 && (
                      <div className="text-sm text-red-600">{item.errors} erros</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
