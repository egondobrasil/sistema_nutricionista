import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqluezygzhfmvyrevuxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbHVlenlnemhmbXZ5cmV2dXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODM3NTksImV4cCI6MjA5MTg1OTc1OX0.CSvW-IxwecUEz-FJ2OTOTj63zc8pbJbXud1Vtg2sse0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPaciente() {
  const { data, error } = await supabase.from('pacientes').select('*').ilike('nome', '%Ricardo%')
  if (error) {
    console.error('Error fetching paciente:', error)
  } else {
    console.log('Pacientes com nome Ricardo:', data)
  }
}

checkPaciente()
