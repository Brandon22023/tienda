# Suite Cypress

Suite independiente para smoke, catálogo, carrito, validaciones de API y resumen de checkout. Los videos y capturas de fallos quedan en `test/Cypress/results`.

Desde `frontend`:

```bash
npm run test:cypress
```

Para cambiar el frontend: define `CYPRESS_BASE_URL` antes de ejecutar `npm run test:cypress`.
