# Roadmap de mejoras

Pendientes detectados en la evaluación del proyecto (2026-10-24), para desarrollar más adelante.

## 1. Funcionalidades para usuarios (portal)

Ordenadas por impacto estimado.

- [ ] **Mapa en ficha y listado** — hoy solo hay selector de ubicación al publicar (`publish`, `sell-property`). Agregar mapa en `properties/property/[id]` y búsqueda por mapa en los listados.
- [ ] **Agendar visita** — flujo para pedir día/hora desde la ficha; aviso al agente vía `notifications` y gestión en backoffice.
- [ ] **Alertas de búsqueda guardada** — "avísame si aparece algo así", reutilizando favoritos + notificaciones/mail.
- [ ] **Comparar propiedades** — seleccionar 2–4 y verlas lado a lado.
- [ ] **Pago en línea de contratos** — si `myContracts/[id]/payments` solo muestra historial, integrar pasarela de pago.
- [ ] **URLs en español** — `/mis-contratos`, `/nosotros`, `/arriendo`, etc. (hoy `myContracts`, `aboutUs`), con redirects 301 desde las rutas actuales.
- [ ] **Ocultar `test-colors`** en producción (portal y backoffice).

## 2. Calidad técnica — plan paso a paso

Orden de ejecución: Fase 1 → 2 → 3 → 4 → 5 (tests de frontend al final).

### Fase 1: Seguridad (urgente, ~1 día)
- [x] Listar los secretos que tenía `.env.dev` (se dejó de trackear en `2129b04`, pero sigue en el historial). Revisado: solo `portal/.env.dev` y `backoffice/.env.dev`; el único secreto es `NEXTAUTH_SECRET` (el resto son URLs). Sin otros secretos en el historial.
- [ ] **Rotar `NEXTAUTH_SECRET`** de portal y backoffice en el servidor y `pm2 reload` (manual; invalida sesiones activas).
- [x] Confirmar que `.gitignore` cubre todos los `.env*` salvo `*.example`.
- [ ] (Opcional, solo después de rotar) limpiar historial con `git filter-repo`.

### Fase 2: Limpieza rápida (~1 hora)
- [x] Borrar `.github/java-upgrade/`. `copilot-instructions.md` se conservó y se actualizó (puertos, legacy).
- [ ] Commitear `doc/manual-de-usuario/` y este roadmap.
- [x] Añadir `lint` de portal y backoffice a CI (0 errores).
- [ ] Añadir `build` a CI (requiere envs de build en el runner).

### Fase 3: Errores de TypeScript del backoffice (~2–4 días)
126 errores en 42 archivos; 105 son TS2322, concentrados en los diálogos de `src/features/` (AgentDialog, AdminUserDialog, Create/EditContractDialog, SliderDialog…).
- [x] Agrupar los TS2322 por mensaje para encontrar los tipos raíz (props de diálogos / tipos de `api-client`).
- [x] Corregir primero esos tipos compartidos (`error` en TextField/Select, `description` en Dialog, opciones de UpdateBaseForm).
- [x] Corregir sueltos. Además se eliminó código muerto de `src/features` que ninguna ruta importaba.
- [x] 126 → 0 errores.
- [x] Con 0 errores: quitar `ignoreBuildErrors` de `backoffice/next.config.ts` y hacer que `typecheck:backoffice` bloquee la CI. Ver `doc/tsc-debt.md`.

### Fase 4: Reducir `any` (gradual)
Medido con ESLint: portal 190, backoffice 327; core ~580 líneas.
- [x] Activar `@typescript-eslint/no-explicit-any` (portal: **error**, backoffice: **warn**).
- [x] Portal: 190 → 0 (tipado + eliminación de server actions/archivos que el portal no usaba).
- [ ] Backoffice: 327 → 291 (pendiente).
- [ ] Core (~580 líneas con `any`, más ~2.900 `no-unsafe-*` y ~2.900 de prettier en lint): por módulo, empezando por `auth`, `contracts`, `property`; usar DTOs o `unknown` con validación.
- [ ] Al llegar a 0 en un paquete, pasar la regla a **error** ahí.

### Fase 5: Tests de frontend (al final)
Hoy: portal 2 archivos de test (smoke con Node, sin Jest), backoffice 13; la CI solo corre tests del core.
- [ ] Instalar Jest + Testing Library en portal y backoffice (el script `test` del backoffice llama a `jest`, pero no está instalado).
- [ ] Portal: filtros/listado, ficha, login/registro, mis contratos/pagos, publicar propiedad.
- [ ] Backoffice: crear/editar contrato, diálogos de usuarios, crear/editar propiedad.
- [ ] Sumar `test` de portal y backoffice a la CI.
- [ ] Regla: cada bug corregido trae su test.

## 3. Pendiente de validar

- [x] **Auditoría completa de UI y Mobile**: Ver detalle y checklist priorizado en [`doc/LISTADO_CORRECCIONES_UI_MOBILE.md`](./LISTADO_CORRECCIONES_UI_MOBILE.md).
- [ ] Revisión de UX real en navegador (sobre todo móvil): velocidad, filtros, flujo de publicación y área de cliente.
