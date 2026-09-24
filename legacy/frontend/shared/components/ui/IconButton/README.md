# IconButton Component

Botón elegante y accesible que utiliza íconos de Material Symbols, diseñado para acciones compactas con diferentes variantes visuales y tamaños personalizables.

## 🚀 Características Principales

- ✅ **Múltiples Variantes**: Contained, outlined, text, basic
- ✅ **Material Symbols**: Íconos modernos y consistentes
- ✅ **Tamaños Flexibles**: Desde xs hasta xl, o tamaños personalizados
- ✅ **Accesibilidad**: Labels ARIA y navegación por teclado
- ✅ **Responsive**: Diseño adaptativo
- ✅ **TypeScript**: Completamente tipado
- ✅ **Animaciones**: Transiciones suaves y efectos hover
- ✅ **Data Test IDs**: Soporte completo para testing

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import IconButton from '@/components/IconButton/IconButton';

# Asegúrate de que Material Symbols esté cargado en tu aplicación
# Normalmente en _app.tsx o layout.tsx:
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import IconButton from '@/components/IconButton/IconButton';

export default function BasicIconButtons() {
  const handleEdit = () => console.log('Editar');
  const handleDelete = () => console.log('Eliminar');
  const handleSave = () => console.log('Guardar');

  return (
    <div className="flex items-center gap-2 p-4">
      {/* Botón primario contenido */}
      <IconButton
        icon="edit"
        variant="containedPrimary"
        onClick={handleEdit}
        ariaLabel="Editar elemento"
      />

      {/* Botón secundario contenido */}
      <IconButton
        icon="delete"
        variant="containedSecondary"
        onClick={handleDelete}
        ariaLabel="Eliminar elemento"
      />

      {/* Botón outlined */}
      <IconButton
        icon="save"
        variant="outlined"
        onClick={handleSave}
        ariaLabel="Guardar cambios"
      />

      {/* Botón de texto */}
      <IconButton
        icon="close"
        variant="text"
        onClick={() => console.log('Cerrar')}
        ariaLabel="Cerrar modal"
      />
    </div>
  );
}
```

## 🔧 API Reference

### Props del IconButton

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `string` | - | Nombre del ícono de Material Symbols |
| `variant` | `'containedPrimary' \| 'containedSecondary' \| 'outlined' \| 'text' \| 'basic'` | `'containedPrimary'` | Estilo visual del botón |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number` | `'md'` | Tamaño del botón e ícono |
| `className` | `string` | `''` | Clases CSS adicionales |
| `onClick` | `React.MouseEventHandler<HTMLButtonElement>` | - | Función a ejecutar al hacer click |
| `ariaLabel` | `string` | - | Label accesible para lectores de pantalla |

### Tamaños Disponibles

| Tamaño | Valor en px | Uso recomendado |
|--------|-------------|-----------------|
| `xs` | 16px | Elementos muy compactos |
| `sm` | 20px | Tooltips, acciones secundarias |
| `md` | 24px | **Default** - Acciones principales |
| `lg` | 32px | Acciones destacadas |
| `xl` | 40px | Botones grandes, móviles |

## 🎯 Casos de Uso Comunes

### Barra de Acciones de Tabla

```tsx
import React from 'react';
import IconButton from '@/components/IconButton/IconButton';

interface UserRow {
  id: string;
  name: string;
  email: string;
}

export default function UserTableActions() {
  const users: UserRow[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
    { id: '2', name: 'María García', email: 'maria@example.com' },
  ];

  const handleEdit = (userId: string) => {
    console.log('Editar usuario:', userId);
  };

  const handleDelete = (userId: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      console.log('Eliminar usuario:', userId);
    }
  };

  const handleView = (userId: string) => {
    console.log('Ver detalles de usuario:', userId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-1">
                  <IconButton
                    icon="visibility"
                    variant="text"
                    size="sm"
                    onClick={() => handleView(user.id)}
                    ariaLabel={`Ver detalles de ${user.name}`}
                  />
                  <IconButton
                    icon="edit"
                    variant="text"
                    size="sm"
                    onClick={() => handleEdit(user.id)}
                    ariaLabel={`Editar ${user.name}`}
                  />
                  <IconButton
                    icon="delete"
                    variant="outlined"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    ariaLabel={`Eliminar ${user.name}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Modal con Botones de Acción

```tsx
import React, { useState } from 'react';
import IconButton from '@/components/IconButton/IconButton';

export default function ModalWithActions() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  const handleSave = () => {
    console.log('Guardando cambios...');
    setIsOpen(false);
  };
  const handleDelete = () => {
    if (confirm('¿Eliminar este elemento?')) {
      console.log('Eliminando...');
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Abrir Modal
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header con botón de cerrar */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Editar Elemento</h2>
              <IconButton
                icon="close"
                variant="text"
                onClick={handleClose}
                ariaLabel="Cerrar modal"
              />
            </div>

            {/* Contenido */}
            <div className="p-4">
              <p className="text-gray-600">Contenido del modal aquí...</p>
            </div>

            {/* Footer con acciones */}
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <IconButton
                icon="delete"
                variant="outlined"
                onClick={handleDelete}
                ariaLabel="Eliminar elemento"
              />
              <IconButton
                icon="save"
                variant="containedPrimary"
                onClick={handleSave}
                ariaLabel="Guardar cambios"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Galería de Imágenes con Controles

```tsx
import React, { useState } from 'react';
import IconButton from '@/components/IconButton/IconButton';

export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg',
    '/image4.jpg',
  ];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = () => {
    console.log('Eliminar imagen:', currentIndex);
  };

  const handleDownload = () => {
    console.log('Descargar imagen:', currentIndex);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Imagen principal */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          className="w-full h-64 object-cover"
        />

        {/* Controles de navegación */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <IconButton
            icon="chevron_left"
            variant="containedSecondary"
            onClick={goToPrevious}
            ariaLabel="Imagen anterior"
          />
          <IconButton
            icon="chevron_right"
            variant="containedSecondary"
            onClick={goToNext}
            ariaLabel="Imagen siguiente"
          />
        </div>

        {/* Controles de acción */}
        <div className="absolute top-4 right-4 flex gap-2">
          <IconButton
            icon="download"
            variant="containedSecondary"
            onClick={handleDownload}
            ariaLabel="Descargar imagen"
          />
          <IconButton
            icon="delete"
            variant="outlined"
            onClick={handleDelete}
            ariaLabel="Eliminar imagen"
          />
        </div>

        {/* Indicador de posición */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
              index === currentIndex ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Formulario con Acciones Rápidas

```tsx
import React, { useState } from 'react';
import IconButton from '@/components/IconButton/IconButton';
import { TextField } from '@/components/TextField';

export default function TodoForm() {
  const [todos, setTodos] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Tareas</h1>

      {/* Formulario para agregar */}
      <div className="flex gap-2 mb-4">
        <TextField
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nueva tarea..."
          className="flex-1"
        />
        <IconButton
          icon="add"
          variant="containedPrimary"
          onClick={addTodo}
          ariaLabel="Agregar tarea"
        />
      </div>

      {/* Lista de tareas */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-2 p-3 rounded border ${
              todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
            }`}
          >
            <IconButton
              icon={todo.completed ? 'check_circle' : 'radio_button_unchecked'}
              variant="text"
              size="sm"
              onClick={() => toggleTodo(todo.id)}
              ariaLabel={todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
            />

            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text}
            </span>

            <IconButton
              icon="delete"
              variant="text"
              size="sm"
              onClick={() => deleteTodo(todo.id)}
              ariaLabel="Eliminar tarea"
            />
          </div>
        ))}

        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <IconButton
              icon="checklist"
              variant="basic"
              size="lg"
              className="pointer-events-none"
            />
            <p className="mt-2">No hay tareas pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Variantes y Colores

```tsx
// Todas las variantes disponibles
<div className="flex gap-2 flex-wrap">
  <IconButton icon="favorite" variant="containedPrimary" ariaLabel="Favorito" />
  <IconButton icon="favorite" variant="containedSecondary" ariaLabel="Favorito" />
  <IconButton icon="favorite" variant="outlined" ariaLabel="Favorito" />
  <IconButton icon="favorite" variant="text" ariaLabel="Favorito" />
  <IconButton icon="favorite" variant="basic" ariaLabel="Favorito" />
</div>

// Personalización con clases CSS
<IconButton
  icon="settings"
  variant="containedPrimary"
  className="hover:scale-110 shadow-lg"
  ariaLabel="Configuración"
/>

// Tema oscuro
<div className="dark">
  <IconButton
    icon="dark_mode"
    variant="outlined"
    ariaLabel="Modo oscuro"
  />
</div>
```

### Tamaños Personalizados

```tsx
// Tamaños predefinidos
<div className="flex items-center gap-2">
  <IconButton icon="zoom_in" size="xs" variant="text" ariaLabel="Acercar" />
  <IconButton icon="zoom_in" size="sm" variant="text" ariaLabel="Acercar" />
  <IconButton icon="zoom_in" size="md" variant="text" ariaLabel="Acercar" />
  <IconButton icon="zoom_in" size="lg" variant="text" ariaLabel="Acercar" />
  <IconButton icon="zoom_in" size="xl" variant="text" ariaLabel="Acercar" />
</div>

// Tamaños personalizados en píxeles
<IconButton
  icon="expand_more"
  size={48} // 48px
  variant="basic"
  ariaLabel="Expandir"
/>

// Tamaños responsivos
<IconButton
  icon="menu"
  size={window.innerWidth < 640 ? 32 : 24}
  variant="text"
  ariaLabel="Menú"
/>
```

### Grupos de Botones

```tsx
// Grupo horizontal
<div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
  <IconButton
    icon="format_align_left"
    variant="basic"
    className="rounded-none border-r border-gray-300"
    ariaLabel="Alinear izquierda"
  />
  <IconButton
    icon="format_align_center"
    variant="basic"
    className="rounded-none border-r border-gray-300"
    ariaLabel="Centrar"
  />
  <IconButton
    icon="format_align_right"
    variant="basic"
    className="rounded-none"
    ariaLabel="Alinear derecha"
  />
</div>

// Grupo vertical
<div className="inline-flex flex-col rounded-lg border border-gray-300 overflow-hidden">
  <IconButton
    icon="arrow_upward"
    variant="basic"
    className="rounded-none border-b border-gray-300"
    ariaLabel="Mover arriba"
  />
  <IconButton
    icon="arrow_downward"
    variant="basic"
    className="rounded-none"
    ariaLabel="Mover abajo"
  />
</div>
```

## 📱 Responsive Design

El IconButton es completamente responsive:

```tsx
// Diseño responsive con diferentes tamaños
<div className="flex gap-2">
  {/* Ocultar en móvil, mostrar en desktop */}
  <IconButton
    icon="view_list"
    variant="text"
    className="hidden sm:inline-flex"
    ariaLabel="Vista lista"
  />

  {/* Tamaño diferente en móvil */}
  <IconButton
    icon="search"
    variant="outlined"
    size={window.innerWidth < 640 ? 'lg' : 'md'}
    ariaLabel="Buscar"
  />

  {/* Grid responsivo de acciones */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <IconButton icon="create" variant="containedPrimary" ariaLabel="Crear" />
    <IconButton icon="edit" variant="outlined" ariaLabel="Editar" />
    <IconButton icon="delete" variant="containedSecondary" ariaLabel="Eliminar" />
    <IconButton icon="share" variant="text" ariaLabel="Compartir" />
  </div>
</div>
```

## 🎯 Mejores Prácticas

### 1. Usar Labels ARIA Apropiados

```tsx
// ✅ Bien - labels descriptivos
<IconButton
  icon="delete"
  variant="outlined"
  ariaLabel="Eliminar usuario Juan Pérez"
  onClick={() => deleteUser(user.id)}
/>

// ✅ Bien - contexto claro
<IconButton
  icon="edit"
  variant="text"
  ariaLabel="Editar configuración de notificaciones"
  onClick={() => openSettings('notifications')}
/>

// ❌ Mal - labels genéricos
<IconButton
  icon="edit"
  ariaLabel="Editar" // No proporciona suficiente contexto
/>
```

### 2. Elegir la Variante Apropiada

```tsx
// ✅ Bien - jerarquía visual clara
<div className="flex gap-2">
  <IconButton icon="save" variant="containedPrimary" ariaLabel="Guardar" /> {/* Acción principal */}
  <IconButton icon="delete" variant="outlined" ariaLabel="Eliminar" /> {/* Acción destructiva */}
  <IconButton icon="settings" variant="text" ariaLabel="Configurar" /> {/* Acción secundaria */}
</div>

// ✅ Bien - consistencia en la aplicación
// Usar containedPrimary para acciones principales
// Usar outlined para acciones importantes pero no críticas
// Usar text para acciones terciarias
```

### 3. Considerar el Tamaño del Contexto

```tsx
// ✅ Bien - tamaños apropiados por contexto
// En barras de herramientas
<IconButton icon="bold" variant="text" size="sm" ariaLabel="Negrita" />

// En modales
<IconButton icon="close" variant="text" size="md" ariaLabel="Cerrar" />

// En tarjetas grandes
<IconButton icon="favorite" variant="outlined" size="lg" ariaLabel="Favorito" />

// En móviles
<IconButton icon="menu" variant="basic" size="xl" ariaLabel="Menú" />
```

### 4. Estados de Loading y Deshabilitado

```tsx
// ✅ Bien - mostrar estados de carga
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await saveData();
  } finally {
    setIsLoading(false);
  }
};

<IconButton
  icon={isLoading ? "hourglass_empty" : "save"}
  variant="containedPrimary"
  onClick={handleSave}
  disabled={isLoading}
  ariaLabel={isLoading ? "Guardando..." : "Guardar"}
/>

// ✅ Bien - botones deshabilitados con feedback visual
<IconButton
  icon="send"
  variant="outlined"
  disabled={!canSend}
  className={!canSend ? "opacity-50 cursor-not-allowed" : ""}
  ariaLabel="Enviar mensaje"
/>
```

## 🐛 Solución de Problemas

### Problema: Los íconos no se muestran

```tsx
// Asegúrate de que Material Symbols esté cargado
// En tu index.html o _app.tsx:
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>

// O usando npm/yarn:
npm install material-symbols
// Luego importa en tu CSS
@import '~material-symbols/index.css';
```

### Problema: Tamaños inconsistentes

```tsx
// El tamaño incluye padding, usa tamaños consistentes
<IconButton icon="edit" size="md" /> {/* 24px ícono + 8px padding = 32px total */}

// Para íconos sin padding extra
<IconButton
  icon="close"
  size="md"
  className="p-0"
  style={{ width: 24, height: 24, minWidth: 24, minHeight: 24 }}
/>
```

### Problema: Variantes no se aplican correctamente

```tsx
// Verifica que el nombre de la variante sea exacto
<IconButton icon="save" variant="containedPrimary" /> {/* ✅ Correcto */}
<IconButton icon="save" variant="primary" /> {/* ❌ Incorrecto - no existe */}

// Variantes disponibles:
// - containedPrimary
// - containedSecondary
// - outlined
// - text
// - basic
```

### Problema: Botones no son accesibles

```tsx
// ✅ Siempre incluye ariaLabel
<IconButton
  icon="menu"
  variant="text"
  ariaLabel="Abrir menú de navegación" // Obligatorio
  onClick={toggleMenu}
/>

// ✅ Usa botones normales en lugar de spans para acciones
// ❌ Mal - usar span para acciones clickeables
<span onClick={handleAction} className="cursor-pointer">
  <Icon icon="delete" />
</span>

// ✅ Bien - usar IconButton
<IconButton
  icon="delete"
  variant="text"
  onClick={handleAction}
  ariaLabel="Eliminar elemento"
/>
```

### Problema: Íconos se ven pixelados

```tsx
// Material Symbols escala automáticamente, pero para mejor calidad:
// 1. Usa tamaños que sean múltiplos de 4 (16, 20, 24, 32, 40)
// 2. Considera usar tamaños más grandes en pantallas retina

<IconButton
  icon="zoom_in"
  size="lg" // 32px - buen tamaño para retina
  variant="outlined"
/>
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/IconButton/page.tsx` - Showcase completo con todas las variantes y tamaños
- `app/components/FileUploader/FileImageUploader.tsx` - Uso en eliminación de imágenes
- `app/components/BaseForm/` - Ejemplos en formularios complejos

## 🤝 Contribución

Para contribuir al componente IconButton:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas variantes solo si son necesarias y siguen el patrón de diseño
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente con diferentes combinaciones de props y contextos