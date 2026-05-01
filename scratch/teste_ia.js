import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import dotenv from 'dotenv'

// Carrega as variáveis do .env
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const apiKey = process.env.GOOGLE_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)
const genAI = new GoogleGenerativeAI(apiKey)

async function gerarPlanoParaRicardo() {
  console.log("🔍 Buscando o Ricardo no banco de dados...")
  const { data: paciente, error } = await supabase
    .from('pacientes')
    .select('*')
    .ilike('nome', '%Ricardo%')
    .single()

  if (error || !paciente) {
    console.error("❌ Paciente não encontrado:", error?.message)
    return
  }
  
  console.log(`✅ Paciente encontrado: ${paciente.nome}. Gerando plano com Gemini IA... aguarde.`)

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  })

  const prompt = `
    Você é um nutricionista profissional altamente experiente.
    Gere um plano alimentar semanal (7 dias) personalizado com base nos dados do paciente abaixo.

    DADOS DO PACIENTE:
    ${JSON.stringify(paciente, null, 2)}

    DIRETRIZES:
    - Responda APENAS em JSON válido.
    - Não use blocos de código markdown (\`\`\`json) na resposta, apenas o JSON puro.
    - O JSON DEVE seguir EXATAMENTE a estrutura abaixo:
    {
      "plano_semanal": [
        {
          "dia": "Segunda-feira",
          "refeicoes": {
            "cafe_da_manha": ["", "", "", "", ""],
            "lanche_manha": ["", "", "", "", ""],
            "almoco": ["", "", "", "", ""],
            "lanche_tarde": ["", "", "", "", ""],
            "jantar": ["", "", "", "", ""]
          }
        }
      ]
    }
    - Crie todos os 7 dias da semana.
    - Para CADA refeição, forneça exatamente 5 opções diferentes.
    - Use alimentos comuns e acessíveis.
    - Adapte ao objetivo de emagrecimento, usando as informações como idade, peso, patologias e observações fornecidas.
  `

  try {
    const result = await model.generateContent(prompt)
    let resposta = result.response.text()
    
    // Limpando possível formatação markdown
    resposta = resposta.replace(/^```json\n/, '').replace(/\n```$/, '')
    
    const planoJson = JSON.parse(resposta)
    
    console.log("✅ Plano gerado com sucesso pela IA!")
    console.log("💾 Salvando no banco de dados do Supabase...")

    const { error: dbError } = await supabase
      .from('planos_alimentares')
      .insert([{
        paciente_id: paciente.id,
        conteudo: planoJson
      }])

    if (dbError) throw dbError

    console.log("🎉 Plano salvo! Agora você pode abrir o perfil do Ricardo no navegador e ver o plano lá!")

  } catch (err) {
    console.error("❌ Erro ao gerar ou salvar o plano:", err)
  }
}

gerarPlanoParaRicardo()
