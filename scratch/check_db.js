import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://vqluezygzhfmvyrevuxx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbHVlenlnemhmbXZ5cmV2dXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODM3NTksImV4cCI6MjA5MTg1OTc1OX0.CSvW-IxwecUEz-FJ2OTOTj63zc8pbJbXud1Vtg2sse0')

async function checkTable() {
  const { data, error } = await supabase.from('planos_alimentares').select('*').limit(1)
  if (error) {
    console.error('Error fetching planos_alimentares:', error)
  } else {
    console.log('Successfully connected to planos_alimentares')
  }
}

checkTable()
