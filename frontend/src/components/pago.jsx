import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './pago.css'
import { apiFetch } from '../lib/api.js'

export default function Pago() {
  const navigate = useNavigate()
  const location = useLocation()
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
    } catch {
      setFormErrorFallback(v)
    }
  }
  const [orderInfo, setOrderInfo] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    try {
      const stateInfo = location.state?.orderInfo
      if (stateInfo) {
        setOrderInfo(stateInfo)
      } else {
        // Compatibilidad con enlaces directos de las suites E2E antiguas.
        const rawOrder = localStorage.getItem('orderInfo')
        setOrderInfo(rawOrder ? JSON.parse(rawOrder) : null)
      }
      const cartRaw = localStorage.getItem('cart')
      const savedCart = cartRaw ? JSON.parse(cartRaw) : []
      setCart(Array.isArray(savedCart) ? savedCart : [])
    } catch {
      setOrderInfo(null)
      setCart([])
    }
  }, [location.state])

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.precio || 0) * Number(item.cantidad || 1),
    0
  )

  function validarTarjeta() {
    if (!cardName.trim()) return 'Nombre en la tarjeta es requerido.'
    if (!/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, ''))) return 'Número de tarjeta inválido.'
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/.test(expiry)) return 'Fecha de expiración inválida (MM/AA o MM/AAAA).'
    if (!/^\d{3,4}$/.test(cvc)) return 'CVC inválido.'
    return null
  }
  async function crearPedidoEnServidor() {
    try {
      const body = {
        items: cart.map(it => ({
          idproductos: Number(it.idproductos ?? it.id ?? 0),
          cantidad: Number(it.cantidad || 1)
        }))
      }
      const resp = await apiFetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      })
      const text = await resp.text()
      let json = null
      try { json = text ? JSON.parse(text) : null } catch { json = null }
      if (!resp.ok) {
        console.error('Crear pedido falló', resp.status, text)
        throw new Error(json?.message || text || `status:${resp.status}`)
      }
      return json
    } catch (err) {
      console.error('crearPedidoEnServidor exception', err)
      throw err
    }
  }
  function handleSubmit(e) {
    e.preventDefault()
    setFormErrorSafe(null);
    (async () => {
      try {
        if (!orderInfo) {
          setFormErrorSafe('Completa los datos del pedido antes de pagar.')
          return
        }
        if (cart.length === 0) {
          setFormErrorSafe('Agrega al menos un artículo antes de pagar.')
          return
        }
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
        const order = await crearPedidoEnServidor()

        // El resumen consulta el pedido recién creado directamente al servidor.
        navigate(`/resumen/${order.id}`, { state: { orderInfo, paymentInfo } })
      } catch {
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

          <div className="checkout-items" data-testid="checkout-items" aria-label="Artículos del pedido" style={{ gridColumn: '1 / 3' }}>
            <div className="checkout-items-title">Artículos</div>
            {cart.length > 0 ? cart.map(item => {
              const quantity = Number(item.cantidad || 1)
              const price = Number(item.precio || 0)
              return (
                <div className="checkout-item" data-testid="checkout-item" key={item.idproductos}>
                  <img src={item.image_url} alt="" className="checkout-item-image" />
                  <div className="checkout-item-details">
                    <strong>{item.nombre}</strong>
                    <span>Cantidad: {quantity} · Precio unitario: Q {price.toFixed(2)}</span>
                  </div>
                  <strong className="checkout-item-subtotal">Q {(price * quantity).toFixed(2)}</strong>
                </div>
              )
            }) : (
              <p className="checkout-items-empty">No hay artículos en el carrito.</p>
            )}
            <div className="checkout-total">
              <span>Total del pedido</span>
              <strong>Q {cartTotal.toFixed(2)}</strong>
            </div>
          </div>

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

          <button className="btn-primary" data-testid="payment-submit" type="submit" style={{ gridColumn: '1 / 3' }}>
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
