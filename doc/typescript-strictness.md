# Plan de strictness TypeScript (core)

Fecha: 2026-10-22 (America/Santiago)

## Estado actual

- `core/tsconfig.json` tiene `noImplicitAny: false` (y otros flags strict parciales: `strictNullChecks: true`).
- Usos de `any` aproximados (grep `as any` / `: any` / `<any>`):
  - Solo `core/src` (excl. `*.spec.ts`): **~486**
  - `core/src` + `core/test`: **~646**
- Referencia previa de la fase: ~589 `any`s — el orden de magnitud se mantiene; **no** se eliminan en esta fase.

## Decisión fase 5

**No** se activó `noImplicitAny` en core: el volumen supera el umbral manejable (~50 errores).

**No** se añadió eslint `no-explicit-any` como `error`. Opciones diferidas:

1. Activar `@typescript-eslint/no-explicit-any` en **warn** en `core/eslint.config.mjs` cuando el equipo quiera visibilidad sin romper CI.
2. Luego ir bajando por módulo (auth → property → contracts → mail).
3. Cuando el conteo de errores al activar `noImplicitAny` sea &lt; ~50: flip del flag + PR dedicado.

## Checklist futuro

- [ ] Medir `npx tsc --noEmit` con `noImplicitAny: true` en rama throwaway.
- [ ] Si &lt; 50: activar flag y corregir.
- [ ] Si ≥ 50: eslint warn + burndown por módulo.
- [ ] No usar `@ts-ignore` masivo.
