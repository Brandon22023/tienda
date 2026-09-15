import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'

export default function HistorialPedidos() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cliente = (() => {
    try { return JSON.parse(localStorage.getItem('cliente') || 'null') } catch { return null }
  })()

  useEffect(() => {
    apiFetch('/api/mis-pedidos')
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el historial.')
        return data
      })
      .then(data => setOrders(Array.isArray(data.pedidos) ? data.pedidos : []))
      .catch(reason => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    try { await apiFetch('/api/logout', { method: 'POST' }) } catch { /* la sesión local también se limpia */ }
    localStorage.removeItem('cliente')
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

  if (!cliente) {
    return (
      <main className="summary-page"><div className="summary-card">
        <p>Inicia sesión para consultar tus pedidos.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Iniciar sesión</button>
      </div></main>
    )
  }

  return (
    <main className="summary-page"><div className="summary-card">
      <div className="history-header">
        <div><h2>Mis pedidos</h2><p className="small">Pedidos de {cliente.nombre}</p></div>
        <button className="btn-outline" onClick={logout}>Cerrar sesión</button>
      </div>
      {loading && <p>Cargando pedidos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && orders.length === 0 && <p>Aún no tienes pedidos registrados.</p>}
      <div className="history-list">
        {orders.map(order => (
          <article className="history-card" key={order.id}>
            <div>
              <strong>Pedido #{order.id}</strong>
              <div className="small">{new Date(order.fecha).toLocaleString()}</div>
              <div>{order.items.map(item => `${item.nombre} x${item.cantidad}`).join(', ')}</div>
            </div>
            <div className="history-total">Q {Number(order.total).toFixed(2)}</div>
            <button className="btn-link" onClick={() => navigate(`/resumen/${order.id}`)}>Ver detalle</button>
          </article>
        ))}
      </div>
    </div></main>
  )
}
