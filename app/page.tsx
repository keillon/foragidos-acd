"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Capturar variáveis de ambiente
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || "não definida",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "não definida",
    };
    setEnvVars(vars);

    // Testar criação de URL
    try {
      const url = new URL("/auth/v1", vars.NEXT_PUBLIC_SUPABASE_URL);
      setTestResult({
        success: true,
        message: "URL válida",
        url: url.toString(),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro ao criar URL: ${error.message}`,
        error,
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Diagnóstico de Variáveis de Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium mb-2">Variáveis detectadas:</h3>
              <div className="p-4 bg-gray-100 rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(envVars, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Teste de URL:</h3>
              <div
                className={`p-4 rounded-md ${
                  testResult?.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-medium">{testResult?.message}</p>
                {testResult?.url && (
                  <p className="text-xs mt-2 break-all">{testResult.url}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Formato correto:</h3>
              <ul className="list-disc pl-5 text-sm">
                <li>
                  NEXT_PUBLIC_SUPABASE_URL:{" "}
                  <code>https://lgwjylyodovpyqlbrnsb.supabase.co</code>
                </li>
                <li>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
                  <code>
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd2p5bHlvZG92cHlxbGJybnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyODY3OTUsImV4cCI6MjA1ODg2Mjc5NX0.6VTMasSg3fI3Np_ufLFNveGBHYNtMQNWHib9QfOGpJM
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
