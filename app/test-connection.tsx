"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testConnection } from "@/lib/supabase-test";

export default function TestConnection() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await testConnection();
      setResult(response);
    } catch (err) {
      setResult({ success: false, message: "Erro inesperado", error: err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Teste de Conexão com Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              onClick={handleTest}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Testando..." : "Testar Conexão"}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-md ${
                  result.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-medium">{result.message}</p>
                {!result.success && (
                  <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                    {JSON.stringify(result.details || result.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
