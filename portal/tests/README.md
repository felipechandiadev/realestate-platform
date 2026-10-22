# Tests del portal

## Estado (fase 6)

- Se eliminaron placeholders y copias del árbol de tests del backoffice (`tests/backOffice`, `tests/portal`, etc.).
- **Jest no está instalado** en `portal/package.json` (script histórico `jest --passWithNoTests` y `jest.config.cjs` quedan como referencia opcional).
- Smoke real actual: `tests/smoke.node.test.mjs` con el test runner nativo de Node.

```bash
npm run test -w portal
# equivalente: node --test tests/smoke.node.test.mjs
```

## Opcional: reinstalar Jest

Si se quiere la suite Jest/jsdom:

```bash
npm install -D -w portal jest ts-jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
npm pkg set scripts.test="jest --passWithNoTests" -w portal
```

Los E2E de Playwright siguen en `portal/e2e/`.
