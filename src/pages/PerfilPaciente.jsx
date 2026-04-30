import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'
import { 
  User, 
  Activity, 
  FileText, 
  Plus, 
  Save, 
  ChevronLeft, 
  CheckCircle, 
  Calendar,
  Weight,
  Clock,
  ArrowRight
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const PerfilPaciente = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('pessoal')
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivo_texto: '',
    objetivos: [],
    nivel_atividade: 'sedentario',
    patologias: [],
    restricoes_alimentares: [],
    alergias: [],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  })

  const [consultas, setConsultas] = useState([])
  const [planos, setPlanos] = useState([])
  const [idade, setIdade] = useState(null)
  const [imc, setImc] = useState(null)

  const [novaConsulta, setNovaConsulta] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Patient
      const { data: patient, error: pError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single()
      if (pError) throw pError
      setFormData(patient)

      // Fetch Consultations
      const { data: consultations, error: cError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false })
      if (cError) throw cError
      setConsultas(consultas)

      // Fetch Plans
      const { data: plans, error: plError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false })
      if (plError) throw plError
      setPlanos(plans)

    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (formData.data_nascimento) {
      const birth = new Date(formData.data_nascimento)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
      setIdade(age)
    }
  }, [formData.data_nascimento])

  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const h = parseFloat(formData.altura) / 100
      const w = parseFloat(formData.peso_inicial)
      if (h > 0) {
        setImc((w / (h * h)).toFixed(1))
      }
    }
  }, [formData.peso_inicial, formData.altura])

  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error: dbError } = await supabase
      .from('pacientes')
      .update({
        ...formData,
        peso_inicial: parseFloat(formData.peso_inicial),
        altura: parseFloat(formData.altura),
        litros_agua: parseFloat(formData.litros_agua),
        refeicoes_por_dia: parseInt(formData.refeicoes_por_dia)
      })
      .eq('id', id)

    if (dbError) {
      setError(dbError.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  const handleAddConsulta = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error: dbError } = await supabase
      .from('consultas')
      .insert([{
        ...novaConsulta,
        paciente_id: id,
        peso: parseFloat(novaConsulta.peso),
        cintura: novaConsulta.cintura ? parseFloat(novaConsulta.cintura) : null,
        quadril: novaConsulta.quadril ? parseFloat(novaConsulta.quadril) : null,
        percentual_gordura: novaConsulta.percentual_gordura ? parseFloat(novaConsulta.percentual_gordura) : null,
      }])

    if (dbError) {
      setError(dbError.message)
    } else {
      setShowModal(false)
      setNovaConsulta({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      })
      fetchData()
    }
    setSaving(false)
  }

  const chartData = [...consultas]
    .reverse()
    .map(c => ({
      data: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: c.peso
    }))

  const renderMultiChoice = (label, field, options) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              const current = formData[field] || []
              const next = current.includes(opt) 
                ? current.filter(v => v !== opt) 
                : [...current, opt]
              setFormData({...formData, [field]: next})
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1.5px solid var(--border)',
              background: formData[field]?.includes(opt) ? 'var(--primary)' : 'transparent',
              color: formData[field]?.includes(opt) ? 'white' : 'var(--text-light)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content"><div className="empty-state">Carregando perfil do paciente...</div></main>
    </div>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button onClick={() => navigate('/pacientes')} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <ChevronLeft size={18} /> Voltar
            </button>
            <h2 className="page-title">{formData.nome}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-light)' }}>
              <span>{idade} anos</span>
              <span>•</span>
              <span>{formData.sexo}</span>
              <span>•</span>
              <span>{imc ? `IMC: ${imc}` : '--'}</span>
            </div>
          </div>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} /> Alterações salvas com sucesso!
          </div>
        )}

        {/* SEÇÃO 1: DADOS DO PACIENTE */}
        <section className="list-card" style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h3 className="section-title"><User size={24} /> Dados do Paciente</h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {['pessoal', 'clinico', 'habitos'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`btn ${activeTab === t ? '' : 'btn-outline'}`}
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem', 
                  fontSize: '0.85rem',
                  background: activeTab === t ? 'var(--primary)' : 'rgba(16, 185, 129, 0.05)',
                  border: activeTab === t ? 'none' : '1px solid var(--border)',
                  color: activeTab === t ? 'white' : 'var(--text-light)'
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleUpdatePatient}>
            {activeTab === 'pessoal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Nome Completo</label>
                  <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input type="date" value={formData.data_nascimento} onChange={e => setFormData({...formData, data_nascimento: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Sexo</label>
                  <select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})}>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === 'clinico' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Peso Inicial (kg)</label>
                  <input type="number" step="0.1" value={formData.peso_inicial} onChange={e => setFormData({...formData, peso_inicial: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Altura (cm)</label>
                  <input type="number" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  {renderMultiChoice('Objetivos', 'objetivos', ['Emagrecer', 'Hipertrofia', 'Saúde', 'Performance'])}
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Patologias / Condições</label>
                  <textarea value={formData.objetivo_texto} onChange={e => setFormData({...formData, objetivo_texto: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === 'habitos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Refeições/Dia</label>
                  <input type="number" value={formData.refeicoes_por_dia} onChange={e => setFormData({...formData, refeicoes_por_dia: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Água/Dia (Litros)</label>
                  <input type="number" step="0.1" value={formData.litros_agua} onChange={e => setFormData({...formData, litros_agua: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Observações Adicionais</label>
                  <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} />
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn" disabled={saving} style={{ width: 'auto', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </section>

        {/* SEÇÃO 2: CONSULTAS */}
        <section className="list-card" style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h3 className="section-title"><Activity size={24} /> Evolução e Consultas</h3>
            <button onClick={() => setShowModal(true)} className="btn" style={{ width: 'auto', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Plus size={18} /> Nova Consulta
            </button>
          </div>

          <div className="chart-container">
            {consultas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="data" stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-light)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', opacity: 0.5 }}>
                Nenhuma consulta registrada ainda
              </div>
            )}
          </div>

          <div className="history-list">
            {consultas.map(c => (
              <div key={c.id} className="history-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={18} className="text-primary" style={{ color: 'var(--primary)' }} />
                    <strong style={{ fontSize: '1.1rem' }}>{new Date(c.data_consulta).toLocaleDateString('pt-BR')}</strong>
                  </div>
                  <div className="badge">{c.peso} kg</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  <div><strong>Cintura:</strong> {c.cintura || '--'} cm</div>
                  <div><strong>Quadril:</strong> {c.quadril || '--'} cm</div>
                  <div><strong>Gordura:</strong> {c.percentual_gordura || '--'} %</div>
                  <div><strong>Retorno:</strong> {c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : '--'}</div>
                </div>
                {c.observacoes && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(2, 44, 34, 0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {c.observacoes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: PLANOS ALIMENTARES */}
        <section className="list-card">
          <div className="section-header">
            <h3 className="section-title"><FileText size={24} /> Planos Alimentares</h3>
            <button className="btn" style={{ width: 'auto', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7, cursor: 'not-allowed' }}>
              Gerar Plano Alimentar
            </button>
          </div>

          {planos.length > 0 ? (
            <div className="history-list">
              {planos.map(p => (
                <div key={p.id} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Clock size={20} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: '700' }}>Plano Gerado em {new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Versão {new Date(p.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <ArrowRight size={20} style={{ opacity: 0.5 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
              Nenhum plano alimentar gerado ainda
            </div>
          )}
        </section>

        {/* MODAL NOVA CONSULTA */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Nova Consulta</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleAddConsulta}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Data da Consulta</label>
                    <input type="date" value={novaConsulta.data_consulta} onChange={e => setNovaConsulta({...novaConsulta, data_consulta: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Peso Atual (kg)</label>
                    <input type="number" step="0.1" value={novaConsulta.peso} onChange={e => setNovaConsulta({...novaConsulta, peso: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Cintura (cm)</label>
                    <input type="number" value={novaConsulta.cintura} onChange={e => setNovaConsulta({...novaConsulta, cintura: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quadril (cm)</label>
                    <input type="number" value={novaConsulta.quadril} onChange={e => setNovaConsulta({...novaConsulta, quadril: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>% de Gordura</label>
                    <input type="number" step="0.1" value={novaConsulta.percentual_gordura} onChange={e => setNovaConsulta({...novaConsulta, percentual_gordura: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Próximo Retorno</label>
                    <input type="date" value={novaConsulta.proximo_retorno} onChange={e => setNovaConsulta({...novaConsulta, proximo_retorno: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Observações</label>
                    <textarea value={novaConsulta.observacoes} onChange={e => setNovaConsulta({...novaConsulta, observacoes: e.target.value})} />
                  </div>
                </div>

                <div style={{ marginTop: '2.5rem' }}>
                  <button type="submit" className="btn" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar Consulta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default PerfilPaciente
