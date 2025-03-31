"use client";

import { useEffect, useState } from "react";
import LoginPage from "@/components/login-page";
import Dashboard from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

// Componente para exibir erros de forma amigável
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle>Algo deu errado</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro ao carregar o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <p className="mb-4 text-sm text-gray-600">
            Isso pode ocorrer devido a problemas de conexão ou configuração.
            Verifique se as variáveis de ambiente estão configuradas
            corretamente.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={resetErrorBoundary}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Componente para verificar as variáveis de ambiente
function EnvironmentChecker() {
  // Verificar explicitamente as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <CardTitle>Configuração necessária</CardTitle>
          </div>
          <CardDescription>
            As variáveis de ambiente do Supabase não estão configuradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Para usar este aplicativo, você precisa configurar as seguintes
            variáveis de ambiente no Vercel:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>NEXT_PUBLIC_SUPABASE_URL {supabaseUrl ? "✅" : "❌"}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY {supabaseKey ? "✅" : "❌"}</li>
          </ul>
          <p className="mb-4 text-sm text-gray-600">
            Estas variáveis devem ser configuradas no painel de controle do
            Vercel em Settings &gt; Environment Variables.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium">Informações de debug:</p>
            <p className="text-xs text-gray-600">
              URL: {supabaseUrl ? "Definida" : "Não definida"}
            </p>
            <p className="text-xs text-gray-600">
              Key: {supabaseKey ? "Definida" : "Não definida"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Componente principal do aplicativo
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  // Verificar explicitamente as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!supabaseUrl && !!supabaseKey;

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!isConfigured) {
      console.warn(
        "Supabase não configurado. Verifique as variáveis de ambiente."
      );
      setSupabaseConfigured(false);
      setIsLoading(false);
      return;
    }

    // Verificar se há um usuário na sessão
    try {
      const storedUser = sessionStorage.getItem("foragidosUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Erro ao recuperar usuário da sessão:", error);
    }

    setIsLoading(false);
  }, [isConfigured]);

  const handleLogin = (userData: any) => {
    try {
      // Salvar usuário na sessão (não no localStorage)
      sessionStorage.setItem("foragidosUser", JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Erro ao salvar usuário na sessão:", error);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("foragidosUser");
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Erro ao remover usuário da sessão:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return <EnvironmentChecker />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </main>
  );
}

// Componente principal com ErrorBoundary
export default function Home() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AppContent />
    </ErrorBoundary>
  );
}
