# Estrategia de Testing - Frontend

## Estado Actual

### Estructura de Tests

```
frontend/
├── tests/generated/        # 46 tests UNITARIOS (Jest) - Placeholders
│   ├── portal/            # Tests de páginas del portal público
│   ├── backOffice/        # Tests de páginas del backOffice
│   ├── actions/           # Tests de server actions
│   ├── contexts/          # Tests de React contexts
│   └── ...
│
└── e2e/                   # 1 test E2E (Playwright) - Funcional
    └── backoffice.sales.spec.ts
```

---

## 1. TESTS UNITARIOS (Jest)

**Framework:** Jest + React Testing Library  
**Ubicación:** `frontend/tests/generated/`  
**Cantidad:** 46 archivos  
**Estado:** ⚠️ **PLACEHOLDERS** (no implementados)

### Problema Identificado

Todos los tests unitarios son **placeholders vacíos**:

```typescript
// tests/generated/portal/portal.test.ts
describe('portal - /portal', () => {
  it('renders /portal (placeholder)', () => {
    expect(true).toBe(true);  // ❌ No testea nada real
  });
});
```

### Scripts Disponibles

```bash
npm run test           # Ejecuta todos los tests unitarios
npm run test:watch     # Modo watch para desarrollo
```

### Configuración (jest.config.cjs)

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',  // Simula browser
  testMatch: ['<rootDir>/frontend/tests/**/*.test.(ts|tsx|js)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/$1'  // Alias de imports
  }
}
```

---

## 2. TESTS E2E (Playwright)

**Framework:** Playwright  
**Ubicación:** `frontend/e2e/`  
**Cantidad:** 1 archivo funcional  
**Estado:** ✅ **IMPLEMENTADO Y FUNCIONAL**

### Test Existente: `backoffice.sales.spec.ts`

Este test cubre el **flujo completo de gestión de propiedades de venta**:

#### Test 1: Login y navegación básica
```typescript
test('login, open sales grid and basic interactions', async ({ page }) => {
  // 1. Ir a portal (/)
  // 2. Click "Ingresar"
  // 3. Login con admin@re.cl / 890890
  // 4. Redirect a /
  // 5. Abrir menú → propiedades → venta
  // 6. Verificar que el DataGrid se muestra
  // 7. Probar expandir fila
  // 8. Probar botones de acciones (view/edit/delete)
});
```

#### Test 2: Crear propiedad completa
```typescript
test('create new property - basic flow', async ({ page }) => {
  // 1-5. (igual que test anterior hasta llegar al grid)
  
  // 6. Click botón "Agregar" (add-button)
  // 7. Modal se abre
  
  // PASO 1: Información Básica
  //   - Título: "Test Property"
  //   - Descripción: "Test description"
  //   - Tipo de propiedad: (primera opción)
  //   - Precio: 100000000
  //   - Moneda: (primera opción)
  //   - Click "→" (siguiente)
  
  // PASO 2: Detalles
  //   - M² construidos: 100
  //   - M² terreno: 200
  //   - Click "→"
  
  // PASO 3: Ubicación
  //   - Región: (primera opción)
  //   - Ciudad: (primera opción, espera carga)
  //   - Dirección: "Test Address 123"
  //   - Coordenadas: lat -33.4000, lng -70.6000
  //   - Click "→"
  
  // PASO 4: Multimedia (skip)
  //   - Click "→"
  
  // PASO 5: SEO (skip)
  //   - Click "→"
  
  // PASO 6: Notas Internas
  //   - Notas: "Test notes"
  //   - Click "Crear Propiedad"
  
  // 8. Esperar mensaje de éxito
  // 9. Verificar que vuelve al grid
});
```

### Scripts Disponibles

```bash
npm run test:e2e         # Ejecuta tests E2E (headless)
npm run test:e2e:headed  # Ejecuta con browser visible
```

### Configuración (playwright.config.ts)

```typescript
{
  testDir: './frontend/e2e',
  timeout: 60_000,              // 60 segundos por test
  baseURL: 'http://localhost:3000',  // ⚠️ Frontend debe estar corriendo
  use: {
    headless: true,             // Sin interfaz gráfica
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'     // Debug trace en fallos
  }
}
```

---

## 3. ESTRATEGIA DE TESTING RECOMENDADA

### Pirámide de Testing Ideal

```
         /\
        /E2E\          10% - Tests de flujos completos (Playwright)
       /------\
      /  INT   \       20% - Tests de integración (Jest)
     /----------\
    /   UNIT     \     70% - Tests unitarios (Jest + RTL)
   /--------------\
```

### Implementación por Fases

#### FASE 1: Tests E2E Críticos (1-2 semanas)

**Prioridad:** 🔴 ALTA

Crear tests E2E para flujos críticos del negocio:

1. **Portal Público:**
   - ✅ Búsqueda de propiedades con filtros
   - ✅ Detalle de propiedad
   - ✅ Propiedades relacionadas
   - ✅ Contacto con agente
   - ✅ Solicitud de visita

2. **BackOffice - Propiedades:**
   - ✅ Login admin
   - ✅ Crear propiedad (IMPLEMENTADO)
   - ✅ Editar propiedad
   - ✅ Subir multimedia
   - ✅ Cambiar estado (Disponible → Vendida)
   - ✅ Eliminar propiedad (soft delete)

3. **BackOffice - Contratos:**
   - ✅ Crear contrato
   - ✅ Adjuntar documentos
   - ✅ Registrar pago
   - ✅ Cambiar estado contrato
   - ✅ Generar reporte

4. **BackOffice - Usuarios:**
   - ✅ Crear usuario
   - ✅ Asignar rol
   - ✅ Cambiar permisos
   - ✅ Desactivar usuario

**Archivos a crear:**
```
e2e/
├── portal.search.spec.ts          # Búsqueda de propiedades
├── portal.property-detail.spec.ts # Detalle de propiedad
├── portal.contact.spec.ts         # Formulario de contacto
├── backoffice.sales.spec.ts       # ✅ Ya existe
├── backoffice.rentals.spec.ts     # Propiedades de arriendo
├── backoffice.contracts.spec.ts   # Gestión de contratos
├── backoffice.users.spec.ts       # Gestión de usuarios
└── auth.spec.ts                   # Login/Logout/Recuperar contraseña
```

#### FASE 2: Tests Unitarios de Componentes (2-3 semanas)

**Prioridad:** 🟠 MEDIA

Reemplazar placeholders con tests reales:

1. **Componentes Críticos:**
   ```typescript
   // tests/components/DataGrid.test.tsx
   describe('DataGrid', () => {
     it('renders columns correctly', () => {
       // Test que columnas se muestran
     });
     
     it('handles pagination', () => {
       // Test cambio de página
     });
     
     it('sorts data when clicking header', () => {
       // Test ordenamiento
     });
     
     it('calls onRowClick when row is clicked', () => {
       // Test eventos
     });
   });
   ```

2. **Server Actions:**
   ```typescript
   // tests/actions/properties.test.ts
   describe('getProperties', () => {
     it('fetches properties with filters', async () => {
       // Mock fetch
       // Llamar acción
       // Verificar request correcto
     });
     
     it('handles error response', async () => {
       // Mock error
       // Verificar error handling
     });
   });
   ```

3. **Contexts:**
   ```typescript
   // tests/contexts/AuthContext.test.tsx
   describe('AuthContext', () => {
     it('provides user session', () => {
       // Test que provee sesión
     });
     
     it('updates session on login', () => {
       // Test login actualiza estado
     });
   });
   ```

#### FASE 3: Tests de Integración (3-4 semanas)

**Prioridad:** 🟡 MEDIA-BAJA

Tests que validan interacción entre componentes:

```typescript
// tests/integration/property-creation-flow.test.tsx
describe('Property Creation Flow', () => {
  it('completes multi-step form', () => {
    // Renderizar BaseForm
    // Llenar paso 1
    // Ir a paso 2
    // Llenar paso 2
    // ...
    // Verificar datos finales
  });
});
```

---

## 4. CHECKLIST DE IMPLEMENTACIÓN

### E2E Tests (Playwright)

- [x] **backoffice.sales.spec.ts** - IMPLEMENTADO
- [ ] portal.search.spec.ts
- [ ] portal.property-detail.spec.ts
- [ ] portal.contact.spec.ts
- [ ] backoffice.rentals.spec.ts
- [ ] backoffice.contracts.spec.ts
- [ ] backoffice.users.spec.ts
- [ ] auth.spec.ts

### Unit Tests (Jest)

**Componentes UI:**
- [ ] DataGrid.test.tsx
- [ ] BaseForm.test.tsx
- [ ] PropertyFilter.test.tsx
- [ ] NumberStepper.test.tsx
- [ ] FileUploader.test.tsx
- [ ] LocationPicker.test.tsx
- [ ] Alert.test.tsx
- [ ] Dialog.test.tsx

**Server Actions:**
- [ ] properties.test.ts
- [ ] contracts.test.ts
- [ ] users.test.ts
- [ ] auth.test.ts

**Contexts:**
- [ ] AuthContext.test.tsx
- [ ] AlertContext.test.tsx

**Hooks:**
- [ ] useAlert.test.ts
- [ ] useAuth.test.ts

---

## 5. CÓMO EJECUTAR TESTS

### Prerequisitos

1. **Backend corriendo:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Frontend corriendo:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Base de datos con datos de prueba:**
   ```bash
   cd backend
   npm run seed:reset
   ```

### Ejecutar Tests E2E

```bash
# Desde la raíz del proyecto
cd frontend

# Modo headless (sin interfaz)
npm run test:e2e

# Modo headed (con browser visible)
npm run test:e2e:headed

# Test específico
npx playwright test e2e/backoffice.sales.spec.ts

# Modo debug (pausado, inspector)
npx playwright test --debug

# Generar reporte HTML
npx playwright test --reporter=html
```

### Ejecutar Tests Unitarios

```bash
cd frontend

# Todos los tests
npm run test

# Modo watch (re-ejecuta en cambios)
npm run test:watch

# Test específico
npm run test -- tests/components/DataGrid.test.tsx

# Con cobertura
npm run test -- --coverage
```

---

## 6. DATOS DE PRUEBA

### Usuarios de Test

| Email | Password | Rol | Uso |
|-------|----------|-----|-----|
| admin@re.cl | 890890 | ADMIN | Tests de backOffice |
| agent@re.cl | 890890 | AGENT | Tests de agente |
| user@re.cl | 890890 | COMMUNITY | Tests de usuario normal |

### Propiedades de Test

Después de `npm run seed:reset` habrá:
- ~10 propiedades de venta
- ~5 propiedades de arriendo
- ~3 propiedades destacadas

---

## 7. DEBUGGING TIPS

### Playwright

```typescript
// Pausar test para inspeccionar
await page.pause();

// Screenshots
await page.screenshot({ path: 'debug.png' });

// Ver selector
await page.locator('[data-test-id="add-button"]').highlight();

// Console logs del browser
page.on('console', msg => console.log('BROWSER:', msg.text()));

// Errores de página
page.on('pageerror', error => console.log('PAGE ERROR:', error));
```

### Jest

```typescript
// Debug un test específico
test.only('this test', () => {
  // Solo corre este test
});

// Ver valores
console.log('Debug:', value);

// Breakpoint (con --inspect-brk)
debugger;
```

---

## 8. CI/CD INTEGRATION

### GitHub Actions (recomendado)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Backend Dependencies
        run: cd backend && npm ci
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      
      - name: Start Backend
        run: cd backend && npm run start:prod &
      
      - name: Start Frontend
        run: cd frontend && npm run start &
      
      - name: Wait for services
        run: npx wait-on http://localhost:3000 http://localhost:3001
      
      - name: Run E2E Tests
        run: cd frontend && npm run test:e2e
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 9. MÉTRICAS DE ÉXITO

### Coverage Targets

```
E2E Tests:     100% de flujos críticos (8 tests)
Unit Tests:    >70% cobertura de componentes
Integration:   >50% cobertura de flujos complejos
```

### KPIs

- ✅ Todos los tests E2E pasan en <5 minutos
- ✅ Tests unitarios en <30 segundos
- ✅ 0 tests flaky (intermitentes)
- ✅ Coverage >70% en código crítico

---

## 10. PRÓXIMOS PASOS

### Semana 1-2: E2E Críticos

1. [ ] Crear `portal.search.spec.ts`
2. [ ] Crear `portal.property-detail.spec.ts`
3. [ ] Crear `backoffice.contracts.spec.ts`
4. [ ] Crear `auth.spec.ts`

### Semana 3-4: Unit Tests Base

1. [ ] Implementar DataGrid.test.tsx
2. [ ] Implementar BaseForm.test.tsx
3. [ ] Implementar PropertyFilter.test.tsx
4. [ ] Implementar server actions tests

### Semana 5-6: Integration & Coverage

1. [ ] Tests de integración de flujos
2. [ ] Aumentar coverage a >70%
3. [ ] Setup CI/CD en GitHub Actions
4. [ ] Documentar edge cases

---

**Última actualización:** 3 de Febrero de 2026  
**Autor:** Análisis de Testing - GitHub Copilot
