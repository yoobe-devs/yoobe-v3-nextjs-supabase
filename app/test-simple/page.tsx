export default function TestSimplePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Página de Teste Simples - FUNCIONANDO!
      </h1>
      <p className="mt-4 text-gray-600">
        Se você está vendo esta página, o Next.js está funcionando corretamente.
      </p>
      <div className="mt-6 space-y-4">
        <a 
          href="/auth/login" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ir para Login
        </a>
        <br />
        <a 
          href="/test-gestor" 
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Teste do Gestor
        </a>
        <br />
        <a 
          href="/gestor/dashboard" 
          className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Dashboard do Gestor
        </a>
      </div>
    </div>
  )
}
