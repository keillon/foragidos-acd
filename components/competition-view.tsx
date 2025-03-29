"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { getMonthlyRanking, getPreviousMonthRanking, getAllTimeRanking } from "@/lib/supabase"

interface CompetitionViewProps {
  user: any
}

export default function CompetitionView({ user }: CompetitionViewProps) {
  const [monthlyRanking, setMonthlyRanking] = useState<any[]>([])
  const [allTimeRanking, setAllTimeRanking] = useState<any[]>([])
  const [previousRanking, setPreviousRanking] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState("")
  const [previousMonth, setPreviousMonth] = useState("")
  const [daysLeftInMonth, setDaysLeftInMonth] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRankings() {
      try {
        // Calcular mês atual e anterior
        const now = new Date()
        const currentMonthName = now.toLocaleString("pt-BR", { month: "long" })
        setCurrentMonth(currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1))

        const prevMonth = new Date()
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const prevMonthName = prevMonth.toLocaleString("pt-BR", { month: "long" })
        setPreviousMonth(prevMonthName.charAt(0).toUpperCase() + prevMonthName.slice(1))

        // Calcular dias restantes no mês
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        setDaysLeftInMonth(lastDay - now.getDate())

        // Carregar rankings
        const { ranking: monthlyRank } = await getMonthlyRanking()
        const { ranking: prevRank } = await getPreviousMonthRanking()
        const { ranking: allTimeRank } = await getAllTimeRanking()

        setMonthlyRanking(monthlyRank || [])
        setPreviousRanking(prevRank || [])
        setAllTimeRanking(allTimeRank || [])
      } catch (err) {
        console.error("Erro ao carregar rankings:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRankings()
  }, [user])

  // Obter posição do usuário no ranking
  const getUserRank = (ranking: any[]) => {
    return ranking.findIndex((u) => u.id === user.id) + 1
  }

  // Obter indicador de mudança de posição
  const getPositionChange = (userId: string) => {
    const currentPos = monthlyRanking.findIndex((u) => u.id === userId)
    const prevPos = previousRanking.findIndex((u) => u.id === userId)

    if (prevPos === -1 || currentPos === prevPos) return <Minus className="h-4 w-4 text-gray-500" />
    if (currentPos < prevPos) return <ArrowUp className="h-4 w-4 text-green-500" />
    return <ArrowDown className="h-4 w-4 text-red-500" />
  }

  // Obter máximo de visitas no mês atual
  const getMaxVisits = () => {
    if (monthlyRanking.length === 0) return 0
    return monthlyRanking[0].visits
  }

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
          <CardTitle>Competição Mensal</CardTitle>
          <CardDescription>Quem vai mais à academia neste mês ganha 50 pontos extras!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <h3 className="text-lg font-medium">Competição de {currentMonth}</h3>
                <p className="text-sm text-gray-500">Faltam {daysLeftInMonth} dias para o fim</p>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Prêmio: 50 pontos extras</span>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Sua posição</h3>
                <Badge variant="outline" className="font-medium">
                  {getUserRank(monthlyRanking)}º lugar
                </Badge>
              </div>

              {monthlyRanking.find((u) => u.id === user.id) && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-lg">{getUserRank(monthlyRanking)}</div>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.photo_url} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Visitas</div>
                        <div className="font-medium">{monthlyRanking.find((u) => u.id === user.id)?.visits || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Sequência</div>
                        <div className="font-medium">{user.streak || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso</span>
                      <span>
                        {monthlyRanking.find((u) => u.id === user.id)?.visits || 0} de {getMaxVisits()}
                      </span>
                    </div>
                    <Progress
                      value={
                        getMaxVisits() > 0
                          ? ((monthlyRanking.find((u) => u.id === user.id)?.visits || 0) / getMaxVisits()) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Ranking atual</h3>
              <div className="grid gap-2">
                {monthlyRanking.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-lg w-5 text-center">{index + 1}</div>
                      {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                      {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={user.photoUrl} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {getPositionChange(user.id)}
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Visitas</div>
                        <div className="font-medium">{user.visits}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Competições</CardTitle>
          <CardDescription>Resultados de competições anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="previous">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="previous">Mês Anterior</TabsTrigger>
              <TabsTrigger value="alltime">Todos os Tempos</TabsTrigger>
            </TabsList>

            <TabsContent value="previous">
              <div>
                <h3 className="text-lg font-medium mb-2">Competição de {previousMonth}</h3>

                {previousRanking.length > 0 ? (
                  <div className="grid gap-2">
                    {previousRanking.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-lg w-5 text-center">{index + 1}</div>
                          {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={user.photoUrl} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Visitas</div>
                            <div className="font-medium">{user.visits}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">Nenhum dado disponível para o mês anterior</div>
                )}

                {previousRanking.length > 0 && previousRanking[0].visits > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">
                        {previousRanking[0].name} ganhou a competição com {previousRanking[0].visits} visitas!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alltime">
              <div>
                <h3 className="text-lg font-medium mb-2">Ranking geral</h3>
                <div className="grid gap-2">
                  {allTimeRanking.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-lg w-5 text-center">{index + 1}</div>
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={user.photoUrl} alt={user.name} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Visitas</div>
                          <div className="font-medium">{user.visits}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Pontos</div>
                          <div className="font-medium">{user.points}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

