import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Sidebar from '../components/Sidebar'

const NovoPaciente = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('pessoal')

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

  // Helpers de Cálculo e Validação
  const [idade, setIdade] = useState(null)
  const [imc, setImc] = useState(null)
  const [incompleteTabs, setIncompleteTabs] = useState([])

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
        const val = (w / (h * h)).toFixed(1)
        setImc(val)
      }
    } else {
      setImc(null)
    }
  }, [formData.peso_inicial, formData.altura])

  // Lógica de verificação de abas incompletas
  useEffect(() => {
    const incomplete = []
    
    // Aba Pessoal
    if (!formData.nome || !formData.data_nascimento || !formData.sexo || !formData.telefone || !formData.email) {
      incomplete.push('pessoal')
    }
    
    // Aba Clínico
    if (!formData.peso_inicial || !formData.altura || formData.objetivos.length === 0 || formData.patologias.length === 0) {
      incomplete.push('clinico')
    }
    
    // Aba Hábitos
    if (!formData.refeicoes_por_dia || !formData.litros_agua || !formData.horario_acorda || !formData.horario_dorme) {
      incomplete.push('habitos')
    }

    setIncompleteTabs(incomplete)
  }, [formData])

  const maskPhone = (value) => {
    if (!value) return ""
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const formatTime = (value) => {
    if (!value) return ''
    const str = value.toString().replace(/\D/g, '')
    if (!str) return ''
    if (str.length <= 2) {
      const h = parseInt(str)
      if (h >= 0 && h <= 23) return `${str.padStart(2, '0')}:00`
      return '00:00'
    }
    if (str.length === 3) return `0${str[0]}:${str.slice(1)}`
    if (str.length === 4) return `${str.slice(0, 2)}:${str.slice(2)}`
    return value
  }

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || []
      if (value === 'Nenhum') return { ...prev, [field]: ['Nenhum'] }
      const filtered = current.filter(v => v !== 'Nenhum')
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...filtered, value] }
      }
    })
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    if (id === 'telefone' || id === 'whatsapp') {
      const maskedValue = maskPhone(value)
      setFormData(prev => ({ ...prev, [id]: maskedValue }))
      return
    }
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sessão expirada. Faça login novamente.')
      setLoading(false)
      return
    }

    const payload = {
      ...formData,
      nutricionista_id: user.id,
      peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
      altura: formData.altura ? parseFloat(formData.altura) : null,
      litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
      refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
    }

    const { data, error: dbError } = await supabase
      .from('pacientes')
      .insert([payload])
      .select()

    if (dbError) {
      setError(`Erro ao salvar: ${dbError.message}`)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate(`/pacientes/${data[0].id}`), 1500)
    }
  }

  const renderMultiChoice = (label, field, options) => (
    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleMultiSelect(field, opt)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1.5px solid var(--border)',
              background: formData[field]?.includes(opt) ? 'var(--primary)' : 'transparent',
              color: formData[field]?.includes(opt) ? 'white' : 'var(--text-light)',
              fontSize: '0.8rem',
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

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <h2 className="page-title">Novo Paciente</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Ficha de anamnese nutricional completa.</p>
        </header>

        {error && <div className="error-message">{error}</div>}
        
        {incompleteTabs.length > 0 && !success && (
          <div className="error-message" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong>Cadastro Incompleto:</strong> Algumas abas ainda possuem campos importantes em branco. 
              Isso pode dificultar sua análise clínica futuramente.
            </div>
          </div>
        )}

        {success && <div className="error-message" style={{ backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary-dark)' }}>
          Paciente cadastrado com sucesso! Redirecionando...
        </div>}

        <div className="list-card" style={{ padding: '0' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {['pessoal', 'clinico', 'habitos'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '1.25rem', background: 'transparent', border: 'none',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-light)',
                  borderBottom: activeTab === tab ? '3px solid var(--primary)' : 'none',
                  fontWeight: '700', textTransform: 'uppercase', fontSize: '0.85rem', cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {tab}
                {incompleteTabs.includes(tab) && (
                  <span style={{ position: 'absolute', top: '1rem', right: '1rem', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24', boxShadow: '0 0 10px #fbbf24' }}></span>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
            {activeTab === 'pessoal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="nome">Nome Completo *</label>
                  <input id="nome" type="text" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="data_nascimento">Data de Nascimento {idade !== null && `(${idade} anos)`}</label>
                  <input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="sexo">Sexo</label>
                  <select id="sexo" value={formData.sexo} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input id="telefone" type="text" placeholder="(00) 00000-0000" value={formData.telefone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="whatsapp">WhatsApp</label>
                  <input id="whatsapp" type="text" placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'clinico' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label htmlFor="peso_inicial">Peso Atual (kg)</label>
                    <div style={{ position: 'relative' }}>
                      <input id="peso_inicial" type="number" step="0.1" value={formData.peso_inicial} onChange={handleChange} />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>kg</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="altura">Altura (cm)</label>
                    <div style={{ position: 'relative' }}>
                      <input id="altura" type="number" value={formData.altura} onChange={handleChange} />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>cm</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>IMC (Auto)</label>
                    <input readOnly value={imc || '--'} style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary)', color: 'var(--primary)' }} />
                  </div>
                </div>
                {renderMultiChoice('Objetivos', 'objetivos', ['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'])}
                <div className="form-group">
                  <label htmlFor="objetivo_texto">Objetivo (Complemento)</label>
                  <textarea id="objetivo_texto" value={formData.objetivo_texto} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="nivel_atividade">Nível de Atividade Física</label>
                  <select id="nivel_atividade" value={formData.nivel_atividade} onChange={handleChange}>
                    <option value="sedentario">Sedentário</option>
                    <option value="leve">Levemente ativo</option>
                    <option value="moderado">Moderadamente ativo</option>
                    <option value="muito">Muito ativo</option>
                    <option value="extremamente">Extremamente ativo</option>
                  </select>
                </div>
                {renderMultiChoice('Patologias', 'patologias', ['Nenhum', 'Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'])}
                {renderMultiChoice('Restrições Alimentares', 'restricoes_alimentares', ['Nenhum', 'Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'])}
                {renderMultiChoice('Alergias', 'alergias', ['Nenhum', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'])}
                <div className="form-group">
                  <label htmlFor="medicamentos">Medicamentos Contínuos</label>
                  <input id="medicamentos" type="text" value={formData.medicamentos} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="suplementos">Suplementos em Uso</label>
                  <input id="suplementos" type="text" value={formData.suplementos} onChange={handleChange} />
                </div>
              </div>
            )}

            {activeTab === 'habitos' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label htmlFor="refeicoes_por_dia">Refeições/Dia</label>
                    <input id="refeicoes_por_dia" type="number" value={formData.refeicoes_por_dia} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="litros_agua">Água/Dia</label>
                    <div style={{ position: 'relative' }}>
                      <input id="litros_agua" type="number" step="0.1" value={formData.litros_agua} onChange={handleChange} />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>litros</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="horario_acorda">Horário que acorda</label>
                    <input id="horario_acorda" type="text" value={formData.horario_acorda} onChange={handleChange} onBlur={(e) => setFormData(p => ({ ...p, horario_acorda: formatTime(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="horario_dorme">Horário que dorme</label>
                    <input id="horario_dorme" type="text" value={formData.horario_dorme} onChange={handleChange} onBlur={(e) => setFormData(p => ({ ...p, horario_dorme: formatTime(e.target.value) }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input id="atividade_fisica" type="checkbox" checked={formData.atividade_fisica} onChange={handleChange} />
                    <span>Pratica atividade física?</span>
                  </label>
                </div>
                {formData.atividade_fisica && (
                  <div className="form-group"><textarea id="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleChange} /></div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn" disabled={loading} style={{ width: 'auto', padding: '1rem 3rem' }}>
                {loading ? 'Salvando...' : 'Salvar Ficha do Paciente'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default NovoPaciente
