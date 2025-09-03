'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ExportarDocsPage() {
  const [downloading, ] = useState(false)
  const download = async (path: string) => { window.open(path, '_blank') }
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Documentação</CardTitle>
          <CardDescription>Baixe artefatos úteis (OpenAPI, CHANGELOG) gerados no repositório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={() => download('/docs/v3/openapi.v3.json')} disabled={downloading}>OpenAPI v3</Button>
            <Button onClick={() => download('/docs/v3/CHANGELOG.md')} disabled={downloading}>CHANGELOG.md</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

