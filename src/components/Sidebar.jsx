import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">NutriSystem</div>
      </div>
      
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <span>Pacientes</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          Sair do Sistema
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
