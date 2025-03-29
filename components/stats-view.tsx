"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Flame, CalendarIcon } from "lucide-react"
import { getUserVisits, getUserMonthlyPoints } from "@/lib/supabase"

interface StatsViewProps {
  user: any
}

export default function StatsView({ user }: StatsViewProps) {
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [visitDates, setVisitDates] = useState<string[]>([])
  const [monthlyPointsData, setMonthlyPointsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserStats() {
      try {
        // Carregar visitas do usuário
        const { visits, error: visitsError } = await getUserVisits(user.id)

        if (!visitsError && visits) {
          setVisitDates(visits)

          // Processar dados mensais
          const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
          const monthCounts: { [key: string]: number } = {}

          visits.forEach((visit: string) => {
            const date = new Date(visit)
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
            monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1
          })

          const monthlyChartData = Object.keys(monthCounts).map((key) => ({
            name: key,
            visits: monthCounts[key],
          }))

          setMonthlyData(monthlyChartData)

          // Processar dados semanais
          const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
          const dayCounts = Array(7).fill(0)

          visits.forEach((visit: string) => {
            const date = new Date(visit)
            const dayOfWeek = date.getDay()
            dayCounts[dayOfWeek]++
          })

          const weeklyChartData = dayNames.map((day, index) => ({
            name: day,
            visits: dayCounts[index],
          }))

          setWeeklyData(weeklyChartData)
        }

        // Carregar pontos mensais
        const { monthlyPoints, error: pointsError } = await getUserMonthlyPoints(user.id)

        if (!pointsError && monthlyPoints) {
          const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

          const pointsChartData = monthlyPoints.map((mp: any) => {
            const [year, month] = mp.month.split("-")
            return {
              name: `${monthNames[Number.parseInt(month)]} ${year}`,
              points: mp.points,
            }
          })

          setMonthlyPointsData(pointsChartData)
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserStats()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>Visualize seu progresso ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visits">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="visits">Visitas</TabsTrigger>
              <TabsTrigger value="points">Pontos</TabsTrigger>
            </TabsList>

            <TabsContent value="visits">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Visitas por dia da semana</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#9333ea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Visitas por mês</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#9333ea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="points">
              <div>
                <h3 className="text-lg font-medium mb-2">Pontos por mês</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPointsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="points" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conquistas</CardTitle>
          <CardDescription>Seus marcos e recompensas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${user.streak >= 3 ? "bg-green-100" : "bg-gray-100"}`}>
                  <Flame className={`h-5 w-5 ${user.streak >= 3 ? "text-green-500" : "text-gray-400"}`} />
                </div>
                <div>
                  <h4 className="font-medium">Sequência de 3 dias</h4>
                  <p className="text-sm text-gray-500">Visite a academia por 3 dias seguidos</p>
                </div>
              </div>
              {user.streak >= 3 ? (
                <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded">Concluído</div>
              ) : (
                <div className="text-xs font-medium">{user.streak}/3</div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${user.streak >= 7 ? "bg-green-100" : "bg-gray-100"}`}>
                  <Flame className={`h-5 w-5 ${user.streak >= 7 ? "text-green-500" : "text-gray-400"}`} />
                </div>
                <div>
                  <h4 className="font-medium">Sequência de 7 dias</h4>
                  <p className="text-sm text-gray-500">Visite a academia por 7 dias seguidos</p>
                </div>
              </div>
              {user.streak >= 7 ? (
                <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded">Concluído</div>
              ) : (
                <div className="text-xs font-medium">{user.streak}/7</div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${visitDates?.length >= 10 ? "bg-green-100" : "bg-gray-100"}`}>
                  <CalendarIcon
                    className={`h-5 w-5 ${visitDates?.length >= 10 ? "text-green-500" : "text-gray-400"}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium">10 visitas</h4>
                  <p className="text-sm text-gray-500">Visite a academia 10 vezes</p>
                </div>
              </div>
              {visitDates?.length >= 10 ? (
                <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded">Concluído</div>
              ) : (
                <div className="text-xs font-medium">{visitDates?.length || 0}/10</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

