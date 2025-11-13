import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/IMG/logocentral.png'
import './resumen.css'

export default function Resumen() {
  const navigate = useNavigate()
  const [orderInfo, setOrderInfo] = useState(null)
  const [cart, setCart] = useState([])
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [finished, setFinished] = useState(false)
   const [orderNumber, setOrderNumber] = useState(null)
  const [generatedAtStr, setGeneratedAtStr] = useState(new Date().toLocaleString())

  useEffect(() => {
    try {
      const o = localStorage.getItem('orderInfo')
      const c = localStorage.getItem('cart')
      const p = localStorage.getItem('paymentInfo')
      setOrderInfo(o ? JSON.parse(o) : null)
      setCart(c ? JSON.parse(c) : [])
      setPaymentInfo(p ? JSON.parse(p) : null)
       // si el pedido ya fue creado en /pago, cargar id/fecha desde savedOrder
        const saved = localStorage.getItem('savedOrder')
        if (saved) {
          try {
            const s = JSON.parse(saved)
            setOrderNumber(s.id)
            setGeneratedAtStr(new Date(s.fecha).toLocaleString())
          } catch {}
        }
    } catch { /* ignore */ }
  }, [])

  const total = cart.reduce((s, it) => s + (Number(it.precio || 0) * Number(it.cantidad || 1)), 0)
  function generarPDF() {

    // proceso: primero guardar pedido en servidor, luego generar PDF con id y fecha del servidor
    (async () => {
      try {
        // leer pedido creado en pago.jsx
        const saved = localStorage.getItem('savedOrder')
        if (!saved) {
          alert('No se encontró un pedido guardado. Debes completar el pago (Continuar) antes de descargar la factura.')
          return
        }
        const s = JSON.parse(saved)
        const res = { id: s.id, fecha: s.fecha }

        // ahora construir filas y HTML usando order id/fecha
        const rowsHtml = cart.map(it => {
          const qty = Number(it.cantidad || 1)
          const precio = Number(it.precio || 0)
          const subtotal = (precio * qty).toFixed(2)
          return `<tr>
            <td class="desc">${escapeHtml(it.nombre)}</td>
            <td class="qty">${qty}</td>
            <td class="unit">Q ${precio.toFixed(2)}</td>
            <td class="sub">Q ${subtotal}</td>
          </tr>`
        }).join('')

        const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Factura N° ${res.id}</title><style>
          :root{ --accent:#3f63d6; --muted:#6b6b6b; }
          html,body{ margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#122033; background:#fff; }
          .container{ max-width:800px; margin:20px auto; padding:22px; border-radius:8px; border:1px solid #ececec; box-shadow: 0 10px 30px rgba(18,32,60,0.04); }
          .header{ display:flex; align-items:center; gap:18px; } .logo{ width:84px; height:auto; } .shop{ flex:1; } .shop h1{ margin:0; font-size:1.15rem; color:var(--accent); }
          .meta{ text-align:right; font-size:0.92rem; color:var(--muted); } .section{ margin-top:18px; } .buyer, .payment { border:1px solid #f0f0f0; padding:12px; border-radius:8px; background:#fbfdff; }
          table{ width:100%; border-collapse:collapse; font-size:0.95rem; } th, td{ padding:10px 8px; border-bottom:1px solid #f3f6fb; } th{ text-align:left; font-weight:700; color:#2c3e50; }
          td.desc{ width:60%; } td.qty, td.unit, td.sub { text-align:right; white-space:nowrap; } .totals{ display:flex; justify-content:flex-end; margin-top:12px; gap:8px; }
          .totals .box{ width:320px; border-radius:8px; padding:12px; background:linear-gradient(180deg,#fff,#fbfdff); border:1px solid #f0f4ff; } .totals .line{ display:flex; justify-content:space-between; margin-bottom:6px; color:#33415a; }
          .totals .line.total { font-weight:800; font-size:1.05rem; color:#122033; } .foot{ margin-top:18px; font-size:0.92rem; color:var(--muted); }
        </style></head><body><div class="container"><div class="header">
          <img class="logo" src="${logo}" alt="logo" />
          <div class="shop"><h1>Electrocore</h1><div style="color:var(--muted); font-size:0.95rem;">Factura / Resumen de compra</div></div>
          <div class="meta"><div><strong>N° pedido:</strong> ${res.id}</div><div><strong>Generado:</strong> ${new Date(res.fecha).toLocaleString()}</div></div>
        </div>
        <div class="section"><h3 style="margin:10px 0 8px 0;">Datos del comprador</h3><div class="buyer">
          <div class="row"><strong>Nombre:</strong>&nbsp;<span>${escapeHtml(orderInfo?.nombre || '')}</span></div>
          <div class="row"><strong>Dirección:</strong>&nbsp;<span>${escapeHtml(orderInfo?.direccion || '')}</span></div>
          
        </div></div>
        <div class="section"><h3 style="margin:10px 0 8px 0;">Artículos</h3><div class="table-wrap"><table><thead><tr>
          <th>Descripción</th><th style="width:80px; text-align:center">Cant.</th><th style="width:120px; text-align:right">Precio unit.</th><th style="width:120px; text-align:right">Subtotal</th>
        </tr></thead><tbody>${rowsHtml}</tbody></table></div>
        <div class="totals"><div class="box"><div class="line"><span>Subtotal</span><span>Q ${total.toFixed(2)}</span></div><div class="line total"><span>Total</span><span>Q ${total.toFixed(2)}</span></div></div></div></div>
        <div class="section"><h3 style="margin:10px 0 8px 0;">Método de pago</h3><div class="payment"><div><strong>${paymentInfo?.method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}</strong></div></div></div>
        <div class="foot"><div>Gracias por su compra.</div></div></div></body></html>`

        const w = window.open('', '_blank')
        if (!w) return alert('Permite abrir ventanas para generar el PDF.')
        w.document.write(html)
        w.document.close()
        w.focus()
        setTimeout(() => { w.print(); }, 500)
      } catch (e) {
        // ya mostrado en crearPedidoEnServidor
      }
    })()
  }
  

  // pequeño helper para evitar inyectar HTML sin escapar
  function escapeHtml(str) {
    if (!str) return ''
    return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))
  }

  function finalizar(sinDescarga = false) {
    // limpiar carrito y marcar finalizado
    localStorage.removeItem('cart')
    // notificar al resto de la app para que el contador se actualice
    window.dispatchEvent(new Event('cart-updated'))
    // opcional: conservar orderInfo/paymentInfo si quieres
    setFinished(true)
    setTimeout(() => navigate('/'), 2400)
  }

  if (!orderInfo) {
    return (
      <div className="summary-page">
        <div className="summary-card">
          <p>No se encontró información del pedido. <button className="btn-link" onClick={() => navigate('/')}>Volver al inicio</button></p>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="summary-page">
        <div className="summary-card thankyou">
          <img src={logo} alt="logo" />
          <h2>Gracias por tu compra 🎉</h2>
          <p>Te redirigiremos al inicio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="summary-page">
      <div className="summary-card">
        <header className="summary-head">
          <img src={logo} alt="logo" />
          <div>
            <h2>Resumen de compra</h2>
            <div className="small">Electrocore</div>
            <div className="small">N° pedido: {orderNumber} · Fecha: {generatedAtStr}</div>
          </div>
        </header>

        <section className="section">
          <h3>Datos del comprador</h3>
          <div className="info-row"><strong>Nombre:</strong> {orderInfo.nombre}</div>
          <div className="info-row"><strong>Dirección:</strong> {orderInfo.direccion}</div>
          <div className="info-row"><strong>Teléfono:</strong> {orderInfo.telefono}</div>
        </section>

        <section className="section">
          <h3>Artículos</h3>
          <ul className="items-list">
            {cart.map(it => (
              <li key={it.idproductos}>
                <span className="it-name">{it.nombre}</span>
                <span className="it-qty">x{it.cantidad}</span>
                <span className="it-price">Q {Number(it.precio).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="total-line">Total: Q {total.toFixed(2)}</div>
        </section>

        <section className="section">
          <h3>Método de pago</h3>
          <div className="info-row">{paymentInfo?.method === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}</div>
        </section>

        <div className="actions">
          <button className="btn-outline" onClick={() => finalizar(true)}>No, gracias</button>
          <button className="btn-primary" onClick={generarPDF}>Descargar factura (PDF)</button>
        </div>

        <div style={{ marginTop:12, display:'flex', justifyContent:'center' }}>
          <button className="btn-link" onClick={() => finalizar(false)}>Finalizar compra</button>
        </div>
      </div>
    </div>
  )
}
