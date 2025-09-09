import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Yoobe v3</div>
          <nav className="space-x-4 text-sm">
            <Link href="/docs" className="underline">
              Docs
            </Link>
            <Link href="/store/catalog" className="underline">
              Loja
            </Link>
            <Link href="/admin" className="underline">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Plataforma Yoobe v3
            </h1>
            <p className="text-lg text-muted-foreground">
              Gestão de orçamentos, replicação de produtos e loja com
              elegibilidade por tags.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button size="lg">Entrar</Button>
              </Link>
              <Link href="/docs" className="underline">
                Ver Documentação
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl border p-6">
              <ul className="space-y-3 text-sm">
                <li>• Orçamentos v3.3 com replicação automática</li>
                <li>• SKUs com sequência por empresa e EAN-13</li>
                <li>• Upload/Artes e customizações</li>
                <li>• Tags por usuário/produto e elegibilidade</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted-foreground">
          Yoobe v3.3.0 — Todos os direitos reservados
        </div>
      </footer>
    </main>
  )
}
