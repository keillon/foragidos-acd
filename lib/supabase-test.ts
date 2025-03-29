import { createClient } from "@supabase/supabase-js"

// Substitua estas variáveis pelas suas credenciais do Supabase
const supabaseUrl = "https://SEU_ID_DO_PROJETO.supabase.co"
const supabaseAnonKey = "SUA_CHAVE_ANON"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função simples para testar a conexão
export async function testConnection() {
  try {
    // Tenta fazer uma consulta simples
    const { data, error } = await supabase.from("users").select("count()").single()

    if (error) {
      return { success: false, message: error.message, details: error }
    }

    return { success: true, message: "Conexão bem-sucedida!", data }
  } catch (err) {
    return { success: false, message: "Erro ao conectar", error: err }
  }
}

