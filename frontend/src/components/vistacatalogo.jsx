import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import './vistacatalogo.css'
export default function vistacatalogo({ categorias }) {
  const { categoriaId } = useParams();
  const [productosCategoria, setProductosCategoria] = useState([]);
  const [loadingCategoria, setLoadingCategoria] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState(null);
  //aqui se ordenara segun el precio
   const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState('defecto'); // solo para mostrar selección UI
  const menuRef = useRef(null);

  // Resetear orden a "defecto" cada vez que se cambia de categoría
  useEffect(() => {
    setSelected('defecto');
  }, [categoriaId]);


  useEffect(() => {
    async function cargar() {
      setLoadingCategoria(true);
      setErrorCategoria(null);
      try {
        const base = 'http://127.0.0.1:8000';
        let endpoint = '/api/catalogo';
      
        if (selected === 'mayor') endpoint = '/api/catalogo/mayor';
        if (selected === 'menor') endpoint = '/api/catalogo/menor';

        const resp = await fetch(base + endpoint);
        if (!resp.ok) throw new Error('Error al cargar catálogo');
        
        
        
        const json = await resp.json();
        // Filtra por categoría normalizada
        const encontrados = (json.productos || []).filter(
          p => p.categoria.toLowerCase().replace(/\s/g, '-') === categoriaId
        );
        setProductosCategoria(encontrados);
      } catch (e) {
        setErrorCategoria(e.message);
        setProductosCategoria([]);
      } finally {
        setLoadingCategoria(false);
      }
    }
    if (categoriaId) cargar();
  }, [categoriaId, selected]);

  // cerrar al hacer click fuera
  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const opciones = [
    { value: 'defecto', label: 'Predeterminado' },
    { value: 'mayor', label: 'Mayor a menor' },
    { value: 'menor', label: 'Menor a mayor' },
  ];

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3>Catálogo: {categoriaId.replace(/-/g, ' ')}</h3>


        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="orden-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            Ordenar precio por: <span className="selected-label">{opciones.find(opt => opt.value === selected)?.label}</span>
            <span className="caret" aria-hidden="true">▾</span>
          </button>

          {menuOpen && (
            <ul className="orden-menu" role="menu" aria-label="Opciones de orden">
              {opciones.map(opt => (
                <li
                  key={opt.value}
                  role="menuitemradio"
                  aria-checked={selected === opt.value}
                  className={`orden-item ${selected === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    // solo UI: marcar selección visual, no realiza orden real
                    setSelected(opt.value)
                    // no cerrar o cerrar según preferencia; aquí cerramos
                    setMenuOpen(false)
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>






      {loadingCategoria && <p>Cargando productos...</p>}
      {errorCategoria && <p style={{color:'red'}}>Error: {errorCategoria}</p>}
      {!loadingCategoria && !errorCategoria && productosCategoria.length === 0 && (
        <p>No hay productos en esta categoría.</p>
      )}
      <ul style={{ listStyle:'none', padding:0, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
        {productosCategoria.map(p => (
          <li key={p.idproductos} style={{ background:'#fff', padding:12, borderRadius:8, boxShadow:'0 8px 20px rgba(12,24,48,0.05)' }}>
            <img
              src={p.image_url}
              alt={p.nombre}
              style={{ width: '200px', height: 'auto', borderRadius: 8 }}
            />
            <div style={{ fontWeight:700 }}>{p.nombre}</div>
            <div style={{ color:'#666', fontSize:13 }}>{p.categoria}</div>
            <div style={{ color:'#666', fontSize:13 }}>{p.descripcion}</div>
            <div style={{ marginTop:8, fontWeight:600 }}>${p.precio}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

