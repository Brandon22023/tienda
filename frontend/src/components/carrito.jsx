// ...existing code...
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './carrito.css'

export default function Carrito() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 20)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`cart-page simple ${ready ? 'enter' : ''}`} role="region" aria-label="Carrito vacío">
      <main className="cart-wrap">
        <article className="cart-card-simple" aria-live="polite">
          <div className="cart-visual" aria-hidden="true">
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

              <div className="cart-empty-dot" aria-hidden="true" />
              <div className="cart-bubble" role="status" aria-hidden="false">
                <div className="bubble-text">Silencio total en tu carrito...</div>
              </div>
            </div>
          </div>

          <div className="cart-body">
            <h1 className="cart-title">Tu carrito se siente solo 😢</h1>
            <p className="cart-sub">¡Hazlo feliz con algunos productos nuevos!</p>

            <div className="cart-cta">
              <button
                className="btn-cart-blue"
                onClick={() => navigate('/')}
                aria-label="Ir al inicio"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}