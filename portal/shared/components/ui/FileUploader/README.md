# MultimediaUploader Component

Componente avanzado para subir multimedia (imágenes y videos) con vista previa, eliminación individual y gestión de archivos múltiples. Ideal para formularios que requieren carga de archivos multimedia con feedback visual inmediato.

## 🚀 Características Principales

- ✅ **Vista Previa**: Muestra thumbnails de las imágenes seleccionadas
- ✅ **Múltiples Archivos**: Soporte para selección múltiple con límite configurable
- ✅ **Eliminación Individual**: Botón para remover imágenes específicas
- ✅ **Validación de Duplicados**: Evita archivos duplicados por nombre y tamaño
- ✅ **Responsive**: Grid adaptativo para diferentes tamaños de pantalla
- ✅ **TypeScript**: Completamente tipado
- ✅ **Accesibilidad**: Labels y ARIA attributes apropiados
- ✅ **Feedback Visual**: Indicador de ruta de subida

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';
```

## 🎯 Uso Básico

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';

export default function BasicImageUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    console.log('Archivos seleccionados:', files);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Subir Multimedia del Producto</h2>

      <MultimediaUploader
        uploadPath="/api/products/images"
        onChange={handleFilesChange}
        label="Selecciona multimedia del producto"
        maxFiles={5}
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium">Archivos seleccionados: {uploadedFiles.length}</h3>
          <ul className="mt-2 text-sm text-gray-600">
            {uploadedFiles.map((file, index) => (
              <li key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## 🔧 API Reference

### Props del MultimediaUploader

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `uploadPath` | `string` | - | Ruta del backend donde se guardarán los archivos |
| `onChange` | `(files: File[]) => void` | - | Callback que se ejecuta cuando cambian los archivos |
| `label` | `string` | `"Selecciona imágenes"` | Texto del label del input |
| `accept` | `string` | `"image/*"` | Tipos de archivo aceptados (atributo accept del input) |
| `maxFiles` | `number` | `5` | Número máximo de archivos permitidos |

## 🎯 Casos de Uso Comunes

### Subida de Avatar de Usuario

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';

export default function UserAvatarUpload() {
  const [avatarFile, setAvatarFile] = useState<File[]>([]);

  const handleAvatarChange = (files: File[]) => {
    setAvatarFile(files);
    console.log('Avatar seleccionado:', files[0]);
  };

  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Subir Avatar</h2>

      <MultimediaUploader
        uploadPath="/api/user/avatar"
        onChange={handleAvatarChange}
        label="Selecciona tu foto de perfil"
        variant="avatar"
        accept="image/*"
        maxFiles={1}
        maxSize={2}
      />

      {avatarFile.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-green-600">
            ✓ Avatar seleccionado: {avatarFile[0].name}
          </p>
        </div>
      )}
    </div>
  );
}
```

### Formulario de Perfil de Usuario

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';
import { Button } from '@/components/Button';

export default function UserProfileForm() {
  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagesChange = (files: File[]) => {
    setProfileImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      profileImages.forEach((file, index) => {
        formData.append(`profile_image_${index}`, file);
      });

      const response = await fetch('/api/user/profile/images', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Multimedia de perfil actualizada exitosamente');
        setProfileImages([]);
      }
    } catch (error) {
      console.error('Error al subir multimedia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Actualizar Perfil</h2>
        <p className="text-gray-600">Sube hasta 3 archivos multimedia para tu perfil</p>
      </div>

      <MultimediaUploader
        uploadPath="/api/user/profile/images"
        onChange={handleImagesChange}
        label="Multimedia de perfil"
        maxFiles={3}
        accept="image/jpeg,image/png,image/webp"
      />

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          disabled={profileImages.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={() => setProfileImages([])}
          disabled={profileImages.length === 0}
        >
          Limpiar
        </Button>
      </div>
    </form>
  );
}
```

### Galería de Imágenes de Producto

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

export default function ProductGalleryForm() {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    images: [] as File[],
  });

  const handleImagesChange = (files: File[]) => {
    setProductData(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);

    productData.images.forEach((file, index) => {
      formData.append(`image_${index}`, file);
    });

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Producto creado exitosamente');
        setProductData({ name: '', description: '', images: [] });
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Producto</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TextField
            label="Nombre del Producto"
            value={productData.name}
            onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <TextField
            label="Descripción"
            value={productData.description}
            onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={4}
          />
        </div>

        <div>
          <MultimediaUploader
            uploadPath="/api/products/images"
            onChange={handleImagesChange}
            label="Multimedia del producto (máximo 8)"
            maxFiles={8}
            accept="image/jpeg,image/png,image/webp,image/gif"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" variant="primary" disabled={!productData.name || productData.images.length === 0}>
          Crear Producto
        </Button>
      </div>
    </form>
  );
}
```

### Subida de Documentos con Imágenes

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';

interface DocumentWithImages {
  title: string;
  images: File[];
}

export default function DocumentScanner() {
  const [documents, setDocuments] = useState<DocumentWithImages[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocumentWithImages>({
    title: '',
    images: [],
  });

  const handleImagesChange = (files: File[]) => {
    setCurrentDoc(prev => ({ ...prev, images: files }));
  };

  const addDocument = () => {
    if (currentDoc.title && currentDoc.images.length > 0) {
      setDocuments(prev => [...prev, currentDoc]);
      setCurrentDoc({ title: '', images: [] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Escáner de Documentos</h1>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo Documento</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título del documento"
            value={currentDoc.title}
            onChange={(e) => setCurrentDoc(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <MultimediaUploader
            uploadPath="/api/documents/scan"
            onChange={handleImagesChange}
            label="Escanear páginas del documento"
            maxFiles={20}
            accept="image/jpeg,image/png,image/tiff"
          />

          <button
            onClick={addDocument}
            disabled={!currentDoc.title || currentDoc.images.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Agregar Documento
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Documentos Agregados ({documents.length})</h2>

        {documents.map((doc, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium">{doc.title}</h3>
            <p className="text-sm text-gray-600">{doc.images.length} páginas</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Subida con Validación de Tamaño

```tsx
import React, { useState } from 'react';
import MultimediaUploader from '@/components/FileUploader/MultimediaUploader';

export default function ValidatedImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = (selectedFiles: File[]) => {
    const newErrors: string[] = [];
    const maxSizeInMB = 5;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    selectedFiles.forEach((file, index) => {
      // Validar tamaño
      if (file.size > maxSizeInMB * 1024 * 1024) {
        newErrors.push(`${file.name}: El archivo es demasiado grande (máx. ${maxSizeInMB}MB)`);
      }

      // Validar tipo
      if (!allowedTypes.includes(file.type)) {
        newErrors.push(`${file.name}: Tipo de archivo no permitido. Solo JPG, PNG, WebP`);
      }

      // Validar dimensiones (requiere FileReader)
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          newErrors.push(`${file.name}: La imagen es demasiado pequeña (mín. 100x100px)`);
        }
      };
      img.src = URL.createObjectURL(file);
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFilesChange = (selectedFiles: File[]) => {
    if (validateFiles(selectedFiles)) {
      setFiles(selectedFiles);
    } else {
      // Si hay errores, no actualizar el estado
      setFiles([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Subir Multimedia con Validación</h2>

      <MultimediaUploader
        uploadPath="/api/validated-images"
        onChange={handleFilesChange}
        label="Selecciona archivos multimedia (JPG, PNG, WebP - máx. 5MB cada uno)"
        maxFiles={10}
        accept="image/jpeg,image/png,image/webp"
      />

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && errors.length === 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-medium">
            ✓ {files.length} archivo{files.length !== 1 ? 's' : ''} validado{files.length !== 1 ? 's' : ''}
          </h3>
        </div>
      )}
    </div>
  );
}
```

## 🎨 Personalización

### Estilos Personalizados

```tsx
// Personalizar el grid de previews
<FileImageUploader
  uploadPath="/api/images"
  onChange={handleFilesChange}
  maxFiles={6}
  className="custom-uploader"
/>

// En tu CSS
.custom-uploader .grid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.custom-uploader img {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Tema Oscuro

```tsx
// Para tema oscuro, el componente usa variables CSS
<div className="dark">
  <FileImageUploader
    uploadPath="/api/images"
    onChange={handleFilesChange}
    label="Selecciona imágenes (modo oscuro)"
  />
</div>

// Las variables CSS se adaptan automáticamente:
// --color-background, --color-text, etc.
```

## 📱 Responsive Design

El componente es completamente responsive:

```tsx
// El grid se adapta automáticamente:
// - 1 columna en móviles (grid-cols-1)
// - 2 columnas en tablets pequeñas (sm:grid-cols-2)
// - 3 columnas en tablets grandes (md:grid-cols-3)
// - 4 columnas en desktop (lg:grid-cols-4)

// Para personalizar el responsive
<FileImageUploader
  uploadPath="/api/images"
  onChange={handleFilesChange}
  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
/>
```

## 🎯 Mejores Prácticas

### 1. Manejo de Memoria (URLs de Object)

```tsx
// ✅ Bien - limpiar URLs de object cuando el componente se desmonta
useEffect(() => {
  return () => {
    // Limpiar URLs de object para evitar memory leaks
    previews.forEach(url => URL.revokeObjectURL(url));
  };
}, [previews]);
```

### 2. Validación del Lado del Cliente

```tsx
// ✅ Bien - validar antes de enviar al servidor
const validateAndUpload = async (files: File[]) => {
  const errors = [];

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push(`${file.name} es demasiado grande`);
    }
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name} no es una imagen válida`);
    }
  }

  if (errors.length > 0) {
    setErrors(errors);
    return;
  }

  // Proceder con la subida
  await uploadFiles(files);
};
```

### 3. Feedback de Progreso

```tsx
// ✅ Bien - mostrar progreso de subida
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

const uploadWithProgress = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`file_${index}`, file);
  });

  const xhr = new XMLHttpRequest();

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      setUploadProgress(prev => ({ ...prev, all: percentComplete }));
    }
  };

  // ... resto de la lógica de subida
};
```

### 4. Accesibilidad

```tsx
// ✅ Bien - labels descriptivos y navegación por teclado
<FileImageUploader
  uploadPath="/api/images"
  onChange={handleFilesChange}
  label="Subir fotos de perfil (máximo 3 imágenes, formato JPG o PNG)"
  accept="image/jpeg,image/png"
  maxFiles={3}
/>

// El componente incluye:
// - aria-label en botones de eliminación
// - Labels apropiados para inputs
// - Navegación por teclado funcional
```

## 🐛 Solución de Problemas

### Problema: Las imágenes no se muestran en la preview

```tsx
// Asegúrate de que los archivos sean imágenes válidas
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  // Filtrar solo imágenes
  const imageFiles = files.filter(file => file.type.startsWith('image/'));

  if (imageFiles.length !== files.length) {
    alert('Solo se permiten archivos de imagen');
  }

  setFiles(imageFiles);
  setPreviews(imageFiles.map(file => URL.createObjectURL(file)));
};
```

### Problema: Memory leaks con URLs de object

```tsx
// ✅ Solución - limpiar URLs cuando cambian los archivos
useEffect(() => {
  // Limpiar URLs anteriores
  previews.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });

  // Crear nuevas URLs
  const newPreviews = files.map(file => URL.createObjectURL(file));
  setPreviews(newPreviews);

  // Limpiar al desmontar
  return () => {
    newPreviews.forEach(url => URL.revokeObjectURL(url));
  };
}, [files]);
```

### Problema: El input no se resetea después de eliminar archivos

```tsx
// El componente ya maneja esto automáticamente
// Pero si necesitas control manual:
const handleRemove = (index: number) => {
  const newFiles = files.filter((_, i) => i !== index);
  setFiles(newFiles);

  // Limpiar el input para permitir volver a seleccionar el mismo archivo
  if (inputRef.current) {
    inputRef.current.value = '';
  }
};
```

### Problema: Archivos duplicados no se filtran correctamente

```tsx
// Usar una combinación de nombre y tamaño para identificar duplicados
const uniqueFiles = Array.from(
  new Map(
    allFiles.map(f => [`${f.name}_${f.size}_${f.lastModified}`, f])
  ).values()
);
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/FileUploader/page.tsx` - Showcase completo con diferentes configuraciones
- `app/components/BaseForm/` - Ejemplos de uso en formularios complejos

## 🤝 Contribución

Para contribuir al componente MultimediaUploader:

1. Mantén la compatibilidad con la API existente
2. Agrega validaciones adicionales manteniendo la simplicidad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que el manejo de memoria sea eficiente (URLs de object)
6. Prueba el componente con diferentes tipos y tamaños de archivo

---

# MultimediaUpdater Component

Componente reutilizable para actualizar multimedia existente (imágenes y videos) con vista previa, selección de archivos, validación y soporte para drag & drop. Perfecto para formularios de edición donde necesitas mostrar el contenido actual y permitir actualizaciones.

## 🚀 Características Principales

- ✅ **Vista Previa**: Muestra la multimedia actual (imagen/video) antes de actualizar
- ✅ **Selección de Archivos**: Botón para seleccionar nuevos archivos con validación
- ✅ **Validación Completa**: Tipo de archivo, tamaño máximo y formato
- ✅ **Soporte Drag & Drop**: Opcional, arrastra archivos directamente al componente
- ✅ **Variante Avatar**: Estilo especial para avatares de usuario (como AdminCard)
- ✅ **Reset Opcional**: Botón para restaurar la multimedia original
- ✅ **Aspect Ratio**: Soporte para diferentes proporciones (1:1, 16:9, 9:16)
- ✅ **TypeScript**: Completamente tipado con interfaces dedicadas
- ✅ **Responsive**: Se adapta a diferentes tamaños de pantalla

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import MultimediaUpdater from '@/components/FileUploader/MultimediaUpdater';
```

## 🎯 Uso Básico

```tsx
import React, { useState } from 'react';
import MultimediaUpdater from '@/components/FileUploader/MultimediaUpdater';

export default function ProfileUpdate() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    console.log('Archivo seleccionado:', file);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Actualizar Foto de Perfil</h2>

      <MultimediaUpdater
        currentUrl="https://example.com/current-avatar.jpg"
        currentType="image"
        onFileChange={handleFileChange}
        buttonText="Cambiar foto"
        acceptedTypes={['image/*']}
        maxSize={2}
        variant="avatar"
        showReset={true}
      />

      {selectedFile && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✓ Nuevo archivo seleccionado: {selectedFile.name}
          </p>
        </div>
      )}
    </div>
  );
}
```

## 🔧 API Reference

### Props del MultimediaUpdater

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `currentUrl` | `string` | - | URL de la multimedia actual a mostrar |
| `currentType` | `'image' \| 'video'` | - | Tipo de la multimedia actual |
| `onFileChange` | `(file: File \| null) => void` | - | Callback cuando cambia el archivo seleccionado |
| `buttonText` | `string` | `"Actualizar multimedia"` | Texto del botón de selección |
| `acceptedTypes` | `string[]` | `['image/*', 'video/*']` | Tipos MIME aceptados |
| `maxSize` | `number` | `5` | Tamaño máximo en MB |
| `aspectRatio` | `'1:1' \| '16:9' \| '9:16'` | `'1:1'` | Proporción del contenedor de preview |
| `variant` | `'default' \| 'avatar'` | `'default'` | Estilo visual (avatar usa border-4 border-secondary rounded-full) |
| `showReset` | `boolean` | `false` | Mostrar botón de reset para restaurar original |
| `allowDragDrop` | `boolean` | `false` | Habilitar arrastrar y soltar archivos |
| `className` | `string` | `''` | Clases CSS adicionales |

## 🎯 Casos de Uso Comunes

### Actualización de Avatar de Usuario

```tsx
import React, { useState } from 'react';
import MultimediaUpdater from '@/components/FileUploader/MultimediaUpdater';
import { Button } from '@/components/Button';

export default function UserAvatarUpdate() {
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarChange = (file: File | null) => {
    setNewAvatar(file);
  };

  const handleUpdate = async () => {
    if (!newAvatar) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('avatar', newAvatar);

      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Avatar actualizado exitosamente');
        setNewAvatar(null);
        // Recargar la página o actualizar el estado global
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h2 className="text-lg font-semibold text-center">Cambiar Avatar</h2>

      <MultimediaUpdater
        currentUrl="/api/user/current-avatar"
        currentType="image"
        onFileChange={handleAvatarChange}
        buttonText="Seleccionar nueva foto"
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
        maxSize={1}
        variant="avatar"
        showReset={true}
      />

      <Button
        variant="primary"
        onClick={handleUpdate}
        disabled={!newAvatar || isUpdating}
        className="w-full"
      >
        {isUpdating ? 'Actualizando...' : 'Actualizar Avatar'}
      </Button>
    </div>
  );
}
```

### Edición de Video de Producto

```tsx
import React, { useState } from 'react';
import MultimediaUpdater from '@/components/FileUploader/MultimediaUpdater';

interface ProductVideoUpdateProps {
  productId: string;
  currentVideoUrl?: string;
}

export default function ProductVideoUpdate({ productId, currentVideoUrl }: ProductVideoUpdateProps) {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const handleVideoChange = (file: File | null) => {
    setSelectedVideo(file);
  };

  const handleSave = async () => {
    if (!selectedVideo) return;

    const formData = new FormData();
    formData.append('video', selectedVideo);
    formData.append('productId', productId);

    try {
      const response = await fetch('/api/products/video', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Video actualizado exitosamente');
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error al actualizar video:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Video del Producto</h3>

      <MultimediaUpdater
        currentUrl={currentVideoUrl}
        currentType="video"
        onFileChange={handleVideoChange}
        buttonText="Cambiar video del producto"
        acceptedTypes={['video/mp4', 'video/webm', 'video/ogg']}
        maxSize={50}
        aspectRatio="16:9"
        allowDragDrop={true}
      />

      {selectedVideo && (
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
          <Button variant="outlined" onClick={() => setSelectedVideo(null)}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/FileUploader/MultimediaUpdaterExample.tsx` - Showcase completo con diferentes configuraciones
- `app/components/BaseForm/` - Ejemplos de integración con formularios
- `app//users/administrators/` - Uso en formularios de administración

## 🤝 Contribución

Para contribuir al componente MultimediaUpdater:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas validaciones manteniendo la simplicidad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que el manejo de memoria sea eficiente (URLs de object)
6. Prueba el componente con diferentes tipos y tamaños de archivo
7. Verifica la accesibilidad con herramientas como WAVE o axe