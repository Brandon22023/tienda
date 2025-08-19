
import { StrictMode } from 'react'
import logoPM from './assets/IMG/logocentral.png'
import './App.css'
import Datosfinales from './components/datosfinales.jsx'
import {useState, useEffect} from 'react'
function App() {
  const [mensaje, setMensaje] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // NUEVO efecto
  useEffect(() => {
    async function cargar() {
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/inicio')
        if (!resp.ok) {
          const txt = await resp.text()
          throw new Error(`Error inicio (${resp.status}) ${txt}`)
        }
        const json = await resp.json()
        setMensaje(json.mensaje)
        setProductos(json.productos)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])





  return (
    <div>
      <header className="main-header">
      <div className="header-container">
        
        <div className="header-left">
          <button className="menu-btn">
            {/* Icono de 3 líneas */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          </button>
          <img
            src={logoPM}
            alt="Logo Tienda"
            className="logo"
          />
          
        </div>
        <div className="header-center">
          <input type="text" className="buscador-input" placeholder="Buscar en la tienda..." />
          <button className="buscador-btn">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="7"/><line x1="16" y1="16" x2="13.5" y2="13.5"/></svg>
          </button>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <svg width="22" height="22" fill="none" stroke=" #4b70cf" strokeWidth="2"><circle cx="11" cy="8" r="4"/><path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>
            <span>Mi Cuenta</span>
          </button>
          <button className="icon-btn">
            <svg width="22" height="22" fill="none" stroke=" #4b70cf" strokeWidth="2"><path d="M16.5 7.5a4.5 4.5 0 0 0-9 0c0 4.5 4.5 7.5 4.5 7.5s4.5-3 4.5-7.5z"/></svg>
            <span>Favoritos</span>
          </button>
          <button className="icon-btn">
            <svg width="22" height="22" fill="none" stroke=" #4b70cf" strokeWidth="2"><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/><path d="M5 6h16l-1.5 9h-13z"/><path d="M7 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Carrito</span>
          </button>
        </div>
      </div>
      </header>

      

      
      {/* Barra de navegación secundaria */}
      <nav className="nav-secundaria">
        <a href="#">Ofertas</a>
        <a href="#">Ubicaciones</a>
        <a href="#">Marcas</a>
        <a href="#">Blog</a>
        <a href="#">Mayoreo</a>
        <a href="#">Empresa</a>
        <a href="#">Soporte</a>
        <a href="#">Políticas</a>
        <a href="#">Sugerencias</a>
        <a href="#">Empleos</a>
      </nav>

      {/* Aquí puedes agregar el resto de tu tienda */}
      <main style={{ padding: "2rem" }}>
        {loading && <p>Cargando...</p>}
        {error && <p style={{color:'red'}}>Error: {error}</p>}
        {!loading && !error && (
          <>
            <h2>{mensaje?.titulo}</h2>
            <p>{mensaje?.descripcion}</p>

            <h3>Productos</h3>
            <ul style={{listStyle:'none', padding:0}}>
              {productos.map(p => (
                <li key={p.id} style={{marginBottom:'0.5rem'}}>
                  <strong>{p.nombre}</strong> - ${p.precio}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      {/* Componente de datos finales */}
      <footer className="footer">
        <Datosfinales />
      </footer>
    </div>
  );
}

export default App
