import { createClient } from "@supabase/supabase-js"

// Substitua estas variáveis pelas suas credenciais do Supabase
const supabaseUrl = "https://lgwjylyodovpyqlbrnsb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd2p5bHlvZG92cHlxbGJybnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyODY3OTUsImV4cCI6MjA1ODg2Mjc5NX0.6VTMasSg3fI3Np_ufLFNveGBHYNtMQNWHib9QfOGpJM"

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

