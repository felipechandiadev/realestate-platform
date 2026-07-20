# UpdateBaseForm

Componente React para formularios de actualización con soporte completo para campos multimedia.

## 🚀 Instalación

```bash
npm install @/components/BaseForm
```

## 📖 Uso Básico

```tsx
import { UpdateBaseForm } from '@/components/BaseForm';

const fields: BaseUpdateFormField[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  {
    name: 'avatar',
    label: 'Avatar',
    type: 'avatar',
    currentUrl: user.avatarUrl,
    showReset: true,
  },
];

<UpdateBaseForm
  fields={fields}
  initialState={userData}
  onSubmit={handleSubmit}
  title="Actualizar Usuario"
/>
```

## 🎯 Tipos de Campos Soportados

### Campos Básicos
- `text` - Campo de texto simple
- `email` - Campo de email con validación
- `textarea` - Área de texto multilínea
- `number` - Campo numérico
- `select` - Selector desplegable
- `switch` - Interruptor booleano

### Campos Multimedia
- `avatar` - Foto de perfil (estilo AdminCard)
- `image` - Imagen general
- `video` - Archivo de video

## 🔧 Configuración de Campos Multimedia

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `currentUrl` | `string` | - | URL de la multimedia actual |
| `currentType` | `'image' \| 'video'` | Auto | Tipo de multimedia actual |
| `acceptedTypes` | `string[]` | Auto | Tipos MIME aceptados |
| `maxSize` | `number` | Auto | Tamaño máximo en MB |
| `aspectRatio` | `string` | Auto | Proporción del contenedor |
| `buttonText` | `string` | Auto | Texto del botón |
| `labelText` | `string` | `""` | Texto opcional debajo del botón |

### Configuraciones por Defecto

| Tipo | Variant | Accepted Types | Max Size | Aspect Ratio | Button Text |
|------|---------|----------------|----------|--------------|-------------|
| `avatar` | `avatar` | `['image/*']` | 2MB | `1:1` | "Cambiar avatar" |
| `image` | `default` | `['image/*']` | 5MB | `16:9` | "Actualizar imagen" |
| `video` | `default` | `['video/*']` | 5MB | `16:9` | "Actualizar video" |

## 🎨 Interfaz MultimediaUpdater

El componente `MultimediaUpdater` tiene una interfaz simplificada:

- **Botón siempre visible**: Icono de upload que abre el selector de archivos
- **Área clickeable**: El contenedor de preview también abre el selector al hacer click
- **Label opcional**: Texto descriptivo debajo del botón (configurable con `labelText`)
- **Callback automático**: `onFileChange` se ejecuta cuando se selecciona un archivo

```tsx
<MultimediaUpdater
  currentUrl={user.avatarUrl}
  onFileChange={(file) => {
    // Se ejecuta automáticamente al seleccionar archivo
    console.log('Archivo seleccionado:', file);
  }}
  labelText="Haz click en la imagen para cambiarla" // Opcional
/>
```

## 📤 Manejo del Submit

Los archivos multimedia se almacenan en campos con sufijo `File`:

```tsx
const handleSubmit = async (values: Record<string, any>) => {
  // Subir archivos multimedia
  if (values.avatarFile) {
    const result = await uploadAvatar(values.avatarFile);
    values.avatar = result.url;
  }

  // Actualizar entidad
  await updateEntity(entityId, values);
};
```

## 🎨 Ejemplos de Uso

### Formulario de Usuario
```tsx
const userFields: BaseUpdateFormField[] = [
  { name: 'username', label: 'Usuario', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  {
    name: 'avatar',
    label: 'Avatar',
    type: 'avatar',
    currentUrl: user.avatarUrl,
    labelText: 'Haz click en la imagen para cambiarla', // Opcional
  },
];
```

### Formulario de Propiedad
```tsx
const propertyFields: BaseUpdateFormField[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  {
    name: 'coverImage',
    label: 'Imagen principal',
    type: 'image',
    currentUrl: property.coverImageUrl,
    aspectRatio: '16:9',
    maxSize: 10,
  },
  {
    name: 'virtualTour',
    label: 'Tour virtual',
    type: 'video',
    currentUrl: property.videoUrl,
    maxSize: 100,
  },
];
```

## 📚 Referencias

- `UpdateBaseFormMultimediaExample.tsx` - Ejemplos completos
- `app/users/administrators/` - Uso en administración
- `app/properties/` - Uso en propiedades