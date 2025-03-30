import { createClient } from "@supabase/supabase-js"

// Verificar se estamos no lado do cliente
const isBrowser = typeof window !== "undefined"

// Use environment variables for Supabase credentials with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Criar cliente apenas se estivermos no navegador e a URL for válida
export const supabase = isBrowser && supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to check if Supabase is configured
function checkSupabaseConfig() {
  if (!supabase) {
    console.error(
      "Supabase not configured or running during build. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    )
    return false
  }
  return true
}

// Funções auxiliares para autenticação - versão simplificada sem usar auth
export async function signUp(username: string, password: string, name: string, photoUrl = "") {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  // Primeiro, verificamos se o usuário já existe
  const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

  if (existingUser) {
    return { error: { message: "Nome de usuário já existe" } }
  }

  try {
    // Criamos o usuário diretamente na tabela users
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password, // Em produção, use autenticação do Supabase
          name,
          photo_url: photoUrl || "/placeholder.svg?height=100&width=100",
          points: 0,
          streak: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Erro ao inserir usuário:", error)
      return { error }
    }

    return { user: data }
  } catch (err) {
    console.error("Erro ao criar usuário:", err)
    return { error: { message: "Erro ao criar usuário" } }
  }
}

export async function signIn(username: string, password: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password) // Em produção, use autenticação do Supabase
    .single()

  if (error || !data) {
    return { error: { message: "Usuário ou senha inválidos" } }
  }

  return { user: data }
}

export async function signOut() {
  // Versão simplificada sem usar auth
  return { error: null }
}

// Funções para gerenciar visitas
export async function registerVisit(userId: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  try {
    console.log("Iniciando registro de visita para usuário:", userId)
    const today = new Date()

    // 1. Registrar a visita
    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .insert([{ user_id: userId, visit_date: today.toISOString() }])
      .select()

    if (visitError) {
      console.error("Erro ao registrar visita:", visitError)
      return { error: visitError }
    }

    console.log("Visita registrada com sucesso:", visitData)

    // 2. Buscar a última visita para verificar streak
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday)
    yesterdayStart.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const { data: yesterdayVisit, error: yesterdayError } = await supabase
      .from("visits")
      .select("*")
      .eq("user_id", userId)
      .gte("visit_date", yesterdayStart.toISOString())
      .lte("visit_date", yesterdayEnd.toISOString())
      .single()

    if (yesterdayError && yesterdayError.code !== "PGRST116") {
      console.error("Erro ao verificar visita de ontem:", yesterdayError)
    }

    // 3. Buscar dados atuais do usuário
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("streak, points")
      .eq("id", userId)
      .single()

    if (userDataError) {
      console.error("Erro ao buscar dados do usuário:", userDataError)
      return { error: userDataError }
    }

    // 4. Calcular novo streak
    let newStreak = 1 // Padrão: reiniciar streak
    if (yesterdayVisit || (userData && userData.streak === 0)) {
      // Se visitou ontem ou é a primeira visita, incrementar streak
      newStreak = (userData?.streak || 0) + 1
    }

    console.log("Novo streak calculado:", newStreak)

    // 5. Calcular novos pontos
    const newPoints = (userData?.points || 0) + 10

    console.log("Novos pontos calculados:", newPoints)

    // 6. Atualizar usuário diretamente sem usar RPC
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        streak: newStreak,
        last_visit: today.toISOString(),
        points: newPoints,
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) {
      console.error("Erro ao atualizar usuário:", userError)
      return { error: userError }
    }

    console.log("Usuário atualizado com sucesso:", updatedUser)

    // 7. Atualizar pontos mensais
    const currentMonth = `${today.getFullYear()}-${today.getMonth()}`

    // Verificar se já existe registro para este mês
    const { data: existingPoints, error: pointsQueryError } = await supabase
      .from("monthly_points")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single()

    if (pointsQueryError && pointsQueryError.code !== "PGRST116") {
      console.error("Erro ao buscar pontos mensais:", pointsQueryError)
    }

    let monthlyPointsResult

    if (existingPoints) {
      // Atualizar pontos existentes
      monthlyPointsResult = await supabase
        .from("monthly_points")
        .update({ points: existingPoints.points + 10 })
        .eq("id", existingPoints.id)
        .select()
    } else {
      // Criar novo registro de pontos
      monthlyPointsResult = await supabase
        .from("monthly_points")
        .insert([{ user_id: userId, month: currentMonth, points: 10 }])
        .select()
    }

    if (monthlyPointsResult.error) {
      console.error("Erro ao atualizar pontos mensais:", monthlyPointsResult.error)
    } else {
      console.log("Pontos mensais atualizados com sucesso:", monthlyPointsResult.data)
    }

    return { user: updatedUser }
  } catch (err) {
    console.error("Erro inesperado ao registrar visita:", err)
    return { error: err }
  }
}

// Função para verificar se o usuário já fez check-in hoje
export async function hasCheckedInToday(userId: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  console.log("Verificando check-in para o usuário:", userId)
  console.log("Período de verificação:", startOfDay.toISOString(), "até", endOfDay.toISOString())

  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("user_id", userId)
    .gte("visit_date", startOfDay.toISOString())
    .lte("visit_date", endOfDay.toISOString())
    .single()

  console.log("Resultado da verificação:", { data, error })

  if (error && error.code !== "PGRST116") {
    // PGRST116 é o código para "nenhum resultado encontrado"
    console.error("Erro ao verificar check-in:", error)
    return { error }
  }

  return { checkedIn: !!data }
}

// Restante das funções permanecem iguais, mas com verificação de configuração
export async function getUserVisits(userId: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase
    .from("visits")
    .select("visit_date")
    .eq("user_id", userId)
    .order("visit_date", { ascending: true })

  if (error) return { error }
  return { visits: data.map((v) => v.visit_date) }
}

export async function getUserMonthlyPoints(userId: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase
    .from("monthly_points")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: true })

  if (error) return { error }
  return { monthlyPoints: data }
}

export async function getUserAchievements(userId: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .order("achieved_at", { ascending: false })

  if (error) return { error }
  return { achievements: data }
}

export async function getAllUsers() {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase.from("users").select("*")

  if (error) return { error }
  return { users: data }
}

export async function updateUserProfile(userId: string, name: string, photoUrl: string) {
  if (!checkSupabaseConfig()) return { error: { message: "Supabase not configured" } }

  const { data, error } = await supabase
    .from("users")
    .update({ name, photo_url: photoUrl })
    .eq("id", userId)
    .select()
    .single()

  if (error) return { error }
  return { user: data }
}

export async function getMonthlyRanking() {
  if (!checkSupabaseConfig()) return { ranking: [] }

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

  // Buscar todos os usuários
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, name, photo_url, streak, points")

  if (usersError || !users) return { error: usersError }

  // Para cada usuário, contar visitas do mês atual
  const userVisitsPromises = users.map(async (user) => {
    const { data: visits } = await supabase
      .from("visits")
      .select("*")
      .eq("user_id", user.id)
      .gte("visit_date", startOfMonth.toISOString())
      .lte("visit_date", endOfMonth.toISOString())

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      photoUrl: user.photo_url,
      visits: visits ? visits.length : 0,
      streak: user.streak || 0,
      points: user.points || 0,
    }
  })

  const userVisits = await Promise.all(userVisitsPromises)

  // Ordenar por número de visitas (decrescente)
  return { ranking: userVisits.sort((a, b) => b.visits - a.visits) }
}

export async function getPreviousMonthRanking() {
  if (!checkSupabaseConfig()) return { ranking: [] }

  const today = new Date()
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
  const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59)

  // Buscar todos os usuários
  const { data: users, error: usersError } = await supabase.from("users").select("id, username, name, photo_url")

  if (usersError || !users) return { error: usersError }

  // Para cada usuário, contar visitas do mês passado
  const userVisitsPromises = users.map(async (user) => {
    const { data: visits } = await supabase
      .from("visits")
      .select("*")
      .eq("user_id", user.id)
      .gte("visit_date", startOfMonth.toISOString())
      .lte("visit_date", endOfMonth.toISOString())

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      photoUrl: user.photo_url,
      visits: visits ? visits.length : 0,
    }
  })

  const userVisits = await Promise.all(userVisitsPromises)

  // Ordenar por número de visitas (decrescente)
  return { ranking: userVisits.sort((a, b) => b.visits - a.visits) }
}

export async function getAllTimeRanking() {
  if (!checkSupabaseConfig()) return { ranking: [] }

  // Buscar todos os usuários com seus pontos e visitas
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, username, name, photo_url, points, streak")

  if (usersError || !users) return { error: usersError }

  // Para cada usuário, contar o total de visitas
  const userVisitsPromises = users.map(async (user) => {
    const { data: visits } = await supabase.from("visits").select("*").eq("user_id", user.id)

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      photoUrl: user.photo_url,
      visits: visits ? visits.length : 0,
      streak: user.streak || 0,
      points: user.points || 0,
    }
  })

  const userVisits = await Promise.all(userVisitsPromises)

  // Ordenar por número de visitas (decrescente)
  return { ranking: userVisits.sort((a, b) => b.visits - a.visits) }
}

