// ...existing code...
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoPM from '../assets/IMG/logocentral.png'
import './iniciar_sesion.css'

export default function IniciarSesion() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.message || 'Error en login')

      // Guardar usuario mínimo en localStorage para mostrar nombre en header
      const cliente = { cliente_id: json.cliente_id, nombre: json.nombre, correo, telefono: json.telefono }
      localStorage.setItem('cliente', JSON.stringify(cliente))

      window.location.href = '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="card-accent" />
        <div className="brand">
          <img src={logoPM} alt="Logo" />
        </div>

        <h2>Iniciar sesión</h2>
        <p className="sub">Accede a tu cuenta y disfruta de las mejores ofertas</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Correo</span>
            <input className="input" value={correo} onChange={e => setCorreo(e.target.value)} type="email" placeholder="tucorreo@ejemplo.com" />
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Iniciar sesión'}</button>
          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</p>}
        </form>

        <div className="register-row">
          <span>¿Aún no tienes cuenta?</span>
          <button className="btn-link" type="button" onClick={() => navigate('/register')}>Registrarse</button>
        </div>
      </div>
    </div>
  )
}
