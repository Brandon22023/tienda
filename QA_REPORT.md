# Informe QA — Electrocore

Fecha de ejecución: 2026-09-12  
Entorno: Windows 11 x64, Docker Desktop, frontend y backend configurados mediante variables de entorno, PostgreSQL 16 en el puerto 5433.

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
| Cypress | 8 casos escritos; la suite queda preparada para CI Linux. En Windows el ejecutable local falla al verificar `--smoke-test/--ping` |
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

Se verificaron rutas para detalle de pedidos, historial de clientes, logout del servidor y autorización mediante token. La compra como invitado permanece habilitada.

## Hallazgos

### BUG-001 — Resuelto — Autenticación y autorización del lado servidor

`POST /api/login` emite un token Bearer almacenado como hash en la tabla de clientes. Los pedidos invitados permiten `null`; los pedidos autenticados se asocian al cliente del token y no al `cliente_id` enviado por el navegador.

Evidencia: `Backend/routes/api.php`, `Backend/app/Http/Controllers/LoginController.php`, `Backend/app/Http/Controllers/OrderController.php`, `frontend/src/components/pago.jsx`.

Implementado mediante `CustomerToken`, endpoints de logout e historial, conservando el flujo explícito de invitado.

### BUG-002 — Resuelto — Una categoría inexistente muestra todos los productos

La categoría inexistente ahora conserva una lista vacía y muestra el estado “No hay productos en esta categoría”.

Implementado eliminando el fallback al catálogo completo.

### BUG-003 — Media — El carrito permite superar el inventario disponible

`frontend/src/components/carrito.jsx` incrementa la cantidad sin conocer ni consultar el stock. El backend rechaza el pedido al finalizar, pero el usuario puede construir un carrito inválido y descubre el problema tarde.

Recomendación: exponer stock en el contrato de catálogo, limitar el control `+`, mostrar disponibilidad y conservar la validación definitiva en el backend.

### BUG-004 — Resuelto — `/pago` puede abrirse sin carrito

La navegación directa a `/pago` conserva el resumen vacío, pero el frontend ahora bloquea el envío y muestra un mensaje accionable cuando no hay artículos.

Implementado con validación de datos del pedido y carrito antes de crear la orden.

### GAP-001 — Parcialmente resuelto — Búsqueda, favoritos y enlaces secundarios

La búsqueda y favoritos ya funcionan y tienen pruebas frontend. Los enlaces secundarios que todavía apuntan a `#` quedan fuera del alcance de este cambio.

## Riesgos no cubiertos por el producto actual

- No hay pasarela de pago real; el flujo de tarjeta solo valida formato y guarda información en el navegador.
- El historial de pedidos requiere una cuenta y token Bearer; los pedidos invitados solo se consultan mediante el identificador generado para su resumen.
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
