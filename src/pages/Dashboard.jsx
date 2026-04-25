import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    weekConsultations: 0,
    noReturnPatients: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Total de pacientes
      const { count: totalPatients } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user.id)

      // 2. Consultas da semana
      const today = new Date()
      const lastWeek = new Date()
      lastWeek.setDate(today.getDate() - 7)
      
      // Precisamos pegar os IDs dos pacientes dessa nutri para filtrar as consultas
      const { data: myPatients } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('nutricionista_id', user.id)
      
      const patientIds = myPatients?.map(p => p.id) || []
      
      let weekConsultations = 0
      if (patientIds.length > 0) {
        const { count } = await supabase
          .from('consultas')
          .select('*', { count: 'exact', head: true })
          .in('paciente_id', patientIds)
          .gte('data_consulta', lastWeek.toISOString().split('T')[0])
        
        weekConsultations = count || 0
      }

      // 3. Pacientes sem retorno (> 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

      let noReturnPatients = []
      if (patientIds.length > 0) {
        // Pegar a última consulta de cada paciente
        const { data: latestConsultations } = await supabase
          .from('consultas')
          .select('paciente_id, data_consulta, proximo_retorno')
          .in('paciente_id', patientIds)
          .order('data_consulta', { ascending: false })

        // Agrupar por paciente (já que estão ordenados, a primeira ocorrência é a mais recente)
        const latestByPatient = {}
        latestConsultations?.forEach(c => {
          if (!latestByPatient[c.paciente_id]) {
            latestByPatient[c.paciente_id] = c
          }
        })

        // Filtrar pacientes que atendem aos critérios
        noReturnPatients = myPatients
          .filter(p => {
            const lastC = latestByPatient[p.id]
            if (!lastC) return false // Se nunca consultou, não entra nessa regra específica de "sem retorno"
            
            const isOld = lastC.data_consulta < thirtyDaysAgoStr
            const hasNoNext = !lastC.proximo_retorno
            
            return isOld && hasNoNext
          })
          .map(p => ({
            ...p,
            lastDate: latestByPatient[p.id].data_consulta
          }))
      }

      setStats({
        totalPatients: totalPatients || 0,
        weekConsultations,
        noReturnPatients
      })
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
          <h2 className="page-title">Dashboard</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
            Bem-vinda ao seu centro de controle nutricional.
          </p>
        </header>

        {loading ? (
          <div className="empty-state">Carregando dados do painel...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total de Pacientes</span>
                <div className="stat-value">{stats.totalPatients}</div>
              </div>
              
              <div className="stat-card">
                <span className="stat-label">Consultas da Semana</span>
                <div className="stat-value">{stats.weekConsultations}</div>
              </div>

              <div className="stat-card">
                <span className="stat-label">Ativos</span>
                <div className="stat-value">{stats.totalPatients}</div>
              </div>
            </div>

            <div className="list-card">
              <h3>
                Pacientes sem retorno
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-light)' }}>
                  (Última consulta há +30 dias e sem retorno agendado)
                </span>
              </h3>
              
              <div className="patient-list">
                {stats.noReturnPatients.length > 0 ? (
                  stats.noReturnPatients.map(p => (
                    <Link key={p.id} to={`/pacientes/${p.id}`} className="patient-item">
                      <span className="patient-name">{p.nome}</span>
                      <span className="patient-last-date">
                        Última consulta: {new Date(p.lastDate).toLocaleDateString('pt-BR')}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="empty-state">Nenhum paciente sem retorno no momento.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard
