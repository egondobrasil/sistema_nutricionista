import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqluezygzhfmvyrevuxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbHVlenlnemhmbXZ5cmV2dXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODM3NTksImV4cCI6MjA5MTg1OTc1OX0.CSvW-IxwecUEz-FJ2OTOTj63zc8pbJbXud1Vtg2sse0'
const supabase = createClient(supabaseUrl, supabaseKey)

// Dados recebidos + Adições Criativas para o perfil nutricional
const pacienteData = {
  nome: "Ricardo Emanuel Barros",
  data_nascimento: "1997-04-01", // Convertido de 01/04/1997
  sexo: "masculino",
  telefone: "(82) 3702-3007",
  whatsapp: "(82) 99884-7796",
  email: "ricardo.emanuel.barros@editorazap.com.br",
  
  // Transformações básicas
  peso_inicial: 106,
  altura: 180, // Convertido de 1,80m para 180cm
  
  // --- INFORMAÇÕES NUTRICIONAIS (Criativas baseadas no perfil) ---
  // Um homem de 29 anos com 1.80m e 106kg possui IMC de 32.7 (Obesidade Grau I)
  objetivos: ["Emagrecer", "Saúde"],
  objetivo_texto: "Gostaria de reduzir peso para melhorar a saúde geral e ter mais disposição no dia a dia.",
  
  nivel_atividade: "sedentario",
  atividade_fisica: false,
  atividade_fisica_descricao: "Pretende começar caminhadas leves na próxima semana.",
  
  patologias: ["Hipertensão leve", "Resistência à insulina"],
  restricoes_alimentares: ["Evitar excesso de sódio e carboidratos simples"],
  alergias: [],
  
  medicamentos: "Losartana 50mg (uso contínuo)",
  suplementos: "Nenhum no momento",
  
  refeicoes_por_dia: 4,
  horario_acorda: "07:00",
  horario_dorme: "23:30",
  litros_agua: 2.0, // Meta será aumentar
  
  observacoes: "Paciente relata ansiedade no trabalho (editora), o que gera episódios de compulsão alimentar noturna. Foco inicial em reeducação alimentar e não em dietas muito restritivas."
}

async function insertPaciente() {
  console.log("Inserindo paciente no banco de dados...")
  
  const { data, error } = await supabase
    .from('pacientes')
    .insert([pacienteData])
    .select()

  if (error) {
    console.error('Erro ao inserir paciente:', error.message)
    return
  }

  console.log('✅ Paciente inserido com sucesso!')
  console.log('ID do Paciente:', data[0].id)
}

insertPaciente()
