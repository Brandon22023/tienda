# Suite Selenium

La suite usa `node:test`, Selenium WebDriver y Chrome en modo headless. Cada caso crea y cierra su propio navegador, espera elementos explícitamente y guarda una captura en `test/Selenium/results` si falla.

Desde `frontend`:

```bash
npm run test:selenium
```

Variables opcionales:

- `SELENIUM_BASE_URL`: URL del frontend, por defecto `http://localhost:5173`.
- `SELENIUM_API_URL`: URL del backend, por defecto `http://localhost:8000`.
