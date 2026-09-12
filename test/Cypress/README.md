# Suite Cypress

Suite independiente para smoke, catálogo, carrito, validaciones de API y resumen de checkout. Los videos y capturas de fallos quedan en `test/Cypress/results`.

Desde `frontend`:

```bash
npm run test:cypress
```

Para cambiar el frontend: `CYPRESS_BASE_URL=http://localhost:5173 npm run test:cypress`.
