import { supabase } from "./supabase"

export async function debugInsertUser() {
  try {
    // Tentativa de inserção direta para depuração
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: "teste_debug",
          password: "senha123",
          name: "Usuário de Teste",
          photo_url: "/placeholder.svg?height=100&width=100",
          points: 0,
          streak: 0,
        },
      ])
      .select()

    return {
      success: !error,
      data,
      error,
      message: error ? `Erro: ${error.message}` : "Inserção bem-sucedida!",
    }
  } catch (err: any) {
    return {
      success: false,
      error: err,
      message: `Exceção: ${err.message || "Erro desconhecido"}`,
    }
  }
}

