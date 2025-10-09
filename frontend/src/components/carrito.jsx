// ...existing code...
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './carrito.css'

export default function Carrito() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState([])
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 20)
    return () => clearTimeout(t)
  }, [])

  // cargar carrito desde localStorage
  function loadCart() {
    try {
      const raw = localStorage.getItem('cart')
      const arr = raw ? JSON.parse(raw) : []
      setCart(arr)
    } catch {
      setCart([])
    }
  }

  useEffect(() => {
    loadCart()
    function onUpdate() { loadCart() }
    window.addEventListener('cart-updated', onUpdate)
    return () => window.removeEventListener('cart-updated', onUpdate)
  }, [])

  function changeQty(itemId, delta) {
    const next = cart.map(i => {
      if (i.idproductos === itemId) {
        return { ...i, cantidad: Math.max(1, (i.cantidad || 1) + delta) }
      }
      return i
    })
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  function removeItem(itemId) {
    const next = cart.filter(i => i.idproductos !== itemId)
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = cart.reduce((s, it) => s + (Number(it.precio || 0) * Number(it.cantidad || 1)), 0)

  if (!ready) return null

return (
    <div className={`cart-page simple enter`} role="region" aria-label="Carrito">
      <main className="cart-wrap" style={{ paddingBottom: 16 }}>
        <article className="cart-card-simple" style={{ flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin:0 }}>Mi Carrito</h2>

          {cart.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div className="cart-visual" aria-hidden="true">
                {/* reutiliza icono existente */}
                <div className="cart-icon" role="img" aria-hidden="true">
                  <svg viewBox="0 0 64 64" className="cart-svg" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="gCart" x1="0" x2="1">
                        <stop offset="0" stopColor="#3f63d6"/>
                        <stop offset="1" stopColor="#6ea0ff"/>
                      </linearGradient>
                    </defs>
                    <rect x="6" y="8" width="52" height="48" rx="10" fill="url(#gCart)" />
                    <g className="cart-structure" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path className="basket" d="M16 22h30l-5.2 18H22.6z" />
                      <path className="handle" d="M20 22l3.5-8h12.5" />
                    </g>
                    <g className="wheels" fill="#ffffff" opacity="0.98">
                      <circle className="wheel wheel-left" cx="26" cy="44.5" r="3.6" />
                      <circle className="wheel wheel-right" cx="40" cy="44.5" r="3.6" />
                    </g>
                  </svg>
                </div>
              </div>
              <div>
                <h3 style={{ margin:0 }}>Tu carrito se siente solo 😢</h3>
                <p style={{ margin: '6px 0 0 0', color:'#5f6b7a' }}>¡Hazlo feliz con algunos productos nuevos!</p>
              </div>
            </div>
          ) : (
            <div style={{ width:'100%' }}>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gap:12 }}>
                {cart.map(item => (
                  <li key={item.idproductos} className="cart-item-row">
                    <img src={item.image_url} alt={item.nombre} className="cart-item-thumb" />
                    <div className="cart-item-main">
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-price">Q {Number(item.precio).toFixed(2)}</div>
                    </div>
                    <div className="cart-item-qty">
                      <button onClick={() => changeQty(item.idproductos, -1)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => changeQty(item.idproductos, +1)}>+</button>
                    </div>
                    <div className="cart-item-total">Q {(Number(item.precio) * Number(item.cantidad)).toFixed(2)}</div>
                    <button className="cart-item-remove" aria-label="Eliminar" onClick={() => removeItem(item.idproductos)}>🗑</button>
                  </li>
                ))}
              </ul>

              <div className="cart-summary">
                <div className="cart-summary-left">Total</div>
                <div className="cart-summary-right">Q {total.toFixed(2)}</div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
                <button className="btn-cart-blue" onClick={() => navigate('/checkout')}>Continuar</button>
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}