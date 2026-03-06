# Copilot Instructions

Este repositorio es un **MONOREPO** con dos subproyectos independientes:

- **/backend** → API REST NestJS (TypeScript)
- **/frontend** → Cliente Next.js (React + TypeScript)

**Regla número 1:** siempre aplica cambios dentro del subproyecto correcto y no toques archivos fuera de él.

---

## 🧩 Backend (NestJS) - `/backend`

### Arquitectura clave
- El núcleo de la aplicación vive en `backend/src/modules/<feature>/`.
- Cada módulo sigue el patrón **DDD por features**:
  - `presentation/` → controladores (HTTP)
  - `application/` → casos de uso / orquestación
  - `domain/` → entidades, enums, interfaces (sin efectos secundarios)
  - `infrastructure/` → repositorios, servicios externos, almacenamiento
- La dependencia debe fluir: **presentation → application → domain**, y **infrastructure → domain**.
- Usa alias: `@modules/*`, `@shared/*`.

### Flujo multimédia (ejemplo crítico)
- El módulo `multimedia` usa `media-optimization` para generar variantes (thumbnails, WebP, etc.).
- `ImageOptimizationService.processAndUpload()` devuelve metadata + variantes. Cuando agregues soporte a nuevos formatos/variantes, asegúrate de **persistir los `MultimediaVariant`** en la BD (tabla `multimedia_variants`).
- El proveedor de almacenamiento se selecciona con `STORAGE_PROVIDER` (`local`, `r2`, `s3`).

### Comandos frecuentes
- `npm install` (desde /backend)
- `npm run start:dev` → servidor en modo watcher
- `npm run build` & `npm run start:prod`
- `npm run test` (unit & integration)
- `npm run test:multimedia` (cobertura focalizada para multimedia)

---

## 🌐 Frontend (Next.js) - `/frontend`

### Principio básico
- `/frontend/app` **solo debe contener rutas** y layout. No debe incluir lógica de negocio, fetchs, hooks globales ni validaciones.
- La lógica de negocio vive en `frontend/features/{context}/{feature}`.
- Hay dos contextos aislados: `backoffice` y `portal`. **Nunca mezcles imports entre ellos**.

### Estructura estándar de feature (obligatorio)
```
features/{context}/{feature}/
  actions/      (Server Actions)
  hooks/        (React Query hooks)
  services/     (HTTP layer, usa lib/apiClient)
  validation/   (Zod schemas)
  components/   (UI específicos de la feature)
  types/        (tipos del dominio)
  utils/        (helpers específicos)
  index.ts      (exports públicos)
```

### Patrones de páginas (App Router)
- Cada `app/.../page.tsx` debe ser **Async Server Component** que carga datos y pasa `initialData` a un componente client.
- Debe haber siempre un `loading.tsx` con skeletons que reflejen el layout real.
- No usar `useEffect(...)` para fetch inicial.

### APIs y autenticación
- Usa `frontend/lib/apiClient.ts` (con `fetchWithAuthCheck`) para llamadas fetch.
- No hagas `fetch` directo en componentes; ubica los fetch en servicios y consúmelos desde hooks (React Query).

### Comandos frecuentes
- `npm install` (desde /frontend)
- `npm run dev` → Next.js en `http://localhost:3001`
- `npm run build` / `npm run start`
- `npm run test` (Jest)
- `npm run test:e2e` (Playwright)

---

## 🛠️ Convenciones generales
- Usa `git mv` cuando muevas/renombres archivos para preservar historial.
- Configuración de paths:
  - Backend: `@modules/*`, `@shared/*`
  - Frontend: `@/*`, `@/features/*`, `@/shared/*`
- Sigue el estilo de código actual (TS + ESLint/Prettier configurados en cada paquete).

---

Si hay algo en el código que no encaja con estas reglas (por ejemplo, un fetch directo en un componente o un módulo mal ubicado), documenta el caso y propón la refactorización siguiendo estos principios.
