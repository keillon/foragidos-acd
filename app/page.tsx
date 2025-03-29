"use client"

import { useEffect, useState } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário na sessão
    const storedUser = sessionStorage.getItem("foragidosUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: any) => {
    // Salvar usuário na sessão (não no localStorage)
    sessionStorage.setItem("foragidosUser", JSON.stringify(userData))
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("foragidosUser")
    setUser(null)
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Dashboard user={user} onLogout={handleLogout} />}
    </main>
  )
}

