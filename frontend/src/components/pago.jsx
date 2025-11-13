import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './pago.css'

export default function Pago() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('efectivo') // 'efectivo' | 'tarjeta'
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [formError, setFormError] = useState(null)
    // fallback por si el setter original está sobrescrito en tiempo de ejecución
  const [formErrorFallback, setFormErrorFallback] = useState(null)
  const setFormErrorSafe = (v) => {
    try {
      if (typeof setFormError === 'function') {
        setFormError(v)
      } else {
        setFormErrorFallback(v)
      }
    } catch (e) {
      setFormErrorFallback(v)
    }
  }
  const [orderInfo, setOrderInfo] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('orderInfo')
      if (raw) setOrderInfo(JSON.parse(raw))
    } catch {}
  }, [])

  function validarTarjeta() {
    if (!cardName.trim()) return 'Nombre en la tarjeta es requerido.'
    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ''))) return 'Número de tarjeta inválido.'
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/.test(expiry)) return 'Fecha de expiración inválida (MM/AA o MM/AAAA).'
    if (!/^\d{3,4}$/.test(cvc)) return 'CVC inválido.'
    return null
  }
  async function crearPedidoEnServidor(total) {
    try {
      const clienteRaw = localStorage.getItem('cliente')
      const cliente = clienteRaw ? JSON.parse(clienteRaw) : null
      const body = {
        cliente_id: cliente ? cliente.cliente_id : null,
        total: Number(total || 0)
      }
      const resp = await fetch('http://127.0.0.1:8000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const text = await resp.text()
      let json = null
      try { json = text ? JSON.parse(text) : null } catch (e) { /* respuesta no JSON */ }
      if (!resp.ok) {
        console.error('Crear pedido falló', resp.status, text)
        throw new Error(json?.message || text || `status:${resp.status}`)
      }
      // guardar localmente para que Resumen lo use
      localStorage.setItem('savedOrder', JSON.stringify({ id: json.id, fecha: json.fecha, total: body.total }))
      return json
    } catch (err) {
      console.error('crearPedidoEnServidor exception', err)
      throw err
    }
  }
  async function crearDetallesEnServidor(orderId, cart) {
    try {
      if (!orderId) throw new Error('orderId requerido')
      const items = (cart || []).map(it => ({
        idpedidos: Number(orderId),
        idproductos: Number(it.idproductos ?? it.id ?? 0),
        cantidad: Number(it.cantidad || 1),
        precio_unitario: Number(it.precio || 0)
      }))
      const resp = await fetch(`http://127.0.0.1:8000/api/pedidos/${orderId}/detalles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const text = await resp.text()
      let json = null
      try { json = text ? JSON.parse(text) : null } catch (e) {}
      if (!resp.ok) {
        console.error('Crear detalles falló', resp.status, text)
        throw new Error(json?.message || text || `status:${resp.status}`)
      }
      return json
    } catch (err) {
      console.error('crearDetallesEnServidor exception', err)
      throw err
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setFormErrorSafe(null);
    (async () => {
      try {
        if (method === 'tarjeta') {
          const err = validarTarjeta()
          if (err) {
            setFormErrorSafe(err);
            return
          }
        }
        // guardar info de pago localmente primero
        const paymentInfo = {
          method,
          tarjeta: method === 'tarjeta' ? {
            nombre: cardName,
            numero_mask: cardNumber.replace(/\s+/g, '').replace(/.(?=.{4})/g, '*'),
            expiry,
            cvc: '***'
          } : null,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem('paymentInfo', JSON.stringify(paymentInfo))

        // calcular total desde el carrito y crear pedido en BD ahora
        const cartRaw = localStorage.getItem('cart')
        const cart = cartRaw ? JSON.parse(cartRaw) : []
        const total = cart.reduce((s, it) => s + (Number(it.precio || 0) * Number(it.cantidad || 1)), 0)
        const pedidoResp = await crearPedidoEnServidor(total)
        await crearDetallesEnServidor(pedidoResp.id, cart)

        // navegamos al resumen (resumen leerá savedOrder)
        navigate('/resumen')
      } catch (err) {
        alert('No se pudo guardar el pedido en el servidor. Revisa la consola del navegador y los logs del backend.')
      }
    })()
  }

  return (
    <div className="register-page" style={{ paddingTop: 40 }}>
      <div className="register-card" style={{ maxWidth: 720 }}>
        <div className="card-accent" aria-hidden="true" />
        <div className="brand" style={{ marginBottom: 8 }}>
          <div className="brand-header">
            <svg className="brand-icon" width="46" height="46" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#4b70cf"/>
                  <stop offset="1" stopColor="#6ea0ff"/>
                </linearGradient>
              </defs>
              <rect x="3" y="5" width="18" height="10" rx="3" fill="url(#g2)"/>
              <path d="M7 9h10v1H7z" fill="rgba(255,255,255,0.9)"/>
            </svg>

            <div className="brand-text">
              <h2>Método de pago</h2>
              <p className="sub">Elige efectivo o tarjeta. Si seleccionas tarjeta, introduce los datos.</p>
            </div>
          </div>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              className={method === 'efectivo' ? 'btn-outline active' : 'btn-outline'}
              onClick={() => setMethod('efectivo')}
            >
              Pago en efectivo
            </button>
            <button
              type="button"
              className={method === 'tarjeta' ? 'btn-outline active' : 'btn-outline'}
              onClick={() => setMethod('tarjeta')}
            >
              Pagar con tarjeta
            </button>
          </div>

          {orderInfo && (
            <div className="field" style={{ gridColumn: '1 / 3' }}>
              <span className="field-label">Resumen del pedido</span>
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(245,247,255,0.9)', color: '#334' }}>
                <div><strong>Nombre:</strong> {orderInfo.nombre}</div>
                <div><strong>Correo:</strong> {orderInfo.correo}</div>
                <div><strong>Dirección:</strong> {orderInfo.direccion}</div>
                {orderInfo.nota && <div><strong>Nota:</strong> {orderInfo.nota}</div>}
              </div>
            </div>
          )}

          {method === 'tarjeta' && (
            <>
              <label className="field" style={{ gridColumn: '1 / 3' }}>
                <span className="field-label">Nombre en la tarjeta</span>
                <input className="input" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Nombre como aparece en la tarjeta" />
              </label>

              <label className="field">
                <span className="field-label">Número de tarjeta</span>
                <input className="input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" inputMode="numeric" />
              </label>

              <label className="field">
                <span className="field-label">Expiración (MM/AA)</span>
                <input className="input" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/AA" />
              </label>

              <label className="field" style={{ alignSelf: 'end' }}>
                <span className="field-label">CVC</span>
                <input className="input" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" inputMode="numeric" />
              </label>
            </>
          )}

          <button className="btn-primary" type="submit" style={{ gridColumn: '1 / 3' }}>
            {method === 'efectivo' ? 'Continuar con efectivo' : 'continuar con tarjeta'}
          </button>

           {(formError || formErrorFallback) && <p style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{formError || formErrorFallback}</p>}
        </form>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="btn-link" type="button" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    </div>
  )
}