# Preparacion para despliegue

Este documento deja el proyecto listo para un despliegue futuro sin crear
servicios, cuentas ni credenciales reales.

## Arquitectura preparada

- `frontend/`: React 19 + Vite, desplegable como proyecto independiente en Vercel.
- `Backend/`: Laravel 12 en una imagen Docker, desplegable como servicio Docker en Render.
- Base de datos: PostgreSQL. En produccion puede ser Supabase; en local la
  proporciona `docker-compose.yml`.
- `test/`: suites externas de PHPUnit, Playwright, Selenium y Cypress.
- `Database/DDL.postgresql.sql`: DDL explícito del esquema de negocio para
  PostgreSQL/Supabase.
- `Database/DDL.sql`: export histórico de MySQL Workbench; se conserva solo
  como referencia de la base anterior y no debe ejecutarse en PostgreSQL.
- Las migraciones Laravel en `Backend/database/migrations/` siguen siendo la
  fuente de verdad del runtime y crean también las tablas internas de Laravel.

El backend no depende de archivos JSON de productos ni de datos de prueba para
la operacion normal. Los productos, categorias, clientes y pedidos viven en la
base de datos. `localStorage` conserva únicamente el carrito, favoritos y el
token de sesión del navegador. El resumen y la factura consultan el pedido en
el servidor.

## Variables del backend

Para desarrollo local, `Backend/.env` ya está configurado para el PostgreSQL de
`docker-compose.yml` (puerto local 5433). No subas ese archivo porque contiene
valores locales.

Usa `Backend/.env.example` como plantilla para otro entorno. En Supabase/Render se deben definir
los valores reales de:

```env
APP_KEY=base64:valor-generado-por-Laravel
APP_URL=https://dominio-real-del-backend
DB_CONNECTION=pgsql
DB_HOST=host-real-de-Supabase
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=usuario-real
DB_PASSWORD=secreto-real
DB_SSLMODE=require
CORS_ALLOWED_ORIGINS=https://dominio-real-de-Vercel
SEED_ON_STARTUP=false
```

No se deben commitear secretos. `APP_KEY` se genera en Render mediante
`generateValue` en `render.yaml`, y los demas valores sensibles quedan como
variables pendientes (`sync: false`).

La aplicacion usa `pdo_pgsql` en Docker y ejecuta las migraciones al iniciar el
contenedor. En produccion la carga de productos es intencional: primero se
ejecuta una carga inicial controlada y despues se mantiene
`SEED_ON_STARTUP=false`.

## Render

1. Conecta el repositorio en Render.
2. Usa `render.yaml` como Blueprint.
3. Configura en el servicio los valores de Supabase indicados arriba.
4. Coloca la URL final de Vercel en `CORS_ALLOWED_ORIGINS`.
5. Verifica el endpoint de salud `/up`.

Render inyecta `PORT`; el `CMD` de `Backend/Dockerfile` lo respeta y escucha en
`0.0.0.0`, como necesita un servicio web Docker.

El entrypoint ejecuta las migraciones al iniciar. Despues de que el servicio
este saludable, usa el Render Shell para cargar los productos una sola vez:

```bash
php artisan db:seed --force
```

Luego conserva `SEED_ON_STARTUP=false`.

## Vercel

Configura `frontend/` como Root Directory del proyecto Vercel. El archivo
`frontend/vercel.json` permite que las rutas de React Router se resuelvan al
`index.html` despues de recargar la pagina.

Define esta variable en Vercel antes del build:

```env
VITE_API_URL=https://dominio-real-del-backend
```

Debe ser el origen completo del backend y no debe terminar en `/api`, porque el
cliente agrega ese segmento a cada endpoint. Vite inyecta esta variable en el
build; no se debe poner el secreto de la base de datos en el frontend.

## Docker local

Desde la raiz del repositorio:

```bash
docker compose up --build -d
```

La configuracion local usa PostgreSQL en el puerto host `5433` para no chocar
con una instalacion local de MySQL/PostgreSQL. El backend migra la base y carga
los productos si la tabla esta vacia porque Compose establece
`SEED_ON_STARTUP=true`.

URLs locales:

- Frontend: URL publicada por el servicio web
- Backend: URL publicada por el servicio API
- PostgreSQL: puerto local 5433 durante desarrollo

Para una carga manual o una comprobacion:

```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

El volumen `postgres_data` persiste la informacion. No uses `docker compose
down -v` si necesitas conservarla.

## Desarrollo sin Docker

Para el frontend, copia `frontend/.env.example` a `.env` y define
`VITE_DEV_API_PROXY_TARGET` con el origen local del backend si Vite debe
reenviar `/api`.

Para el backend, copia `Backend/.env.example` a `.env`, define una base
PostgreSQL accesible y genera la clave con:

```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Las variables locales de los runners de pruebas pueden seguir usando SQLite y
URLs de pruebas; son configuración de pruebas, no defaults del bundle de
produccion.

## Compatibilidad MySQL -> PostgreSQL

La migracion de la tienda usa tipos, claves foraneas, restricciones unicas y
consultas compatibles con PostgreSQL. `unsignedInteger` conserva la validacion
de rango en la aplicacion, ya que PostgreSQL no tiene un tipo entero unsigned
nativo. Antes del primer despliegue se debe probar una copia de los datos
reales y revisar cualquier dato historico que provenga del DDL de Workbench.

## Limites conocidos antes de produccion

- El login emite un token Bearer y el backend lo valida para pedidos asociados
  e historial. El carrito y favoritos siguen siendo estado de navegador.
- El pago con tarjeta solo valida datos localmente; no existe una pasarela real.
- El almacenamiento de sesiones/cache en archivo es adecuado para este MVP de
  una instancia, pero debe cambiarse a un servicio compartido si se escala.
- `SEED_ON_STARTUP` debe permanecer desactivado en Render despues de la carga
  inicial para que un reinicio no se convierta en una operacion de datos no
  intencionada.

## Verificaciones

Antes de crear servicios cloud:

```bash
docker compose config --quiet
cd Backend && composer test
cd ../frontend && npm run lint && npm run test && npm run build
```

Las pruebas de navegador se ejecutan desde `frontend/` con los scripts del
`package.json` y guardan sus artefactos bajo `test/`.
