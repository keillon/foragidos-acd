"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSimpleVisit } from "@/lib/simplified-visit"

export default function DebugVisitPage() {
  const [userId, setUserId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    if (!userId) {
      setResult({ success: false, message: "Por favor, insira um ID de usuário" })
      return
    }

    setIsLoading(true)
    try {
      const response = await registerSimpleVisit(userId)
      setResult(response)
    } catch (err) {
      setResult({ success: false, message: "Erro inesperado", error: err })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Depuração de Registro de Visita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Digite o ID do usuário"
              />
              <p className="text-xs text-gray-500">
                Você pode obter o ID do usuário no console do navegador após fazer login
              </p>
            </div>

            <Button onClick={handleTest} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? "Registrando..." : "Registrar Visita"}
            </Button>

            {result && (
              <div className={`p-4 rounded-md ${result.success ? "bg-green-100" : "bg-red-100"}`}>
                <p className="font-medium">
                  {result.success ? "Visita registrada com sucesso!" : "Erro ao registrar visita"}
                </p>
                <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

