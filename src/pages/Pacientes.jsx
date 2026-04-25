import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPacientesComConsultas = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar pacientes
      const { data: patientsData } = await supabase
        .from('pacientes')
        .select('*')
        .eq('nutricionista_id', user.id)
        .order('nome', { ascending: true })

      if (patientsData) {
        // Buscar a última consulta de cada paciente
        const { data: consultationsData } = await supabase
          .from('consultas')
          .select('paciente_id, data_consulta')
          .in('paciente_id', patientsData.map(p => p.id))
          .order('data_consulta', { ascending: false })

        // Mapear última consulta para cada paciente
        const latestConsultations = {}
        consultationsData?.forEach(c => {
          if (!latestConsultations[c.paciente_id]) {
            latestConsultations[c.paciente_id] = c.data_consulta
          }
        })

        const combinedData = patientsData.map(p => ({
          ...p,
          ultima_consulta: latestConsultations[p.id] || 'Nenhuma realizada'
        }))

        setPacientes(combinedData)
      }
      setLoading(false)
    }

    fetchPacientesComConsultas()
  }, [])

  const filteredPatients = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="page-title">Pacientes</h2>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
              Gerencie sua base de clientes e acompanhe seus históricos.
            </p>
          </div>
          <Link to="/pacientes/novo" className="btn" style={{ width: 'auto', padding: '0.875rem 2rem' }}>
            + Novo Paciente
          </Link>
        </header>

        <div className="form-group" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar paciente por nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '1rem' }}
          />
        </div>
        
        <div className="list-card" style={{ padding: '0' }}>
          {loading ? (
            <div className="empty-state">Carregando pacientes...</div>
          ) : filteredPatients.length > 0 ? (
            <div className="patient-list">
              <div className="patient-item" style={{ background: 'rgba(16, 185, 129, 0.05)', fontWeight: '700', cursor: 'default' }}>
                <div style={{ flex: 2 }}>Nome</div>
                <div style={{ flex: 1.5 }}>Objetivo Principal</div>
                <div style={{ flex: 1 }}>Última Consulta</div>
              </div>
              {filteredPatients.map(p => (
                <Link key={p.id} to={`/pacientes/${p.id}`} className="patient-item" style={{ textDecoration: 'none', display: 'flex', padding: '1.25rem 2rem' }}>
                  <div style={{ flex: 2 }} className="patient-name">{p.nome}</div>
                  <div style={{ flex: 1.5, color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {p.objetivo_texto || 'Não informado'}
                  </div>
                  <div style={{ flex: 1, color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {p.ultima_consulta !== 'Nenhuma realizada' 
                      ? new Date(p.ultima_consulta).toLocaleDateString('pt-BR') 
                      : p.ultima_consulta}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {searchTerm ? 'Nenhum paciente encontrado com esse nome.' : 'Nenhum paciente cadastrado ainda.'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Pacientes
