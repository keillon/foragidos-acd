"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { signIn, signUp, supabase } from "@/lib/supabase"

interface LoginPageProps {
  onLogin: (userData: any) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    photoUrl: "/placeholder.svg?height=100&width=100",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!supabase) {
      setSupabaseConfigured(false)
      setError("O sistema não está configurado corretamente. Entre em contato com o administrador.")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!supabaseConfigured) {
        setError("O sistema não está configurado corretamente. Entre em contato com o administrador.")
        return
      }

      const { user, error } = await signIn(loginData.username, loginData.password)

      if (error) {
        setError(error.message)
        return
      }

      if (user) {
        onLogin(user)
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!supabaseConfigured) {
      setError("O sistema não está configurado corretamente. Entre em contato com o administrador.")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await signUp(
        registerData.username,
        registerData.password,
        registerData.name,
        registerData.photoUrl,
      )

      if (error) {
        setError(error.message)
        return
      }

      if (user) {
        onLogin(user)
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setRegisterData({ ...registerData, photoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-purple-50 to-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-purple-600 p-3 rounded-full">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Foragidos da academia</CardTitle>
          <CardDescription>Acompanhe sua jornada fitness e mantenha sua motivação</CardDescription>
        </CardHeader>
        <CardContent>
          {!supabaseConfigured ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium">Configuração necessária</h3>
              </div>
              <p className="text-sm text-gray-600">
                O sistema não está configurado corretamente. As variáveis de ambiente do Supabase não foram encontradas.
                Entre em contato com o administrador.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Nome de usuário</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Seu nome de usuário"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="grid gap-4">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <Image
                          src={registerData.photoUrl || "/placeholder.svg"}
                          alt="Profile"
                          className="rounded-full object-cover border-2 border-purple-500"
                          fill
                        />
                        <label
                          htmlFor="photo-upload"
                          className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-1 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                          >
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-username">Nome de usuário</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Escolha um nome de usuário"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Crie uma senha"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmar senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {activeTab === "login" ? (
              <>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  className="text-purple-500 hover:underline"
                  onClick={() => setActiveTab("register")}
                  disabled={!supabaseConfigured}
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button type="button" className="text-purple-500 hover:underline" onClick={() => setActiveTab("login")}>
                  Faça login
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

