"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Erro na aplicação:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle>Algo deu errado</CardTitle>
          </div>
          <CardDescription>Ocorreu um erro ao carregar o aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Isso pode ocorrer devido a problemas de conexão ou configuração. Verifique se as variáveis de ambiente estão
            configuradas corretamente.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full bg-purple-600 hover:bg-purple-700">
            Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

