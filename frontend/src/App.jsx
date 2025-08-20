
import { StrictMode } from 'react'
import logoPM from './assets/IMG/logocentral.png'
import './App.css'
import Datosfinales from './components/datosfinales.jsx'
import Categoria from './components/catalogo.jsx'
import {useState, useEffect} from 'react'
function App() {
  // Mensaje general traído desde /api/inicio
  const [mensaje, setMensaje] = useState(null)
  // Estados para la carga inicial
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
   // Estado del menú (3 líneas)
  const [menuOpen, setMenuOpen] = useState(false)

   // Controla qué vista se muestra: true = vista "inicio", false = vista "catálogo"
  const [showInicio, setShowInicio] = useState(true)
  //detector de scroll
  const [showFooter, setShowFooter] = useState(false)
  // Estado para la categoría seleccionada y los productos a mostrar
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [productosCategoria, setProductosCategoria] = useState([])
  const [loadingCategoria, setLoadingCategoria] = useState(false)
  const [errorCategoria, setErrorCategoria] = useState(null)

 // Carga inicial (mensaje)
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
      setShowFooter(atBottom)
    }
    window.addEventListener('scroll', handleScroll)
    // Llama una vez al montar
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Maneja la selección de una categoría desde el componente Catalogo
  //  - cierra el menú
  //  - solicita /api/catalogo, filtra por categoría y guarda los productos para mostrar
  async function handleSelectCategory(catName) {
    setSelectedCategory(catName)
    setShowInicio(false)         // <-- mostramos la vista de catálogo
    setMenuOpen(false)
    setLoadingCategoria(true)
    setErrorCategoria(null)
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/catalogo')
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`Error catalogo (${resp.status}) ${txt}`)
      }
      const json = await resp.json()
      // filtra en frontend por la categoría seleccionada
      const encontrados = (json.productos || []).filter(p => p.categoria === catName)
      setProductosCategoria(encontrados)
    } catch (e) {
      setErrorCategoria(e.message)
      setProductosCategoria([])
    } finally {
      setLoadingCategoria(false)
    }
  }

  // Opción rápida para volver a la vista "inicio"
  function volverInicio() {
    setShowInicio(true)
    setSelectedCategory(null)
    setProductosCategoria([])
  }





  return (
    <div className='app-root'>
      <header className="main-header">
      <div className="header-container">
        
        <div className="header-left"style={{position:'relative'}} >
          <button className="menu-btn" onClick={() => setMenuOpen(v => !v)} >
            {/* Icono de 3 líneas */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b70cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          </button>

           {/* Catalogo visual (solo frontend). onSelect usa la función que solicita /api/catalogo */}
          <Categoria
            open={menuOpen}
            categorias={['Memoria RAM','Laptops','Periféricos','Monitores','Almacenamiento','Audio']}
            onSelect={(cat) => {
              console.log('Seleccionado:', cat)
              handleSelectCategory(cat)
            }}
          />
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
            {/* Si showInicio = true mostramos el inicio; si false mostramos la vista de catálogo */}
            {showInicio ? (
              <>
                <h2>{mensaje?.titulo}</h2>
                <p>{mensaje?.descripcion}</p>
                {/* botón para forzar mostrar catálogo vacío (ejemplo) */}
                {/* <button onClick={() => setShowInicio(false)}>Ver catálogo</button> */}
              </>
            ) : (
              <>
                {/* Vista catálogo: título y botón para volver */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3>Catálogo: {selectedCategory}</h3>
                  <button onClick={volverInicio} style={{ padding:'6px 10px', borderRadius:6 }}>Volver al inicio</button>
                </div>

                {loadingCategoria && <p>Cargando productos...</p>}
                {errorCategoria && <p style={{color:'red'}}>Error: {errorCategoria}</p>}

                {!loadingCategoria && !errorCategoria && productosCategoria.length === 0 && (
                  <p>No hay productos en esta categoría.</p>
                )}

                <ul style={{ listStyle:'none', padding:0, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
                  {productosCategoria.map(p => (
                    <li key={p.id} style={{ background:'#fff', padding:12, borderRadius:8, boxShadow:'0 8px 20px rgba(12,24,48,0.05)' }}>
                      <div style={{ fontWeight:700 }}>{p.nombre}</div>
                      <div style={{ color:'#666', fontSize:13 }}>{p.categoria}</div>
                      <div style={{ marginTop:8, fontWeight:600 }}>${p.precio}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
