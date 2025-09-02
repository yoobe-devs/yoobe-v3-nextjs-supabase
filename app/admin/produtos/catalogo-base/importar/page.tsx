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
          limit: 50
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
