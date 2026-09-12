# Informe QA — Electrocore

Fecha de ejecución: 2026-09-12  
Entorno: Windows 11 x64, Docker Desktop, frontend en `http://localhost:5173`, backend en `http://localhost:8000`, PostgreSQL 16 en `localhost:5433`.

## Resumen ejecutivo

La aplicación levanta correctamente con Docker y el entrypoint carga los datos iniciales cuando la tabla de productos está vacía. La API respondió 10 productos desde `/api/inicio`; el catálogo completo contiene 14 productos en PostgreSQL.

La verificación de despliegue también confirmó que el proxy nginx del frontend
responde `/api/catalogo` y que el contenedor backend tiene activa la extensión
`pdo_pgsql`.

Resultados ejecutados:

| Capa | Resultado |
|---|---:|
| PHPUnit backend | 21/21 pruebas, 86 aserciones |
| Vitest frontend | 3/3 pruebas |
| Playwright | 12/12 pruebas |
| Selenium | 5/5 pruebas |
| Cypress | No ejecutable en este Windows; 8 casos escritos y validados sintácticamente |
| ESLint | OK |
| Build Vite | OK |
| `docker compose config` | OK |

Playwright generó HTML, trazas, videos y capturas bajo `test/Playwright/results`. Selenium guarda capturas de diagnóstico en `test/Selenium/results` cuando ocurre un fallo. Cypress está configurado para generar videos y capturas en `test/Cypress/results`.

## Alcance comprobado

- Inicio y carga de productos desde la API.
- Navegación por categorías y ordenamiento por precio.
- Agregar, incrementar, disminuir y eliminar artículos del carrito.
- Validaciones de registro, login y datos del pedido.
- Resumen de checkout con nombre, artículo, cantidad, precio unitario y total.
- Pago en efectivo y validación de campos de tarjeta.
- Creación de pedido, cálculo de total con precio del servidor, descuento de inventario y rollback transaccional mediante PHPUnit.
- API negativa: credenciales inválidas, campos ausentes, cliente/producto inexistente, cantidades inválidas, duplicados, carrito vacío e inventario insuficiente.
- CI con backend, frontend y job de navegadores.

No se encontraron rutas implementadas para historial/detalle de pedidos, administración, roles, logout del servidor o autorización de recursos. Esas áreas quedan como N/A del producto actual, no como funcionalidades verificadas.

## Hallazgos

### BUG-001 — Alta — Falta autenticación y autorización del lado servidor

`POST /api/login` solo devuelve datos del cliente y el frontend los guarda en `localStorage`; no se emite token/sesión. `POST /api/pedidos` acepta `cliente_id` recibido por el consumidor y permite `null` para invitados. Un cliente puede enviar el ID de otro cliente, porque no existe middleware que vincule la identidad autenticada con el pedido.

Evidencia: `Backend/routes/api.php`, `Backend/app/Http/Controllers/LoginController.php`, `Backend/app/Http/Controllers/OrderController.php`, `frontend/src/components/pago.jsx`.

Recomendación: implementar Sanctum/JWT o sesión segura, proteger las rutas, obtener el cliente desde la identidad autenticada y permitir invitados mediante un flujo explícito separado.

### BUG-002 — Media — Una categoría inexistente muestra todos los productos

En `frontend/src/components/vistacatalogo.jsx`, cuando no hay coincidencias se asigna `encontrados = all`. La URL `/categoria-inexistente` termina mostrando el catálogo completo en lugar de un estado vacío o un 404.

Recomendación: eliminar el fallback, mostrar “No hay productos en esta categoría” y, si aplica, validar el slug contra un catálogo de categorías.

### BUG-003 — Media — El carrito permite superar el inventario disponible

`frontend/src/components/carrito.jsx` incrementa la cantidad sin conocer ni consultar el stock. El backend rechaza el pedido al finalizar, pero el usuario puede construir un carrito inválido y descubre el problema tarde.

Recomendación: exponer stock en el contrato de catálogo, limitar el control `+`, mostrar disponibilidad y conservar la validación definitiva en el backend.

### BUG-004 — Media — `/pago` puede abrirse sin carrito

La navegación directa a `/pago` con `orderInfo` pero sin `cart` muestra “No hay artículos en el carrito”, total `Q 0.00` y permite intentar enviar el pedido; el backend termina devolviendo 422. La prueba manual en navegador reprodujo este estado.

Recomendación: proteger la ruta, validar carrito y datos antes de mostrar pago, y redirigir a carrito/pedido con un mensaje accionable.

### GAP-001 — Baja — Búsqueda, favoritos y enlaces secundarios no tienen comportamiento

Los controles visuales de búsqueda y favoritos no ejecutan una acción, y varios enlaces secundarios apuntan a `#`. Si forman parte del alcance comercial, deben convertirse en historias funcionales y cubrirse con pruebas.

## Riesgos no cubiertos por el producto actual

- No hay pasarela de pago real; el flujo de tarjeta solo valida formato y guarda información en el navegador.
- No hay consulta de pedidos para comprobar visibilidad por usuario.
- No hay operaciones administrativas ni permisos por rol.
- No se pudo hacer una prueba de carga/estrés ni un escaneo DAST en este ciclo.

## Reproducción de pruebas

Con Docker levantado:

```bash
cd frontend
npm test
npm run test:e2e
npm run test:selenium
npm run test:cypress
```

El job `browser-e2e` de `.github/workflows/ci.yml` instala Chromium, inicia Docker, ejecuta las tres suites y publica los artefactos.

## Limitación de Cypress en este equipo

La suite está instalada en `cypress@15.16.0`, pero el binario Windows no inicia: Cypress devuelve `bad option: --smoke-test` y `bad option: --ping`. Se intentó validarlo también en la imagen oficial, montando exclusivamente `test/Cypress`; la descarga de la imagen no terminó dentro del tiempo disponible y se detuvo. El CI está preparado para ejecutar Cypress en `ubuntu-latest`.
