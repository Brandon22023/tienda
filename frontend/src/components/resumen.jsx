import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import logo from '../assets/IMG/logocentral.png'
import { apiUrl } from '../lib/api.js'
import './resumen.css'

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]))
}

export default function Resumen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [finished, setFinished] = useState(false)
  const orderInfo = location.state?.orderInfo || null
  const paymentInfo = location.state?.paymentInfo || null

  useEffect(() => {
    fetch(apiUrl(`/api/pedidos/${orderId}`), { headers: { Accept: 'application/json' } })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'No se encontró el pedido.')
        return data
      })
      .then(setOrder)
      .catch(reason => setError(reason.message))
  }, [orderId])

  function generarPDF() {
    if (!order) return
    const rowsHtml = order.items.map(item => `<tr>
      <td class="desc">${escapeHtml(item.nombre)}</td>
      <td class="qty">${item.cantidad}</td>
      <td class="unit">Q ${Number(item.precio_unitario).toFixed(2)}</td>
      <td class="sub">Q ${Number(item.subtotal).toFixed(2)}</td>
    </tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Factura N° ${order.id}</title><style>
      body{font-family:Arial,sans-serif;color:#122033;margin:0;padding:20px}.container{max-width:800px;margin:auto;border:1px solid #eee;padding:24px}.header{display:flex;gap:18px;align-items:center}.logo{width:84px}.shop{flex:1}.meta{text-align:right;color:#666}.section{margin-top:18px}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #eee}td.qty,td.unit,td.sub{text-align:right;white-space:nowrap}.totals{text-align:right;margin-top:14px;font-size:1.1rem}.muted{color:#666}
    </style></head><body><div class="container"><div class="header"><img class="logo" src="${logo}" alt="logo"/><div class="shop"><h1>Electrocore</h1><div class="muted">Factura / Resumen de compra</div></div><div class="meta"><div><strong>N° pedido:</strong> ${order.id}</div><div><strong>Generado:</strong> ${new Date(order.fecha).toLocaleString()}</div></div></div>
      <div class="section"><h3>Datos del comprador</h3><div><strong>Nombre:</strong> ${escapeHtml(orderInfo?.nombre || 'Cliente')}</div><div><strong>Dirección:</strong> ${escapeHtml(orderInfo?.direccion || 'No especificada')}</div></div>
      <div class="section"><h3>Artículos</h3><table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead><tbody>${rowsHtml}</tbody></table><div class="totals"><strong>Total: Q ${Number(order.total).toFixed(2)}</strong></div></div>
      <div class="section"><h3>Método de pago</h3><div>${paymentInfo?.method === 'tarjeta' ? 'Tarjeta de práctica' : 'Efectivo'}</div></div>
    </div></body></html>`
    const windowRef = window.open('', '_blank')
    if (!windowRef) {
      alert('Permite abrir ventanas para generar el PDF.')
      return
    }
    windowRef.document.write(html)
    windowRef.document.close()
    windowRef.focus()
    windowRef.print()
  }

  function finalizar() {
    window.dispatchEvent(new Event('cart-cleared'))
    setFinished(true)
    setTimeout(() => navigate('/'), 2400)
  }

  if (finished) {
    return <div className="summary-page"><div className="summary-card thankyou"><img src={logo} alt="logo" /><h2 className="thankyou-title"><PartyPopper size={24} aria-hidden="true" />Gracias por tu compra</h2><p>Te redirigiremos al inicio...</p></div></div>
  }

  if (error) {
    return <div className="summary-page"><div className="summary-card"><p style={{ color: 'red' }}>{error}</p><button className="btn-link" onClick={() => navigate('/')}>Volver al inicio</button></div></div>
  }

  if (!order) {
    return <div className="summary-page"><div className="summary-card"><p>Cargando pedido...</p></div></div>
  }

  return (
    <div className="summary-page"><div className="summary-card">
      <header className="summary-head"><img src={logo} alt="Logo" /><div><h2>Resumen de compra</h2><div className="small">Electrocore</div><div className="small">N° pedido: {order.id} · Fecha: {new Date(order.fecha).toLocaleString()}</div></div></header>
      <section className="section"><h3>Datos del comprador</h3><div className="info-row"><strong>Nombre:</strong> {orderInfo?.nombre || 'Cliente'}</div><div className="info-row"><strong>Dirección:</strong> {orderInfo?.direccion || 'No especificada'}</div><div className="info-row"><strong>Teléfono:</strong> {orderInfo?.telefono || 'No especificado'}</div></section>
      <section className="section"><h3>Artículos</h3><ul className="items-list">{order.items.map(item => <li key={item.idproductos}><span className="it-name">{item.nombre}</span><span className="it-qty">x{item.cantidad}</span><span className="it-price">Q {Number(item.precio_unitario).toFixed(2)} · Q {Number(item.subtotal).toFixed(2)}</span></li>)}</ul><div className="total-line">Total: Q {Number(order.total).toFixed(2)}</div></section>
      <section className="section"><h3>Método de pago</h3><div className="info-row">{paymentInfo?.method === 'tarjeta' ? 'Tarjeta de práctica' : 'Efectivo'}</div></section>
      <div className="actions"><button className="btn-outline" onClick={finalizar}>No, gracias</button><button className="btn-primary" onClick={generarPDF}>Descargar factura (PDF)</button></div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}><button className="btn-link" onClick={finalizar}>Finalizar compra</button></div>
    </div></div>
  )
}
