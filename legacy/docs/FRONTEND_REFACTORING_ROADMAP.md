# 🚀 QUICK START - REFACTORIZACIÓN FRONTEND

**Tiempo estimado:** 50-60 horas  
**Riesgo:** BAJO (todos los cambios son locales, sin cambios de API)  
**Rollback:** Simple (git revert del commit)

> 📋 **IMPORTANTE:** Esta refactorización debe cumplir con normas definidas en [.github/DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md) y [.github/copilot-instructions.md](.github/copilot-instructions.md). Revisar ambos documentos ANTES de empezar.

---

## 📦 COMPONENTES BASE A MIGRAR (20 Total)

⚠️ **FUENTE DE VERDAD:** Copiar desde `/ui` (raíz del proyecto), **NO** desde `frontend/components/`

Estos componentes deben copiarse de **`/ui`** a **`frontend/shared/ui`**:

**Formularios & Inputs (9):**
- BaseForm, TextField, Select, AutoComplete, NumberStepper, Switch, RangeSlider, FileUploader ⚠️ (solo multimedia), LocationPicker

**Botones & Acciones (1):**
- Button, IconButton

**Superstructura (1):**
- Dialog

**Feedback & Progress (2):**
- Alert, DotProgress

**Navegación (2):**
- TopBar, Tabs ⭐ (nuevo)

**Dropdowns (1):**
- DropdownList

**Tablas (1):**
- DataGrid

**Utilidades (2):**
- Badge, SplashScreen ⭐ (nuevo)

**Total: 20 componentes base**

> 📝 **NOTA:** `BaseForm` incluye 4 variantes: CreateBaseForm, UpdateBaseForm, DeleteBaseForm, StepperBaseForm. Todos siguen las normas de [DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md).

> ⚠️ **CRÍTICO - FileUploader:** El componente `ui/FileUploader` solo contiene `MultimediaUploader` y `MultimediaUpdater` (para imágenes/videos). **NO** incluye componente genérico para subir documentos (PDF, DOC, XLS, etc.). Este componente debe crearse en Fase 1.

---

## 🎯 COMPONENTES ESPECÍFICOS DE DOMINIO (NO van a shared/ui/)

Estos componentes son específicos de features y deben migrar a sus respectivos contextos:

**Portal Properties (2):**
- PropertyFilterRent → `features/portal/properties/components/`
- PropertyFilterSale → `features/portal/properties/components/`

**Portal Auth (2):**
- LoginForm → `features/shared/auth/components/`
- RegisterForm → `features/shared/auth/components/`

**Portal Contact (1):**
- ContactDialog → `features/portal/contact/components/`

**CMS (1):**
- SortableSlideCard → `features/backoffice/cms/components/`

**Eliminados:**
- ~~FontAwesome~~ - No está en `/ui` y no se usará

> ⚠️ **IMPORTANTE:** Estos 6 componentes **NO** son compartidos entre contextos y violarían la arquitectura si se colocan en `shared/ui/`. Se migrarán en fases 3-4.

---

## ❓ COMPONENTES SOLO EN frontend/components/ (Auditar)

Estos componentes existen en `frontend/components/` pero **NO** en `/ui`. Requieren auditoría antes de migrar:

**UI Críticos:**
- Card - Verificar si reemplazar con versión de ui/Dialog o mantener
- DeleteButton - Puede ser variante de Button
- Stepper - Puede estar integrado en BaseForm/StepperBaseForm
- CircularProgress - Verificar si reemplazar con DotProgress
- Dropdown - Verificar diferencia con DropdownList
- Logo - Validar si es necesario en shared/ui/
- **FileUploader.tsx (genérico)** ⚠️ - Existe en frontend/components/ pero NO en ui/. Usado para subir documentos (PDFs, DNI, comprobantes de pago). **CRÍTICO: DEBE migrarse o recrearse.**

**Desarrollo:**
- Showcase - Solo para demostración (NO migrar)

> 🔍 Durante Fase 1, auditar estos componentes y decidir caso por caso.

---

## 🚨 REQUERIMIENTO CRÍTICO: FileUploader Genérico

### 📋 Problema Identificado

El folder `/ui/FileUploader` (fuente de verdad) contiene **SOLO** componentes para multimedia:

```
ui/FileUploader/
├── MultimediaUploader.tsx   (subida de imágenes/videos)
├── MultimediaUpdater.tsx    (actualizar multimedia existente)
└── types.ts                 (tipos compartidos)
```

**FALTA:** Componente genérico para subir **documentos NO multimedia** (PDF, DOC, XLS, ZIP, etc.)

### 🎯 Casos de Uso Actuales

El proyecto **REQUIERE** subir archivos no-multimedia en:

**Portal:**
- `/portal/myContracts/[id]/payments` - Comprobantes de pago (PDF, imágenes de recibos)
- `/portal/personalInfo` - Documentos de identidad (DNI, pasaporte PDF)

**BackOffice:**
- `/backOffice/contracts/persons/ui/UploadDNIDialog` - Documentos DNI/RUT
- `/backOffice/contracts/documents` - Documentos legales (contratos PDF, anexos)

**Características requeridas:**
- Aceptar cualquier tipo de archivo (`accept="*/*"` o específico)
- Validación de tamaño máximo
- Preview del nombre de archivo seleccionado
- Botón de limpiar/remover
- Manejo de errores

### ✅ Solución

**Fase 1 (step 1.3.1):** Copiar `FileUploader.tsx` genérico desde `frontend/components/FileUploader/` a `frontend/shared/ui/FileUploader/`

```bash
cp frontend/components/FileUploader/FileUploader.tsx frontend/shared/ui/FileUploader/
```

**Resultado esperado:**
```
frontend/shared/ui/FileUploader/
├── FileUploader.tsx          ✅ (genérico para documentos)
├── MultimediaUploader.tsx    ✅ (específico para multimedia)
├── MultimediaUpdater.tsx     ✅ (actualizar multimedia)
└── types.ts                  ✅ (tipos compartidos)
```

**Imports actualizados:**
```typescript
// Para documentos (PDF, DOC, etc.)
import FileUploader from '@/shared/ui/FileUploader/FileUploader';

// Para imágenes/videos
import MultimediaUploader from '@/shared/ui/FileUploader/MultimediaUploader';
```

### ⚠️ Sin Esta Solución

Si NO se implementa:
- ❌ Subida de comprobantes de pago **ROTA**
- ❌ Upload de documentos DNI **ROTO**
- ❌ Gestión documental de contratos **ROTA**
- ❌ Cualquier formulario con documentos **NO FUNCIONA**

**Prioridad:** 🔴 **CRÍTICO - BLOQUEANTE**

---

## 📋 INVENTARIO DE FEATURES BACKOFFICE (18 Páginas Documentadas)

Esta sección resume las funcionalidades actuales de cada módulo BackOffice. **Usar como referencia durante la migración para preservar funcionalidad completa.**

### 🏠 Dashboard (`/backOffice/page.tsx`)
**Propósito:** Panel administrativo central con métricas y KPIs
- KPI cards (propiedades activas, contratos, usuarios)
- Analytics y gráficos de rendimiento
- Revenue charts y tendencias
- Ranking de agentes por desempeño
- Overview del estado del negocio

**Audiencia:** Gerentes, Administradores

---

### 🏢 Properties Management (2 páginas)

#### Properties Sales (`/backOffice/properties/sales/page.tsx`)
**Propósito:** Gestión de inventario de propiedades en venta
- DataGrid con propiedades en venta
- Búsqueda por título, ubicación, características
- Ordenamiento por precio, fecha, ubicación
- Filtros avanzados (precio, tipo, estado)
- Paginación para grandes inventarios
- CRUD: crear, editar, eliminar propiedades
- Carga de imágenes y multimedia

**Audiencia:** Agentes, Gerentes de ventas

#### Properties Rent (`/backOffice/properties/rent/page.tsx`)
**Propósito:** Gestión de inventario de propiedades en arriendo
- Mismo patrón que sales (búsqueda, filtros, paginación)
- Información específica: renta mensual, depósito, disponibilidad
- Gestión de disponibilidad por fechas
- Historial de arrendatarios

**Audiencia:** Agentes, Gerentes de arriendo

---

### 📄 Contracts Management (5 páginas)

#### Contracts Sales (`/backOffice/contracts/sales/page.tsx`)
**Propósito:** Gestión del ciclo de vida de contratos de venta
- Visualización de contratos de compraventa
- Estados: borrador, en revisión, firmado, ejecutado
- Firma electrónica y tracking
- Descarga de documentos PDF
- Vincular con propiedades y personas
- Alertas de vencimientos

**Audiencia:** Agentes, Abogados, Gerentes

#### Contracts Rent (`/backOffice/contracts/rent/page.tsx`)
**Propósito:** Gestión de contratos de arriendo
- Contratos de arriendo con renovación automática
- Tracking de vencimientos y renovaciones
- Gestión de garantías y depósitos
- Historial de pagos mensuales
- Notificaciones de renovación

**Audiencia:** Agentes, Administración

#### Document Types (`/backOffice/contracts/documentTypes/page.tsx`)
**Propósito:** Gestión de tipos de documentos para contratos
- Definir estructura y campos de cada tipo
- Asignar documentos obligatorios por tipo de contrato
- Configurar orden y validación de documentos
- Templates y esquemas de validación XML/JSON
- Categorización y metadata

**Audiencia:** Administradores, Legal

#### Documents (`/backOffice/contracts/documents/page.tsx`)
**Propósito:** Repositorio centralizado de documentos digitalizados
- Almacenamiento y organización de documentos
- Búsqueda y filtrado por tipo, fecha, contrato, persona
- Descarga, visualización, validación de documentos
- Control de versiones e historial
- Linking con contratos, propiedades, personas

**Audiencia:** Administradores, Abogados, Operación

#### Persons (`/backOffice/contracts/persons/page.tsx`)
**Propósito:** Directorio de stakeholders en transacciones
- Base de datos de vendedores, compradores, inquilinos, inversionistas
- Búsqueda y filtrado por tipo, ciudad, estado, país
- Información de contacto y documentación
- Historial de transacciones por persona
- Linking con contratos y propiedades

**Audiencia:** Agentes, Gerentes de ventas

---

### 📝 CMS Management (6 páginas)

#### CMS Articles (`/backOffice/cms/articles/page.tsx`)
**Propósito:** Gestión de blog y contenido editorial
- CRUD de artículos con editor rich text
- Categorías y tags
- Programación de publicación
- SEO metadata (title, description, keywords)
- Imágenes destacadas y galería
- Estados: borrador, publicado, archivado

**Audiencia:** Marketing, Content Creators

#### CMS About Us (`/backOffice/cms/aboutUs/page.tsx`)
**Propósito:** Gestión de página "Quiénes Somos"
- Actualizar bio de la empresa
- Misión, visión, valores corporativos
- Multimedia: fotos del equipo, oficinas, proyectos
- Timeline de hitos de la empresa
- Certificaciones y premios

**Audiencia:** Marketing, Dirección

#### CMS Slider (`/backOffice/cms/slider/page.tsx`)
**Propósito:** Gestión de banner principal del sitio
- Slides del homepage con imágenes hero
- Drag-and-drop para reordenar slides
- Configurar título, subtítulo, CTA por slide
- Programar activación/desactivación
- Preview en tiempo real

**Audiencia:** Marketing, Administradores

#### CMS Testimonials (`/backOffice/cms/testimonials/page.tsx`)
**Propósito:** Gestión de testimonios de clientes
- CRUD de testimonios con foto y texto
- Calificación por estrellas
- Vincular con propiedades/agentes
- Publicar/despublicar testimonios
- Moderar y validar contenido

**Audiencia:** Marketing, Servicio al cliente

#### CMS Our Team (`/backOffice/cms/ourTeam/page.tsx`)
**Propósito:** Gestión de perfiles públicos del equipo
- Crear/editar perfiles de miembros del equipo
- Fotos profesionales y bios
- Cargo, especialización, redes sociales
- Visualización en página pública "Nuestro Equipo"
- Ordenamiento y categorización por departamento

**Audiencia:** Marketing, HR

#### CMS Identity (`/backOffice/cms/identity/page.tsx`)
**Propósito:** Gestión de identidad corporativa
- Logos (principal, variantes, favicon)
- Colores corporativos y branding
- Redes sociales (links y configuración)
- Información de contacto corporativo
- Footer y header global

**Audiencia:** Marketing, Administradores

---

### 👥 Users Management (3 páginas)

#### Users Agents (`/backOffice/users/agents/page.tsx`)
**Propósito:** Gestión de agentes inmobiliarios
- Lista de agentes del equipo
- Información: nombre, email, teléfono, especialización
- Gestión de comisiones y estructura de pagos
- Tracking de desempeño (ventas, comisiones)
- Asignación de propiedades y zonas
- Estados: activo, inactivo, suspendido

**Audiencia:** Gerentes, HR

#### Users Administrators (`/backOffice/users/administrators/page.tsx`)
**Propósito:** Gestión de usuarios administrativos
- Crear/editar usuarios con acceso al backoffice
- Roles y permisos (super admin, admin, editor, viewer)
- Control de acceso por módulo
- Bitácora de actividad
- Gestión de sesiones y seguridad

**Audiencia:** Super Admin

#### Users Community (`/backOffice/users/community/page.tsx`)
**Propósito:** Base de datos de clientes/comunidad
- Lista de clientes registrados en el portal
- Perfiles: corredor, inquilino, inversionista, comprador
- Búsqueda y filtrado por tipo y estado
- Historial de compras, arriendos, favoritos
- Acciones: contactar, actualizar datos, reportar
- Segmentación para marketing

**Audiencia:** Agentes, Gerentes de ventas

---

### 🔔 Notifications (`/backOffice/notifications/page.tsx`)
**Propósito:** Centro de notificaciones administrativas
- Lista de notificaciones del sistema
- Filtrado por tipo (info, warning, error, success)
- Marcar como leído/no leído
- Acciones rápidas desde notificación
- Integración con eventos del sistema
- Configuración de preferencias de notificación

**Audiencia:** Todos los roles backOffice

---

### 🎯 Patrones Comunes Identificados

Durante la refactorización, estos patrones se repetirán en múltiples features:

1. **DataGrid Pattern** (11 páginas usan DataGrid)
   - Búsqueda, filtrado, ordenamiento, paginación
   - Columnas configurables, acciones por fila
   - Estados: loading, error, empty

2. **CRUD Pattern** (9 features tienen CRUD completo)
   - Crear, leer, actualizar, eliminar
   - Dialogs de confirmación para acciones destructivas
   - Validación con Zod

3. **State Management Pattern** (7 features con estados)
   - Estados de entidad: activo, inactivo, borrador, publicado
   - Badges visuales por estado
   - Transiciones de estado con validación

4. **Media Upload Pattern** (5 features con multimedia)
   - FileUploader component
   - Preview de imágenes
   - Validación de tipo y tamaño

5. **Filtering Pattern** (13 features con filtros)
   - URL-based filtering (searchParams)
   - PropertyFilterSale, PropertyFilterRent
   - Select, TextField, RangeSlider para filtros

6. **Pagination Pattern** (11 features paginadas)
   - Server-side pagination
   - Page, limit en URL
   - Total count display

---

## 📋 INVENTARIO DE FEATURES PORTAL (20 Páginas Documentadas)

Esta sección resume las funcionalidades actuales de cada módulo Portal (sitio público). **Usar como referencia durante la migración para preservar funcionalidad completa.**

### 🏠 Homepage (`/portal/page.tsx`)
**Propósito:** Landing page pública del sitio web inmobiliario
- Banner slider principal con destacados
- Propiedades destacadas (featured) con paginación
- Propiedades regulares con filtrado inicial
- Testimonios de clientes
- Punto de entrada para visitantes no autenticados
- Integración de componentes públicos (Slider, FeaturedPropertiesBand, TestimonialsBand)

**Audiencia:** Visitantes públicos, clientes potenciales, usuarios no autenticados

---

### 🏢 Properties Catalog (4 páginas + 1 stub)

#### Properties General (`/portal/properties/page.tsx`)
**Propósito:** Placeholder/stub sin funcionalidad
- Actualmente no implementado
- Posible redirección a /sale o /rent

**Estado:** TODO - Implementar o eliminar

#### Properties Sale (`/portal/properties/sale/page.tsx`)
**Propósito:** Catálogo público de propiedades en venta
- Búsqueda y filtrado avanzado (tipo, ubicación, precio)
- Filtros numéricos: habitaciones, baños, estacionamientos (con operadores)
- Ordenamiento: precio, fecha
- Paginación server-side
- PropertyFilterSale component
- ListProperties grid

**Audiencia:** Compradores, inversionistas, visitantes públicos

#### Properties Rent (`/portal/properties/rent/page.tsx`)
**Propósito:** Catálogo público de propiedades en arriendo
- Mismo patrón que sale pero operation='rent'
- Filtros específicos de arriendo (renta mensual)
- PropertyFilterRent component

**Audiencia:** Arrendatarios, estudiantes, profesionales

#### Property Detail (`/portal/properties/property/[id]/page.tsx`)
**Propósito:** Página de detalle de propiedad específica
- Galería de imágenes, mapa, features, descripción
- Contacto con agente responsable
- Integración con favoritos y compartir
- Error handling si no existe
- SEO metadata dinámico

**Audiencia:** Visitantes públicos, clientes potenciales

---

### ✍️ Property Publication (3 páginas)

#### Sell Property (`/portal/sell-property/page.tsx`)
**Propósito:** Formulario multi-step para publicar propiedad en VENTA
- StepperBaseForm con 4 pasos
- Operación forzada a SALE
- Validación dinámica por tipo de propiedad
- Preview antes de publicar
- Upload de imágenes con FileUploader
- LocationPicker con mapa interactivo

**Audiencia:** Usuarios registrados que quieren vender

#### Rent Property (`/portal/rent-property/page.tsx`)
**Propósito:** Formulario multi-step para publicar propiedad en ARRIENDO
- Mismo patrón que sell-property
- Operación forzada a RENT
- Precio mensual en lugar de precio total

**Audiencia:** Usuarios registrados que quieren arrendar

#### Publish Generic (`/portal/publish/page.tsx`)
**Propósito:** Formulario genérico con operación seleccionable
- Permite elegir SALE o RENT en el formulario
- Mismo wizard que específicos

**Estado:** Considerar deprecar en favor de sell/rent específicos

---

### 👤 User Dashboard (4 páginas)

#### My Properties (`/portal/myProperties/page.tsx`)
**Propósito:** Dashboard personal de propiedades del usuario
- Gestionar propiedades publicadas
- Ver estado de publicaciones (pendiente, publicada, rechazada)
- Badges visuales por estado
- Editar o eliminar propiedades propias
- Normalización de URLs de imágenes

**Audiencia:** Usuarios registrados publicadores

#### My Contracts (`/portal/myContracts/page.tsx`)
**Propósito:** Dashboard personal de contratos del usuario
- Ver contratos donde usuario es parte
- Descargar documentos
- Tracking de estado
- Formateo de fechas localizadas (es-CL)

**Audiencia:** Usuarios involucrados en transacciones

#### Personal Info (`/portal/personalInfo/page.tsx`)
**Propósito:** Perfil y datos personales del usuario
- UpdateBaseForm con campos agrupados
- Actualizar: nombre, teléfono, dirección, etc.
- Upload de avatar
- Vincular persona (DNI, documentos identidad)
- Verificación de identidad
- Estados de verificación (verified badge)

**Audiencia:** Usuarios registrados gestionando perfil

#### Notifications (`/portal/notifications/page.tsx`)
**Propósito:** Centro de notificaciones personales
- Alertas sobre propiedades, contratos, mensajes
- Marcar como leídas/no leídas
- MarkAllAsRead batch action
- Auto-refresh
- Redirect si no autenticado

**Audiencia:** Usuarios registrados

---

### 📰 Content Pages (3 páginas)

#### Blog (`/portal/blog/page.tsx`)
**Propósito:** Blog público con artículos inmobiliarios
- Educación y contenido de valor
- SEO y posicionamiento orgánico
- Filtrado por categorías
- CategoriesBlog selector
- BlogList grid

**Audiencia:** Visitantes públicos, buscadores de información

#### About Us (`/portal/aboutUs/page.tsx`)
**Propósito:** Página institucional "Quiénes Somos"
- Información corporativa: bio, misión, visión
- Multimedia hero (imagen/video)
- Fallback a mock data
- Responsive Cards

**Audiencia:** Visitantes públicos, stakeholders

#### Our Team (`/portal/ourTeam/page.tsx`)
**Propósito:** Presentar equipo de profesionales
- Perfiles públicos con fotos y bios
- Información: cargo, especialización, redes sociales
- TeamMembersDisplay grid
- Generar confianza

**Audiencia:** Visitantes públicos

---

### 🔧 Services & Tools (2 páginas)

#### Property Management Services (`/portal/services/management/page.tsx`)
**Propósito:** Landing page de servicios de gestión inmobiliaria
- Presentar oferta de administración de propiedades
- Lead generation para servicios
- Showcase de beneficios (30 años exp, gestión total)
- ContactDialog integrado
- Carga dinámica de nombre empresa

**Audiencia:** Propietarios, inversionistas

#### Valuation ML (`/portal/valuation/page.tsx`)
**Propósito:** Tasación automática con Machine Learning
- Wizard guiado: operación, tipo, ubicación, características
- Submit a predictPropertyValue (ML model)
- Resultado: precio predicho + rango confianza
- Diálogo con opción de publicar
- Lead generation

**Audiencia:** Propietarios interesados en valor de mercado

---

### 🔐 Authentication Flow (3 páginas)

#### Forgot Password (`/portal/forgot-password/page.tsx`)
**Propósito:** Recuperación de contraseña
- Solicitar enlace seguro vía email
- Input de email con validación
- Envío de token temporal

**Audiencia:** Usuarios que olvidaron contraseña

#### Reset Password (`/portal/reset-password/page.tsx`)
**Propósito:** Restablecimiento con token
- Validación de token en backend
- ResetPasswordForm
- Estados: inválido, expirado, éxito
- Redirect a login

**Audiencia:** Usuarios con enlace de recuperación

#### Verify Email (`/portal/verify-email/page.tsx`)
**Propósito:** Verificar email con token
- Auto-submit al cargar
- Activar cuenta después de registro
- Opción de reenviar email
- Redirect a dashboard

**Audiencia:** Usuarios recién registrados

---

### 🎯 Patrones Comunes Portal

1. **Stepper Form Pattern** (5 páginas)
   - Wizards multi-step: sell, rent, publish, valuation
   - StepperBaseForm component
   - Validación paso a paso
   - Preview antes de submit

2. **Authentication Guard Pattern** (7 páginas)
   - useAuth hook para verificar login
   - Redirect a /portal si no autenticado
   - Client components con estado de sesión

3. **Public Content Pattern** (6 páginas)
   - Server components sin autenticación
   - SEO-friendly metadata
   - Fallback a mock data

4. **User Dashboard Pattern** (4 páginas)
   - Personal data management
   - CRUD de recursos propios
   - Loading + error states
   - Cards con acciones

5. **Filter & Search Pattern** (3 páginas)
   - URL-based filtering (searchParams)
   - PropertyFilterSale, PropertyFilterRent
   - Server-side filtering y paginación

6. **ML Integration Pattern** (1 página)
   - Valuation con predictPropertyValue
   - Form wizard + resultado predicción
   - Lead generation post-prediction

---

## COMANDO PARA EMPEZAR HOY

```bash
# 1. Crear y cambiar a branch
cd /Users/felipe/dev/realEstatePlatform-3
git checkout -b refactor/frontend-architecture
git push origin refactor/frontend-architecture

# 2. Crear estructura base
mkdir -p frontend/features/backoffice/properties/{actions,hooks,services,store,components,types,validation,utils}
mkdir -p frontend/features/backoffice/contracts/{actions,hooks,services,store,components,types,validation,utils}
mkdir -p frontend/features/backoffice/cms/{actions,hooks,components,utils}
mkdir -p frontend/features/backoffice/multimedia/{actions,hooks,components,types,utils}
mkdir -p frontend/features/backoffice/documents/{actions,hooks,services,components,types,utils}
mkdir -p frontend/features/backoffice/users/{actions,hooks,components,utils}
mkdir -p frontend/features/backoffice/notifications/{actions,hooks,store,components,utils}

mkdir -p frontend/features/portal/properties/{actions,hooks,services,components,types,validation,utils}
mkdir -p frontend/features/portal/blog/{actions,hooks,components,types,utils}
mkdir -p frontend/features/portal/rentProperties/{actions,hooks,components,utils}
mkdir -p frontend/features/portal/saleProperties/{actions,hooks,components,utils}
mkdir -p frontend/features/portal/contact/{actions,hooks,components,utils}
mkdir -p frontend/features/portal/favorites/{actions,hooks,components,utils}

mkdir -p frontend/features/shared/auth/{actions,hooks,services,types,utils}
mkdir -p frontend/features/shared/locations/{actions,types,utils}
mkdir -p frontend/features/shared/common/{actions,types,utils}

# Crear carpetas solo para los 20 componentes base de /ui
mkdir -p frontend/shared/ui/{Alert,AutoComplete,Badge,BaseForm,Button,DataGrid,Dialog,DotProgress,DropdownList,FileUploader,IconButton,LocationPicker,NumberStepper,RangeSlider,Select,SplashScreen,Switch,Tabs,TextField,TopBar}
mkdir -p frontend/shared/hooks
mkdir -p frontend/shared/utils
mkdir -p frontend/shared/types
mkdir -p frontend/shared/validation

mkdir -p frontend/providers

# 3. Actualizar tsconfig.json
cp frontend/tsconfig.json frontend/tsconfig.json.backup
```

---

## FASES DETALLADAS

### ✅ FASE 1: PREPARACIÓN (2-3 horas)

```bash
# 1.1 Crear estructura base
# (comandos arriba)

# 1.2 Actualizar tsconfig.json con paths
# Editar: frontend/tsconfig.json
# Agregar en "compilerOptions.paths":
{
  "@/features/*": ["./features/*"],
  "@/shared/*": ["./shared/*"],
  "@/providers/*": ["./providers/*"]
}

# 1.3 Copiar componentes desde /ui (raíz) a frontend/shared/ui/
# IMPORTANTE: Usar cp -r NO git mv porque la fuente es /ui (raíz)
# Componentes: Alert, AutoComplete, Badge, BaseForm, Button, DataGrid, Dialog,
# DotProgress, DropdownList, FileUploader, IconButton, LocationPicker, NumberStepper,
# RangeSlider, Select, SplashScreen, Switch, Tabs, TextField, TopBar
cp -r ui/* frontend/shared/ui/

# Documentación también se copia para referencia
cp ui/DOCUMENTATION.md frontend/shared/ui/README.md
cp ui/COMPONENTS_ANALYSIS.md frontend/shared/ui/ANALYSIS.md

# 1.3.1 CRÍTICO: Crear FileUploader genérico para documentos
# El ui/FileUploader solo tiene MultimediaUploader/MultimediaUpdater (imágenes/videos)
# Necesitamos componente genérico para documentos (PDF, DOC, XLS, comprobantes, DNI)
# Copiar desde frontend/components/FileUploader/FileUploader.tsx
cp frontend/components/FileUploader/FileUploader.tsx frontend/shared/ui/FileUploader/

# Verificar casos de uso que requieren FileUploader genérico:
# - /portal/myContracts/[id]/payments (comprobantes de pago)
# - /backOffice/contracts/persons/ui/UploadDNIDialog (documentos DNI)
# - Cualquier formulario que suba documentos no-multimedia

# 1.4 Mover providers de app/
# Crearemos files manualmente en siguiente fase

# 1.5 COMMIT
cd /Users/felipe/dev/realEstatePlatform-3
git add -A
git commit -m "refactor: create base structure for feature-based architecture

- Copy 20 base components from /ui to frontend/shared/ui/
- Add generic FileUploader component for non-multimedia documents (PDF, DOC, etc.)
- Create features/ structure for backoffice, portal, and shared
- Update tsconfig.json with path aliases
- Ready for Phase 2: shared code migration"
```

### 🔄 FASE 2: REFACTORIZAR SHARED (3-4 horas)

**2.1 Move hooks globales → shared/hooks**

```bash
# Move and convert
git mv frontend/app/hooks/useAlert.tsx frontend/shared/hooks/useAlert.ts
git mv frontend/app/hooks/useAuthRedirect.ts frontend/shared/hooks/useAuthRedirect.ts

# Remove app/hooks (si está vacío)
rmdir frontend/app/hooks

# Actualizar imports en el proyecto
# Buscar y reemplazar: @/app/hooks → @/shared/hooks
```

**2.2 Move types globales → shared/types**

```bash
git mv frontend/app/types/article.ts frontend/shared/types/article.ts
git mv frontend/app/types/contracts.ts frontend/shared/types/contracts.ts

# Actualizar imports: @/app/types → @/shared/types
```

**2.3 Mover contexts a providers (refactorizar a Zustand luego)**

```bash
# Por ahora mantenerlos pero en providers/
git mv frontend/app/contexts/AlertContext.tsx frontend/providers/AlertContext.tsx
git mv frontend/app/contexts/CookieConsentContext.tsx frontend/providers/CookieConsentContext.tsx
git mv frontend/app/contexts/NotificationContext.tsx frontend/providers/NotificationContext.tsx

# Actualizar imports  en layout.tsx y providers.tsx
```

**2.4 COMMIT**

```bash
cd /Users/felipe/dev/realEstatePlatform-3
git add -A
git commit -m "refactor: move shared code (hooks, types, contexts) to correct locations"
```

---

### ⚙️ FASE 3: MIGRAR BACKOFFICE (15-20 horas)

**3.1 Mover properties actions**

⚠️ **REGLA:** Cada action debe tener su propio archivo y seguir nomenclatura `.action.ts` (ver [DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md))

```bash
# App actions van a feature actions
git mv frontend/app/actions/properties.ts \
       frontend/features/backoffice/properties/actions/createProperty.action.ts

# ⚠️ ENTONCES: Editar archivo para separar por operación:
# - createProperty() → archivo: createProperty.action.ts
# - updateProperty() → archivo: updateProperty.action.ts
# - deleteProperty() → archivo: deleteProperty.action.ts
# - getProperties() → services/properties.service.ts (NO es action)
```

**Patrón a seguir para CADA feature:**

```typescript
// ❌ ANTES: app/actions/properties.ts
export async function createProperty() {...}
export async function updateProperty() {...}
export async function deleteProperty() {...}
export async function getProperties() {...}

// ✅ DESPUÉS: features/backoffice/properties/

// actions/createProperty.action.ts
"use server";
import { createPropertyService } from "../services/properties.service";
export async function createPropertyAction(data: CreatePropertyDto) {...}

// actions/updateProperty.action.ts
"use server";
import { updatePropertyService } from "../services/properties.service";
export async function updatePropertyAction(id: string, data: UpdatePropertyDto) {...}

// services/properties.service.ts
import { apiClient } from "@/lib/apiClient";
export async function getPropertiesService() {
  return apiClient.get("/properties");
}
export async function createPropertyService(data: CreatePropertyDto) {
  return apiClient.post("/properties", data);
}
```

**3.2 Crear hooks para properties**

```typescript
// features/backoffice/properties/hooks/useProperties.ts
import { useQuery } from "@tanstack/react-query";
import { getPropertiesService } from "../services/properties.service";

export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: getPropertiesService,
  });
}

// features/backoffice/properties/hooks/useCreateProperty.ts
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

**3.3 Crear types**

```typescript
// features/backoffice/properties/types/property.types.ts
export type Property = {
  id: string;
  title: string;
  price: number;
  address: string;
  type: "sale" | "rent";
};

export type CreatePropertyDto = Omit<Property, "id">;
export type UpdatePropertyDto = Partial<CreatePropertyDto>;
```

**3.4 Crear validation schema**

```typescript
// features/backoffice/properties/validation/property.schema.ts
import { z } from "zod";

export const PropertySchema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().positive(),
  address: z.string().min(5),
  type: z.enum(["sale", "rent"]),
});

export type PropertyInput = z.infer<typeof PropertySchema>;
```

**3.5 Crear store**

```typescript
// features/backoffice/properties/store/propertyStore.ts
import { create } from "zustand";

interface PropertyFilters {
  type: "all" | "sale" | "rent";
  minPrice: number;
  maxPrice: number;
}

interface PropertyStore {
  filters: PropertyFilters;
  setFilters: (filters: Partial<PropertyFilters>) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  filters: { type: "all", minPrice: 0, maxPrice: 1000000 },
  setFilters: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates },
    })),
}));
```

**3.6 Mover componentes**

```bash
# Los componentes que estaban en app/backOffice/properties/ui/*
# van a features/backoffice/properties/components/*

git mv frontend/app/backOffice/properties/ui/PropertyList.tsx \
       frontend/features/backoffice/properties/components/PropertyList.tsx

git mv frontend/app/backOffice/properties/ui/PropertyForm.tsx \
       frontend/features/backoffice/properties/components/PropertyForm.tsx
```

⚠️ **IMPORTANTE:** Todos los componentes deben cumplir con:
- Usar SOLO componentes de `/shared/ui/` (VER lista de 20 componentes base arriba)
- PROHIBIDO usar elementos HTML nativos (`<button>`, `<input>`, `<div>` con estilos inline)
- Los 20 componentes base de `@/shared/ui/` son reutilizables = DEBEN usarse entre features
- Componentes de dominio (PropertyFilter, LoginForm, etc.) se importan desde `@/features/`
- Seguir anatomía de Cards, DataGrids y Diálogos documentada en [DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md#-componentes-del-design-system)
- Importar con path aliases: `@/shared/ui/` (componentes base) y `@/features/{context}/{feature}/components/` (componentes de dominio)

**3.7 Crear index export (fachada pública de feature)**

```typescript
// features/backoffice/properties/index.tsx
import { PropertyList } from "./components/PropertyList";
import { PropertyForm } from "./components/PropertyForm";

export { PropertyList, PropertyForm };

// Para la página:
export function PropertiesPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-primary mb-6">Gestión de Propiedades</h1>
      <PropertyForm />
      <PropertyList />
    </div>
  );
}
```

> Este index.tsx es la API pública de la feature. VER [copilot-instructions.md](.github/copilot-instructions.md#definition-of-done---features) para verificar completitud.

**3.8 Actualizar página de routing**

```typescript
// app/backOffice/properties/page.tsx (ANTES)
import { PropertyList } from "@/app/backOffice/properties/ui/PropertyList";
import { createProperty } from "@/app/actions/properties";
export default function Page() {
  return <PropertyList />;
}

// app/backOffice/properties/page.tsx (DESPUÉS)
import { PropertiesPage } from "@/features/backoffice/properties";

export default function Page() {
  return <PropertiesPage />;
}
```

**3.9 Repetir 3.1-3.8 para CADA feature:**

- contracts (+ sales + rent subdivisión)
- cms (+ slides)
- multimedia
- documents (+ documentTypes)
- users (+ teams/agents)
- notifications
- identity
- predict

**3.10 COMMIT después de CADA feature**

```bash
git add -A
git commit -m "refactor(backoffice): migrate properties feature to feature-based architecture"
git commit -m "refactor(backoffice): migrate contracts feature to feature-based architecture"
# ... etc
```

---

### 🌐 FASE 4: MIGRAR PORTAL (10-15 horas)

**Mismo patrón que Fase 3, pero para portal features:**

```bash
# properties
git mv frontend/app/actions/portalProperties.ts \
       frontend/features/portal/properties/actions/getProperties.action.ts

# blog/articles
git mv frontend/app/actions/articles.ts \
       frontend/features/portal/blog/actions/getArticles.action.ts

# rentProperties
git mv frontend/app/actions/rentProperties.ts \
       frontend/features/portal/rentProperties/actions/getRentProperties.action.ts

# saleProperties
git mv frontend/app/actions/saleProperties.ts \
       frontend/features/portal/saleProperties/actions/getSaleProperties.action.ts

# contact
git mv frontend/app/actions/contact.ts \
       frontend/features/portal/contact/actions/submitContact.action.ts

# testimonials
git mv frontend/app/actions/testimonials.ts \
       frontend/features/portal/testimonials/actions/getTestimonials.action.ts
```

**Mismo proceso:**
1. Mover actions
2. Crear services para queries
3. Crear hooks
4. Crear types
5. Crear validation
6. Mover componentes
7. Crear index.tsx export
8. Actualizar páginas
9. COMMIT por feature

---

### 🔗 FASE 5: SHARED FEATURES (5-10 horas)

**5.1 Auth compartida**

```bash
git mv frontend/app/actions/auth.ts \
       frontend/features/shared/auth/actions/login.action.ts
git mv frontend/app/actions/email-verification.ts \
       frontend/features/shared/auth/actions/verifyEmail.action.ts

# Crear estructura similar a backoffice/portal
```

**5.2 Locations compartida**

```bash
git mv frontend/app/actions/locations.ts \
       frontend/features/shared/locations/actions/getLocations.action.ts
git mv frontend/app/actions/comunas.ts \
       frontend/features/shared/locations/actions/getComunas.action.ts
```

**5.3 Common compartida**

```bash
git mv frontend/app/actions/commons.ts \
       frontend/features/shared/common/actions/getCommons.action.ts
git mv frontend/app/actions/uf.ts \
       frontend/features/shared/common/actions/getUF.action.ts
git mv frontend/app/actions/config.ts \
       frontend/lib/config.ts
```

---

### ✅ FASE 6: VALIDACIÓN & CLEANUP (3-5 horas)

```bash
# 6.1 Remover carpetas vacías
rmdir frontend/app/actions  # Debe estar vacío
rmdir frontend/app/types    # Debe estar vacío
rmdir frontend/app/contexts # Debe estar vacío

# 6.2 Buscar orphaned imports
grep -r "@/app/actions" frontend/app/
grep -r "@/app/hooks" frontend/app/
grep -r "@/app/types" frontend/app/
grep -r "@/app/contexts" frontend/app/

# Si hay resultados, actualizar imports

# 6.3 Run lint
npm run lint --prefix frontend

# 6.4 Check build
npm run build --prefix frontend

# 6.5 Run E2E tests
npm run test:e2e --prefix frontend

# 6.6 Design System Compliance Check
# Verificar manualmente:
# - Abrir app y revisar: cards, diálogos, forms, tables
# - Confirmar: sin HTML nativos, colores consistentes, spacing correcto
# - Leer DESIGN_SYSTEM.md checkpoints: https://github.com/tu-repo/blob/main/.github/DESIGN_SYSTEM.md#-checklist-de-implementación

# 6.7 FINAL COMMIT
git add -A
git commit -m "refactor: complete frontend architecture refactoring to feature-based structure

- Move 34 server actions to features/{context}/{feature}/actions/
- Create features/shared/ for cross-cutting concerns
- Move components to shared/ui/
- Implement proper hooks, services, stores per feature
- Move contexts to providers/
- Update all imports to use new paths
- Maintain 100% functional equivalence
- All tests passing"

# 6.8 PUSH
git push origin refactor/frontend-architecture

# 6.9 CREAR PULL REQUEST EN GITHUB
echo "Visit: https://github.com/tu-repo/compare/main...refactor/frontend-architecture"
```

---

## 🎯 CHECKPOINTS DE VALIDACIÓN

### Validación de Diseño y Componentes

**TODAS LAS FASES:** Verificar cumplimiento de DESIGN_SYSTEM.md

- [ ] ✅ Todos los componentes usan Design System (`@/components/`)
- [ ] ✅ NO hay elementos HTML nativos sin wrapper de Design System
- [ ] ✅ Cards siguen anatomía: `rounded-lg shadow-sm border p-[2] flex flex-col justify-between`
- [ ] ✅ Diálogos usan overlay: `fixed inset-0 bg-black bg-opacity-50`
- [ ] ✅ DataGrids configuradas con columnas correctas
- [ ] ✅ Formularios usan TextField, Select, validación Zod
- [ ] ✅ Botones usan variantes correctas según contexto
- [ ] ✅ Colores usan variables CSS: `text-primary`, `bg-secondary`, etc.
- [ ] ✅ Espaciado sigue escala: gap-2/4/6, p-2/4/6, etc.
- [ ] ✅ Typography sigue jerarquía: `text-lg font-bold`, `text-sm text-neutral-600`
- [ ] ✅ Responsive con breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

VER: [DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md) para detalles completos.

---

**Después de Fase 2:**
```
✅ shared/ui/ existe con 20 componentes base (copiados desde /ui)
✅ shared/ui/FileUploader/ contiene FileUploader.tsx genérico + MultimediaUploader/Updater
✅ shared/hooks/ existe con hooks globales
✅ shared/types/ existe
✅ providers/ existe con contexts movidos
✅ tsconfig.json actualizado
✅ No hay imports rotos
✅ Build pasa
✅ frontend/components/ aún existe (no se borra todavía)
✅ Subida de documentos NO-multimedia funciona correctamente
```

**Después de Fase 3:**
```
✅ features/backoffice/ estructura completa
✅ 22 backoffice actions movidas y renombradas
✅ Services creados para queries
✅ Hooks creados por feature
✅ Stores creados con Zustand
✅ app/backOffice/*/page.tsx importan desde features/
✅ E2E tests de backOffice pasan
✅ Todos los componentes de properties/contracts/etc cumplen DESIGN_SYSTEM.md
✅ Validación de componentes: lint + build + visual inspection
```

**Después de Fase 4:**
```
✅ features/portal/ estructura completa
✅ 8 portal actions movidas y renombradas
✅ Portal hooks y services creados
✅ app/portal/*/page.tsx importan desde features/
✅ E2E tests de portal pasan
```

**Después de Fase 5:**
```
✅ features/shared/ estructura completa
✅ Shared actions centralizadas
✅ No hay imports cruzados entre BackOffice y Portal
✅ Build completo exitoso
```

**Después de Fase 6:**
```
✅ Lint 100% clean
✅ Build exitoso
✅ E2E tests 100% pasando
✅ grep no encuentra imports old
✅ 0 carpetas vacías
✅ PR creado
✅ DESIGN_SYSTEM.md compliance check: 100%
✅ copilot-instructions.md compliance check: 100%
✅ Coherencia arquitectónica: 95%+ (vs 28% actual)
```

---

## 🚨 ROLLBACK EN CUALQUIER MOMENTO

Si algo sale mal:

```bash
git reset --hard HEAD~1   # Deshace el último commit
git reset --hard origin/main   # Vuelve al main original
git branch -D refactor/frontend-architecture
```

---

## 📊 PROGRESO CHECKLIST

```
FASE 1: Preparación
[ ] estructura base creada
[ ] tsconfig.json actualizado
[ ] shared/ui creado (20 componentes desde /ui)
[ ] FileUploader genérico copiado (CRÍTICO para documentos)
[ ] COMMIT

FASE 2: Shared
[ ] hooks movidos
[ ] types movidos
[ ] contexts movidos a providers
[ ] COMMIT

FASE 3: BackOffice
[ ] properties migrado (estructura completa)
[ ] contracts migrado
[ ] cms migrado
[ ] multimedia migrado
[ ] documents migrado
[ ] users migrado
[ ] notifications migrado
[ ] identity migrado
[ ] 7x COMMITS

FASE 4: Portal
[ ] properties migrado
[ ] blog migrado
[ ] rentProperties migrado
[ ] saleProperties migrado
[ ] contact migrado
[ ] testimonials migrado
[ ] favorites migrado
[ ] 7x COMMITS

FASE 5: Shared
[ ] auth migrado
[ ] locations migrado
[ ] common migrado
[ ] 1x COMMIT

FASE 6: Validation
[ ] lint check
[ ] build check
[ ] E2E tests
[ ] imports verificados
[ ] carpetas limpias
[ ] DESIGN_SYSTEM.md compliance: anatomía cards/diálogos/forms/datagrid
[ ] copilot-instructions.md compliance: paths, estructura, exports
[ ] Visual inspection: colors, spacing, typography
[ ] FINAL COMMIT
[ ] PR creado
```

---

## 📚 GUÍA COMPLEMENTARIA: DESIGN_SYSTEM.md

Durante la refactorización, usar [.github/DESIGN_SYSTEM.md](.github/DESIGN_SYSTEM.md) como referencia oficial para:

### Componentes y Patrones

- **Cards** (sección 3.3): Anatomía, padding, footer de acciones
- **Diálogos** (sección 3.4): Estructura, validación, estados destructivos
- **Layouts List** (sección 3.5): Búsqueda, filtrado, update optimistas
- **Layouts DataGrid** (sección 3.6): Columnas, tipos de renderizado, acciones
- **Component Library** (sección 3.8): 33+ componentes disponibles

### Sistema de Colores y Estilos

- **Paleta Principal** (sección 1): Primary, Secondary, Accent, States
- **Tipografía** (sección 2): Jerarquía, tamaños, truncamiento
- **Espaciado** (sección 3): Escala 4px, grids, max-widths
- **Material Symbols** (sección 9): 25+ iconos, tamaños, colores

### Implementación Correcta

- **Estados y Feedback** (sección 10): Loading, error, vacío, disabled
- **Badges y Pills** (sección 11): Variantes, uso en cards
- **Botones y Acciones** (sección 12): Variantes por contexto
- **Formularios** (sección 13): TextField, Select, validación
- **Responsive Design** (sección 14): Breakpoints, grids, adaptación

### Checklists

- **Checklist de Implementación** (sección 15): Verificaciones por componente

---

## 🔗 RELACIÓN CON COPILOT-INSTRUCTIONS.md

Ambos documentos son **complementarios**:

- `copilot-instructions.md` → Arquitectura, paths, estructura de features
- `DESIGN_SYSTEM.md` → Componentes, colores, patrones UI/UX

**Durante la refactorización LEER AMBOS** para asegurar 100% compliance.

---

**¿Empezamos ahora?**

Responde:
1. **YA - Empezar hoy** - Te guío paso a paso
2. **REVISAR - Solo quiero entender mejor** - Aclaro dudas
3. **AJUSTAR - Tengo preguntas primero** - Espero feedback
