'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const docs = [
  { title: 'Visão Geral', path: '/admin/documentacao/viva/PLATFORM_OVERVIEW' },
  { title: 'Manual do Usuário', path: '/admin/documentacao/viva/USER_GUIDE' },
  { title: 'API Reference', path: '/admin/documentacao/viva/API_REFERENCE' },
  { title: 'Schema do Banco', path: '/admin/documentacao/viva/DATABASE_SCHEMA' },
]

export default function VisualizarDocsPage() {
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visualizar Documentação</CardTitle>
          <CardDescription>Acesse as principais seções</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            {docs.map(d => (
              <li key={d.path}><Link className="text-blue-600 hover:underline" href={d.path}>{d.title}</Link></li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

