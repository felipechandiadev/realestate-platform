# 10 · Desarrollo local, calidad y pruebas

## 10.1 Requisitos

Node.js ≥ 20, npm 10, MySQL 8 (local o Docker) y, opcionalmente, Docker para Mailpit.

## 10.2 Puesta en marcha

```bash
npm install
npm install --prefix core
npm run env:dev          # copia los .env de ejemplo
npm run seed --prefix core
npm run core:dev         # API en :8000
npm run dev:apps         # portal :8001 y backoffice :8002
npm run mail:dev         # opcional: bandeja de correo local
```

## 10.3 Calidad

| Comando | Qué verifica |
|---|---|
| `npm run typecheck` | Tipos TypeScript de portal, backoffice y core (0 errores) |
| `npm run lint` | Reglas de estilo y errores comunes |
| `npm test` | Pruebas unitarias del core (sin base de datos) |
| `npm run test:frontend` | Pruebas de portal y backoffice |
| `npm run test:<modulo> --prefix core` | Pruebas de integración por módulo (requieren BD de prueba) |

**CI (GitHub Actions, `.github/workflows/ci.yml`)**: en cada push/PR ejecuta typecheck de las tres apps, lint de portal y backoffice, y tests unitarios del core.

## 10.4 Convenciones

- Commits en español, estilo *Conventional Commits* (`feat:`, `fix:`, `chore:`).
- Rama principal `main`; cambios grandes en rama aparte.
- Lógica de negocio en el core; los frontends solo presentan y llaman a la API.
- Nuevas columnas → migración (`npm run migration:generate --prefix core`), nunca `DB_SYNCHRONIZE` en producción.
- Sin secretos en el repositorio.
