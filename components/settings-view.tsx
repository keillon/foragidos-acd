"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"
import Image from "next/image"
import { updateUserProfile } from "@/lib/supabase"

interface SettingsViewProps {
  user: any
  setUser: (user: any) => void
}

export default function SettingsView({ user, setUser }: SettingsViewProps) {
  const [name, setName] = useState(user.name || "")
  const [photoUrl, setPhotoUrl] = useState(user.photo_url || "/placeholder.svg?height=100&width=100")
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!localStorage.getItem("reminderTime"))
  const [reminderTime, setReminderTime] = useState(localStorage.getItem("reminderTime") || "18:00")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    setIsLoading(true)

    try {
      const { user: updatedUser, error } = await updateUserProfile(user.id, name, photoUrl)

      if (error) {
        console.error("Erro ao atualizar perfil:", error)
        return
      }

      if (updatedUser) {
        // Atualizar usuário na sessão
        sessionStorage.setItem("foragidosUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
        setSuccessMessage("Perfil atualizado com sucesso!")
      }
    } catch (err) {
      console.error("Erro ao salvar perfil:", err)
    } finally {
      setIsLoading(false)

      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }

  const saveNotificationSettings = () => {
    if (notificationsEnabled) {
      localStorage.setItem("reminderTime", reminderTime)

      // Solicitar permissão de notificação se não concedida
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission()
      }
    } else {
      localStorage.removeItem("reminderTime")
    }

    setSuccessMessage("Configurações de notificação salvas!")

    setTimeout(() => {
      setSuccessMessage("")
    }, 3000)
  }

  return (
    <div className="grid gap-6">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{successMessage}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <Image
                  src={photoUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="rounded-full object-cover border-2 border-purple-500"
                  fill
                />
                <label
                  htmlFor="profile-photo-upload"
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
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input id="username" value={user.username} disabled />
              <p className="text-xs text-gray-500">O nome de usuário não pode ser alterado</p>
            </div>

            <Button onClick={saveProfile} className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure lembretes para ir à academia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <Label htmlFor="notifications" className="font-medium">
                  Lembretes diários
                </Label>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>

            {notificationsEnabled && (
              <div className="grid gap-2">
                <Label htmlFor="reminder-time">Horário do lembrete</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Você receberá uma notificação neste horário para lembrar de ir à academia
                </p>
              </div>
            )}

            <Button onClick={saveNotificationSettings} className="bg-purple-600 hover:bg-purple-700">
              Salvar configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

