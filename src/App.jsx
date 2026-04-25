import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import NovoPaciente from './pages/NovoPaciente'
import PerfilPaciente from './pages/PerfilPaciente'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pacientes" 
          element={
            <ProtectedRoute>
              <Pacientes />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pacientes/novo" 
          element={
            <ProtectedRoute>
              <NovoPaciente />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pacientes/:id" 
          element={
            <ProtectedRoute>
              <PerfilPaciente />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
