import { supabase } from "./supabase"

export async function registerSimpleVisit(userId: string) {
  try {
    console.log("Iniciando registro de visita para usuário:", userId)

    // 1. Registrar a visita
    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .insert([{ user_id: userId, visit_date: new Date().toISOString() }])
      .select()

    if (visitError) {
      console.error("Erro ao registrar visita:", visitError)
      return { success: false, error: visitError }
    }

    console.log("Visita registrada com sucesso:", visitData)

    // 2. Buscar a última visita para verificar streak
    const today = new Date()
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

    console.log("Visita de ontem:", yesterdayVisit)

    // 3. Buscar streak atual do usuário
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("streak")
      .eq("id", userId)
      .single()

    if (userDataError) {
      console.error("Erro ao buscar dados do usuário:", userDataError)
    }

    console.log("Dados atuais do usuário:", userData)

    // 4. Calcular novo streak
    let newStreak = 1 // Padrão: reiniciar streak
    if (yesterdayVisit || (userData && userData.streak === 0)) {
      // Se visitou ontem ou é a primeira visita, incrementar streak
      newStreak = (userData?.streak || 0) + 1
    }

    console.log("Novo streak calculado:", newStreak)

    // 5. Atualizar usuário diretamente (sem usar RPC)
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        streak: newStreak,
        last_visit: today.toISOString(),
        points: supabase.rpc("increment_points", { user_id: userId, amount: 10 }),
      })
      .eq("id", userId)
      .select()
      .single()

    if (userError) {
      console.error("Erro ao atualizar usuário:", userError)
      return { success: false, error: userError }
    }

    console.log("Usuário atualizado com sucesso:", updatedUser)

    // 6. Atualizar pontos mensais
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

    console.log("Pontos mensais existentes:", existingPoints)

    // 7. Atualizar ou inserir pontos mensais
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

    return {
      success: true,
      user: updatedUser,
      visit: visitData,
      monthlyPoints: monthlyPointsResult.data,
    }
  } catch (err) {
    console.error("Erro inesperado:", err)
    return { success: false, error: err }
  }
}

