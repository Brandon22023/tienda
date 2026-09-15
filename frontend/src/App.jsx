import React from 'react'
import logoPM from './assets/IMG/logocentral.png'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
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
import Favoritos from './components/favoritos.jsx'
import HistorialPedidos from './components/historial.jsx'
import { useState, useEffect } from 'react'
import { apiUrl } from './lib/api.js'
import { getFavoriteIds, toggleFavorite } from './lib/favorites.js'

function App() {
  // Mensaje general traído desde /api/inicio
  const [mensaje, setMensaje] = useState(null)
  const [productosInicio, setProductosInicio] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cliente, setCliente] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [favoriteIds, setFavoriteIds] = useState([])
  const categorias = ['Memoria Ram','Laptops','Periféricos','Monitores','Almacenamiento','Audio']
  const navigate = useNavigate()
  const location = useLocation()
  
  const [cartCount, setCartCount] = useState(0)
 const [badgePulse, setBadgePulse] = useState(false)

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
    } catch {
      console.error('Error guardando carrito')
    }
  }

 useEffect(() => {
   function readCartCount() {
     try {
       const raw = localStorage.getItem('cart')
       const arr = raw ? JSON.parse(raw) : []
        const newCount = Array.isArray(arr) ? arr.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) : 0

       setCartCount(newCount)
       if (newCount > 0) {
         setBadgePulse(true)
         setTimeout(() => setBadgePulse(false), 420)
       }
     } catch {
       setCartCount(0)
     }
   }

   readCartCount()
   function onUpdate() { readCartCount() }
   function onClear() {
     localStorage.removeItem('cart')
     readCartCount()
   }
   window.addEventListener('cart-updated', onUpdate)
   window.addEventListener('cart-cleared', onClear)
   return () => {
     window.removeEventListener('cart-updated', onUpdate)
     window.removeEventListener('cart-cleared', onClear)
   }
 }, [])

  useEffect(() => {
    // cargar cliente desde localStorage (si ya inició sesión)
    try {
      const raw = localStorage.getItem('cliente')
      if (raw) setCliente(JSON.parse(raw))
    } catch {
      setCliente(null)
    }
  }, [])

  // Nuevo: manejar clic en el botón de usuario (mostrar advertencia de cerrar sesión)
  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || ''
    setSearchInput(query)
    setSearchTerm(query.trim().toLowerCase())
  }, [location.search])

  useEffect(() => {
    function readFavorites() { setFavoriteIds(getFavoriteIds()) }
    readFavorites()
    window.addEventListener('favorites-updated', readFavorites)
    return () => window.removeEventListener('favorites-updated', readFavorites)
  }, [])

  function submitSearch(event) {
    event.preventDefault()
    const query = searchInput.trim()
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/')
  }

  function toggleProductFavorite(id) {
    setFavoriteIds(toggleFavorite(id))
  }

  function handleCuentaClick() {
    if (!cliente) {
      navigate('/login')
      return
    }
    navigate('/mis-pedidos')
  }
  useEffect(() => {
    async function cargar() {
      try {
        const endpoint = searchTerm ? '/api/catalogo' : '/api/inicio'
        const resp = await fetch(apiUrl(endpoint))
        if (!resp.ok) {
          const txt = await resp.text()
          throw new Error(`Error inicio (${resp.status}) ${txt}`)
        }
        const json = await resp.json()
        const products = Array.isArray(json.productos) ? json.productos : []
        const normalized = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const filtered = searchTerm
          ? products.filter(product => `${product.nombre} ${product.descripcion || ''} ${product.categoria || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized))
          : products
        setProductosInicio(filtered)
        setMensaje(searchTerm ? { titulo: `Resultados para “${searchTerm}”` } : json.mensaje)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [searchTerm])

  useEffect(() => {
    // Función para detectar si estamos al final del scroll
    function handleScroll() {
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
            <button className="menu-btn" data-testid="category-menu" aria-label="Abrir catálogo" onClick={() => setMenuOpen(v => !v)} >
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
          <form className="header-center" onSubmit={submitSearch}>
            <input type="text" className="buscador-input" data-testid="store-search" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Buscar en la tienda..." />
            <button type="submit" className="buscador-btn" data-testid="store-search-submit" aria-label="Buscar">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="7"/><line x1="16" y1="16" x2="13.5" y2="13.5"/></svg>
            </button>
          </form>
          <div className="header-right">


            {cliente ? (
              <button
                className="icon-btn"
                data-testid="account-button"
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
                data-testid="account-button"
                onClick={() => navigate('/login')}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/login') }}
              >
              <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="8" r="5"/>
              <path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6"/>
              </svg>
                <span>Mi Cuenta</span>
              </button>
            )}


            <button className="icon-btn" data-testid="favorites-button" onClick={() => navigate('/favoritos')}>
              <svg className="cart-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 7.5a4.5 4.5 0 0 0-9 0c0 4.5 4.5 7.5 4.5 7.5s4.5-3 4.5-7.5z"/>
              </svg>
               <span>Favoritos{favoriteIds.length ? ` (${favoriteIds.length})` : ''}</span>
            </button>
            <button className="icon-btn cart-btn" data-testid="cart-button"
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
                    <article key={p.idproductos} className="producto-card" data-testid="home-product-card">
                      <img src={p.image_url} alt={p.nombre} />
                      <div className="producto-info">
                        <div className="producto-nombre">{p.nombre}</div>
                        <div className="producto-categoria">{p.categoria}</div>
                        <div className="producto-precio">Q {Number(p.precio).toFixed(2)}</div>
                        <button className="favorite-btn" data-testid="home-favorite" aria-label={favoriteIds.includes(Number(p.idproductos)) ? 'Quitar de favoritos' : 'Agregar a favoritos'} onClick={() => toggleProductFavorite(p.idproductos)}>
                          {favoriteIds.includes(Number(p.idproductos)) ? '♥' : '♡'}
                        </button>
                        <button className="producto-add" data-testid="home-add-to-cart" onClick={() => addToCart(p, 1)}>Agregar al carrito</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </main>
        } />
         <Route path="/login" element={<IniciarSesion />} />
        <Route path="/register" element={<Registrarse />} />
        <Route path="/carrito" element={<Carrito/>} />
        <Route path="/pedidos" element={<Pedido />} />
        <Route path="/pago" element={<Pago />} />
         <Route path="/resumen/:orderId" element={<Resumen />} />
         <Route path="/favoritos" element={<Favoritos />} />
         <Route path="/mis-pedidos" element={<HistorialPedidos />} />
         <Route path="/:categoriaId" element={<Vistacatalogo categorias={categorias} />} />
      </Routes>

      <footer className="footer">
        <Datosfinales />
      </footer>
    </div>
  )
}

export default App
