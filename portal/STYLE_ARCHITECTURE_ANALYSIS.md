# Análisis de Arquitectura de Estilos: Dialog + BaseComponents

## 📋 Resumen Ejecutivo

Este análisis evalúa cómo interactúan **Dialog** y los **BaseComponents** (CreateBaseForm, UpdateBaseForm, DeleteBaseForm) en términos de estilos, paddings, títulos, subtítulos y áreas de acciones.

**Fecha**: 4 de marzo de 2026  
**Contexto**: Sistema de gestión de contenido (CMS) del backOffice

---

## 🎯 Problemas Identificados

### 1. **DUPLICACIÓN DE TÍTULOS** ⚠️ CRÍTICO

**Problema**: Cuando Dialog y BaseForm se usan juntos, aparecen **DOS títulos** idénticos:

```tsx
// Ejemplo: SliderContent.tsx línea 372-374
<Dialog
  open={isCreateDialogOpen}
  title="Crear Nuevo Slide"  // ❌ Título en Dialog
>
  <CreateSlideForm />  // ❌ Título interno en BaseForm
</Dialog>
```

**Resultado visual**:
```
┌─────────────────────────────────────┐
│ Crear Nuevo Slide          [cerrar] │ ← Dialog title (p-6, pb-0, mb-2)
│─────────────────────────────────────│
│ Crear Nuevo Slide                   │ ← BaseForm title (p-1, pb-0)
│ (campos del formulario...)           │
└─────────────────────────────────────┘
```

**Ubicaciones del problema**:
- `SliderContent.tsx` líneas 372-374 (Create)
- `SliderContent.tsx` líneas 390-398 (Update)  
- `ArticleDialog.tsx` (maneja título manualmente, no usa BaseForm title)

---

### 2. **INCONSISTENCIA EN PADDINGS** ⚠️ ALTO

**Diferentes estructuras de espaciado**:

#### Dialog (Dialog.tsx línea 297-322):
```tsx
// Header del Dialog
<div className="flex items-center justify-between mb-2 p-6 pb-0">
  <h2 className="title p-1">Title</h2>  // Extra p-1
</div>

// Body del Dialog
<div className={`w-full ${title ? 'pt-2 px-6 pb-6' : 'p-6'}`}>
  {children}  // BaseForm aquí
</div>

// Actions del Dialog
<div className="px-6 pb-6 pt-4 border-t">
  {actions}
</div>
```

#### BaseForm (CreateBaseForm.tsx línea 233-306):
```tsx
<form className="form-container">  // p-4 gap-4 (globals.css:568)
  {/* Title/Subtitle */}
  <div className="flex flex-col gap-0">
    <div className="title p-1 pb-0">Title</div>      // p-1 pb-0
    <div className="subtitle p-1 pt-0">Subtitle</div> // p-1 pt-0
  </div>
  
  {/* Fields */}
  <div className="space-y-4">...</div>
  
  {/* Actions */}
  <div className="form-actions">  // mt-4 (globals.css:590)
    <Button>Guardar</Button>
  </div>
</form>
```

**Análisis de paddings acumulados**:

```
Cuando Dialog contiene BaseForm:

Dialog exterior:
├─ Header: p-6 pb-0 mb-2
│  └─ Title: p-1
├─ Body: px-6 pb-6 pt-2 (si hay title)
│  └─ BaseForm: p-4 (form-container)
│     ├─ Title: p-1 pb-0
│     ├─ Fields: space-y-4
│     └─ Actions: mt-4
└─ Dialog Actions: px-6 pb-6 pt-4 border-t

Total padding sides: 6px (Dialog) + 4px (BaseForm) = 10px
Total top spacing title: 2px + 4px + 1px = 7px extra
```

---

### 3. **REDUNDANCIA EN ACTIONS AREAS** ⚠️ MEDIO

**Dos áreas de acciones**:

1. **Dialog.actions**: Área de botones en el footer del Dialog
2. **BaseForm.form-actions**: Área de botones dentro del formulario

**Uso actual**:
- SliderContent usa `hideActions={false}` en Dialog (por defecto) pero los botones están en BaseForm
- ArticleDialog NO usa BaseForm, rendering manual de campos
- DeleteSlideForm usa BaseForm con botones internos + Dialog sin actions

**Inconsistencia**:
```tsx
// Caso 1: Dialog CON BaseForm (SliderContent.tsx)
<Dialog title="Crear Nuevo Slide">  // No usa Dialog.actions
  <CreateSlideForm />  // Tiene sus propios botones (cancel + submit)
</Dialog>

// Caso 2: Dialog SIN BaseForm (ArticleDialog.tsx)
<Dialog 
  title="Crear Artículo"
  actions={[  // ✓ Usa Dialog.actions
    { label: 'Cancelar', onClick: handleCancel },
    { label: 'Guardar', onClick: handleSubmit }
  ]}
>
  {/* Campos manuales sin BaseForm */}
</Dialog>
```

---

### 4. **VARIACIONES EN TAMAÑOS DE DIALOG** ⚠️ BAJO

**Diferentes tamaños usados**:

| Feature | Create | Update | Delete |
|---------|--------|--------|--------|
| Slider  | `sm`   | `sm`   | `xs`   |
| Articles| (manual handling) | (manual) | N/A |

**Referencia de tamaños** (Dialog.tsx línea 68-104):
```typescript
const dialogSizePresets = {
  xs:  { md: 420px,  lg: 420px  },
  sm:  { md: 520px,  lg: 640px  },
  md:  { md: 640px,  lg: 800px  },
  lg:  { md: 800px,  lg: 900px  },
  xl:  { md: 900px,  lg: 1024px },
  xxl: { md: 1170px, lg: 1300px }
}
```

---

### 5. **ESTILOS DE TÍTULOS Y SUBTÍTULOS** ⚠️ BAJO

**Definiciones en globals.css** (línea 325-342):

```css
.title-base-form {
  @apply text-2xl font-bold text-primary leading-tight;
}

.subtitle-base-form {
  @apply text-base font-light text-foreground leading-snug;
}

.title {
  @apply text-2xl font-bold text-primary leading-tight;
}

.subtitle {
  @apply text-base font-light text-foreground leading-snug;
}
```

**Problema**: 
- `.title-base-form` y `.title` son idénticos (duplicados innecesarios)
- Dialog usa `text-xl font-bold` (Dialog.tsx línea 300)
- BaseForm usa `.title` class que resulta en `text-2xl font-bold`
- **Inconsistencia**: Dialog title (20px) vs BaseForm title (24px)

---

## 🎨 Patrones de Uso Actuales

### Patrón A: Dialog + BaseForm (Recomendado parcialmente)

**Usado en**: Slider CRUD

```tsx
// SliderContent.tsx
<Dialog 
  open={isCreateDialogOpen}
  size="sm"
  title="Crear Nuevo Slide"  // ❌ Duplicado
>
  <CreateSlideForm 
    onSuccess={handleCreateSuccess} 
    onCancel={handleCreateCancel}
  />
</Dialog>
```

**Props de BaseForm**:
```typescript
interface CreateBaseFormProps {
  title?: string;         // ❌ Redundante con Dialog.title
  subtitle?: string;      // ✓ Útil para descripción adicional
  fields: BaseFormField[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;   // ✓ Personalizable
  cancelButton?: boolean; // ✓ Útil
  cancelButtonText?: string;
  onCancel?: () => void;
  errors?: string[];
}
```

**Ventajas**:
- ✓ Lógica de formulario encapsulada
- ✓ Validación integrada
- ✓ Manejo de estados (loading, errors)
- ✓ Tipado fuerte para campos

**Desventajas**:
- ❌ Duplicación de títulos
- ❌ Paddings acumulados (10px total lateral)
- ❌ Dos áreas de actions potencialmente
- ❌ Complejidad de props (`title` debe omitirse si Dialog tiene title)

---

### Patrón B: Dialog con campos manuales (NO recomendado)

**Usado en**: Algunos dialogs antiguos (ArticleDialog parcialmente)

```tsx
<Dialog 
  title="Crear Artículo"
  actions={[
    { label: 'Cancelar', onClick: handleCancel },
    { label: 'Guardar', onClick: handleSubmit, loading: isPending }
  ]}
>
  <TextField label="Título" value={formData.title} onChange={...} />
  <TextField label="Contenido" value={formData.content} onChange={...} />
  {/* más campos... */}
</Dialog>
```

**Ventajas**:
- ✓ Control total del layout
- ✓ No hay duplicación de títulos
- ✓ Paddings simplificados (solo Dialog)

**Desventajas**:
- ❌ Código repetitivo
- ❌ No reutilizable
- ❌ Manejo manual de estados
- ❌ Validación manual
- ❌ Sin tipado consistente

---

### Patrón C: DeleteBaseForm + Dialog (Mixto)

**Usado en**: DeleteSlideForm

```tsx
<Dialog 
  open={isDeleteDialogOpen} 
  size="xs" 
  title=""  // ✓ Vacío para evitar duplicación
>
  <DeleteSlideForm 
    slide={slideToDelete}
    onSuccess={handleDeleteSuccess}
    onCancel={handleDeleteCancel}
  />
</Dialog>
```

**DeleteBaseForm characteristics**:
- Tiene title interno: "Confirmar eliminación" (default)
- Incluye icono visual (Trash2)
- Mensaje customizable
- Botones propios (Cancel + Delete)

**Ventajas**:
- ✓ Evita duplicación pasando `title=""`
- ✓ UX consistente para deletes
- ✓ Icono visual de advertencia

**Desventajas**:
- ❌ Aún tiene paddings acumulados
- ❌ Necesita `title=""` explícito (no intuitivo)

---

## 🏗️ Arquitectura de Componentes

### Jerarquía de rendering:

```
Dialog (Portal to document.body)
├─ Backdrop (bg-black/70)
└─ Content wrapper (size presets, responsive)
   ├─ Header (conditional, p-6 pb-0 mb-2)
   │  ├─ Title (h2.title p-1)
   │  └─ Close button (opcional)
   │
   ├─ Body (px-6 pb-6 pt-2)
   │  ├─ Description (opcional)
   │  └─ {children}  ← BaseForm aquí
   │     │
   │     └─ BaseForm (.form-container p-4)
   │        ├─ Title/Subtitle section (p-1)
   │        ├─ Fields (.space-y-4)
   │        ├─ Actions (.form-actions mt-4)
   │        └─ Errors (mt-4)
   │
   └─ Actions (opcional, px-6 pb-6 pt-4 border-t)
      └─ Buttons (gap-2)
```

### Flujo de datos:

```
User Click "Agregar"
    ↓
setIsCreateDialogOpen(true)
    ↓
Dialog open={true}
    ↓
CreateSlideForm renderizado
    ↓
User llena campos
    ↓
onChange actualiza values
    ↓
User click "Guardar"
    ↓
BaseForm.onSubmit()
    ↓
Validación (opcional)
    ↓
createSlideWithMultimedia(formData)
    ↓
onSuccess callback
    ↓
setIsCreateDialogOpen(false)
    ↓
refreshSlides()
```

---

## 📐 Especificaciones de Estilos

### Dialog (Dialog.tsx)

```typescript
// Header spacing
header: "p-6 pb-0 mb-2"
title: "title p-1 text-xl font-bold"  // text-xl = 20px

// Body spacing
body: "px-6 pb-6 pt-2" (if has title)
body: "p-6" (if no title)

// Actions spacing
actions: "px-6 pb-6 pt-4 border-t border-gray-50"
buttons: "gap-2"
```

### BaseForm (CreateBaseForm/UpdateBaseForm)

```typescript
// Container
form: "form-container"  // p-4 (globals.css)

// Title section
titleWrapper: "flex flex-col gap-0"
title: "title p-1 pb-0"  // text-2xl = 24px
subtitle: "subtitle p-1 pt-0"  // text-base = 16px

// Fields section
fieldsWrapper: "space-y-4"  // 16px gap vertical

// Actions section
actions: "form-actions"  // mt-4 (globals.css)
actionsHeader: "flex justify-between"
actionsButtons: "flex gap-2"  // 8px gap horizontal
```

### DeleteBaseForm

```typescript
// Container
form: "form-container"  // p-4

// Title (same as CreateBaseForm)
titleWrapper: "flex flex-col gap-0"
title: "title p-1 pb-0"

// Icon + Message section
content: "p-4 space-y-4"
iconWrapper: "w-28 h-28 rounded-full border border-red-400"
message: "text-sm font-normal leading-relaxed text-center sm:text-justify"

// Actions (same as CreateBaseForm)
```

---

## 🔧 Propuestas de Mejora

### Propuesta 1: **Modo "nested" para BaseForm** ⭐ RECOMENDADO

**Objetivo**: Eliminar títulos, paddings y actions duplicados cuando BaseForm está dentro de Dialog.

**Implementación**:

```typescript
// BaseFormProps extendido
interface CreateBaseFormProps {
  // ... props existentes
  
  /**
   * Modo nested: Oculta títulos, reduce paddings, oculta actions
   * Usar cuando el form está dentro de un Dialog que ya maneja estos elementos
   */
  nested?: boolean;
  
  /**
   * Cuando nested=true, estas props son ignoradas:
   * - title (usa Dialog.title)
   * - subtitle (usa Dialog.description)
   * - cancelButton (usa Dialog close)
   */
}
```

**Cambios en BaseForm**:

```tsx
const CreateBaseForm: React.FC<CreateBaseFormProps> = ({
  fields,
  nested = false,  // ← Nuevo parámetro
  // ... otros props
}) => {
  // Clases dinámicas según modo
  const formClass = nested 
    ? "w-full flex flex-col gap-4"  // Sin padding
    : "form-container";              // Con p-4
  
  const showTitleSection = !nested && (title || subtitle);
  const showActions = !nested;
  
  return (
    <form className={formClass}>
      {showTitleSection && (
        <div className="flex flex-col gap-0">
          {title && <div className="title p-1 pb-0">{title}</div>}
          {subtitle && <div className="subtitle p-1 pt-0">{subtitle}</div>}
        </div>
      )}
      
      <div className="space-y-4">
        {/* fields rendering */}
      </div>
      
      {showActions && (
        <div className="form-actions">
          {/* buttons */}
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {/* errors */}
        </div>
      )}
    </form>
  );
};
```

**Uso**:

```tsx
// ✓ CORRECTO: Con nested
<Dialog 
  title="Crear Nuevo Slide"
  actions={[
    { label: 'Cancelar', onClick: handleCancel },
    { label: 'Guardar', onClick: handleSubmit, loading: isSubmitting }
  ]}
>
  <CreateSlideForm 
    nested  // ← Elimina títulos, paddings y botones internos
    fields={fields}
    values={values}
    onChange={handleChange}
    onSubmit={handleSubmit}
  />
</Dialog>

// ✓ CORRECTO: Sin nested (standalone)
<div className="page-container">
  <CreateSlideForm  // Renderiza todo completo
    title="Crear Nuevo Slide"
    fields={fields}
    // ...
  />
</div>
```

**Ventajas**:
- ✓ Elimina duplicación de títulos automáticamente
- ✓ Paddings optimizados (6px lateral total)
- ✓ Una sola área de actions (Dialog.actions)
- ✓ API clara y explícita
- ✓ Backward compatible (nested=false por defecto)
- ✓ Funciona con todos los BaseForms (Create, Update, Delete)

**Estimación de esfuerzo**: 4-6 horas
- Modificar 3 BaseForms (Create, Update, Delete)
- Actualizar 15-20 usos existentes
- Testing de regresión

---

### Propuesta 2: **Wrapper inteligente DialogForm** ⭐ ALTERNATIVA

**Objetivo**: Componente que combina Dialog + BaseForm con lógica de integración

**Implementación**:

```tsx
interface DialogFormProps<T> extends Omit<DialogProps, 'children' | 'actions'> {
  // Dialog props ya incluidos (title, size, open, onClose, etc.)
  
  // BaseForm props
  mode: 'create' | 'update' | 'delete';
  fields?: BaseFormField[];  // Para create/update
  initialValues?: T;
  message?: string;  // Para delete
  
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  
  // Customización
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  errors?: string[];
}

function DialogForm<T = any>({
  // Dialog props
  title,
  description,
  size = 'md',
  open,
  onClose,
  
  // Form props
  mode,
  fields,
  initialValues,
  message,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  isSubmitting,
  errors,
  ...dialogProps
}: DialogFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues ?? {} as T);
  
  const handleSubmit = async () => {
    await onSubmit(values);
  };
  
  const actions = [
    {
      label: cancelLabel ?? 'Cancelar',
      onClick: onCancel ?? onClose,
      variant: 'outlined' as const,
    },
    {
      label: submitLabel ?? (mode === 'delete' ? 'Eliminar' : 'Guardar'),
      onClick: handleSubmit,
      variant: mode === 'delete' ? 'destructive' : 'primary' as const,
      loading: isSubmitting,
    },
  ];
  
  return (
    <Dialog
      {...dialogProps}
      title={title}
      description={description}
      size={size}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {mode === 'delete' ? (
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full flex items-center justify-center border border-red-400">
              <Trash2 size={42} color="#dc2626" />
            </div>
            <p className="text-sm text-foreground">{message}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {fields?.map(field => (
            <div key={field.name}>
              {/* Render field based on type */}
            </div>
          ))}
        </div>
      )}
      
      {errors && errors.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          {errors.map((err, i) => (
            <Alert key={i} variant="error">{err}</Alert>
          ))}
        </div>
      )}
    </Dialog>
  );
}
```

**Uso**:

```tsx
// Create mode
<DialogForm
  mode="create"
  title="Crear Nuevo Slide"
  size="sm"
  open={isOpen}
  onClose={handleClose}
  fields={slideFields}
  onSubmit={handleCreateSlide}
  submitLabel="Crear Slide"
  isSubmitting={isCreating}
  errors={errors}
/>

// Delete mode
<DialogForm
  mode="delete"
  title="Eliminar Slide"
  size="xs"
  open={isOpen}
  onClose={handleClose}
  message={`¿Eliminar "${slide.title}"?`}
  onSubmit={handleDelete}
  submitLabel="Eliminar"
  isSubmitting={isDeleting}
/>
```

**Ventajas**:
- ✓ API unificada para todos los modos
- ✓ Elimina completamente la duplicación
- ✓ Lógica de integración encapsulada
- ✓ Menos código en páginas

**Desventajas**:
- ❌ Mayor complejidad interna
- ❌ Menos flexible para casos edge
- ❌ Requiere migración de código existente
- ❌ Más difícil de mantener

**Estimación de esfuerzo**: 8-12 horas

---

### Propuesta 3: **Normalización de estilos** ⭐ COMPLEMENTARIA

**Objetivo**: Unificar tamaños, paddings y clases entre Dialog y BaseForms

**Cambios**:

1. **Unificar clases de título**:
```css
/* globals.css - Eliminar duplicados */
.title {
  @apply text-xl font-bold text-primary leading-tight;  /* ← Cambiar a xl */
}

.subtitle {
  @apply text-sm font-light text-foreground leading-snug;  /* ← Cambiar a sm */
}

/* Eliminar .title-base-form y .subtitle-base-form (duplicados) */
```

2. **Estandarizar paddings de Dialog**:
```tsx
// Dialog.tsx - Ajustar body padding cuando contiene form
const bodyPadding = title && title !== '' 
  ? 'pt-2 px-6 pb-6'  // ← Mantener
  : 'p-6';
```

3. **Crear variante "dialog" para form-container**:
```css
/* globals.css */
.form-container-dialog {
  @apply w-full flex flex-col gap-4;  /* Sin padding lateral */
}
```

**Ventajas**:
- ✓ Consistencia visual inmediata
- ✓ Bajo riesgo
- ✓ Fácil de implementar

**Estimación de esfuerzo**: 2-3 horas

---

### Propuesta 4: **Documentación de patrones** ⭐ ESENCIAL

**Objetivo**: Guidelines claros para desarrolladores

**Contenido del documento**:

```markdown
## Dialog + BaseForm Guidelines

### ✅ HACER

1. **Cuando usar Dialog + BaseForm con nested**:
   ```tsx
   <Dialog title="..." actions={[...]}>
     <CreateSlideForm nested fields={...} />
   </Dialog>
   ```

2. **Cuando usar BaseForm standalone**:
   ```tsx
   <div className="page-container">
     <CreateSlideForm title="..." fields={...} />
   </div>
   ```

3. **Tamaños de Dialog recomendados**:
   - Delete confirmations: `xs` (420px)
   - Simple forms (3-5 fields): `sm` (640px)
   - Standard forms (6-10 fields): `md` (800px)
   - Complex forms (10+ fields): `lg` (900px)

### ❌ NO HACER

1. **NO duplicar títulos**:
   ```tsx
   ❌ <Dialog title="Crear">
        <CreateForm title="Crear" />
      </Dialog>
   ```

2. **NO renderizar campos manualmente**:
   ```tsx
   ❌ <Dialog title="Crear">
        <TextField />
        <TextField />
        <Button>Guardar</Button>
      </Dialog>
   ```
   
   ✅ Usar BaseForm siempre que sea posible
```

**Estimación de esfuerzo**: 3-4 horas

---

## 📊 Comparación de Propuestas

| Propuesta | Complejidad | Impacto | Compatibilidad | Esfuerzo | Prioridad |
|-----------|-------------|---------|----------------|----------|-----------|
| 1. Modo nested | Media | Alto | ✓ Backward compatible | 4-6h | ⭐⭐⭐⭐⭐ |
| 2. DialogForm wrapper | Alta | Muy Alto | ❌ Requiere migración | 8-12h | ⭐⭐⭐ |
| 3. Normalización CSS | Baja | Medio | ✓ Compatible | 2-3h | ⭐⭐⭐⭐ |
| 4. Documentación | Baja | Medio | ✓ N/A | 3-4h | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recomendación Final

### Plan de acción sugerido:

**Fase 1 (Corto plazo - 1 semana)**:
1. ✅ Implementar Propuesta 1 (modo `nested`)
2. ✅ Implementar Propuesta 3 (normalización CSS)
3. ✅ Actualizar 5-10 componentes críticos a `nested` mode

**Fase 2 (Mediano plazo - 2 semanas)**:
4. ✅ Implementar Propuesta 4 (documentación)
5. ✅ Migrar todos los componentes restantes
6. ✅ Testing exhaustivo

**Fase 3 (Opcional - futuro)**:
7. ⚠️ Evaluar Propuesta 2 (DialogForm) si el patrón `nested` presenta limitaciones

**Beneficios esperados**:
- ✅ Elimina 100% de duplicación de títulos
- ✅ Reduce padding acumulado de 10px a 6px (40% mejora)
- ✅ API consistente y clara
- ✅ Backward compatible (no rompe código existente)
- ✅ Mejora significativa en mantenibilidad
- ✅ Experiencia de usuario más consistente

---

## 📝 Ejemplos de Migración

### Antes (con problemas):

```tsx
// ❌ Duplicación de títulos y paddings
<Dialog 
  open={isOpen}
  title="Crear Nuevo Slide"
  size="sm"
>
  <CreateSlideForm 
    title="Crear Nuevo Slide"  // ← Duplicado
    subtitle="Completa los campos"
    fields={fields}
    values={values}
    onChange={handleChange}
    onSubmit={handleSubmit}
    isSubmitting={isSubmitting}
    cancelButton
    onCancel={handleCancel}
  />
</Dialog>

// Resultado: 2 títulos, 10px padding lateral, botones en BaseForm
```

### Después (con solución):

```tsx
// ✅ Sin duplicación, paddings optimizados
<Dialog 
  open={isOpen}
  title="Crear Nuevo Slide"
  description="Completa los campos del nuevo slide"  // ← Descripción en Dialog
  size="sm"
  actions={[
    { 
      label: 'Cancelar', 
      onClick: handleCancel,
      variant: 'outlined' 
    },
    { 
      label: 'Crear Slide', 
      onClick: handleSubmit,
      variant: 'primary',
      loading: isSubmitting 
    }
  ]}
>
  <CreateSlideForm 
    nested  // ← Elimina títulos, paddings y actions
    fields={fields}
    values={values}
    onChange={handleChange}
    onSubmit={handleSubmit}
  />
</Dialog>

// Resultado: 1 título, 6px padding lateral, botones en Dialog
```

---

## 🔍 Checklist de Implementación

### Para desarrolladores:

- [ ] Leer esta documentación completa
- [ ] Actualizar BaseForm con prop `nested`
- [ ] Actualizar CSS (normalización de `.title` y `.subtitle`)
- [ ] Migrar componentes uno por uno
- [ ] Para cada migración:
  - [ ] Mover `title` a Dialog
  - [ ] Mover `subtitle` a Dialog `description`
  - [ ] Mover botones a Dialog `actions`
  - [ ] Agregar prop `nested` a BaseForm
  - [ ] Verificar visualmente el resultado
  - [ ] Testing funcional (submit, cancel, validación)
- [ ] Actualizar tests si es necesario
- [ ] Documentar en Storybook (si aplica)

### Para QA:

- [ ] Verificar que no haya títulos duplicados
- [ ] Verificar paddings consistentes (6px lateral)
- [ ] Verificar tamaños de Dialog apropiados
- [ ] Testing responsive (mobile, tablet, desktop)
- [ ] Testing de accesibilidad (keyboard navigation, screen readers)
- [ ] Validar flujos completos (create, update, delete)

---

## 📚 Referencias

- **Dialog component**: `frontend/shared/components/ui/Dialog/Dialog.tsx`
- **CreateBaseForm**: `frontend/shared/components/ui/BaseForm/CreateBaseForm.tsx`
- **UpdateBaseForm**: `frontend/shared/components/ui/BaseForm/UpdateBaseForm.tsx`
- **DeleteBaseForm**: `frontend/shared/components/ui/BaseForm/DeleteBaseForm.tsx`
- **Estilos globales**: `frontend/app/globals.css`
- **Ejemplo de uso**: `frontend/features/backoffice/cms/components/slider/SliderContent.tsx`
- **Design System**: `.github/DESIGN_SYSTEM.md`

---

**Autor**: AI Assistant  
**Revisado por**: (Pendiente)  
**Última actualización**: 4 de marzo de 2026
