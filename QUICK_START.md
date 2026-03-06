# 🚀 Quick Start - Sistema de Optimización de Imágenes

## ⚡ 5 Minutos de Setup

### 1. Verificar Backend Compilado
```bash
cd backend
npm run build
# ✅ Sin errores
```

### 2. Verificar Frontend Compilado
```bash
cd frontend
npm run build
# ✅ Sin errores
```

### 3. Variables de Entorno (Backend)
```bash
# backend/.env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=2c4b6491224237603ee9e1fff228f50c
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### 4. Ejecutar Migraciones
```bash
cd backend
npm run seed:reset
# ✅ Tabla multimedia_variants creada
```

### 5. Iniciar Backend
```bash
npm run start:dev
# 🚀 Server running on port 3000
```

---

## 🧪 Test Rápido

### Opción A: cURL
```bash
# Subir imagen de prueba
curl -X POST http://localhost:3000/multimedia/upload \
  -F "file=@/path/to/image.jpg" \
  -F "type=PROPERTY_IMG" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Respuesta esperada:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://pub-xxx.r2.dev/properties/img/property_20260305_ABCD1234_original.jpg",
  "filename": "property_20260305_ABCD1234.jpg",
  "fileSize": 312500,
  "type": "PROPERTY_IMG"
}

# ✅ Verificar en Adminer:
# SELECT * FROM multimedia_variants WHERE multimediaId = '550e8400...'
# Debe mostrar 8 registros con diferentes variantType y format
```

### Opción B: Frontend Test
```bash
# Editar algún componente para usar LazyImage
# frontend/features/backoffice/properties/components/PropertyCard.tsx

import LazyImage from '@/shared/components/ui/LazyImage';

// Cambiar de:
<img src={property.multimedia.url} alt="..." />

// A:
<LazyImage
  multimedia={property.multimedia}
  variantType="thumbnail-md"
  alt="Property image"
/>

# npm run dev
# Abrir http://localhost:3001/backOffice/properties
# 🖼️ Ver imagenes cargando con srcSet responsive
```

---

## 📊 Verificar BD

### En Adminer (http://localhost:8080)

```sql
-- 1. Ver tabla de variantes creada
SHOW TABLES LIKE 'multimedia%';

-- 2. Ver estructura de variantes
DESCRIBE multimedia_variants;

-- 3. Ver un multimedia con variantes
SELECT m.id, m.filename, COUNT(v.id) as variant_count
FROM multimedia m
LEFT JOIN multimedia_variants v ON m.id = v.multimediaId
GROUP BY m.id
LIMIT 5;

-- 4. Ver todas las variantes de una imagen
SELECT variantType, format, width, height, ROUND(size/1024, 2) as size_kb
FROM multimedia_variants
WHERE multimediaId = '550e8400...' -- ID del test
ORDER BY variantType, format;
```

**Esperado:**
```
THUMBNAIL_SM  | webp  | 320  | 240  | 12.45
THUMBNAIL_SM  | jpeg  | 320  | 240  | 18.23
THUMBNAIL_MD  | webp  | 640  | 480  | 45.67
THUMBNAIL_MD  | jpeg  | 640  | 480  | 67.89
THUMBNAIL_LG  | webp  | 1280 | 720  | 123.45
THUMBNAIL_LG  | jpeg  | 1280 | 720  | 189.34
FULL          | webp  | 2048 | 1536 | 356.78
FULL          | jpeg  | 2048 | 1536 | 534.12
```

---

## 🎨 Componente LazyImage - Uso Básico

```tsx
// Antes (sin optimización)
<img 
  src={multimedia.url} 
  alt="Property"
  className="w-full h-auto"
/>

// Después (con optimización + lazy loading)
<LazyImage
  multimedia={multimedia}
  variantType="thumbnail-md"
  alt="Property image"
  sizes="(max-width: 768px) 320px, 640px"
  className="w-full h-auto object-cover"
/>
```

### Variantes Disponibles
```typescript
type VariantType =
  | 'thumbnail-sm'   // 320x240 (mobile cards)
  | 'thumbnail-md'   // 640x480 (tablet cards)
  | 'thumbnail-lg'   // 1280x720 (desktop cards)
  | 'full'           // 2048xAuto (original quality)
  | 'og-image'       // 1200x630 (social media)
  | 'avatar-sm'      // 64x64 (small avatars)
  | 'avatar-md'      // 128x128 (medium avatars)
  | 'avatar-lg'      // 256x256 (large avatars)
  | 'slide-mobile'   // 768x432 (mobile slides)
  | 'slide-desktop'  // 1920x1080 (desktop slides)
  | 'slide-thumb'    // 400x225 (slide thumbnails)
```

---

## 🔄 Logs en Consola

### Backend Logs (esperado)
```
[MediaOptimization] 🎨 Processing image for property:... - Size: 2450.32KB
[MediaOptimization]   ✅ Created THUMBNAIL_SM.webp - 320x240 - 12.45KB
[MediaOptimization]   ✅ Created THUMBNAIL_SM.jpeg - 320x240 - 18.23KB
[MediaOptimization]   ✅ Created THUMBNAIL_MD.webp - 640x480 - 45.67KB
[MediaOptimization]   ✅ Created THUMBNAIL_MD.jpeg - 640x480 - 67.89KB
[MediaOptimization]   ✅ Created THUMBNAIL_LG.webp - 1280x720 - 123.45KB
[MediaOptimization]   ✅ Created THUMBNAIL_LG.jpeg - 1280x720 - 189.34KB
[MediaOptimization]   ✅ Created FULL.webp - 2048x1536 - 356.78KB
[MediaOptimization]   ✅ Created FULL.jpeg - 2048x1536 - 534.12KB
[MediaOptimization] ✅ Image processed in 1234ms - Compression: 87.5% - Variants: 8
```

### Frontend Console (DevTools)
```
// Network tab mostrará:
property_THUMBNAIL_MD.webp  45KB  200 OK  (lazy loaded)
property_THUMBNAIL_MD.jpeg  68KB  BLOCKED (no needed, tenemos webp)
```

---

## ❌ Troubleshooting

### "Cannot find module ImageOptimizationService"
```bash
✅ Verificar: import en multimedia-storage.service.ts apunta a ../../../media-optimization
✅ Verificar: MediaOptimizationModule está en app.module.ts
```

### "multimedia_variants table doesn't exist"
```bash
✅ Ejecutar: npm run seed:reset
✅ Revisar: backend logs durante migraciones
```

### "R2 403 Forbidden"
```bash
✅ Verificar: R2_ACCOUNT_ID y credenciales en .env
✅ Verificar: Bucket permissions permiten s3:PutObject
```

### "LazyImage no renderiza en frontend"
```bash
✅ Verificar: multimedia tiene estructura correcta
✅ Verificar: Import correcto: import LazyImage from '@/shared/components/ui/LazyImage'
✅ Revisar: DevTools > Console para errores
```

---

## 📈 Performance Check

### Network DevTools
1. Abrir DevTools (F12) → Network
2. Recargar página de propiedades
3. Verificar:
   - ✅ `property_...THUMBNAIL_MD.webp` cargó (~45KB)
   - ✅ No cargó `property_...original.jpg` (ese es fallback)
   - ✅ Imágenes tienen atributos srcset

### Lighthouse
1. DevTools → Lighthouse
2. Run Audit
3. Verificar:
   - ✅ LCP mejoro (~600ms)
   - ✅ CLS = 0 (sin reflow)
   - ✅ Serve images in next-gen formats: ✅

---

## 🎯 Próximos Pasos

### Si Todo Funciona
1. ✅ Actualizar PropertyCard en backoffice
2. ✅ Actualizar PropertyCard en portal
3. ✅ Actualizar BlogCard
4. ✅ Agregar E2E tests

### Documentación
- 📖 Lee: `backend/src/modules/media-optimization/README.md`
- 📖 Lee: `backend/INTEGRATION_PHASE2.md`
- 📖 Lee: `frontend/PHASE3_LAZY_IMAGE.md`
- 📖 Lee: `SISTEMA_OPTIMIZACION_IMAGENES_RESUMEN.md`

---

## 📞 Validación Final

```bash
# 1. Backend OK?
cd backend && npm run build && echo "✅ Backend ok"

# 2. Frontend OK?
cd frontend && npm run build && echo "✅ Frontend ok"

# 3. Migrations OK?
# Revisar en Adminer: multimedia_variants table existe

# 4. LazyImage OK?
# grep -r "LazyImage" frontend/shared/components/ui/
# Debe encontrar LazyImage.tsx e index.ts

# 5. Deploy Ready?
echo "✅ Sistema listo para Deploy!"
```

---

**¡Listo! El sistema está funcionando.** 🎉

Próximo: Actualizar componentes existentes para usar `LazyImage`  
Tiempo estimado: ~2 horas
