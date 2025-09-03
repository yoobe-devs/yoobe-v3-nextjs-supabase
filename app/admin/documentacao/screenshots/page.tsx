'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ScreenshotsPage() {
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Capturar Screenshots</CardTitle>
          <CardDescription>Guia e ferramentas para atualizar imagens das telas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Consulte o guia em docs/SCREENSHOT_GUIDE.md e use seu pipeline local para atualizar as capturas.</p>
        </CardContent>
      </Card>
    </div>
  )
}

