import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './pedidos.css'
import MAPASENPEDIDOS from './maps.jsx'
export default function DatosPedido() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccionObj, setDireccionObj] = useState(null)
  const [nota, setNota] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cliente')
      if (raw) {
        const c = JSON.parse(raw)
        if (c.nombre) setNombre(c.nombre)
        if (c.correo) setCorreo(c.correo)
        setTelefono(c.telefono || '')
      }
    } catch {}
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const direccionText = direccionObj?.address || ''
    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !direccionText.trim()) {
      setError('Completa los campos obligatorios.')
      return
    }
    const orderInfo = {
      nombre,
      correo,
      telefono,
      direccion: direccionText,
      direccion_geo: direccionObj ? { lat: direccionObj.lat, lng: direccionObj.lng } : null,
      nota,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem('orderInfo', JSON.stringify(orderInfo))
    // redirigir al siguiente paso de checkout (pago/resumen). Ajusta según tu flujo.
    navigate('/pago') // o la ruta que uses para pago
  }

  return (
    <div className="register-page" style={{ paddingTop: 40 }}>
      <div className="register-card" style={{ maxWidth: 720 }}>
        <div className="card-accent" aria-hidden="true" />
        <div className="brand" style={{ marginBottom: 8 }}>
          <div className="brand-header">
            {/* icono renovado sin rojo, con gradiente de acento */}
            <svg className="brand-icon" width="46" height="46" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#4b70cf"/>
                  <stop offset="1" stopColor="#6ea0ff"/>
                </linearGradient>
              </defs>
              <rect x="2" y="3" width="20" height="14" rx="4" fill="url(#g1)"/>
              <path d="M7 8h10v2H7z" fill="rgba(255,255,255,0.9)"/>
              <circle cx="12" cy="11" r="1.3" fill="rgba(255,255,255,0.95)"/>
            </svg>

            <div className="brand-text">
              <h2>Datos para el pedido</h2>
              <p className="sub">Introduce nombre completo, correo, teléfono y dirección</p>
            </div>
          </div>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="field" style={{ gridColumn: '1 / 3' }}>
            <span className="field-label">Nombre completo</span>
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} type="text" placeholder="Nombre y apellidos" />
          </label>

          <label className="field" style={{ gridColumn: '1 / 3' }}>
            <span className="field-label">Correo</span>
            <input className="input" value={correo} onChange={e => setCorreo(e.target.value)} type="email" placeholder="tucorreo@ejemplo.com" />
          </label>

          <label className="field">
            <span className="field-label">Teléfono</span>
            <input className="input" value={telefono} onChange={e => setTelefono(e.target.value)} type="tel" placeholder="+502 1234 5678" />
          </label>

          <label className="field" style={{ gridColumn: '1 / 3' }}>
            <span className="field-label">Dirección (busca y coloca el marcador)</span>
            <MAPASENPEDIDOS value={direccionObj} onChange={setDireccionObj} />
          </label>

          <label className="field" style={{ gridColumn: '1 / 3' }}>
            <span className="field-label">Información adicional para el repartidor</span>
            <textarea className="input" style={{ minHeight: 100, resize: 'vertical' }} value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: dejar en portería, referencias, etc." />
          </label>

          <button className="btn-primary" type="submit">Guardar y continuar</button>

          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</p>}
        </form>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="btn-link" type="button" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    </div>
  )
}