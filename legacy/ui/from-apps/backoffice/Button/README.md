# Button Components

Una colección completa de componentes de botón con múltiples variantes, tamaños, estados y estilos para diferentes casos de uso en la aplicación.

## 🚀 Características Principales

- ✅ **Múltiples Variantes**: Primary, Secondary, Outlined, Text
- ✅ **Estados de Carga**: Indicadores de loading integrados
- ✅ **Iconos**: Soporte para iconos de Material Symbols al inicio y final
- ✅ **Tamaños**: Small, Medium, Large
- ✅ **Estados**: Normal, Disabled, Loading
- ✅ **Accesibilidad**: Navegación por teclado, ARIA labels
- ✅ **Responsive**: Diseño adaptativo
- ✅ **Tres Componentes**: Button, ButtonPill, IconButton

## 📦 Instalación

```bash
# Los componentes ya están incluidos en el proyecto
import { Button } from '@/components/Button';
import { ButtonPill } from '@/components/Button/ButtonPill';
import IconButton from '@/components/Button/IconButton';
```

## 🎯 Componentes Disponibles

### Button (Principal)

Componente de botón estándar con texto e iconos opcionales.

### ButtonPill

Variante de botón con bordes redondeados (píldora) para un look más moderno.

### IconButton

Botón circular que contiene solo un icono, ideal para acciones compactas.

## 🎨 Button - Uso Básico

```tsx
import React from 'react';
import { Button } from '@/components/Button';

export default function BasicExample() {
  const handleClick = () => {
    console.log('Botón clickeado');
  };

  return (
    <div className="space-x-4">
      <Button onClick={handleClick}>
        Botón Básico
      </Button>

      <Button variant="primary" onClick={handleClick}>
        Botón Primary
      </Button>

      <Button variant="secondary" onClick={handleClick}>
        Botón Secondary
      </Button>
    </div>
  );
}
```

## 🔧 API Reference - Button

### Props del Button

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "outlined" \| "text"` | `"primary"` | Estilo visual del botón |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tamaño del botón |
| `isLoading` | `boolean` | `false` | Muestra indicador de carga |
| `startIcon` | `string` | `undefined` | Icono al inicio (Material Symbols) |
| `endIcon` | `string` | `undefined` | Icono al final (Material Symbols) |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `className` | `string` | `""` | Clases CSS adicionales |
| `children` | `React.ReactNode` | **Requerido** | Contenido del botón |
| `onClick` | `function` | `undefined` | Manejador de click |

## 🎨 Variantes del Button

### Primary (Principal)

```tsx
<Button variant="primary" onClick={handleSubmit}>
  Guardar Cambios
</Button>
```

### Secondary (Secundario)

```tsx
<Button variant="secondary" onClick={handleCancel}>
  Cancelar
</Button>
```

### Outlined (Contorno)

```tsx
<Button variant="outlined" onClick={handleEdit}>
  Editar
</Button>
```

### Text (Texto)

```tsx
<Button variant="text" onClick={handleMore}>
  Ver Más
</Button>
```

## 📏 Tamaños del Button

```tsx
<div className="space-y-2">
  <Button variant="primary" size="sm" onClick={handleAction}>
    Pequeño
  </Button>

  <Button variant="primary" size="md" onClick={handleAction}>
    Mediano (Default)
  </Button>

  <Button variant="primary" size="lg" onClick={handleAction}>
    Grande
  </Button>
</div>
```

## 🔄 Estados de Carga

```tsx
import React, { useState } from 'react';
import { Button } from '@/components/Button';

export default function LoadingExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="primary"
      isLoading={isSubmitting}
      onClick={handleSubmit}
    >
      {isSubmitting ? 'Guardando...' : 'Guardar'}
    </Button>
  );
}
```

## 🎯 Iconos en Button

### Iconos de Material Symbols

```tsx
<Button variant="primary" startIcon="add" onClick={handleAdd}>
  Agregar
</Button>

<Button variant="secondary" startIcon="delete" onClick={handleDelete}>
  Eliminar
</Button>

<Button variant="outlined" endIcon="arrow_forward" onClick={handleContinue}>
  Continuar
</Button>

<Button variant="primary" startIcon="download" endIcon="expand_more" onClick={handleDownload}>
  Descargar
</Button>
```

### Lista de Iconos Comunes

- `add` - Agregar/Plus
- `delete` - Eliminar/Borrar
- `edit` - Editar
- `save` - Guardar
- `search` - Buscar
- `download` - Descargar
- `upload` - Subir
- `arrow_forward` - Flecha derecha
- `arrow_back` - Flecha izquierda
- `expand_more` - Expandir abajo
- `expand_less` - Expandir arriba
- `close` - Cerrar
- `check` - Check/Confirmar
- `error` - Error
- `warning` - Advertencia
- `info` - Información

## 🔘 ButtonPill - Variante Píldora

Botón con bordes completamente redondeados para un look moderno.

```tsx
import React from 'react';
import { ButtonPill } from '@/components/Button/ButtonPill';

export default function PillExample() {
  return (
    <div className="space-x-4">
      <ButtonPill variant="primary" onClick={handleAction}>
        Primary Pill
      </ButtonPill>

      <ButtonPill variant="secondary" onClick={handleAction}>
        Secondary Pill
      </ButtonPill>

      <ButtonPill variant="outlined" onClick={handleAction}>
        Outlined Pill
      </ButtonPill>
    </div>
  );
}
```

### API del ButtonPill

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "outlined"` | `"primary"` | Estilo visual del botón |
| `className` | `string` | `""` | Clases CSS adicionales |
| `children` | `React.ReactNode` | **Requerido** | Contenido del botón |
| `...props` | `ButtonHTMLAttributes` | - | Todas las props estándar de button |

## 🎯 IconButton - Botón de Icono

Botón circular que contiene únicamente un icono.

```tsx
import React from 'react';
import IconButton from '@/components/Button/IconButton';

export default function IconButtonExample() {
  return (
    <div className="space-x-4">
      <IconButton
        icon="add"
        variant="primary"
        onClick={handleAdd}
        aria-label="Agregar elemento"
      />

      <IconButton
        icon="delete"
        variant="secondary"
        size="lg"
        onClick={handleDelete}
        aria-label="Eliminar elemento"
      />

      <IconButton
        icon="edit"
        variant="outlined"
        onClick={handleEdit}
        aria-label="Editar elemento"
      />
    </div>
  );
}
```

### API del IconButton

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `string` | **Requerido** | Nombre del icono (Material Symbols) |
| `variant` | `"primary" \| "secondary" \| "outlined" \| "text"` | `"primary"` | Estilo visual del botón |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"sm"` | Tamaño del botón |
| `className` | `string` | `""` | Clases CSS adicionales |
| `aria-label` | `string` | `undefined` | Etiqueta de accesibilidad (requerida para iconos) |
| `...props` | `ButtonHTMLAttributes` | - | Todas las props estándar de button |

### Tamaños del IconButton

```tsx
<div className="space-x-4">
  <IconButton icon="add" size="xs" aria-label="Agregar" />
  <IconButton icon="add" size="sm" aria-label="Agregar" />
  <IconButton icon="add" size="md" aria-label="Agregar" />
  <IconButton icon="add" size="lg" aria-label="Agregar" />
  <IconButton icon="add" size="xl" aria-label="Agregar" />
</div>
```

## 🎯 Estados Especiales

### Botón Deshabilitado

```tsx
<Button variant="primary" disabled onClick={handleAction}>
  Deshabilitado
</Button>

<ButtonPill variant="secondary" disabled onClick={handleAction}>
  Pill Deshabilitado
</ButtonPill>

<IconButton icon="delete" disabled aria-label="Eliminar" />
```

### Botón con Loading

```tsx
<Button variant="primary" isLoading={true} onClick={handleAction}>
  Cargando...
</Button>
```

## 🎨 Personalización

### Clases CSS Adicionales

```tsx
<Button
  variant="primary"
  className="w-full md:w-auto px-8 py-3"
  onClick={handleAction}
>
  Botón Personalizado
</Button>

<ButtonPill
  variant="secondary"
  className="shadow-lg hover:shadow-xl transition-shadow"
  onClick={handleAction}
>
  Pill con Sombra
</ButtonPill>
```

## 📱 Responsive Design

Los botones son completamente responsive:

```tsx
// Botón que se adapta al tamaño de pantalla
<Button
  variant="primary"
  className="w-full sm:w-auto"
  onClick={handleAction}
>
  Acción Responsive
</Button>
```

## 🔧 Integración con Formularios

### Formulario con Botones de Acción

```tsx
import React, { useState } from 'react';
import { Button } from '@/components/Button';

interface FormData {
  name: string;
  email: string;
}

export default function FormWithButtons() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Datos enviados:', formData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          startIcon="save"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={handleReset}
          startIcon="refresh"
        >
          Resetear
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={() => window.history.back()}
          startIcon="arrow_back"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
```

### Barra de Acción con IconButtons

```tsx
import React from 'react';
import IconButton from '@/components/Button/IconButton';

export default function ActionBar() {
  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b">
      <IconButton
        icon="add"
        variant="primary"
        size="md"
        onClick={handleAdd}
        aria-label="Agregar nuevo elemento"
      />

      <IconButton
        icon="edit"
        variant="secondary"
        size="md"
        onClick={handleEdit}
        aria-label="Editar elemento seleccionado"
      />

      <IconButton
        icon="delete"
        variant="outlined"
        size="md"
        onClick={handleDelete}
        aria-label="Eliminar elemento seleccionado"
      />

      <div className="ml-auto flex gap-2">
        <IconButton
          icon="download"
          variant="text"
          size="md"
          onClick={handleDownload}
          aria-label="Descargar datos"
        />

        <IconButton
          icon="settings"
          variant="text"
          size="md"
          onClick={handleSettings}
          aria-label="Configuración"
        />
      </div>
    </div>
  );
}
```

## 🎯 Mejores Prácticas

### 1. Usa Variantes Apropiadas

```tsx
// ✅ Bien - Jerarquía clara
<Button variant="primary" onClick={handlePrimary}>Acción Principal</Button>
<Button variant="outlined" onClick={handleSecondary}>Acción Secundaria</Button>

// ❌ Mal - Sin jerarquía visual
<Button variant="primary" onClick={handleAction1}>Acción 1</Button>
<Button variant="primary" onClick={handleAction2}>Acción 2</Button>
```

### 2. Incluye Etiquetas de Accesibilidad

```tsx
// ✅ Bien - Accesible
<IconButton
  icon="delete"
  aria-label="Eliminar usuario Juan Pérez"
  onClick={() => deleteUser(user.id)}
/>

// ❌ Mal - No accesible
<IconButton
  icon="delete"
  onClick={() => deleteUser(user.id)}
/>
```

### 3. Maneja Estados de Carga

```tsx
// ✅ Bien - Feedback visual
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await apiCall();
  } finally {
    setIsLoading(false);
  }
};

<Button isLoading={isLoading} onClick={handleSubmit}>
  {isLoading ? 'Guardando...' : 'Guardar'}
</Button>
```

### 4. Usa Tamaños Consistentes

```tsx
// ✅ Bien - Consistencia
<div className="space-x-4">
  <Button variant="primary" size="md">Guardar</Button>
  <Button variant="outlined" size="md">Cancelar</Button>
</div>

// ❌ Mal - Tamaños inconsistentes
<div className="space-x-4">
  <Button variant="primary" size="lg">Guardar</Button>
  <Button variant="outlined" size="sm">Cancelar</Button>
</div>
```

## 🐛 Solución de Problemas

### Problema: Los iconos no aparecen

```tsx
// Asegúrate de usar nombres de iconos válidos de Material Symbols
<IconButton icon="add" /> // ✅ Correcto
<IconButton icon="plus" /> // ❌ No existe en Material Symbols
```

### Problema: Botón no responde a clicks

```tsx
// Verifica que no esté deshabilitado
<Button disabled={false} onClick={handleClick}> // ✅ Correcto
<Button disabled onClick={handleClick}> // ❌ Siempre deshabilitado
```

### Problema: Loading no funciona

```tsx
// El prop isLoading solo existe en el componente Button principal
<Button isLoading={true}>Cargando</Button> // ✅ Correcto
<ButtonPill isLoading={true}>Cargando</ButtonPill> // ❌ ButtonPill no soporta isLoading
```

### Problema: IconButton no es accesible

```tsx
// Siempre incluye aria-label para IconButtons
<IconButton
  icon="delete"
  aria-label="Eliminar elemento" // ✅ Requerido
  onClick={handleDelete}
/>
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/Button/page.tsx` - Showcase completo con todas las variantes
- `app/components/BaseForm/` - Ejemplos de uso en formularios complejos

## 🤝 Contribución

Para contribuir a los componentes Button:

1. Mantén la consistencia entre Button, ButtonPill e IconButton
2. Agrega nuevos tamaños o variantes siguiendo el patrón existente
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura accesibilidad en todos los nuevos componentes</content>
<parameter name="filePath">/Users/felipe/dev/DSP-App/app/components/Button/README.md