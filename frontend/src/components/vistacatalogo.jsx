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
  // modal: estado y helpers para elegir cantidad antes de agregar al carrito
  const [modalOpen, setModalOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const [modalQty, setModalQty] = useState(1)

 // alias usado por los botones "Agregar al carrito" (abre el modal)
 function agregarAlCarrito(product) {
   setModalProduct(product)
   setModalQty(1)
   setModalOpen(true)
 }
  //para agregar al carrito
  // Abre modal para elegir cantidad
  function openQtyModal(product) {
    setModalProduct(product)
    setModalQty(1)
    setModalOpen(true)
  }

  // Agrega al carrito en localStorage y notifica a la app
  function addToCart(product, qty) {
    try {
      const key = 'cart'
      const raw = localStorage.getItem(key)
      const cart = raw ? JSON.parse(raw) : []
      const idx = cart.findIndex(i => i.idproductos === product.idproductos)
      if (idx >= 0) {
        cart[idx].cantidad = (cart[idx].cantidad || 0) + qty
      } else {
        cart.push({
          idproductos: product.idproductos,
          nombre: product.nombre,
          precio: Number(product.precio) || 0,
          image_url: product.image_url,
          cantidad: qty
        })
      }
      localStorage.setItem(key, JSON.stringify(cart))
      // evento para que otros componentes (Carrito) recarguen
      window.dispatchEvent(new Event('cart-updated'))
    } catch (e) {
      console.error('Error guardando carrito', e)
    }
  }

  function confirmAdd() {
    if (!modalProduct) return
    addToCart(modalProduct, Number(modalQty || 1))
    setModalOpen(false)
  }


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
            <button
              className="btn-agregar"
              onClick={() => agregarAlCarrito(p)}
            >
              Agregar al carrito
            </button>
            <div style={{ fontWeight:700 }}>{p.nombre}</div>
            <div style={{ color:'#666', fontSize:13 }}>{p.categoria}</div>
            <div style={{ color:'#666', fontSize:13 }}>{p.descripcion}</div>
            <div style={{ marginTop:8, fontWeight:600 }}>${p.precio}</div>
          </li>
        ))}
      </ul>
      {/* Modal de la cantidad del producto */}
      {modalOpen && (
        <div className="qty-modal-overlay" role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
          <div className="qty-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Añadir al carrito</h4>
            <div className="modal-row">
              <div className="modal-thumb">
                <img src={modalProduct.image_url} alt={modalProduct.nombre} />
              </div>
              <div className="modal-info">
                <div className="modal-name">{modalProduct.nombre}</div>
                <div className="modal-price">${modalProduct.precio}</div>
                <div className="qty-control">
                  <button onClick={() => setModalQty(q => Math.max(1, q - 1))}>−</button>
                  <input type="number" min="1" value={modalQty} onChange={(e) => setModalQty(Math.max(1, Number(e.target.value || 1)))} />
                  <button onClick={() => setModalQty(q => q + 1)}>+</button>
                </div>
                <div className="modal-actions">
                  <button className="btn-confirm" onClick={confirmAdd}>Agregar</button>
                  <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

