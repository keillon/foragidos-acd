"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <CardTitle>Erro crítico</CardTitle>
              </div>
              <CardDescription>Ocorreu um erro crítico na aplicação.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={reset} className="w-full bg-purple-600 hover:bg-purple-700">
                Tentar novamente
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}

