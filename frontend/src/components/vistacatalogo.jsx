import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './vistacatalogo.css'
function vistacatalogo({ categorias }) {
  const { categoriaId } = useParams();
  const [productosCategoria, setProductosCategoria] = useState([]);
  const [loadingCategoria, setLoadingCategoria] = useState(false);
  const [errorCategoria, setErrorCategoria] = useState(null);

  useEffect(() => {
    async function cargar() {
      setLoadingCategoria(true);
      setErrorCategoria(null);
      try {
        const resp = await fetch('http://127.0.0.1:8000/api/catalogo');
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
    cargar();
  }, [categoriaId]);

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3>Catálogo: {categoriaId.replace(/-/g, ' ')}</h3>
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

export default vistacatalogo;