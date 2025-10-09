import './datosfinales.css'
  const year = new Date().getFullYear();
function datosfinales() {


  return (
    <footer className="footer aurora-footer" role="contentinfo">
      <div className="footer-inner">
        {/* CTA superior */}
        

        {/* Contenido principal */}
        <div className="footer-content">
          <div className="footer-col brand">
            <h2 className="brand-logo">Electrocore</h2>
            <p className="muted">Contáctos:</p>
            <div className="social">
              <a href="#" aria-label="Facebook" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.04 3.68 9.22 8.5 10v-7.06H8.07v-2.94h2.43v-2.24c0-2.4 1.43-3.72 3.62-3.72 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.91h2.65l-.42 2.94h-2.23V22c4.82-.78 8.5-4.96 8.5-9.94z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.11-2.12C19.3 5 12 5 12 5s-7.3 0-8.89.38A3 3 0 0 0 1 7.5V12a46.7 46.7 0 0 0 .11 4.5A3 3 0 0 0 3.22 18.6C4.8 19 12 19 12 19s7.3 0 8.89-.38A3 3 0 0 0 23 16.5V12a46.7 46.7 0 0 0 0-4.5zM9.75 15.02v-6L15.5 12l-5.75 3.02z"/></svg>
              </a>
              <a href="#" aria-label="X" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h3l-7.5 9.2L22 22h-6l-4.5-5.9L6 22H3l7.9-9.7L2 2h6l4 5.3L18 2z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Tienda</h4>
            <ul>
              <li><a href="#">Puntos de Venta</a></li>
              <li><a href="#">Horarios</a></li>
              <li><a href="#">Envíos</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Soporte al cliente</h4>
            <ul>
              <li><a href="#">Garantías</a></li>
              <li><a href="#">Servicio técnico</a></li>
              <li><a href="#">Formas de pago</a></li>
              <li><a href="#">Devoluciones</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Información</h4>
            <ul>
              <li><a href="mailto:info@Electrocore.com">info@Electrocore.com</a></li>
              <li><a href="tel:+50224230000">(502) 2423‑0000</a></li>
              <li><a href="#">Condiciones de uso</a></li>
              <li><a href="#">Venta a empresas</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-hr" />

        <div className="footer-bottom">
          <p>© 1961 - {year} Electrocore S.A.</p>
          <p className="disclaimer" style={{fontSize:12, color:'#a1a1a1', marginTop:6}}>
            Imágenes usadas únicamente con fines educativos. No se emplean con fines de lucro ni implican asociación con las marcas mostradas.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default datosfinales
