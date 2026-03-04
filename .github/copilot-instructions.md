# Copilot Instructions

Este repositorio es un **MONOREPO** con sólo dos subproyectos independientes:

- **/backend** - API REST construida con NestJS (Node.js/TypeScript)
- **/frontend** - Cliente web construido con Next.js (React/TypeScript)

Cada aplicación tiene reglas de arquitectura propias. **Copilot debe aplicar las reglas únicamente al proyecto correspondiente y no tocar archivos fuera de él.**

---

## Backend NestJS (`/backend`)

### Alcance

Estas reglas se aplican **SOLO** al código del backend:

- ✅ **Se aplica a:** `/backend/src/modules/` (lógica de negocio)
- ❌ **No se aplica a:** `/backend/test`, `/backend/config`, `/backend/scripts`, `/backend/prisma`, `/backend/migrations`, `/backend/dist`, ni a directorios de otros subproyectos.

### Arquitectura: Domain‑Driven Design basada en features

1. **Organización:** por dominio de negocio (feature), **no por tipo técnico**.
2. **Módulos de negocio:** siempre bajo `/backend/src/modules/`.

#### Estructura obligatoria de cada módulo de feature

```
modules/<feature>/
  domain/
    *.entity.ts          (modelos de dominio y reglas de negocio)
  application/
    *.service.ts         (casos de uso y orquestación)
    dto/
      *.dto.ts           (objetos de transferencia con validación)
  infrastructure/
    *.repository.ts      (persistencia e implementaciones)
  presentation/
    *.controller.ts      (endpoints HTTP)
  <feature>.module.ts
```

#### Código compartido

Todo lo compartido vive en `/backend/src/shared/`:

```
shared/
  domain/         (interfaces, clases base)
  enums/          (enum globales)
  guards/         (guards de auth)
  decorators/     (decoradores personalizados)
  utils/          (funciones auxiliares)
  interceptors/   (interceptores de request/response)
  pipes/          (pipes de validación)
  exceptions/     (excepciones custom)
```

#### Responsabilidades por capa

**Capa de dominio:**
- Contiene entidades y reglas puros.
- No tiene efectos secundarios.
- No puede depender de controllers, services, repositorios o frameworks.

**Capa de aplicación:**
- Servicios que implementan casos de uso.
- Sólo puede depender de dominio.
- No puede depender de presentación ni infraestructura.

**Capa de infraestructura:**
- Acceso a base de datos, APIs externas, etc.
- Sólo puede depender de dominio.

**Capa de presentación:**
- Controladores HTTP.
- No contienen lógica de negocio.
- Sólo pueden depender de aplicación.

#### Flujo de dependencias

```
Presentación → Aplicación → Dominio
Infraestructura → Dominio
```

**Nunca:**
- Dominio → Infraestructura
- Dominio → Presentación
- Aplicación → Presentación

#### Reglas adicionales de NestJS

- Los DTOs deben usar `class‑validator`.
- Los controllers no contienen lógica de negocio.
- Los repositorios se definen como interfaces en dominio.
- No crear carpetas globales como `/services`, `/controllers`, `/entities`, `/dto`.
- Usar alias de ruta (`@modules/*`, `@shared/*`).

> **Nota de operación:** al reorganizar o renombrar archivos en el backend utiliza `git mv` en lugar de `mv` para mantener el historial y que Git detecte el cambio como un rename. Ejemplo:
> ```bash
> git mv backend/src/modules/foo/foo.service.ts \
>        backend/src/modules/foo/application/foo.service.ts
> ```
> De este modo `git blame` sigue funcionando y el diff mostrará un `rename`.


---

## Frontend Next.js (`/frontend`)

### Alcance

Estas reglas se aplican **SOLO** al código del cliente web:

- ✅ **Se aplica a:** `/frontend/app`, `/frontend/components`, `/frontend/lib`, `/frontend/types`, `/frontend/e2e`, `/frontend/tests`
- ❌ **No se aplica a:** `/backend` u otros directorios. Copilot está **prohibido** de crear, modificar o mover archivos fuera de `/frontend`.

### Visión arquitectónica

Este proyecto sigue:

- **Feature-First Architecture** - organización por dominio de negocio
- **Clean Architecture** (adaptación frontend)
- **Domain-Oriented Organization** - separación por contextos de negocio
- **Server-First Design** - Next.js App Router con Server Actions
- **Explicit Data Flow Boundaries** - flujo unidireccional de datos
- **Testable UI** - separación de lógica para facilitar testing

### Principio crítico

El directorio `/frontend/app` **es SÓLO la capa de ruteo de Next.js**.

**Nunca debe contener:**

- Lógica de negocio
- Llamadas HTTP directas
- Server Actions compartidas
- Estado global
- Hooks reutilizables
- Validaciones de dominio
- Services

**Toda la lógica de negocio reside en módulos de features.**

### Separación de contextos (CRÍTICO)

Este proyecto tiene dos **bounded contexts** principales:

1. **BackOffice** - Sistema administrativo
2. **Portal** - Sitio público

**Reglas de aislamiento:**

- BackOffice **NUNCA** importa features de Portal
- Portal **NUNCA** importa features de BackOffice
- Código compartido debe vivir en `/shared`
- Cada contexto tiene su propia estructura de features

Esta separación permite:

- Escalabilidad independiente
- Despliegues separados (futuro)
- Code splitting por contexto
- Teams independientes
- Migración a microfrontends

### Estructura objetivo (Enterprise)

**Estado actual problemático:**

El proyecto actualmente tiene lógica dispersa en:

```
app/actions/          ❌ 33 archivos globales de Server Actions
app/hooks/            ❌ Hooks compartidos globalmente
app/types/            ❌ Tipos no agrupados por feature
app/contexts/         ❌ Contextos globales sin feature clara
```

**Esto NO es escalable.**

**Estructura objetivo:**

```
frontend/
├── app/                      (routing ONLY)
│   ├── backOffice/           (rutas admin)
│   │   ├── properties/
│   │   │   └── page.tsx      (sólo importa componente de feature)
│   │   └── contracts/
│   │       └── page.tsx
│   └── portal/               (rutas públicas)
│       ├── properties/
│       │   └── page.tsx
│       └── blog/
│           └── page.tsx
│
├── features/                 (business logic)
│   ├── backoffice/
│   │   ├── properties/
│   │   │   ├── actions/      (Server Actions específicas)
│   │   │   ├── hooks/        (React Query hooks)
│   │   │   ├── services/     (HTTP layer)
│   │   │   ├── store/        (estado de la feature)
│   │   │   ├── components/   (UI de la feature)
│   │   │   ├── types/        (tipos del dominio)
│   │   │   ├── validation/   (schemas Zod)
│   │   │   └── index.ts      (exports públicos)
│   │   ├── contracts/
│   │   ├── users/
│   │   ├── cms/
│   │   └── notifications/
│   │
│   └── portal/
│       ├── properties/
│       ├── blog/
│       ├── myContracts/
│       ├── myProperties/
│       └── services/
│
├── shared/                   (código compartido)
│   ├── components/
│   │   └── ui/               (componentes reutilizables - SOURCE OF TRUTH)
│   ├── hooks/                (hooks genéricos)
│   ├── utils/                (utilidades)
│   ├── types/                (tipos compartidos)
│   └── validation/           (validadores comunes)
│
├── providers/                (global providers)
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
│
├── lib/                      (configuración base)
│   ├── api/
│   │   └── client.ts         (cliente HTTP centralizado)
│   ├── auth.ts               (abstracción NextAuth)
│   └── env.ts                (variables de entorno)
│
├── config/                   (configuración)
├── tests/                    (unit & integration tests)
└── e2e/                      (Playwright E2E tests)
```

### Reglas en `/app` (Router Layer)

**Permitido:**

- `page.tsx` - sólo renderiza componente de feature
- `layout.tsx` - estructura y providers
- `loading.tsx` - estados de carga
- `error.tsx` - manejo de errores
- `route.ts` - API routes
- Componentes UI específicos de una página que no se reutilizan

**Prohibido:**

- Validación de negocio
- Llamadas fetch directas
- Hooks compartidos
- Estado global
- Imports cruzados entre features
- Lógica compleja (> 50 líneas)

**PATRÓN OBLIGATORIO: Server Component + Suspense + Loading State**

**TODAS las pages en `/app` deben seguir este patrón:**

1. **Async Server Component** que pre-carga datos
2. **loading.tsx** con skeleton UI (Suspense fallback)
3. **Client Component** que recibe `initialData` como props

**Estructura obligatoria:**

```
app/backOffice/feature/
├── page.tsx         (Async Server Component)
├── loading.tsx      (Suspense fallback con skeleton)
└── ui/
    └── FeatureList.tsx  (Client Component)
```

**Ejemplo completo (SIGUELO EXACTAMENTE):**

```tsx
// ✅ app/backOffice/cms/slider/page.tsx (Server Component)
import { SliderContent } from '@/features/backoffice/cms/components';
import { getSlides } from '@/features/backoffice/cms/actions/slides.action';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SliderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const result = await getSlides({ search });
  const initialSlides = result.success && result.data ? result.data : [];

  return <SliderContent initialSlides={initialSlides} initialSearch={search} />;
}
```

```tsx
// ✅ app/backOffice/cms/slider/loading.tsx (Suspense fallback)
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      {/* Skeleton UI matching real content structure */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-neutral animate-pulse rounded" />
          <div className="h-5 w-96 bg-neutral animate-pulse rounded" />
        </div>
        <div className="h-12 w-12 bg-neutral animate-pulse rounded-full" />
      </div>

      <div className="h-14 w-80 bg-neutral animate-pulse rounded-lg" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="aspect-video bg-neutral animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-neutral animate-pulse rounded" />
              <div className="h-4 bg-neutral animate-pulse rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-8">
        <DotProgress />
      </div>
    </div>
  );
}
```

```tsx
// ✅ features/backoffice/cms/components/SliderContent.tsx (Client Component)
'use client';

import { useState } from 'react';

interface SliderContentProps {
  initialSlides: Slide[];
  initialSearch?: string;
}

export function SliderContent({ initialSlides, initialSearch = '' }: SliderContentProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false); // Para búsquedas subsecuentes

  const refreshSlides = async () => {
    setIsLoading(true); // ✅ Previene flash de "no results"
    try {
      const result = await getSlides({ search: search || undefined });
      if (result.success) {
        setSlides(result.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Search input */}
      <TextField value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Loading state para búsquedas */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral animate-pulse rounded" />
          ))}
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>No se encontraron resultados</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSlides.map((slide) => (
            <SlideCard key={slide.id} slide={slide} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Beneficios de este patrón:**

- ✅ **No más flash de "sin resultados"** en mount inicial
- ✅ **SSR con datos pre-cargados** (mejor Core Web Vitals)
- ✅ **Suspense nativo de Next.js** con loading.tsx
- ✅ **Loading states claros** para búsquedas subsecuentes
- ✅ **Mejor UX** con skeletons apropiados
- ✅ **Streaming SSR** habilitado automáticamente

**Reglas críticas:**

1. **SIEMPRE** usa `async` en funciones de page.tsx
2. **SIEMPRE** pre-carga datos en Server Component
3. **SIEMPRE** crea loading.tsx con skeleton UI
4. **SIEMPRE** agrega estado `isLoading` en Client Component para operaciones subsecuentes
5. **NUNCA** uses `useEffect(() => { fetchData() }, [])` en mount inicial
6. **NUNCA** muestres "no results" sin verificar `!isLoading`

**Excepciones permitidas:**

Solo pueden ser Client Components sin este patrón:
- Pages con formularios complejos (muchos estados interdependientes)
- Pages con RealTime updates (WebSockets, SSE)
- Pages con drag & drop complejo en toda la página
- Ejemplos: identity/page.tsx, aboutUs/page.tsx

**Anti-patterns (PROHIBIDO):**

```tsx
// ❌ PROHIBIDO: useEffect fetch en mount
'use client';
export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData(); // ❌ NUNCA
  }, []);

  return <div>{data.map(...)}</div>;
}

// ❌ PROHIBIDO: Sin loading state
export function List({ initialData }: Props) {
  const [data, setData] = useState(initialData);

  const search = async () => {
    const result = await getData(); // ❌ Causa flash de "no results"
    setData(result);
  };
}

// ❌ PROHIBIDO: Fetch directo en Server Component sin async
export default function Page() {
  const data = fetch('...'); // ❌ Debe ser async
  return <div>{data}</div>;
}
```

**CRITICAL: Migración de código existente**

Si encuentras este patrón antiguo:

```tsx
// ❌ ANTIGUO
'use client';
export default function Page() {
  useEffect(() => { loadData() }, []);
  return <List />;
}
```

**DEBES refactorizarlo a:**

```tsx
// ✅ NUEVO
export default async function Page({ searchParams }: PageProps) {
  const result = await getData(searchParams);
  return <List initialData={result.data} initialSearch={searchParams.search} />;
}
```



### Estructura de features (MANDATORIO)

Cada feature debe seguir esta estructura:

```
features/{context}/{feature}/
├── actions/                  (Server Actions)
│   ├── createProperty.action.ts
│   ├── updateProperty.action.ts
│   └── deleteProperty.action.ts
│
├── hooks/                    (React hooks)
│   ├── useProperties.ts      (fetch con React Query)
│   ├── useCreateProperty.ts  (mutación)
│   └── usePropertyFilters.ts (estado UI)
│
├── services/                 (HTTP layer)
│   ├── properties.service.ts (llamadas API)
│   └── properties.types.ts   (tipos de API)
│
├── store/                    (estado de la feature)
│   └── propertyStore.ts      (Zustand store)
│
├── components/               (UI components)
│   ├── PropertyList.tsx
│   ├── PropertyForm.tsx
│   └── PropertyCard.tsx
│
├── types/                    (domain types)
│   └── property.types.ts
│
├── validation/               (schemas)
│   └── property.schema.ts    (Zod schemas)
│
├── utils/                    (helpers)
│   └── propertyHelpers.ts
│
└── index.ts                  (public API)
```

### Server Actions - Reglas estrictas

**Ubicación:**

- Deben vivir en `features/{context}/{feature}/actions/`
- Nombre: `{accion}.action.ts` (ej: `createProperty.action.ts`)
- Cada action en su propio archivo

**Responsabilidades:**

- Manejar mutaciones (POST, PUT, DELETE)
- Revalidar datos (revalidatePath, revalidateTag)
- Llamar a services
- Retornar resultados seguros (sin exponer errores internos)

**Prohibido:**

- Lógica UI
- Vivir en `/app/actions`
- Ser compartidas globalmente entre features (crear copia si es necesario)
- Contener queries complejas (usar services)

**Ejemplo:**

```ts
// ✅ features/backoffice/properties/actions/createProperty.action.ts
"use server";

import { revalidatePath } from "next/cache";
import { createPropertyService } from "../services/properties.service";
import { PropertySchema } from "../validation/property.schema";

export async function createPropertyAction(formData: FormData) {
  const validated = PropertySchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten() };
  }

  try {
    const property = await createPropertyService(validated.data);
    revalidatePath("/backOffice/properties");
    return { success: true, data: property };
  } catch (error) {
    return { success: false, error: "Failed to create property" };
  }
}
```

### Services - Capa HTTP

**Responsabilidades:**

- Comunicación HTTP exclusivamente
- Usar `apiClient` centralizado de `/lib/api/client`
- Retornar datos crudos (sin transformaciones UI)
- No manejar estado de React

**Dónde se pueden usar:**

- ✅ Desde hooks
- ✅ Desde actions
- ❌ NUNCA desde componentes

**Ejemplo:**

```ts
// ✅ features/backoffice/properties/services/properties.service.ts
import { apiClient } from "@/lib/api/client";
import type { Property, CreatePropertyDto } from "../types/property.types";

export async function createPropertyService(data: CreatePropertyDto): Promise<Property> {
  const response = await apiClient.post<Property>("/properties", data);
  return response.data;
}

export async function getPropertiesService(): Promise<Property[]> {
  const response = await apiClient.get<Property[]>("/properties");
  return response.data;
}
```

### Hooks - Capa de React

**Responsabilidades:**

- Llamar services para fetching
- Llamar actions para mutaciones
- Usar React Query para gestión de datos
- Retornar estado simplificado para UI
- Manejar loading y error states

**Prohibido:**

- Fetch directo (sin React Query)
- Lógica de negocio compleja
- Vivir en `/app/hooks`
- Importarse desde otros hooks de diferentes features

**Ejemplo:**

```tsx
// ✅ features/backoffice/properties/hooks/useProperties.ts
import { useQuery } from "@tanstack/react-query";
import { getPropertiesService } from "../services/properties.service";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: getPropertiesService,
  });
}
```

```tsx
// ✅ features/backoffice/properties/hooks/useCreateProperty.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPropertyAction } from "../actions/createProperty.action";

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPropertyAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
```

### Store - Estado de features

**Reglas:**

- Estado específico de la feature → `features/{feature}/store/`
- Estado global → `/providers`
- Usar Zustand o Context API
- Un store por feature (no múltiples stores mezclados)

**Prohibido:**

- Store global para todo
- Estado en componentes de página
- Coupling entre stores de diferentes features

**Ejemplo:**

```ts
// ✅ features/backoffice/properties/store/propertyStore.ts
import { create } from "zustand";

interface PropertyFilters {
  type: string;
  minPrice: number;
  maxPrice: number;
}

interface PropertyStore {
  filters: PropertyFilters;
  setFilters: (filters: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  filters: { type: "all", minPrice: 0, maxPrice: 1000000 },
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () =>
    set({ filters: { type: "all", minPrice: 0, maxPrice: 1000000 } }),
}));
```

### Components - Capa de UI

**Componentes reutilizables (compartidos):**

Ubicación canónica: **`/shared/components/ui/`** (SOURCE OF TRUTH)

```
shared/components/ui/
├── Button/
├── Card/
├── Dialog/
├── TextField/
├── DataGrid/
├── Alert/
├── Badge/
├── DotProgress/
└── ... otros componentes reutilizables
```

**Regla crítica:** Todos los componentes genéricos viven SOLO en `/shared/components/ui/`. Los componentes específicos de dominio viven en `features/{context}/{feature}/components/`.

**Componentes de feature:**

Viven en `features/{feature}/components/`

**Reglas:**

- Son UI pura
- Usan hooks (no services directamente)
- No hacen fetch
- No importan services
- Props bien tipados

**Ejemplo:**

```tsx
// ✅ features/backoffice/properties/components/PropertyList.tsx
import { useProperties } from "../hooks/useProperties";

export function PropertyList() {
  const { data: properties, isLoading, error } = useProperties();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading properties</div>;

  return (
    <div>
      {properties?.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

### Authentication - NextAuth

**Rutas de API:**

Pueden vivir en `app/api/auth/[...nextauth]/`

**Abstracción requerida:**

La lógica de autenticación debe abstraerse en `/lib/auth.ts`

**Prohibido:**

- Importar NextAuth directamente desde features
- Lógica de auth dispersa en múltiples archivos

**Ejemplo:**

```ts
// ✅ lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
```

### Flujo de datos - Enforcement

**Flujo correcto:**

```
Page → Feature Component → Hook → Service → API
Page → Feature Component → Hook → Action → Service → API
```

**Prohibido:**

```
Component → fetch          ❌
Component → service        ❌
Page → fetch               ❌
Page → business logic      ❌
Action → Component         ❌
```

### Validación - Zod schemas

**Ubicación:**

- Validaciones de feature: `features/{feature}/validation/`
- Validaciones compartidas: `shared/validation/`

**Uso:**

- En Server Actions (validar FormData)
- En formularios (React Hook Form + Zod)
- En services (validar respuestas API)

**Ejemplo:**

```ts
// ✅ features/backoffice/properties/validation/property.schema.ts
import { z } from "zod";

export const PropertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  type: z.enum(["sale", "rent"]),
  address: z.string().min(5),
});

export type PropertyInput = z.infer<typeof PropertySchema>;
```

### Testing strategy

**Unit Tests** (`/tests/unit`):

- Hooks
- Utils
- Validation schemas
- Stores

**Integration Tests** (`/tests/integration`):

- Services
- Actions
- Feature flows

**E2E Tests** (`/e2e` con Playwright):

- Flujos completos user-facing:
  - Login
  - Crear propiedad
  - Crear contrato
  - Sistema de notificaciones
  - Filtrado de propiedades

**Ejemplo E2E:**

```ts
// e2e/backoffice.properties.spec.ts
import { test, expect } from "@playwright/test";

test("create property flow", async ({ page }) => {
  await page.goto("/backOffice/properties");
  await page.click('button:has-text("Create Property")');
  await page.fill('input[name="title"]', "Test Property");
  await page.fill('input[name="price"]', "100000");
  await page.click('button:has-text("Submit")');
  await expect(page.locator("text=Property created")).toBeVisible();
});
```

### Path aliases

Configurar en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/features/*": ["./features/*"],
      "@/shared/*": ["./shared/*"],
      "@/lib/*": ["./lib/*"],
      "@/config/*": ["./config/*"]
    }
  }
}
```

### Anti-patterns (ESTRICTAMENTE PROHIBIDO)

❌ Carpeta `app/actions` con 30+ archivos globales
❌ Carpeta `app/hooks` global
❌ Carpeta `app/types` sin organización por feature
❌ Lógica de negocio en `layout.tsx`
❌ Estado mutable compartido entre contextos
❌ Uso directo de `axios` en componentes
❌ BackOffice importando features de Portal
❌ Archivos `page.tsx` de 500+ líneas
❌ Services importados directamente en componentes
❌ Fetch sin React Query
❌ Validación de negocio en componentes
❌ Server Actions sin validación

### Definition of Done - Features

Una feature está completa sólo si:

- ✅ Tiene carpeta aislada en `features/{context}/{feature}`
- ✅ Tiene services implementados
- ✅ Tiene hooks implementados con React Query
- ✅ Tiene validation schema (Zod)
- ✅ Tiene types definidos
- ✅ Tiene exports limpios en `index.ts`
- ✅ NO tiene lógica en `/app`
- ✅ Tiene unit tests
- ✅ Tiene escenario E2E (si es flujo principal)
- ✅ Respeta separación de contextos (BackOffice/Portal)

### Migración gradual

Para migrar el código existente:

1. **Fase 1:** Crear estructura de features
2. **Fase 2:** Mover actions de `app/actions` a features específicas
3. **Fase 3:** Mover hooks de `app/hooks` a features
4. **Fase 4:** Mover types de `app/types` a features
5. **Fase 5:** Refactorizar componentes para usar feature hooks
6. **Fase 6:** Agregar tests
7. **Fase 7:** Documentar APIs públicas de cada feature

**No migrar todo de golpe. Hacerlo por feature.**

### Path de escalabilidad futura

Con esta arquitectura, el proyecto está preparado para:

- ✅ Microfrontends (feature → app separada)
- ✅ Carga de features por rol
- ✅ Code splitting por contexto
- ✅ CQRS-style client separation
- ✅ Edge deployment
- ✅ Multi-tenant portals
- ✅ Teams independientes por contexto
- ✅ Deploy independiente BackOffice/Portal

### Enforcement del Copilot

**Si Copilot genera:**

- Lógica de negocio dentro de `/app`
- Fetch en componentes
- Hooks globales en `/app/hooks`
- Imports cruzados entre contextos
- Services usados directamente en UI
- Actions sin validación
- Componentes de 500+ líneas

**→ Debe ser refactorizado INMEDIATAMENTE siguiendo estas reglas.**

> **Nota de operación:** Al reorganizar archivos del frontend, utiliza `git mv` para preservar el historial:
> ```bash
> git mv frontend/app/actions/properties.ts \
>        frontend/features/backoffice/properties/actions/createProperty.action.ts
> ```

### Normas de UI/UX y Sistema de Diseño

**OBLIGATORIO:** Antes de crear o modificar cualquier componente visual, consultar:

**📋 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**

Este documento es la **fuente de verdad** para todas las decisiones de UI/UX y define:

**Sistema Base:**
- Sistema de colores y tokens de diseño (primary, secondary, accent, estados)
- Tipografía y jerarquía de textos (h1-h3, body, labels)
- Espaciado y layout (padding, gaps, grids responsivos)
- Iconografía (Material Symbols)

**Patrones de Componentes:**
- **Cards:** Anatomía base, padding (p-2), cards con/sin imagen, badges, footers
  - **ImageCard:** Patrón especializado para multimedia (16:9 aspect ratio, metadata, controles flotantes, drag & drop)
- **Diálogos:** Header, body, footer, tamaños, validación, limpieza de estado
- **Layouts:**
  - **Card Listing Content (CLC Pattern):** patrón oficial para listados de cards (header + búsqueda + estados + grid)
  - List patterns (búsqueda + grid), DataGrid, responsive breakpoints
- **Formularios:** TextField, Select, FileUploader, validación

**Componentes del Design System:**
- Estados y feedback visual
- Badges y pills (variants: primary-outlined, secondary-outlined)
- Botones y acciones (variants: primary, outlined, text, basicSecondary)
- Responsive design y breakpoints

**Principio fundamental:** Usar SIEMPRE componentes del Design System ubicados en `/shared/components/ui/` (source of truth). Está PROHIBIDO usar elementos HTML nativos (`<button>`, `<input>`, `<div>` con estilos inline) en componentes de features.

**Cuándo consultar DESIGN_SYSTEM.md:**
- ✅ Antes de crear un nuevo componente de UI
- ✅ Al decidir padding, espaciado o colores
- ✅ Al diseñar cards, diálogos o layouts
- ✅ Al usar iconos (Material Symbols)
- ✅ Al definir estados visuales (éxito, error, warning)
- ✅ Al implementar formularios
- ✅ Al trabajar con multimedia (ImageCard pattern)

### Patrón obligatorio para listados de cards (CLC Pattern)

**Nombre oficial:** `Card Listing Content (CLC Pattern)`

Este patrón define el layout estándar para cualquier pantalla que liste cards (BackOffice o Portal). Está basado en el layout de `SliderContent` y debe reutilizarse como referencia principal.

**Estructura obligatoria (orden):**
1. Contenedor principal: `space-y-6 w-full`
2. Header: título/subtítulo + acción primaria (`IconButton`)
3. Bloque de búsqueda con ancho acotado: `flex-1 min-w-0 max-w-xs sm:max-w-sm`
4. Estados del contenido en este orden: loading → empty → data
5. Grid responsivo de cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full`

**Reglas críticas:**
- El estado vacío nunca debe renderizar durante loading.
- El skeleton de loading debe respetar la misma estructura visual del grid final.
- El grid debe mantener `gap-6` y breakpoints `1/2/3` (mobile/tablet/desktop).
- Si hay drag & drop, el wrapper (`DndContext`/`SortableContext`) no cambia clases del grid.
- Los diálogos de crear/editar/eliminar se componen fuera del bloque de grid, no dentro de cada card.

**Path alias recomendado en imports:**
```tsx
// ✅ CORRECTO
import { Button } from '@/shared/components/ui/Button/Button';
import Dialog from '@/shared/components/ui/Dialog/Dialog';

// ❌ INCORRECTO
import { Button } from '@/components/Button/Button';
```


