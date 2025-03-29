"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Flame, Award, CalendarIcon, BarChart3, Settings, LogOut, Trophy } from "lucide-react"
import StatsView from "@/components/stats-view"
import SettingsView from "@/components/settings-view"
import CompetitionView from "@/components/competition-view"
import { getUserVisits, registerVisit, hasCheckedInToday, getUserMonthlyPoints } from "@/lib/supabase"

interface DashboardProps {
  user: any
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [userData, setUserData] = useState(user)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [visitDates, setVisitDates] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showCheckInButton, setShowCheckInButton] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyPoints, setMonthlyPoints] = useState(0)

  useEffect(() => {
    async function loadUserData() {
      try {
        // Verificar se o usuário já fez check-in hoje
        const { checkedIn, error: checkinError } = await hasCheckedInToday(user.id)
        if (!checkinError) {
          setShowCheckInButton(!checkedIn)
        }

        // Carregar visitas do usuário
        const { visits, error: visitsError } = await getUserVisits(user.id)
        if (!visitsError && visits) {
          setVisitDates(visits.map((v: string) => new Date(v)))
        }

        // Carregar pontos mensais
        const today = new Date()
        const currentMonthStr = `${today.getFullYear()}-${today.getMonth()}`
        const { monthlyPoints, error: pointsError } = await getUserMonthlyPoints(user.id)

        if (!pointsError && monthlyPoints) {
          const currentMonthData = monthlyPoints.find((mp: any) => mp.month === currentMonthStr)
          setMonthlyPoints(currentMonthData ? currentMonthData.points : 0)
        }
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()

    // Configurar notificações
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    // Verificar lembretes
    const reminderTime = localStorage.getItem("reminderTime")
    if (reminderTime) {
      scheduleReminder(reminderTime)
    }
  }, [user])

  const scheduleReminder = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)

    const now = new Date()
    const reminderDate = new Date()
    reminderDate.setHours(hours, minutes, 0, 0)

    // Se o horário já passou hoje, agendar para amanhã
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }

    const timeUntilReminder = reminderDate.getTime() - now.getTime()

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Lembrete dos Foragidos", {
          body: "Não se esqueça de ir à academia hoje!",
          icon: "/favicon.ico",
        })
      }
      // Agendar o próximo lembrete para amanhã
      scheduleReminder(time)
    }, timeUntilReminder)
  }

  const handleCheckIn = async () => {
    setIsLoading(true)

    try {
      console.log("Iniciando check-in para usuário:", user)

      // Verificar se o usuário já fez check-in hoje
      const { checkedIn, error: checkinError } = await hasCheckedInToday(user.id)

      if (checkinError) {
        console.error("Erro ao verificar check-in:", checkinError)
        alert("Erro ao verificar check-in. Por favor, tente novamente.")
        return
      }

      if (checkedIn) {
        alert("Você já registrou presença hoje!")
        setShowCheckInButton(false)
        return
      }

      // Registrar a visita
      const { user: updatedUser, error } = await registerVisit(user.id)

      if (error) {
        console.error("Erro ao registrar visita:", error)
        alert("Erro ao registrar visita. Por favor, tente novamente.")
        return
      }

      if (updatedUser) {
        console.log("Visita registrada com sucesso:", updatedUser)

        // Atualizar dados do usuário na sessão
        sessionStorage.setItem("foragidosUser", JSON.stringify(updatedUser))
        setUserData(updatedUser)

        // Atualizar visitas
        const { visits } = await getUserVisits(user.id)
        if (visits) {
          setVisitDates(visits.map((v: string) => new Date(v)))
        }

        // Atualizar pontos mensais
        const today = new Date()
        const currentMonthStr = `${today.getFullYear()}-${today.getMonth()}`
        const { monthlyPoints } = await getUserMonthlyPoints(user.id)

        if (monthlyPoints) {
          const currentMonthData = monthlyPoints.find((mp: any) => mp.month === currentMonthStr)
          setMonthlyPoints(currentMonthData ? currentMonthData.points : 0)
        }

        setShowCheckInButton(false)
        alert("Presença registrada com sucesso!")
      }
    } catch (err) {
      console.error("Erro inesperado ao fazer check-in:", err)
      alert("Ocorreu um erro inesperado. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-full">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Foragidos da academia</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={userData.photo_url} alt={userData.name} />
              <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sequência atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Flame className={`h-5 w-5 ${userData.streak > 0 ? "text-orange-500" : "text-gray-400"}`} />
                  <span className="text-2xl font-bold">{userData.streak || 0} dias</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pontos do mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">{monthlyPoints} pts</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de visitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{visitDates.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {showCheckInButton && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-xl font-semibold text-center">Você foi à academia hoje?</h3>
                  <Button
                    size="lg"
                    onClick={handleCheckIn}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrando..." : "Registrar presença"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="calendar">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="competition">
                <Trophy className="h-4 w-4 mr-2" />
                Competição
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Seu progresso</CardTitle>
                  <CardDescription>Acompanhe os dias em que você foi à academia</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    modifiers={{
                      visited: visitDates,
                    }}
                    modifiersClassNames={{
                      visited: "bg-green-100 text-green-700 font-bold",
                    }}
                    onMonthChange={(month) => {
                      setCurrentMonth(month.getMonth())
                      setCurrentYear(month.getFullYear())
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <StatsView user={userData} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsView user={userData} setUser={setUserData} />
            </TabsContent>

            <TabsContent value="competition">
              <CompetitionView user={userData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

