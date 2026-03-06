# Integración de Image Optimization - Multimedia Module

## 📝 Resumen de Cambios (Fase 2)

El sistema de optimización de imágenes está completamente integrado en el flujo de upload existente del módulo Multimedia.

### 🔄 Flujo de Upload Actualizado

```
@Post('upload')
    ↓
MultimediaUploadController.uploadFile()
    ↓
MultimediaStorageService.uploadFile()
    ├─ Verificar si es imagen + R2 + tipo optimizable
    │
    ├─ SI: Usar ImageOptimizationService
    │   ├─ Procesar imagen con Sharp (compresión + variantes)
    │   ├─ Subir original + 8 variantes a R2
    │   ├─ Guardar metadata enriquecida en DB
    │   └─ Retornar Multimedia con compressedSize, compressionRatio, variants
    │
    └─ NO: Usar flujo estándar (upload directo)
        └─ Retornar Multimedia básico
```

## 🛠️ Cambios Implementados

### 1. **MultimediaStorageService** - Actualizado

**Métodos nuevos:**
- `mapToEntityType()` - Mapea MultimediaType a EntityType para optimización

**Métodos modificados:**
- `uploadFile()` - Ahora incluye lógica de optimización
  - Detecta si es imagen en R2 con tipo optimizable
  - Llama a `ImageOptimizationService.processAndUpload()`
  - Guarda metadata enriquecida: `originalSize`, `compressedSize`, `compressionRatio`, `width`, `height`
  - Fallback automático a flujo estándar si la optimización falla

- `deleteFile()` - Ahora elimina variantes
  - Llama a `ImageOptimizationService.deleteVariants()` si existen
  - Luego elimina archivo original y registro DB

### 2. **Multimedia Entity** - Extendida

```typescript
// Nuevos campos (nullable para compatibilidad con existentes)
originalSize?: number;        // Tamaño antes de compresión
compressedSize?: number;      // Tamaño después de compresión
compressionRatio?: number;    // Porcentaje ahorrado (0-100)
width?: number;               // Ancho imagen
height?: number;              // Alto imagen
variants?: MultimediaVariant[]; // Relación OneToMany
```

### 3. **Multimedia Module** - Actualizado

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia, MultimediaVariant]), // ← Agregado MultimediaVariant
    ConfigModule,
  ],
  // ...
})
```

### 4. **App Module** - Registración Global

```typescript
@Module({
  imports: [
    // ...
    MediaOptimizationModule, // ← Global, exporta ImageOptimizationService
    // ...
  ],
})
```

## 📊 Tipos Optimizables Automáticamente

| MultimediaType | EntityType | Variantes | Formatos |
|---|---|---|---|
| AGENT_IMG | avatar | 3 | WebP + JPEG |
| STAFF | avatar | 3 | WebP + JPEG |
| PROPERTY_IMG | property | 4 | WebP + JPEG |
| SLIDE | slider | 4 | WebP + JPEG |
| TESTIMONIAL_IMG | testimonial | 3 | WebP + JPEG |

**Tipos NO optimizables (flujo estándar):**
- DNI_FRONT, DNI_REAR (documentos)
- LOGO, PARTNERSHIP (branding)
- PROPERTY_VIDEO (videos)
- DOCUMENT (archivos genéricos)

## ⚙️ Configuración Requerida

### 1. **R2 habilitado**

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### 2. **Sharp instalado**

```bash
npm install sharp @aws-sdk/client-s3
```

### 3. **Base de datos migrada**

```bash
npm run seed:reset  # Ejecuta migraciones automáticamente
```

## 📈 Beneficios de la Integración

### Para Users de Fotos

```
Upload imagen 2.5MB
         ↓
ImageOptimization procesa:
  - Compresión: 2.5MB → 312.5KB (87.5% reducción)
  - 8 variantes generadas (4 tamaños × 2 formatos)
  - Todas subidas a R2 en paralelo
  - Original + metadata guardados en DB
         ↓
Retorna: Multimedia + compressionRatio + variants
```

### Para Queries de BD

```typescript
// Obtener imagen con todas sus variantes
const multimedia = await multimediaRepository.findOne({
  where: { id },
  relations: ['variants'],
});

// Acceso a variantes específicas
const thumbnail = multimedia.variants.find(
  v => v.variantType === 'THUMBNAIL_MD' && v.format === 'webp'
);
console.log(thumbnail.url); // URL pública en R2
```

### Para Frontend

**Lazy loading con variantes:**

```tsx
// Los componentes pueden ahora usar variants para srcset
<img
  srcSet={`
    ${getDomain(thumbnail_sm)} 320w,
    ${getDomain(thumbnail_md)} 640w,
    ${getDomain(thumbnail_lg)} 1280w
  `}
  sizes="(max-width: 768px) 320px, (max-width: 1024px) 640px, 1280px"
  alt={alt}
/>
```

## 🧪 Testing

### 1. **Upload de Property Image**

```bash
curl -X POST http://localhost:3000/multimedia/upload \
  -F "file=@test-image.jpg" \
  -F "type=PROPERTY_IMG"
```

**Respuesta esperada:**
```json
{
  "id": "uuid",
  "url": "https://pub-xxx.r2.dev/properties/img/property_20260305_ABCD1234_original.jpg",
  "filename": "property_20260305_ABCD1234.jpg",
  "fileSize": 312500,
  "type": "PROPERTY_IMG"
}
```

**En BD (verifica con adminer):**
- `multimedia.originalSize = 2560000`
- `multimedia.compressedSize = 312500`
- `multimedia.compressionRatio = 87.8`
- `multimedia.width = 2048`
- `multimedia.height = 1536`
- `multimedia.variants = [8 registros]`

### 2. **Verificar variantes en DB**

```sql
SELECT v.variantType, v.format, v.width, v.height, v.size, v.url
FROM multimedia_variants v
WHERE v.multimediaId = 'uuid'
ORDER BY v.variantType, v.format;
```

**Salida esperada:**
```
THUMBNAIL_MD | webp  | 640  | 480  | 45678  | https://...THUMBNAIL_MD.webp
THUMBNAIL_MD | jpeg  | 640  | 480  | 67890  | https://...THUMBNAIL_MD.jpeg
THUMBNAIL_LG | webp  | 1280 | 720 | 123456 | https://...THUMBNAIL_LG.webp
...
```

### 3. **Verificar en R2**

Todos los archivos deben estar bajo `properties/img/`:
```
properties/img/
├── property_20260305_ABCD1234_original.jpg (comprimido)
├── property_20260305_ABCD1234_THUMBNAIL_SM.webp
├── property_20260305_ABCD1234_THUMBNAIL_SM.jpeg
├── property_20260305_ABCD1234_THUMBNAIL_MD.webp
├── property_20260305_ABCD1234_THUMBNAIL_MD.jpeg
├── property_20260305_ABCD1234_THUMBNAIL_LG.webp
├── property_20260305_ABCD1234_THUMBNAIL_LG.jpeg
├── property_20260305_ABCD1234_FULL.webp
└── property_20260305_ABCD1234_FULL.jpeg
```

## 🔍 Logs Esperados

```
[MultimediaUploadController] File received: image.jpg 2560000
[MultimediaStorageService] [uploadFile] provider=r2 path=properties/img/property_... size=2560000 optimize=true
🎨 Processing image for property:property_20260305_ABCD1234_XXXXXX - Size: 2500.00KB
  ✅ Created THUMBNAIL_SM.webp - 320x240 - 12.45KB
  ✅ Created THUMBNAIL_SM.jpeg - 320x240 - 18.23KB
  ✅ Created THUMBNAIL_MD.webp - 640x480 - 45.67KB
  ✅ Created THUMBNAIL_MD.jpeg - 640x480 - 67.89KB
  ✅ Created THUMBNAIL_LG.webp - 1280x720 - 123.45KB
  ✅ Created THUMBNAIL_LG.jpeg - 1280x720 - 189.34KB
  ✅ Created FULL.webp - 2048x1536 - 356.78KB
  ✅ Created FULL.jpeg - 2048x1536 - 534.12KB
✅ Image processed in 1234ms - Compression: 87.5% - Variants: 8
✅ Image optimized: property_20260305_ABCD1234.jpg | Compression: 87.5% | Variants: 8
```

## ❌ Manejo de Errores

Si la optimización falla por cualquier razón:

```
⚠️ Image optimization failed, using standard upload: [reason]
```

El sistema automáticamente vuelve al flujo estándar sin causar error al usuario.

## 🚀 Próximos Pasos (Fase 3 Frontend)

1. **LazyImage Component** - Usar variantes con srcset
2. **PropertyCard** - Actualizar para usar THUMBNAIL_MD
3. **BlogCard** - Usar OG_IMAGE para SEO
4. **AvatarComponent** - Usar AVATAR_MD
5. **E2E Tests** - Validar upload y lazy loading

## 📚 Archivos Modificados

```
backend/
├── src/
│   ├── app.module.ts (agregó MediaOptimizationModule)
│   ├── modules/
│   │   ├── multimedia/
│   │   │   ├── multimedia.module.ts (agregó MultimediaVariant)
│   │   │   ├── domain/multimedia.entity.ts (nuevos campos)
│   │   │   └── infrastructure/storage/multimedia-storage.service.ts (integración)
│   │   └── media-optimization/ (completamente nuevo)
│   └── database/migrations/
│       └── 1735000000000-AddMultimediaOptimization.ts
└── package.json (sharp instalado)
```

## 🎯 Status

✅ Backend base completo
✅ Integración en endpoints
✅ Migrations creadas
✅ Compilación sin errores
⏳ Frontend: Próximo sprint
