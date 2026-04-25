import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const Register = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Redireciona se já estiver logado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) navigate('/dashboard')
    }
    checkSession()
  }, [navigate])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message === 'User already registered' 
        ? 'Este e-mail já está cadastrado.' 
        : 'Ocorreu um erro ao criar sua conta. Tente novamente.')
      setLoading(false)
      return
    }

    if (authData?.user) {
      // 2. Salvar na tabela nutricionistas
      const { error: dbError } = await supabase
        .from('nutricionistas')
        .insert([
          { 
            id: authData.user.id, 
            nome: nome, 
            email: email 
          }
        ])

      if (dbError) {
        console.error('Erro ao salvar perfil:', dbError)
        setError('Conta criada, mas houve um erro ao configurar seu perfil profissional.')
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
      <div className="auth-header">
        <h1 className="logo-text">NutriSystem</h1>
        <p>Comece sua jornada profissional hoje</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="nome">Nome Completo</label>
          <input
            id="nome"
            type="text"
            placeholder="Ex: Dra. Maria Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="contato@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="No mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repita sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Processando cadastro...' : 'Criar minha conta'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Já possui uma conta? <Link to="/login">Fazer login</Link></p>
      </div>
      </div>
    </div>
  )
}

export default Register
