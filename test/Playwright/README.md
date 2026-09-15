# Pruebas E2E con Playwright

Estas pruebas ejecutan el flujo real en el navegador contra el frontend y la API levantados con Docker.

## Preparación

Desde la raíz del proyecto:

```bash
docker compose up --build -d
cd frontend
npx playwright install chromium
```

## Ejecución

```bash
npm run test:e2e
```

Los resultados quedan en `test/Playwright/results/`.

La configuración usa Chrome instalado en el equipo mediante `channel: chrome`. Si no tienes Chrome, ejecuta el comando de instalación anterior.

Puedes cambiar las URLs sin modificar las pruebas:

```bash
set PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173
set PLAYWRIGHT_API_URL=http://127.0.0.1:8000
npm run test:e2e
```
