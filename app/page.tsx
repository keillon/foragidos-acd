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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setSupabaseConfigured(false);
      setIsLoading(false);
      return;
    }

    // Verificar se há um usuário na sessão
    const storedUser = sessionStorage.getItem("foragidosUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    // Salvar usuário na sessão (não no localStorage)
    sessionStorage.setItem("foragidosUser", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("foragidosUser");
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!supabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração necessária</CardTitle>
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
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
