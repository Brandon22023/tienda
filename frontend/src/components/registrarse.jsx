// ...existing code...
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoPM from '../assets/IMG/logocentral.png'
import './registrarse.css'

export default function Registrarse() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          password
        })
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.message || 'Error al registrar')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="card-accent" />
        <div className="brand">
          <img src={logoPM} alt="Logo" />
        </div>

        <h2>Crear cuenta</h2>
        <p className="sub">Regístrate para empezar a comprar</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Nombre</span>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} type="text" placeholder="Tu nombre completo" />
          </label>

          <label className="field">
            <span className="field-label">Correo</span>
            <input className="input" value={correo} onChange={e => setCorreo(e.target.value)} type="email" placeholder="tucorreo@ejemplo.com" />
          </label>

          <label className="field">
            <span className="field-label">Teléfono</span>
            <input className="input" value={telefono} onChange={e => setTelefono(e.target.value)} type="tel" placeholder="+502 1234 5678" />
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>

          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</p>}
        </form>

        <div className="register-row">
          <span>¿Ya tienes cuenta?</span>
          <button className="btn-link" type="button" onClick={() => navigate('/login')}>Iniciar sesión</button>
        </div>
      </div>
    </div>
  )
}
// ...existing code...