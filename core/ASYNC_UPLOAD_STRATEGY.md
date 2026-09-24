# 🚀 Async Upload Strategy - Plan de Implementación

## 📋 Problema Actual

- **Timeout en Render**: 60 segundos máximo por solicitud HTTP
- **Archivos grandes**: Sharp + R2 upload = 45-65 segundos
- **Resultado**: Conexión se corta antes de terminar

## ✅ Solución: Async Processing con Job Queue

Responder **inmediatamente** al cliente mientras se procesa en **background**.

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE SUBE ARCHIVO (5MB)                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - MULTIMEDIA UPLOAD CONTROLLER                          │
│ 1. Validar archivo ✓                                            │
│ 2. Crear job en tabla PROCESSING_JOBS                           │
│ 3. Guardar archivo TEMPORAL en disco/R2                         │
│ 4. RESPONDER AL CLIENTE INMEDIATAMENTE (<1s) ✓                  │
│    Response: { jobId: "abc123", status: "PROCESSING" }         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND - BACKGROUND WORKER (setImmediate)                      │
│ 1. Sharp: Procesar imagen + generar variantes (30-40s)         │
│ 2. R2: Subir variantes (10-15s)                                │
│ 3. Actualizar job: status = "COMPLETED", url = "..."          │
│ 4. Si error: status = "FAILED", error = "..."                  │
│ (Todo esto SIN bloquear otras solicitudes)                      │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ CLIENTE - POLLING DURANTE PROCESAMIENTO                         │
│ GET /api/jobs/:jobId → { status: "PROCESSING" }                │
│ Reintentar cada 1-2 segundos...                                │
│ GET /api/jobs/:jobId → { status: "COMPLETED", url: "..." } ✓  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estructura a Implementar

### 1. **Nueva Tabla: `ProcessingJobs`**
```typescript
CREATE TABLE processing_jobs (
  id VARCHAR(36) PRIMARY KEY,
  fileId VARCHAR(36),
  status ENUM('PROCESSING', 'COMPLETED', 'FAILED'),
  url VARCHAR(500) NULL,
  error TEXT NULL,
  fileSize INT,
  entityType VARCHAR(50), // 'property', 'avatar', 'blog', etc
  entityId VARCHAR(36),
  createdAt DATETIME,
  completedAt DATETIME NULL,
  updatedAt DATETIME
);
```

### 2. **Entity + Repository**
```typescript
// processing-job.entity.ts
@Entity('processing_jobs')
export class ProcessingJob {
  @PrimaryColumn()
  id: string;
  
  @Column()
  fileId: string;
  
  @Column({ type: 'enum', enum: ['PROCESSING', 'COMPLETED', 'FAILED'] })
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  @Column({ nullable: true })
  url: string;
  
  @Column({ nullable: true })
  error: string;
  
  // ... más campos
}

// processing-job.repository.ts (Repository Pattern)
```

### 3. **Modificar: `multimedia-upload.controller.ts`**
```typescript
@Post('upload')
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() metadata: MultimediaUploadMetadata,
  @Res() res: Response,
): Promise<void> {
  try {
    // 1. Crear job
    const job = await this.processingJobRepository.save({
      id: uuid(),
      status: 'PROCESSING',
      fileSize: file.size,
      entityType: metadata.type,
      entityId: metadata.entityId,
      createdAt: new Date(),
    });

    // 2. RESPONDER AHORA (sin esperar procesamiento)
    res.status(202).json({
      jobId: job.id,
      status: 'PROCESSING',
      message: 'Procesamiento iniciado. Verifique estado con GET /api/jobs/:jobId',
    });

    // 3. Procesar en background (no bloquea)
    setImmediate(async () => {
      try {
        const result = await this.multimediaService.uploadFileToPath(file, metadata);
        await this.processingJobRepository.update(job.id, {
          status: 'COMPLETED',
          url: result.url,
          completedAt: new Date(),
        });
      } catch (error) {
        await this.processingJobRepository.update(job.id, {
          status: 'FAILED',
          error: error.message,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### 4. **Nuevo Endpoint: `/api/jobs/:jobId`**
```typescript
@Get(':jobId')
async getJobStatus(@Param('jobId') jobId: string) {
  const job = await this.processingJobRepository.findOne(jobId);
  
  if (!job) {
    throw new NotFoundException('Job no encontrado');
  }
  
  return {
    jobId: job.id,
    status: job.status, // 'PROCESSING', 'COMPLETED', 'FAILED'
    url: job.url,
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  };
}
```

### 5. **Frontend - Polling**
```typescript
// uploadFile.ts
async function uploadFile(file: File) {
  // Upload
  const uploadRes = await fetch('/api/multimedia/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { jobId } = await uploadRes.json();
  
  // Polling
  const pollStatus = async () => {
    const jobRes = await fetch(`/api/jobs/${jobId}`);
    const job = await jobRes.json();
    
    if (job.status === 'COMPLETED') {
      console.log('✅ URL lista:', job.url);
      return job.url;
    } else if (job.status === 'FAILED') {
      throw new Error(job.error);
    } else {
      setTimeout(pollStatus, 1000); // Reintentar en 1s
    }
  };
  
  return pollStatus();
}
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Respuesta al cliente** | 45-65 segundos | **<1 segundo** ✅ |
| **Timeout de Render** | ❌ Se corta a los 60s | ✅ No se corta |
| **Procesamiento** | Bloquea solicitude | Background (no bloquea) |
| **UX** | Pantalla en blanco | Muestra estado en tiempo real |
| **Escalabilidad** | 1 solicitud = 1 worker | Múltiples uploads simultáneos |

---

## 🎯 Ventajas

✅ **Resuelve timeout inmediatamente**
✅ **Mejor UX** (feedback en tiempo real)
✅ **Escalable** (múltiples uploads sin bloqueos)
✅ **Persistencia** (estado guardado en BD)
✅ **No requiere Redis** (usa DB + setImmediate)
✅ **Compatible con Render free**

---

## 🔮 Mejoras Futuras

1. **WebSockets**: Cambiar polling por push real-time
2. **BullMQ**: Queue formal para jobs (cuando escale)
3. **TTL en DB**: Limpiar jobs antiguos después de 7 días
4. **Retry Logic**: Reintentos automáticos en caso de fallo
5. **Webhooks**: Notificar al cliente cuando termina (en vez de polling)

---

## 🚀 Próximos Pasos

- [ ] Crear migration para tabla `ProcessingJobs`
- [ ] Crear entity + repository
- [ ] Modificar multimedia-upload.controller.ts
- [ ] Crear endpoint GET /api/jobs/:jobId
- [ ] Actualizar frontend para usar polling
- [ ] Testing de archivos > 5MB
- [ ] Deploy a Render + validar timeout

---

**Status**: 📋 **EN DISEÑO** (pendiente implementación)
**Criticidad**: 🔴 **ALTA** (bloquea uploads de archivos grandes)
**Estimación**: ⏱️ **2-3 horas** (BD + backend + frontend)
