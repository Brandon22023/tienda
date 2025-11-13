import logoPM from './assets/IMG/logocentral.png'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Datosfinales from './components/datosfinales.jsx'
import Categoria from './components/catalogo.jsx'
import Vistacatalogo from './components/vistacatalogo.jsx'
import IniciarSesion from './components/iniciar_sesion.jsx'
import Registrarse from './components/registrarse.jsx'
import Carrito from './components/carrito.jsx'
import Pedido from './components/pedidos.jsx'
import Pago from './components/pago.jsx'
import Resumen from './components/resumen.jsx'
import { useState, useEffect } from 'react'

function App() {
  // Mensaje general traído desde /api/inicio
  const [mensaje, setMensaje] = useState(null)
  const [productosInicio, setProductosInicio] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cliente, setCliente] = useState(null)
  const categorias = ['Memoria Ram','Laptops','Periféricos','Monitores','Almacenamiento','Audio']
  const navigate = useNavigate()
  
  const [cartCount, setCartCount] = useState(0)
 const [badgePulse, setBadgePulse] = useState(false)

 // lee el carrito y suma cantidades
 function readCartCount() {
    try {
      const raw = localStorage.getItem('cart')
      const arr = raw ? JSON.parse(raw) : []
      const newCount = Array.isArray(arr) ? arr.length : 0

      if (newCount !== cartCount) {
        setCartCount(newCount)
        if (newCount > 0) {
          setBadgePulse(true)
          setTimeout(() => setBadgePulse(false), 420)
        }
      } else {
        // mantener estado sin pulso si no cambió
        setCartCount(newCount)
      }
    } catch {
      setCartCount(0)
    }
  }
  function addToCart(product, qty = 1) {
    try {
      const key = 'cart'
      const raw = localStorage.getItem(key)
      const cart = raw ? JSON.parse(raw) : []
      const idx = cart.findIndex(i => i.idproductos === product.idproductos)
      if (idx >= 0) {
        cart[idx].cantidad = (Number(cart[idx].cantidad || 0) + Number(qty))
      } else {
        cart.push({
          idproductos: product.idproductos,
          nombre: product.nombre,
          precio: Number(product.precio) || 0,
          image_url: product.image_url,
          cantidad: Number(qty)
        })
      }
      localStorage.setItem(key, JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
    } catch (e) {
      console.error('Error guardando carrito', e)
    }
  }

 useEffect(() => {
   readCartCount()
   function onUpdate() { readCartCount() }
   window.addEventListener('cart-updated', onUpdate)
   return () => window.removeEventListener('cart-updated', onUpdate)
 }, [])

  useEffect(() => {
    // cargar cliente desde localStorage (si ya inició sesión)
    try {
      const raw = localStorage.getItem('cliente')
      if (raw) setCliente(JSON.parse(raw))
    } catch (e) {
      // no hacer nada
    }
  }, [])

  // Nuevo: manejar clic en el botón de usuario (mostrar advertencia de cerrar sesión)
  function handleCuentaClick() {
    if (!cliente) {
      navigate('/login')
      return
    }
    const ok = window.confirm('¿Deseas cerrar sesión?')
    if (ok) {
      localStorage.removeItem('cliente')
      // recargar para reflejar estado cerrado
      window.location.href = '/'
    }
    // si el usuario cancela, no hacer nada
  }
  useEffect(() => {
    async function cargar() {
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/inicio')
        if (!resp.ok) {
          const txt = await resp.text()
          throw new Error(`Error inicio (${resp.status}) ${txt}`)
        }
        const json = await resp.json()
        setProductosInicio(Array.isArray(json.productos) ? json.productos : [])
        setMensaje(json.mensaje)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    // Función para detectar si estamos al final del scroll
    function handleScroll() {
      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2
      // Puedes usar este estado si lo necesitas para mostrar el footer
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  //para las promos
  function Carousel({ images = [], interval = 4000 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images.length) return
    const t = setInterval(() => setIndex(i => (i + 1) % images.length), interval)
    return () => clearInterval(t)
  }, [images, interval])

  if (!images.length) return null

  return (
    <div className="carousel" aria-roledescription="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <img key={i} src={src} alt={`Slide ${i + 1}`} className="carousel-image" />
        ))}
      </div>

      <div className="carousel-controls">
        <button type="button" aria-label="Anterior" onClick={() => setIndex((index - 1 + images.length) % images.length)}>&lt;</button>
        <button type="button" aria-label="Siguiente" onClick={() => setIndex((index + 1) % images.length)}>&gt;</button>
      </div>

      <div className="carousel-indicators" role="tablist" aria-label="Indicadores del carrusel">
        {images.map((_, i) => (
          <button
            key={i}
            className={i === index ? 'active' : ''}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
 }

  return (
    <div className='app-root'>
      <header className="main-header">
        <div className="header-container">
          <div className="header-left" style={{position:'relative'}} >
            <button className="menu-btn" onClick={() => setMenuOpen(v => !v)} >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="7" x2="20" y2="7"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="17" x2="20" y2="17"/>
              </svg>
            </button>
            <Categoria
              open={menuOpen}
              categorias={categorias}
              onSelect={(cat) => {
                setMenuOpen(false)
                // Navega a la ruta de la categoría
                navigate('/' + cat.toLowerCase().replace(/\s/g, '-'))
              }}
            />
            <img
              src={logoPM}
              alt="Logo Tienda"
              className="logo"
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/') }}
            />
          </div>
          <div className="header-center">
            <input type="text" className="buscador-input" placeholder="Buscar en la tienda..." />
            <button className="buscador-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="7"/><line x1="16" y1="16" x2="13.5" y2="13.5"/></svg>
            </button>
          </div>
          <div className="header-right">


            {cliente ? (
              <button
                className="icon-btn"
                onClick={handleCuentaClick}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCuentaClick() }}
                title={cliente.correo}
              >
                <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="8" r="5"/>
              <path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
              </svg>
                <span>{cliente.nombre}</span>
              </button>
            ) : (
              <button
                className="icon-btn"
                onClick={() => navigate('/login')}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/login') }}
              >
              <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="8" r="5"/>
              <path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
              </svg>
                <span>Mi Cuenta</span>
              </button>
            )}


            <button className="icon-btn">
              <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 7.5a4.5 4.5 0 0 0-9 0c0 4.5 4.5 7.5 4.5 7.5s4.5-3 4.5-7.5z"/>
              </svg>
              <span>Favoritos</span>
            </button>
            <button className="icon-btn cart-btn"
              onClick={() => navigate('/carrito')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/carrito') }}>
              <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
               <circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/><path d="M5 6h16l-1.5 9h-13z"/><path d="M7 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              {/* contador animado */}
              <span className={`cart-badge ${badgePulse ? 'pop' : ''}`} aria-live="polite" aria-atomic="true">{cartCount > 0 ? cartCount : ''}</span>
              <span>  </span>
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-secundaria">
        <a href="#">Descuentos</a>
        <a href="#">Sugerencias</a>
        <a href="#">Ubicaciones</a>
        <a href="#">Información</a>
        <a href="#">Políticas</a>
        <a href="#">Trabajo</a>
        <a href="#">Soporte</a>
      </nav>

      <Routes>
        <Route path="/" element={
          <main style={{ padding: "2rem" }}>
            <Carousel images={['/promo1.jpg','/promo2.jpg','/promo3.jpg']} interval={4500} />
            {loading && <p>Cargando...</p>}
            {error && <p style={{color:'red'}}>Error: {error}</p>}
            {!loading && !error && (
              <>
                <h2>{mensaje?.titulo}</h2>
                <div className="inicio-grid">
                  {productosInicio.map(p => (
                    <article key={p.idproductos} className="producto-card">
                      <img src={p.image_url} alt={p.nombre} />
                      <div className="producto-info">
                        <div className="producto-nombre">{p.nombre}</div>
                        <div className="producto-categoria">{p.categoria}</div>
                        <div className="producto-precio">Q {Number(p.precio).toFixed(2)}</div>
                        <button className="producto-add" onClick={() => addToCart(p, 1)}>Agregar al carrito</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </main>
        } />
        <Route path="/:categoriaId" element={<Vistacatalogo categorias={categorias} />} />
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/register" element={<Registrarse />} />
        <Route path="/carrito" element={<Carrito/>} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/resumen" element={<Resumen />} />
      </Routes>

      <footer className="footer">
        <Datosfinales />
      </footer>
    </div>
  )
}

export default App